import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import db

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_database():
    """Reset the database before each test run."""
    db.profiles.clear()
    db.patients.clear()
    db.patient_members.clear()
    db.consents.clear()
    db.game_events.clear()
    db.ability_scores.clear()


def test_health_check():
    response = client.get("/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_rls_isolation_user_b_cannot_read_patient_a():
    """Verify that User B cannot read Patient A's records (Row Level Security)."""
    # 1. Caregiver A registers Patient A
    res_a = client.post(
        "/v1/patients",
        json={"full_name": "Patient Alpha", "preferred_language": "as", "initial_theta": 0.0},
        headers={"Authorization": "Bearer caregiver-a"},
    )
    assert res_a.status_code == 201
    patient_a_id = res_a.json()["id"]

    # 2. Caregiver A can read Patient A
    read_a = client.get(
        f"/v1/patients/{patient_a_id}",
        headers={"Authorization": "Bearer caregiver-a"},
    )
    assert read_a.status_code == 200
    assert read_a.json()["full_name"] == "Patient Alpha"

    # 3. Caregiver B attempts to read Patient A -> Must return 403 Forbidden!
    read_b = client.get(
        f"/v1/patients/{patient_a_id}",
        headers={"Authorization": "Bearer caregiver-b"},
    )
    assert read_b.status_code == 403
    assert "Not authorized" in read_b.json()["detail"]


def test_consent_gated_writes_no_consent_returns_403():
    """Verify that without a consent row, game event writes return 403 Forbidden."""
    # 1. Caregiver A creates Patient A
    res_a = client.post(
        "/v1/patients",
        json={"full_name": "Patient Beta", "preferred_language": "hi"},
        headers={"Authorization": "Bearer caregiver-a"},
    )
    patient_id = res_a.json()["id"]

    # 2. Attempt to write game events WITHOUT consent -> Must return 403!
    event_payload = {
        "patient_id": patient_id,
        "events": [
            {
                "id": "018f3a2b-8c4d-7123-8abc-012345678901",
                "patient_id": patient_id,
                "session_id": "session-1",
                "domain": "memory_match",
                "item_id": "card-01",
                "difficulty": -0.5,
                "correct": True,
                "response_time_ms": 1500,
                "timestamp": "2026-10-01T10:00:00Z",
            }
        ],
    }

    res_write_no_consent = client.post(
        "/v1/events:batch",
        json=event_payload,
        headers={"Authorization": "Bearer caregiver-a"},
    )
    assert res_write_no_consent.status_code == 403
    assert "consent" in res_write_no_consent.json()["detail"].lower()
    assert len(db.game_events) == 0

    # 3. Register verifiable consent
    res_consent = client.post(
        "/v1/consents",
        json={
            "patient_id": patient_id,
            "guardian_name": "R. Sharma",
            "guardian_relationship": "Son",
            "consent_version": "2026.1",
        },
        headers={"Authorization": "Bearer caregiver-a"},
    )
    assert res_consent.status_code == 201

    # 4. Attempt to write game events WITH consent -> Must succeed!
    res_write_with_consent = client.post(
        "/v1/events:batch",
        json=event_payload,
        headers={"Authorization": "Bearer caregiver-a"},
    )
    assert res_write_with_consent.status_code == 200
    assert "018f3a2b-8c4d-7123-8abc-012345678901" in res_write_with_consent.json()["acknowledged_ids"]
    assert len(db.game_events) == 1


def test_idempotent_event_ingestion_same_id_stored_once():
    """Verify that posting the exact same event ID twice stores only one row."""
    # 1. Setup patient and consent
    res_a = client.post(
        "/v1/patients",
        json={"full_name": "Patient Gamma", "preferred_language": "as", "initial_theta": 0.0},
        headers={"Authorization": "Bearer caregiver-a"},
    )
    patient_id = res_a.json()["id"]

    client.post(
        "/v1/consents",
        json={
            "patient_id": patient_id,
            "guardian_name": "Devi Baruah",
            "guardian_relationship": "Daughter",
            "consent_version": "2026.1",
        },
        headers={"Authorization": "Bearer caregiver-a"},
    )

    event_id = "018f3a2b-8c4d-7123-8abc-012345678999"
    payload = {
        "patient_id": patient_id,
        "events": [
            {
                "id": event_id,
                "patient_id": patient_id,
                "session_id": "session-1",
                "domain": "memory_match",
                "item_id": "card-02",
                "difficulty": 0.0,
                "correct": True,
                "response_time_ms": 1800,
                "timestamp": "2026-10-01T10:05:00Z",
            }
        ],
    }

    # First post
    res1 = client.post("/v1/events:batch", json=payload, headers={"Authorization": "Bearer caregiver-a"})
    assert res1.status_code == 200
    assert event_id in res1.json()["acknowledged_ids"]
    assert len(db.game_events) == 1

    # Second post with identical event ID (simulating offline replay/retry)
    res2 = client.post("/v1/events:batch", json=payload, headers={"Authorization": "Bearer caregiver-a"})
    assert res2.status_code == 200
    # Must still acknowledge the ID so client queue can delete it
    assert event_id in res2.json()["acknowledged_ids"]
    # Exactly one row exists in database (idempotent ON CONFLICT DO NOTHING)
    assert len(db.game_events) == 1
