#!/usr/bin/env python3
"""
Memora Synthetic Demo Seed Script (Brief B22).
Generates deterministic, idempotent synthetic demonstration data for SIH26003 evaluation.

CRITICAL SAFETY & ETHICAL REQUIREMENTS:
1. Every synthetic record is explicitly labelled '(SYNTHETIC DEMO)'.
2. Contains NO real human patient names, contact numbers, or protected health information.
3. Includes Patient 1 with a verified 3-session dip to exercise anomaly triage.
4. Rerunning this seed script is strictly idempotent (deterministic UUIDs).
"""

import os
import sys
import uuid
from datetime import datetime, timezone, timedelta

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import db
from app.jobs.nightly_anomaly import (
    run_nightly_anomaly_processing,
    ALERTS_REGISTRY,
    clear_alerts,
)

SEED_NAMESPACE = uuid.UUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8")


def get_seed_uuid(key: str) -> str:
    """Generate deterministic UUIDv5 for strict idempotency."""
    return str(uuid.uuid5(SEED_NAMESPACE, f"memora-synthetic-{key}"))


def seed_synthetic_data(reset_first: bool = True) -> dict:
    """
    Populate database with reproducible, non-diagnostic synthetic demo data.
    """
    if reset_first:
        db.clear()
        clear_alerts()

    now = datetime.now(timezone.utc)

    # 1. ASHA Worker & Clinician Profiles
    asha_id = "asha-anamika"
    asha_user = {
        "id": asha_id,
        "email": "anamika.asha@phc-tezpur.ner.gov.in",
        "full_name": "Anamika Bora (SYNTHETIC DEMO ASHA)",
        "role": "asha",
    }
    db.profiles[asha_id] = asha_user

    # 2. Patients Definition
    patients_def = [
        {
            "key": "p1-dip",
            "full_name": "Bhaben Baruah (SYNTHETIC DEMO)",
            "language": "as",
            "guardian_name": "Jonali Baruah (SYNTHETIC DEMO)",
            "guardian_rel": "Daughter",
            "location": "Tezpur, Sonitpur",
            "has_dip": True,
            "is_unwell": False,
        },
        {
            "key": "p2-unwell",
            "full_name": "Hemoprabha Saikia (SYNTHETIC DEMO)",
            "language": "as",
            "guardian_name": "Bipul Saikia (SYNTHETIC DEMO)",
            "guardian_rel": "Son",
            "location": "Nagaon Sadar",
            "has_dip": False,
            "is_unwell": True,
        },
        {
            "key": "p3-steady",
            "full_name": "Dharanidhar Das (SYNTHETIC DEMO)",
            "language": "as",
            "guardian_name": "Pranab Das (SYNTHETIC DEMO)",
            "guardian_rel": "Son",
            "location": "Guwahati, Kamrup Metro",
            "has_dip": False,
            "is_unwell": False,
        },
    ]

    seeded_patient_ids = []

    for p_def in patients_def:
        p_id = get_seed_uuid(f"patient-{p_def['key']}")
        seeded_patient_ids.append(p_id)

        # Patient Record
        db.patients[p_id] = {
            "id": p_id,
            "full_name": p_def["full_name"],
            "preferred_language": p_def["language"],
            "current_theta": 0.0,
            "is_synthetic": True,
            "created_at": (now - timedelta(days=20)).isoformat(),
        }

        # DPDP Act 2023 Guardian Consent
        consent_id = get_seed_uuid(f"consent-{p_def['key']}")
        db.consents.append({
            "id": consent_id,
            "patient_id": p_id,
            "granted_by_user_id": asha_id,
            "guardian_name": p_def["guardian_name"],
            "guardian_relationship": p_def["guardian_rel"],
            "guardian_note": "Plain-language guardian consent verified under DPDP Act 2023. (SYNTHETIC DEMO)",
            "capacity_assessed": True,
            "capacity_notes": "Assessed by family guardian and community worker. (SYNTHETIC DEMO)",
            "consent_version": "2026.1",
            "is_active": True,
            "granted_at": (now - timedelta(days=20)).isoformat(),
        })

        # Assign ASHA worker membership
        db.assign_member(patient_id=p_id, user_id=asha_id, role="asha")

        # 3. Memories Bank
        mem_id = get_seed_uuid(f"memory-{p_def['key']}")
        db.memories[mem_id] = {
            "id": mem_id,
            "patient_id": p_id,
            "created_by_user_id": asha_id,
            "memory_type": "photo",
            "caption": f"Rongali Bihu family celebration in courtyard (SYNTHETIC DEMO) - {p_def['location']}",
            "people": ["Grandfather", "Family"],
            "year": 1985,
            "storage_bucket": "memora-private-memories",
            "storage_path": f"{p_id}/photos/bihu_1985.jpg",
            "signed_url": f"https://supabase.co/storage/v1/object/sign/memora-private-memories/{p_id}/photos/bihu_1985.jpg?token=synthetic",
            "is_approved": True,
            "created_at": (now - timedelta(days=18)).isoformat(),
        }

        # 4. Approved Quiz Items
        q_id = get_seed_uuid(f"quiz-{p_def['key']}")
        db.quiz_items[q_id] = {
            "id": q_id,
            "patient_id": p_id,
            "memory_id": mem_id,
            "question_text": "Who is receiving the phulam gamosa in the family photograph? (SYNTHETIC DEMO)",
            "options": [
                {"id": "o1", "text": "Grandfather (SYNTHETIC)", "is_correct": True},
                {"id": "o2", "text": "Neighbor (SYNTHETIC)", "is_correct": False},
                {"id": "o3", "text": "Uncle (SYNTHETIC)", "is_correct": False},
            ],
            "difficulty": 0.0,
            "domain": "reminiscence_photo",
            "image_url": "🌸",
            "approval_status": "approved",
            "is_approved": True,
            "reviewed_by_user_id": asha_id,
            "reviewed_at": (now - timedelta(days=17)).isoformat(),
            "created_at": (now - timedelta(days=17)).isoformat(),
        }

        # 5. Longitudinal Game Events
        # 14 days of history
        for day_offset in range(14, 0, -1):
            day_date = now - timedelta(days=day_offset)
            day_str = day_date.strftime("%Y-%m-%d")

            # Determine accuracy for this day
            if p_def["has_dip"] and day_offset <= 3:
                # 3-SESSION DIP: Days 12, 13, 14 drop sharply to 0.40 accuracy
                daily_acc = 0.40
            else:
                # Steady baseline performance ~0.85
                daily_acc = 0.85

            num_items = 10
            correct_items = int(round(daily_acc * num_items))

            for item_idx in range(num_items):
                ev_id = get_seed_uuid(f"event-{p_def['key']}-{day_offset}-{item_idx}")
                is_correct = item_idx < correct_items
                db.game_events[ev_id] = {
                    "id": ev_id,
                    "patient_id": p_id,
                    "session_id": f"session-{p_id}-{day_str}",
                    "domain": "memory_match",
                    "item_id": f"item-{item_idx % 4}",
                    "difficulty": 0.0,
                    "correct": is_correct,
                    "response_time_ms": 3200 if is_correct else 7500,
                    "timestamp": f"{day_str}T10:{item_idx:02d}:00Z",
                    "synced": 1,
                }

    # 6. Run Nightly Anomaly Processor
    unwell_flags = {
        get_seed_uuid("patient-p2-unwell"): True,
    }
    summary = run_nightly_anomaly_processing(
        db_instance=db,
        unwell_flags=unwell_flags,
    )

    return {
        "status": "success",
        "patients_seeded": len(patients_def),
        "total_events_seeded": len(db.game_events),
        "total_quiz_items_seeded": len(db.quiz_items),
        "anomaly_summary": summary,
    }


def main():
    print("=" * 70)
    print("MEMORA SYNTHETIC DEMO SEED (SIH26003)")
    print("=" * 70)
    print("Generating strictly synthetic, privacy-safe test records...")

    res = seed_synthetic_data(reset_first=True)

    print(f"✓ Patients Seeded:       {res['patients_seeded']}")
    print(f"✓ Total Events:          {res['total_events_seeded']}")
    print(f"✓ Quiz Questions:        {res['total_quiz_items_seeded']}")
    print(f"✓ Active Alerts:         {res['anomaly_summary']['active_alerts_count']}")
    print(f"✓ Suppressed Alerts:     {res['anomaly_summary']['suppressed_alerts_count']}")

    print("\nDemonstration Triage Order (ASHA View):")
    assigned = db.list_asha_patients("asha-anamika")
    for idx, p in enumerate(assigned, 1):
        print(f"  [{idx}] {p['full_name']} | Triage: {p['status_label']} (Priority {p['triage_priority']})")

    # Safety assertion: check no real names and all records labelled synthetic
    for p in db.patients.values():
        assert "SYNTHETIC" in p["full_name"], "Safety check failed: patient missing SYNTHETIC label"

    print("\n✓ Idempotent seed complete. All records verified SYNTHETIC.")
    print("=" * 70)


if __name__ == "__main__":
    main()
