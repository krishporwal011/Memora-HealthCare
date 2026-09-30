import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import db
from app.jobs.nightly_anomaly import ALERTS_REGISTRY, clear_alerts
from app.services.anomaly import is_safe_message

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_database():
    """Reset repository and alerts registry before each test."""
    db.clear()
    clear_alerts()


def _setup_patient_with_consent(asha_id: str, full_name: str) -> str:
    """Helper to onboard a patient and assign an ASHA worker."""
    # 1. Onboard patient with guardian consent
    res = client.post(
        "/v1/onboarding",
        json={
            "full_name": full_name,
            "preferred_language": "as",
            "lacks_capacity": True,
            "guardian_name": "Jonali Baruah",
            "guardian_relationship": "Daughter",
            "consent_version": "2026.1",
        },
        headers={"Authorization": "Bearer caregiver-jonali"},
    )
    assert res.status_code == 201
    patient_id = res.json()["patient"]["id"]

    # 2. Assign ASHA worker to patient
    db.assign_member(patient_id=patient_id, user_id=asha_id, role="asha")
    return patient_id


def test_asha_sees_only_assigned_patients():
    """Security invariant: An ASHA worker must NEVER see unassigned patients."""
    # ASHA Anamika has Patient A and B
    p_a = _setup_patient_with_consent(asha_id="asha-anamika", full_name="Bhaben Baruah")
    p_b = _setup_patient_with_consent(asha_id="asha-anamika", full_name="Hemoprabha Saikia")

    # ASHA Bharati has Patient C
    p_c = _setup_patient_with_consent(asha_id="asha-bharati", full_name="Dharanidhar Das")

    # Anamika queries her patient list
    res_anamika = client.get(
        "/v1/asha/patients",
        headers={"Authorization": "Bearer asha-anamika"},
    )
    assert res_anamika.status_code == 200
    patients_anamika = res_anamika.json()
    assert len(patients_anamika) == 2
    retrieved_ids = [p["id"] for p in patients_anamika]
    assert p_a in retrieved_ids
    assert p_b in retrieved_ids
    assert p_c not in retrieved_ids  # Patient C strictly isolated!

    # Bharati queries her patient list
    res_bharati = client.get(
        "/v1/asha/patients",
        headers={"Authorization": "Bearer asha-bharati"},
    )
    assert res_bharati.status_code == 200
    patients_bharati = res_bharati.json()
    assert len(patients_bharati) == 1
    assert patients_bharati[0]["id"] == p_c


def test_patient_list_ordered_by_triage_need():
    """Triage priority: Priority 1 (Check-in suggested) appears before Watch and Steady."""
    p_steady = _setup_patient_with_consent("asha-triage", "Steady Patient")
    p_watch = _setup_patient_with_consent("asha-triage", "Watch Patient")
    p_dip = _setup_patient_with_consent("asha-triage", "Check-in Suggested Patient")

    # Register active alert for p_dip (Priority 1)
    ALERTS_REGISTRY.append({
        "id": "alert-1",
        "patient_id": p_dip,
        "domain": "memory_match",
        "has_alert": True,
        "suppressed": False,
        "trigger_metric": "Acute score dip (z = -2.85 <= -2.5)",
        "triggering_numbers": {"robust_z": -2.85, "current_score": 0.40, "baseline_median": 0.85},
    })

    # Register suppressed alert for p_watch (Priority 2)
    ALERTS_REGISTRY.append({
        "id": "alert-2",
        "patient_id": p_watch,
        "domain": "memory_match",
        "has_alert": False,
        "suppressed": True,
        "suppression_reason": "Caregiver flagged patient as unwell today",
    })

    # Query ASHA list
    res = client.get(
        "/v1/asha/patients",
        headers={"Authorization": "Bearer asha-triage"},
    )
    assert res.status_code == 200
    items = res.json()
    assert len(items) == 3

    # Check ordering
    assert items[0]["id"] == p_dip
    assert items[0]["status"] == "checkin_suggested"
    assert items[0]["triage_priority"] == 1

    assert items[1]["id"] == p_watch
    assert items[1]["status"] == "watch"
    assert items[1]["triage_priority"] == 2

    assert items[2]["id"] == p_steady
    assert items[2]["status"] == "steady"
    assert items[2]["triage_priority"] == 3


def test_asha_patient_detail_security_and_evidence():
    """ASHA detail endpoint enforces assignment and returns statistical evidence."""
    p_id = _setup_patient_with_consent("asha-primary", "Bhaben Baruah")

    ALERTS_REGISTRY.append({
        "id": "alert-3",
        "patient_id": p_id,
        "domain": "memory_match",
        "has_alert": True,
        "suppressed": False,
        "trigger_metric": "Acute score dip (z = -2.75)",
        "triggering_numbers": {"robust_z": -2.75, "current_score": 0.42, "baseline_median": 0.84},
    })

    # Authorized ASHA access
    res = client.get(
        f"/v1/asha/patients/{p_id}",
        headers={"Authorization": "Bearer asha-primary"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == p_id
    assert data["status"] == "checkin_suggested"
    assert data["guardian_name"] == "Jonali Baruah"
    assert len(data["active_alerts"]) == 1
    assert data["active_alerts"][0]["triggering_numbers"]["robust_z"] == -2.75

    # Unauthorized ASHA access -> 403
    res_unauth = client.get(
        f"/v1/asha/patients/{p_id}",
        headers={"Authorization": "Bearer asha-stranger"},
    )
    assert res_unauth.status_code == 403


def test_server_side_pdf_report_export():
    """Verify server-side PDF generation contains evidence, non-diagnostic copy, and synthetic disclaimer."""
    p_id = _setup_patient_with_consent("asha-export", "Bhaben Baruah")

    ALERTS_REGISTRY.append({
        "id": "alert-4",
        "patient_id": p_id,
        "domain": "memory_match",
        "has_alert": True,
        "suppressed": False,
        "trigger_metric": "Acute score dip (z = -2.85)",
        "triggering_numbers": {
            "robust_z": -2.85,
            "current_score": 0.42,
            "baseline_median": 0.82,
            "sample_size": 14,
        },
    })

    # Export PDF
    res = client.get(
        f"/v1/asha/patients/{p_id}/report.pdf",
        headers={"Authorization": "Bearer asha-export"},
    )
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert "attachment" in res.headers["content-disposition"]

    pdf_bytes = res.content
    # Standard PDF 1.4 verification
    assert pdf_bytes.startswith(b"%PDF-1.4")
    assert pdf_bytes.rstrip().endswith(b"%%EOF")

    pdf_text = pdf_bytes.decode("latin1", errors="ignore")
    # Verify synthetic demo label
    assert "SYNTHETIC" in pdf_text or "DEMO" in pdf_text
    # Verify patient information
    assert "Bhaben Baruah" in pdf_text
    # Verify explainable evidence
    assert "Robust Z-Score" in pdf_text
    assert "-2.85" in pdf_text
    # Verify non-diagnostic advisory
    assert "Consider a check-up with a doctor" in pdf_text
    assert is_safe_message(pdf_text) is True

    # Unauthorized access -> 403
    res_unauth = client.get(
        f"/v1/asha/patients/{p_id}/report.pdf",
        headers={"Authorization": "Bearer asha-intruder"},
    )
    assert res_unauth.status_code == 403
