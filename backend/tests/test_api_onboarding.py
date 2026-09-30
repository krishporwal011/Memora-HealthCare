import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import db

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_database():
    """Reset in-memory database between tests."""
    db.profiles.clear()
    db.patients.clear()
    db.patient_members.clear()
    db.consents.clear()
    db.game_events.clear()
    db.ability_scores.clear()


def test_onboarding_stores_guardian_relationship_note_and_consent_metadata():
    """Verify that onboarding stores guardian relationship, note, consent version, and timestamp."""
    onboarding_payload = {
        "full_name": "Bhaben Baruah",
        "preferred_language": "as",
        "initial_theta": 0.0,
        "lacks_capacity": True,
        "capacity_notes": "Moderate cognitive decline observed; needs guidance with digital tools",
        "guardian_name": "Jonali Baruah",
        "guardian_relationship": "Daughter",
        "guardian_note": "Primary family caregiver residing with elder in Tezpur",
        "consent_version": "2026.1",
    }

    res = client.post(
        "/v1/onboarding",
        json=onboarding_payload,
        headers={"Authorization": "Bearer caregiver-jonali"},
    )
    assert res.status_code == 201
    data = res.json()

    patient = data["patient"]
    consent = data["consent"]

    # Verify patient
    assert patient["full_name"] == "Bhaben Baruah"
    assert patient["preferred_language"] == "as"

    # Verify guardian relationship and note stored
    assert consent["guardian_name"] == "Jonali Baruah"
    assert consent["guardian_relationship"] == "Daughter"
    assert consent["guardian_note"] == "Primary family caregiver residing with elder in Tezpur"
    assert consent["capacity_assessed"] is True
    assert consent["capacity_notes"] == "Moderate cognitive decline observed; needs guidance with digital tools"

    # Verify consent version and timestamp stored
    assert consent["consent_version"] == "2026.1"
    assert "granted_at" in consent
    assert consent["is_active"] is True


def test_patient_data_unavailable_before_consent():
    """Verify that patient clinical and activity data is strictly unavailable (403) before consent."""
    # 1. Register patient directly without consent
    res_p = client.post(
        "/v1/patients",
        json={"full_name": "Unconsented Elder", "preferred_language": "hi"},
        headers={"Authorization": "Bearer caregiver-test"},
    )
    assert res_p.status_code == 201
    patient_id = res_p.json()["id"]

    # 2. Attempt to access ability scores before consent -> 403 Forbidden
    res_ability = client.get(
        f"/v1/patients/{patient_id}/ability",
        headers={"Authorization": "Bearer caregiver-test"},
    )
    assert res_ability.status_code == 403
    assert "consent" in res_ability.json()["detail"].lower()

    # 3. Attempt to record game events before consent -> 403 Forbidden
    res_events = client.post(
        "/v1/events:batch",
        json={
            "patient_id": patient_id,
            "events": [
                {
                    "id": "018f3a2b-8c4d-7123-8abc-012345678901",
                    "patient_id": patient_id,
                    "session_id": "session-1",
                    "domain": "memory_match",
                    "item_id": "card-01",
                    "difficulty": 0.0,
                    "correct": True,
                    "response_time_ms": 1200,
                    "timestamp": "2026-10-01T10:00:00Z",
                }
            ],
        },
        headers={"Authorization": "Bearer caregiver-test"},
    )
    assert res_events.status_code == 403
    assert "consent" in res_events.json()["detail"].lower()

    # 4. Now record verifiable guardian consent
    res_consent = client.post(
        "/v1/consents",
        json={
            "patient_id": patient_id,
            "guardian_name": "R. Sharma",
            "guardian_relationship": "Son",
            "guardian_note": "Assists with daily care",
            "consent_version": "2026.1",
        },
        headers={"Authorization": "Bearer caregiver-test"},
    )
    assert res_consent.status_code == 201

    # 5. Accessing ability history is now unlocked
    res_ability_post = client.get(
        f"/v1/patients/{patient_id}/ability",
        headers={"Authorization": "Bearer caregiver-test"},
    )
    assert res_ability_post.status_code == 200
    assert res_ability_post.json() == []


def test_consent_retrieval_and_rls_isolation():
    """Verify that only authorized members can read consent records."""
    # 1. Onboard patient with Caregiver A
    res = client.post(
        "/v1/onboarding",
        json={
            "full_name": "Elder Padma",
            "preferred_language": "as",
            "lacks_capacity": True,
            "guardian_name": "Sonali",
            "guardian_relationship": "Daughter-in-law",
            "consent_version": "2026.1",
        },
        headers={"Authorization": "Bearer caregiver-a"},
    )
    assert res.status_code == 201
    patient_id = res.json()["patient"]["id"]

    # 2. Caregiver A can view consent details
    res_c_a = client.get(
        f"/v1/consents/{patient_id}",
        headers={"Authorization": "Bearer caregiver-a"},
    )
    assert res_c_a.status_code == 200
    assert res_c_a.json()["guardian_name"] == "Sonali"

    # 3. Caregiver B cannot view consent details -> 403 Forbidden
    res_c_b = client.get(
        f"/v1/consents/{patient_id}",
        headers={"Authorization": "Bearer caregiver-b"},
    )
    assert res_c_b.status_code == 403
    assert "Not authorized" in res_c_b.json()["detail"]
