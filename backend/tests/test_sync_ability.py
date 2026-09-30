import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import db
from app.services.adaptive import batch_update_ability

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_database():
    """Reset database state before each test run."""
    db.profiles.clear()
    db.patients.clear()
    db.patient_members.clear()
    db.consents.clear()
    db.game_events.clear()
    db.ability_scores.clear()


def test_sync_recomputes_ability_and_stores_ability_scores():
    """Verify that batch sync recalculates ability matching adaptive.py and records ability_scores."""
    # 1. Caregiver A registers Patient A
    res_p = client.post(
        "/v1/patients",
        json={"full_name": "Test Patient", "preferred_language": "as", "initial_theta": 0.0},
        headers={"Authorization": "Bearer caregiver-a"},
    )
    assert res_p.status_code == 201
    patient_id = res_p.json()["id"]

    # 2. Grant consent
    res_c = client.post(
        "/v1/consents",
        json={
            "patient_id": patient_id,
            "guardian_name": "Caregiver A",
            "guardian_relationship": "Son",
            "consent_version": "2026.1",
        },
        headers={"Authorization": "Bearer caregiver-a"},
    )
    assert res_c.status_code == 201

    # 3. Ingest a batch of 3 events
    events = [
        {
            "id": f"018f3a2b-8c4d-7123-8abc-01234567800{i}",
            "patient_id": patient_id,
            "session_id": "session-1",
            "domain": "memory_match",
            "item_id": f"card-0{i}",
            "difficulty": 0.2 * i,
            "correct": (i % 2 == 1),
            "response_time_ms": 1200 + i * 100,
            "timestamp": f"2026-10-01T10:0{i}:00Z",
        }
        for i in range(1, 4)
    ]

    expected_theta = batch_update_ability(0.0, events, current_answers_count=0)

    res_batch = client.post(
        "/v1/events:batch",
        json={"patient_id": patient_id, "events": events},
        headers={"Authorization": "Bearer caregiver-a"},
    )
    assert res_batch.status_code == 200
    data = res_batch.json()

    # Verify response structure and ability parity
    assert len(data["acknowledged_ids"]) == 3
    assert data["processed_count"] == 3
    assert data["new_theta"] == pytest.approx(expected_theta, abs=1e-5)

    # Verify ability_scores table stored the update
    assert len(db.ability_scores) == 1
    assert db.ability_scores[0]["patient_id"] == patient_id
    assert db.ability_scores[0]["theta"] == pytest.approx(expected_theta, abs=1e-5)


def test_acknowledges_only_actually_stored_ids():
    """Verify that only IDs actually stored (or existing) for that patient are acknowledged."""
    # 1. Setup Patient A
    res_p1 = client.post(
        "/v1/patients",
        json={"full_name": "Patient Alpha", "preferred_language": "as", "initial_theta": 0.0},
        headers={"Authorization": "Bearer caregiver-a"},
    )
    patient_a = res_p1.json()["id"]
    client.post(
        "/v1/consents",
        json={
            "patient_id": patient_a,
            "guardian_name": "Caregiver A",
            "guardian_relationship": "Son",
            "consent_version": "2026.1",
        },
        headers={"Authorization": "Bearer caregiver-a"},
    )

    # 2. Ingest batch containing a foreign event (mismatched patient_id)
    id_valid = "018f3a2b-8c4d-7123-8abc-012345678010"
    id_foreign = "018f3a2b-8c4d-7123-8abc-012345678011"
    batch_payload = {
        "patient_id": patient_a,
        "events": [
            {
                "id": id_valid,
                "patient_id": patient_a,
                "session_id": "session-1",
                "domain": "memory_match",
                "item_id": "card-01",
                "difficulty": 0.0,
                "correct": True,
                "response_time_ms": 1500,
                "timestamp": "2026-10-01T10:00:00Z",
            },
            {
                "id": id_foreign,
                "patient_id": "different-patient-uuid",
                "session_id": "session-1",
                "domain": "memory_match",
                "item_id": "card-02",
                "difficulty": 0.0,
                "correct": False,
                "response_time_ms": 2000,
                "timestamp": "2026-10-01T10:01:00Z",
            },
        ],
    }

    res = client.post("/v1/events:batch", json=batch_payload, headers={"Authorization": "Bearer caregiver-a"})
    assert res.status_code == 200
    res_data = res.json()

    # The valid event ID must be acknowledged, but the foreign ID must NOT be acknowledged
    assert id_valid in res_data["acknowledged_ids"]
    assert id_foreign not in res_data["acknowledged_ids"]
    assert res_data["processed_count"] == 1
    assert id_valid in db.game_events
    assert id_foreign not in db.game_events


def test_rls_isolation_on_ability_endpoint():
    """Verify that User B cannot read Patient A's ability scores."""
    # 1. Caregiver A registers Patient A and events
    res_p = client.post(
        "/v1/patients",
        json={"full_name": "Patient Alpha", "preferred_language": "as", "initial_theta": 0.0},
        headers={"Authorization": "Bearer caregiver-a"},
    )
    patient_id = res_p.json()["id"]
    client.post(
        "/v1/consents",
        json={
            "patient_id": patient_id,
            "guardian_name": "Caregiver A",
            "guardian_relationship": "Son",
            "consent_version": "2026.1",
        },
        headers={"Authorization": "Bearer caregiver-a"},
    )

    client.post(
        "/v1/events:batch",
        json={
            "patient_id": patient_id,
            "events": [
                {
                    "id": "018f3a2b-8c4d-7123-8abc-012345678020",
                    "patient_id": patient_id,
                    "session_id": "session-1",
                    "domain": "memory_match",
                    "item_id": "card-01",
                    "difficulty": 0.0,
                    "correct": True,
                    "response_time_ms": 1400,
                    "timestamp": "2026-10-01T10:00:00Z",
                }
            ],
        },
        headers={"Authorization": "Bearer caregiver-a"},
    )

    # 2. Caregiver A can retrieve ability scores
    res_a = client.get(f"/v1/patients/{patient_id}/ability", headers={"Authorization": "Bearer caregiver-a"})
    assert res_a.status_code == 200
    scores_a = res_a.json()
    assert len(scores_a) == 1
    assert scores_a[0]["patient_id"] == patient_id
    assert scores_a[0]["domain"] == "memory_match"

    # 3. Caregiver B cannot retrieve Patient A's ability scores -> 403 Forbidden!
    res_b = client.get(f"/v1/patients/{patient_id}/ability", headers={"Authorization": "Bearer caregiver-b"})
    assert res_b.status_code == 403
    assert "Not authorized" in res_b.json()["detail"]
