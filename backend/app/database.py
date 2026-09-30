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
            "consent_version": consent_version,
            "is_active": True,
            "granted_at": datetime.now(timezone.utc).isoformat(),
        }
        self.consents.append(consent_record)
        return consent_record

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

        # 4. Idempotent Ingestion: ON CONFLICT (id) DO NOTHING
        for ev in events:
            event_id = ev["id"]
            if event_id not in self.game_events:
                # Store new event
                self.game_events[event_id] = {
                    **ev,
                    "patient_id": patient_id,
                    "server_received_at": datetime.now(timezone.utc).isoformat(),
                }
                new_events_for_ability.append(ev)
            # Acknowledge all processed event IDs (both newly stored and duplicates)
            acknowledged_ids.append(event_id)

        # 5. Recalculate Ability Score via 1-PL IRT
        if new_events_for_ability:
            updated_theta = batch_update_ability(
                patient["current_theta"], new_events_for_ability
            )
            patient["current_theta"] = updated_theta
            self.ability_scores.append({
                "id": str(uuid.uuid4()),
                "patient_id": patient_id,
                "domain": events[0].get("domain", "general"),
                "theta": updated_theta,
                "recorded_at": datetime.now(timezone.utc).isoformat(),
            })

        return {
            "acknowledged_ids": acknowledged_ids,
            "new_theta": patient["current_theta"],
            "processed_count": len(acknowledged_ids),
        }


# Global repository instance
db = MemoryDatabase()
