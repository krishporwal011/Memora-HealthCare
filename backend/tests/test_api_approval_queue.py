import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import db

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_database():
    """Reset repository before each test."""
    db.clear()


def _setup_patient_and_memory():
    """Helper to onboard patient and add an approved memory."""
    res_onboard = client.post(
        "/v1/onboarding",
        json={
            "full_name": "Bhaben Baruah",
            "preferred_language": "as",
            "lacks_capacity": True,
            "guardian_name": "Jonali Baruah",
            "guardian_relationship": "Daughter",
            "consent_version": "2026.1",
        },
        headers={"Authorization": "Bearer caregiver-jonali"},
    )
    assert res_onboard.status_code == 201
    patient_id = res_onboard.json()["patient"]["id"]

    res_mem = client.post(
        f"/v1/patients/{patient_id}/memories",
        json={
            "memory_type": "photo",
            "caption": "Grandfather receiving his phulam gamosa at Rongali Bihu celebration in Tezpur",
            "people": ["Grandfather", "Jonali"],
            "year": 1988,
        },
        headers={"Authorization": "Bearer caregiver-jonali"},
    )
    assert res_mem.status_code == 201
    memory_id = res_mem.json()["id"]

    return patient_id, memory_id


def test_unapproved_items_never_reach_patient():
    """Security requirement: Unapproved items must NEVER be served to patients."""
    patient_id, memory_id = _setup_patient_and_memory()

    # AI generates a quiz item, saved with pending status
    quiz_item = db.add_quiz_item({
        "id": "quiz-item-001",
        "patient_id": patient_id,
        "memory_id": memory_id,
        "question_text": "Who received the phulam gamosa in Tezpur?",
        "options": [
            {"id": "opt-1", "text": "Grandfather", "is_correct": True},
            {"id": "opt-2", "text": "Uncle Hemen", "is_correct": False},
            {"id": "opt-3", "text": "Neighbor Pradip", "is_correct": False},
        ],
        "difficulty": 0.2,
        "domain": "reminiscence",
        "image_url": "https://supabase.co/storage/v1/object/sign/memora-private-memories/test.jpg",
        "approval_status": "pending",
        "is_approved": False,
    })
    assert quiz_item["approval_status"] == "pending"
    assert quiz_item["is_approved"] is False

    # 1. Caregiver can see item in approval queue
    res_queue = client.get(
        f"/v1/patients/{patient_id}/approval-queue",
        headers={"Authorization": "Bearer caregiver-jonali"},
    )
    assert res_queue.status_code == 200
    queue_items = res_queue.json()
    assert len(queue_items) == 1
    assert queue_items[0]["id"] == "quiz-item-001"

    # 2. Patient-facing endpoint MUST return EMPTY list (strict isolation)
    res_patient_items = client.get(
        f"/v1/patients/{patient_id}/quiz-items",
        headers={"Authorization": "Bearer caregiver-jonali"},
    )
    assert res_patient_items.status_code == 200
    assert len(res_patient_items.json()) == 0


def test_approve_quiz_item_makes_available_for_patient():
    """Approving an item removes it from pending queue and unlocks it for patient sessions."""
    patient_id, memory_id = _setup_patient_and_memory()

    db.add_quiz_item({
        "id": "quiz-item-002",
        "patient_id": patient_id,
        "memory_id": memory_id,
        "question_text": "What festival was celebrated in the photograph?",
        "options": [
            {"id": "opt-1", "text": "Rongali Bihu", "is_correct": True},
            {"id": "opt-2", "text": "Durga Puja", "is_correct": False},
            {"id": "opt-3", "text": "Diwali", "is_correct": False},
        ],
        "difficulty": 0.0,
        "domain": "reminiscence",
        "approval_status": "pending",
        "is_approved": False,
    })

    # Caregiver approves the question
    res_approve = client.post(
        "/v1/quiz-items/quiz-item-002/approve",
        headers={"Authorization": "Bearer caregiver-jonali"},
    )
    assert res_approve.status_code == 200
    approved_data = res_approve.json()
    assert approved_data["approval_status"] == "approved"
    assert approved_data["is_approved"] is True
    assert approved_data["reviewed_by_user_id"] == "caregiver-jonali"
    assert "reviewed_at" in approved_data

    # Approval queue is now empty
    res_queue = client.get(
        f"/v1/patients/{patient_id}/approval-queue",
        headers={"Authorization": "Bearer caregiver-jonali"},
    )
    assert res_queue.status_code == 200
    assert len(res_queue.json()) == 0

    # Patient endpoint now returns the approved question
    res_patient_items = client.get(
        f"/v1/patients/{patient_id}/quiz-items",
        headers={"Authorization": "Bearer caregiver-jonali"},
    )
    assert res_patient_items.status_code == 200
    items = res_patient_items.json()
    assert len(items) == 1
    assert items[0]["id"] == "quiz-item-002"
    assert items[0]["is_approved"] is True


def test_reject_quiz_item_permanently_excludes_from_patient():
    """Rejecting an item marks it rejected and guarantees it never reaches patient."""
    patient_id, memory_id = _setup_patient_and_memory()

    db.add_quiz_item({
        "id": "quiz-item-003",
        "patient_id": patient_id,
        "memory_id": memory_id,
        "question_text": "Do you remember the sad hospital visit?",
        "options": [
            {"id": "opt-1", "text": "Yes", "is_correct": True},
            {"id": "opt-2", "text": "No", "is_correct": False},
        ],
        "difficulty": 0.5,
        "domain": "reminiscence",
        "approval_status": "pending",
        "is_approved": False,
    })

    # Caregiver rejects the question
    res_reject = client.post(
        "/v1/quiz-items/quiz-item-003/reject",
        headers={"Authorization": "Bearer caregiver-jonali"},
    )
    assert res_reject.status_code == 200
    rejected_data = res_reject.json()
    assert rejected_data["approval_status"] == "rejected"
    assert rejected_data["is_approved"] is False
    assert rejected_data["reviewed_by_user_id"] == "caregiver-jonali"

    # Not in queue
    res_queue = client.get(
        f"/v1/patients/{patient_id}/approval-queue",
        headers={"Authorization": "Bearer caregiver-jonali"},
    )
    assert len(res_queue.json()) == 0

    # NEVER in patient quiz items
    res_patient = client.get(
        f"/v1/patients/{patient_id}/quiz-items",
        headers={"Authorization": "Bearer caregiver-jonali"},
    )
    assert len(res_patient.json()) == 0


def test_unauthorized_user_cannot_access_or_modify_queue():
    """Row Level Security (RLS): User B cannot view or modify Patient A's queue."""
    patient_id, memory_id = _setup_patient_and_memory()

    db.add_quiz_item({
        "id": "quiz-item-004",
        "patient_id": patient_id,
        "memory_id": memory_id,
        "question_text": "Test question?",
        "options": [{"id": "o1", "text": "A", "is_correct": True}],
        "difficulty": 0.0,
        "domain": "reminiscence",
        "approval_status": "pending",
        "is_approved": False,
    })

    # User B tries to view queue -> 403
    res_queue = client.get(
        f"/v1/patients/{patient_id}/approval-queue",
        headers={"Authorization": "Bearer attacker-bob"},
    )
    assert res_queue.status_code == 403

    # User B tries to approve -> 403
    res_app = client.post(
        "/v1/quiz-items/quiz-item-004/approve",
        headers={"Authorization": "Bearer attacker-bob"},
    )
    assert res_app.status_code == 403

    # User B tries to reject -> 403
    res_rej = client.post(
        "/v1/quiz-items/quiz-item-004/reject",
        headers={"Authorization": "Bearer attacker-bob"},
    )
    assert res_rej.status_code == 403

    # User B tries to get patient items -> 403
    res_patient = client.get(
        f"/v1/patients/{patient_id}/quiz-items",
        headers={"Authorization": "Bearer attacker-bob"},
    )
    assert res_patient.status_code == 403


def test_consent_gating_on_approval_queue():
    """Without active consent, accessing approval queue is forbidden."""
    # Create patient directly without consent row
    patient = db.create_patient("caregiver-sam", "Dharanidhar Das", "as")
    p_id = patient["id"]

    res = client.get(
        f"/v1/patients/{p_id}/approval-queue",
        headers={"Authorization": "Bearer caregiver-sam"},
    )
    assert res.status_code == 403
    assert "Active consent required" in res.json()["detail"]


def test_cascading_deletion_removes_quiz_items():
    """Deleting a memory automatically purges all quiz questions derived from it."""
    patient_id, memory_id = _setup_patient_and_memory()

    db.add_quiz_item({
        "id": "quiz-item-cascade-1",
        "patient_id": patient_id,
        "memory_id": memory_id,
        "question_text": "Question derived from memory?",
        "options": [{"id": "o1", "text": "Yes", "is_correct": True}],
        "difficulty": 0.0,
        "domain": "reminiscence",
        "approval_status": "pending",
        "is_approved": False,
    })
    assert "quiz-item-cascade-1" in db.quiz_items

    # Delete memory
    res_del = client.delete(
        f"/v1/memories/{memory_id}",
        headers={"Authorization": "Bearer caregiver-jonali"},
    )
    assert res_del.status_code == 200
    assert res_del.json()["quiz_items_deleted"] == 1

    # Quiz item was cascaded out of existence
    assert "quiz-item-cascade-1" not in db.quiz_items
