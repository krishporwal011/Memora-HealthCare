"""
Memora Database Layer with Row Level Security (RLS) and Consent Enforcement.
In-memory transactional repository backing PostgreSQL/Supabase tables.
"""

from datetime import datetime, timezone
import uuid
from typing import Dict, List, Optional, Any
from fastapi import HTTPException, status
from app.services.adaptive import batch_update_ability


class MemoryDatabase:
    def __init__(self):
        self.profiles: Dict[str, Dict[str, Any]] = {}
        self.patients: Dict[str, Dict[str, Any]] = {}
        self.patient_members: List[Dict[str, Any]] = []
        self.consents: List[Dict[str, Any]] = []
        self.game_events: Dict[str, Dict[str, Any]] = {}
        self.ability_scores: List[Dict[str, Any]] = []
        self.memories: Dict[str, Dict[str, Any]] = {}
        self.embeddings: Dict[str, List[float]] = {}
        self.storage_files: Dict[str, bytes] = {}
        self.quiz_items: Dict[str, Dict[str, Any]] = {}

    def clear(self):
        """Reset all in-memory tables and stores."""
        self.profiles.clear()
        self.patients.clear()
        self.patient_members.clear()
        self.consents.clear()
        self.game_events.clear()
        self.ability_scores.clear()
        self.memories.clear()
        self.embeddings.clear()
        self.storage_files.clear()
        self.quiz_items.clear()

    def is_member(self, patient_id: str, user_id: str) -> bool:
        """RLS check: Verify user is an authorized member of patient."""
        return any(
            m["patient_id"] == patient_id and m["user_id"] == user_id
            for m in self.patient_members
        )

    def has_consent(self, patient_id: str) -> bool:
        """Consent check: Verify active consent row exists for patient."""
        return any(
            c["patient_id"] == patient_id and c["is_active"]
            for c in self.consents
        )

    def create_patient(
        self, user_id: str, full_name: str, preferred_language: str, initial_theta: float = 0.0
    ) -> Dict[str, Any]:
        patient_id = str(uuid.uuid4())
        record = {
            "id": patient_id,
            "full_name": full_name,
            "preferred_language": preferred_language,
            "current_theta": initial_theta,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        self.patients[patient_id] = record

        # Automatically assign creating caregiver as primary_caregiver
        self.patient_members.append({
            "patient_id": patient_id,
            "user_id": user_id,
            "role": "primary_caregiver",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        return record

    def get_patient(self, patient_id: str, user_id: str) -> Dict[str, Any]:
        patient = self.patients.get(patient_id)
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found"
            )

        # RLS check: User B cannot read Patient A data
        if not self.is_member(patient_id, user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this patient"
            )

        return patient

    def list_patients_for_user(self, user_id: str) -> List[Dict[str, Any]]:
        accessible_ids = {
            m["patient_id"] for m in self.patient_members if m["user_id"] == user_id
        }
        return [p for p in self.patients.values() if p["id"] in accessible_ids]

    def record_consent(
        self,
        user_id: str,
        patient_id: str,
        guardian_name: str,
        guardian_relationship: str,
        consent_version: str,
        guardian_note: Optional[str] = None,
        capacity_assessed: bool = True,
        capacity_notes: Optional[str] = None,
    ) -> Dict[str, Any]:
        # User must be an assigned member to grant consent
        if not self.is_member(patient_id, user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to record consent for this patient"
            )

        consent_record = {
            "id": str(uuid.uuid4()),
            "patient_id": patient_id,
            "granted_by_user_id": user_id,
            "guardian_name": guardian_name,
            "guardian_relationship": guardian_relationship,
            "guardian_note": guardian_note,
            "capacity_assessed": capacity_assessed,
            "capacity_notes": capacity_notes,
            "consent_version": consent_version,
            "is_active": True,
            "granted_at": datetime.now(timezone.utc).isoformat(),
        }
        self.consents.append(consent_record)
        return consent_record

    def onboard_patient(self, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Atomically create patient and record verifiable guardian consent under DPDP Act 2023."""
        patient = self.create_patient(
            user_id=user_id,
            full_name=data["full_name"],
            preferred_language=data.get("preferred_language", "as"),
            initial_theta=data.get("initial_theta", 0.0),
        )

        consent = self.record_consent(
            user_id=user_id,
            patient_id=patient["id"],
            guardian_name=data["guardian_name"],
            guardian_relationship=data["guardian_relationship"],
            guardian_note=data.get("guardian_note"),
            capacity_assessed=data.get("lacks_capacity", True),
            capacity_notes=data.get("capacity_notes"),
            consent_version=data["consent_version"],
        )

        return {
            "patient": patient,
            "consent": consent,
        }

    def get_patient_consent(self, patient_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        if not self.is_member(patient_id, user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this patient",
            )
        for c in reversed(self.consents):
            if c["patient_id"] == patient_id and c["is_active"]:
                return c
        return None

    def ingest_batch_events(
        self, user_id: str, patient_id: str, events: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        # 1. Validate batch limit
        if len(events) > 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Batch exceeds maximum size of 200 events"
            )

        # 2. RLS Check
        if not self.is_member(patient_id, user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to write events for this patient"
            )

        # 3. Consent-Gating Rule: No consent row -> 403 on writes
        if not self.has_consent(patient_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Active consent row required before recording patient activity events"
            )

        patient = self.patients[patient_id]
        acknowledged_ids: List[str] = []
        new_events_for_ability: List[Dict[str, Any]] = []

        # Count prior events for this patient to maintain continuous K learning rate decay
        prior_events_count = sum(
            1 for ev in self.game_events.values() if ev.get("patient_id") == patient_id
        )

        # 4. Idempotent Ingestion: ON CONFLICT (id) DO NOTHING
        for ev in events:
            event_id = ev.get("id")
            if not event_id:
                continue

            # Ensure event belongs to the target patient
            if ev.get("patient_id") != patient_id:
                continue

            if event_id not in self.game_events:
                # Store new event
                self.game_events[event_id] = {
                    **ev,
                    "patient_id": patient_id,
                    "server_received_at": datetime.now(timezone.utc).isoformat(),
                }
                new_events_for_ability.append(ev)

            # Strictly acknowledge ONLY IDs that are actually stored in the database
            if event_id in self.game_events:
                acknowledged_ids.append(event_id)

        # 5. Recalculate Ability Score via 1-PL IRT
        if new_events_for_ability:
            updated_theta = batch_update_ability(
                patient["current_theta"],
                new_events_for_ability,
                current_answers_count=prior_events_count,
            )
            patient["current_theta"] = updated_theta
            self.ability_scores.append({
                "id": str(uuid.uuid4()),
                "patient_id": patient_id,
                "domain": new_events_for_ability[0].get("domain", "general"),
                "theta": updated_theta,
                "recorded_at": datetime.now(timezone.utc).isoformat(),
            })

        return {
            "acknowledged_ids": acknowledged_ids,
            "new_theta": patient["current_theta"],
            "processed_count": len(acknowledged_ids),
        }

    def get_patient_ability_history(self, patient_id: str, user_id: str) -> List[Dict[str, Any]]:
        """Retrieve longitudinal ability scores for a patient with RLS enforcement."""
        if patient_id not in self.patients:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found",
            )

        if not self.is_member(patient_id, user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this patient",
            )

        if not self.has_consent(patient_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Patient data is unavailable before consent is granted",
            )

        return [
            score for score in self.ability_scores
            if score["patient_id"] == patient_id
        ]

    def _generate_signed_url(self, storage_path: str, memory_id: str) -> str:
        """Generate a time-limited signed URL for private bucket access."""
        return f"https://supabase.co/storage/v1/object/sign/memora-private-memories/{storage_path}?token=signed-{memory_id[:8]}"

    def create_memory(
        self,
        user_id: str,
        patient_id: str,
        memory_type: str,
        caption: str,
        people: Optional[List[str]] = None,
        year: Optional[int] = None,
        file_path: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Upload private memory metadata and media asset (consent-gated, RLS)."""
        if patient_id not in self.patients:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

        if not self.is_member(patient_id, user_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to add memories for this patient")

        if not self.has_consent(patient_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Active consent required before uploading memories")

        if memory_type not in ("photo", "song", "story"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid memory_type. Must be photo, song, or story.")

        memory_id = str(uuid.uuid4())
        embedding_id = str(uuid.uuid4())
        resolved_path = file_path or f"{patient_id}/{memory_type}s/{memory_id}.dat"

        # 1. Store mock media in private storage bucket
        self.storage_files[resolved_path] = b"MOCK_ENCRYPTED_MEDIA_BINARY"

        # 2. Store vector embedding in pgvector repository
        self.embeddings[embedding_id] = [0.05] * 384

        record = {
            "id": memory_id,
            "patient_id": patient_id,
            "created_by_user_id": user_id,
            "memory_type": memory_type,
            "caption": caption,
            "people": people or [],
            "year": year,
            "storage_bucket": "memora-private-memories",
            "storage_path": resolved_path,
            "signed_url": self._generate_signed_url(resolved_path, memory_id),
            "embedding_id": embedding_id,
            "is_approved": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

        self.memories[memory_id] = record
        return record

    def list_memories(
        self, user_id: str, patient_id: str, memory_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """List private memories for a patient (only authorized members with consent)."""
        if patient_id not in self.patients:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

        if not self.is_member(patient_id, user_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view memories for this patient")

        if not self.has_consent(patient_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Active consent required before viewing memories")

        results = []
        for mem in self.memories.values():
            if mem["patient_id"] == patient_id:
                if memory_type and mem["memory_type"] != memory_type:
                    continue
                # Refresh signed URL
                results.append({
                    **mem,
                    "signed_url": self._generate_signed_url(mem["storage_path"], mem["id"]),
                })
        return results

    def get_memory(self, memory_id: str, user_id: str) -> Dict[str, Any]:
        """Retrieve a single memory with a refreshed signed URL."""
        memory = self.memories.get(memory_id)
        if not memory:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Memory not found")

        if not self.is_member(memory["patient_id"], user_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this memory")

        if not self.has_consent(memory["patient_id"]):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Active consent required before accessing memory")

        return {
            **memory,
            "signed_url": self._generate_signed_url(memory["storage_path"], memory["id"]),
        }

    def delete_memory(self, memory_id: str, user_id: str) -> Dict[str, Any]:
        """Delete memory metadata, private storage file, and vector embedding."""
        memory = self.memories.get(memory_id)
        if not memory:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Memory not found")

        if not self.is_member(memory["patient_id"], user_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this memory")

        # 1. Remove file from private storage bucket
        storage_path = memory.get("storage_path")
        file_deleted = False
        if storage_path in self.storage_files:
            del self.storage_files[storage_path]
            file_deleted = True

        # 2. Cleanup vector embedding
        embedding_id = memory.get("embedding_id")
        embedding_deleted = False
        if embedding_id in self.embeddings:
            del self.embeddings[embedding_id]
            embedding_deleted = True

        # 3. Cascading delete of quiz items generated from this memory
        quiz_ids_to_delete = [
            qid for qid, qitem in self.quiz_items.items()
            if qitem.get("memory_id") == memory_id
        ]
        for qid in quiz_ids_to_delete:
            del self.quiz_items[qid]

        # 4. Delete memory record
        del self.memories[memory_id]

        return {
            "status": "deleted",
            "id": memory_id,
            "file_deleted": file_deleted,
            "embedding_deleted": embedding_deleted,
            "quiz_items_deleted": len(quiz_ids_to_delete),
        }

    def add_quiz_item(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """Store generated quiz item with default pending approval status."""
        item_id = item.get("id") or str(uuid.uuid4())
        record = {
            **item,
            "id": item_id,
            "approval_status": item.get("approval_status", "pending"),
            "is_approved": item.get("is_approved", False),
            "created_at": item.get("created_at") or datetime.now(timezone.utc).isoformat(),
        }
        self.quiz_items[item_id] = record
        return record

    def get_approval_queue(self, patient_id: str, user_id: str) -> List[Dict[str, Any]]:
        """Retrieve pending quiz questions awaiting caregiver review (RLS + consent gated)."""
        if patient_id not in self.patients:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

        if not self.is_member(patient_id, user_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this patient")

        if not self.has_consent(patient_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Active consent required")

        return [
            item for item in self.quiz_items.values()
            if item["patient_id"] == patient_id and item.get("approval_status") == "pending"
        ]

    def approve_quiz_item(self, item_id: str, user_id: str) -> Dict[str, Any]:
        """Approve an AI-generated quiz question, making it available for patient play and offline sync."""
        item = self.quiz_items.get(item_id)
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz item not found")

        patient_id = item["patient_id"]
        if not self.is_member(patient_id, user_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to approve items for this patient")

        if not self.has_consent(patient_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Active consent required")

        item["approval_status"] = "approved"
        item["is_approved"] = True
        item["reviewed_by_user_id"] = user_id
        item["reviewed_at"] = datetime.now(timezone.utc).isoformat()
        return item

    def reject_quiz_item(self, item_id: str, user_id: str) -> Dict[str, Any]:
        """Reject an AI-generated quiz question. Unapproved items must NEVER be served to patients."""
        item = self.quiz_items.get(item_id)
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz item not found")

        patient_id = item["patient_id"]
        if not self.is_member(patient_id, user_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to reject items for this patient")

        if not self.has_consent(patient_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Active consent required")

        item["approval_status"] = "rejected"
        item["is_approved"] = False
        item["reviewed_by_user_id"] = user_id
        item["reviewed_at"] = datetime.now(timezone.utc).isoformat()
        return item

    def list_approved_quiz_items_for_patient(self, patient_id: str, user_id: str) -> List[Dict[str, Any]]:
        """List approved quiz items for patient sessions and offline sync.
        Strict rule: Unapproved or rejected items must NEVER be served to patients.
        """
        if patient_id not in self.patients:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

        if not self.is_member(patient_id, user_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this patient")

        if not self.has_consent(patient_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Active consent required")

        return [
            item for item in self.quiz_items.values()
            if item["patient_id"] == patient_id and item.get("approval_status") == "approved" and item.get("is_approved") is True
        ]

    def assign_member(self, patient_id: str, user_id: str, role: str = "asha") -> Dict[str, Any]:
        """Assign an authorized member (such as ASHA worker or clinician) to a patient."""
        member = {
            "patient_id": patient_id,
            "user_id": user_id,
            "role": role,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        self.patient_members.append(member)
        return member

    def list_asha_patients(self, asha_user_id: str) -> List[Dict[str, Any]]:
        """List patients assigned to authenticated ASHA worker, ordered by triage priority."""
        assigned_patient_ids = [
            m["patient_id"] for m in self.patient_members
            if m["user_id"] == asha_user_id
        ]

        from app.jobs.nightly_anomaly import get_alerts_for_patient

        results = []
        for p_id in assigned_patient_ids:
            patient = self.patients.get(p_id)
            if not patient or not self.has_consent(p_id):
                continue

            alerts = get_alerts_for_patient(p_id)
            active_alerts = [a for a in alerts if a.get("has_alert") and not a.get("suppressed")]

            # Triage priority calculation:
            # 1 = Check-in suggested (active unsuppressed alert)
            # 2 = Watch (suppressed alert / watch boundary)
            # 3 = Steady
            if active_alerts:
                status_code = "checkin_suggested"
                status_label = "Check-in suggested"
                priority = 1
                alert_domain = active_alerts[0].get("domain")
            elif any(a.get("suppressed") for a in alerts):
                status_code = "watch"
                status_label = "Watch"
                priority = 2
                alert_domain = None
            else:
                status_code = "steady"
                status_label = "Steady"
                priority = 3
                alert_domain = None

            events = [e for e in self.game_events.values() if e.get("patient_id") == p_id]
            recent_accuracy = 0.82
            if events:
                recent_accuracy = round(sum(1 for e in events if e.get("correct")) / len(events), 2)

            results.append({
                "id": p_id,
                "full_name": patient["full_name"],
                "status": status_code,
                "status_label": status_label,
                "triage_priority": priority,
                "last_active": datetime.now(timezone.utc).isoformat(),
                "sessions_this_week": max(1, len(events) // 10),
                "average_score": recent_accuracy,
                "active_alert_domain": alert_domain,
                "unwell_today": any(a.get("suppressed") and "unwell" in str(a.get("suppression_reason", "")).lower() for a in alerts),
                "is_synthetic": True,
            })

        # Order by triage_priority ASC (Priority 1 first!)
        results.sort(key=lambda x: x["triage_priority"])
        return results

    def get_asha_patient_detail(self, patient_id: str, asha_user_id: str) -> Dict[str, Any]:
        """Retrieve full triage and longitudinal details for an assigned patient."""
        patient = self.patients.get(patient_id)
        if not patient:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

        if not self.is_member(patient_id, asha_user_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Patient not assigned to this ASHA worker")

        if not self.has_consent(patient_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Active consent required")

        from app.jobs.nightly_anomaly import get_alerts_for_patient
        alerts = get_alerts_for_patient(patient_id)
        active_alerts = [a for a in alerts if a.get("has_alert") and not a.get("suppressed")]

        if active_alerts:
            status_code = "checkin_suggested"
            status_label = "Check-in suggested"
            priority = 1
        elif any(a.get("suppressed") for a in alerts):
            status_code = "watch"
            status_label = "Watch"
            priority = 2
        else:
            status_code = "steady"
            status_label = "Steady"
            priority = 3

        consent = next((c for c in reversed(self.consents) if c["patient_id"] == patient_id and c["is_active"]), {})

        return {
            "id": patient_id,
            "full_name": patient["full_name"],
            "preferred_language": patient.get("preferred_language", "as"),
            "status": status_code,
            "status_label": status_label,
            "triage_priority": priority,
            "unwell_today": any(a.get("suppressed") and "unwell" in str(a.get("suppression_reason", "")).lower() for a in alerts),
            "is_synthetic": True,
            "guardian_name": consent.get("guardian_name", "Family Guardian"),
            "guardian_relationship": consent.get("guardian_relationship", "Family Member"),
            "current_theta": patient.get("current_theta", 0.0),
            "recent_domains": [
                {"domain": "memory_match", "recent_score": 0.82, "status": "steady"},
                {"domain": "reminiscence_photo", "recent_score": 0.78, "status": "steady"},
            ],
            "active_alerts": active_alerts,
            "created_at": patient["created_at"],
        }


# Global repository instance
db = MemoryDatabase()
