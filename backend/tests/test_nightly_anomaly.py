import pytest
from app.services.anomaly import (
    calculate_daily_scores,
    AnomalyDetector,
    is_safe_message,
)
from app.jobs.nightly_anomaly import (
    process_patient_anomaly_trend,
    run_nightly_anomaly_processing,
    ALERTS_REGISTRY,
    clear_alerts,
)


@pytest.fixture(autouse=True)
def reset_registry():
    clear_alerts()


def _generate_mock_events(
    patient_id: str,
    domain: str,
    accuracy_profile: list,
):
    """Helper to generate multi-day mock events with unique patient-scoped IDs."""
    events = []
    total_items = 20
    for day_idx, acc in enumerate(accuracy_profile):
        day_str = f"2026-09-{10 + day_idx:02d}T10:00:00Z"
        correct_items = int(round(acc * total_items))
        for q_idx in range(total_items):
            is_correct = q_idx < correct_items
            events.append({
                "id": f"{patient_id}-ev-{day_idx}-{q_idx}",
                "patient_id": patient_id,
                "domain": domain,
                "correct": is_correct,
                "timestamp": day_str,
                "difficulty": 0.0,
            })
    return events


def test_calculate_daily_scores_aggregates_by_domain_and_day():
    """Verify daily_scores calculation groups events by domain and chronological date."""
    events = [
        {"patient_id": "p1", "domain": "memory_match", "correct": True, "timestamp": "2026-09-01T09:00:00Z"},
        {"patient_id": "p1", "domain": "memory_match", "correct": True, "timestamp": "2026-09-01T09:05:00Z"},
        {"patient_id": "p1", "domain": "memory_match", "correct": False, "timestamp": "2026-09-01T09:10:00Z"},
        {"patient_id": "p1", "domain": "memory_match", "correct": True, "timestamp": "2026-09-02T10:00:00Z"},
        {"patient_id": "p1", "domain": "reminiscence_photo", "correct": True, "timestamp": "2026-09-01T11:00:00Z"},
    ]

    scores = calculate_daily_scores(events)
    assert "memory_match" in scores
    assert "reminiscence_photo" in scores
    assert "overall" in scores

    # Day 1: 2/3 = 0.6667, Day 2: 1/1 = 1.0
    assert scores["memory_match"] == [0.6667, 1.0]
    assert scores["reminiscence_photo"] == [1.0]


def test_nightly_anomaly_detects_acute_dip_and_stores_triggering_numbers():
    """Verify an acute dip triggers an alert carrying full triggering numbers."""
    patient_id = "patient-acute-dip"
    # 5 baseline days at 0.85, 6th day drops sharply to 0.30
    events = _generate_mock_events(
        patient_id=patient_id,
        domain="memory_match",
        accuracy_profile=[0.85, 0.85, 0.85, 0.85, 0.85, 0.30],
    )

    alerts = process_patient_anomaly_trend(patient_id=patient_id, events=events)
    assert len(alerts) >= 1

    alert = next(a for a in alerts if a["domain"] == "memory_match")
    assert alert["has_alert"] is True
    assert alert["suppressed"] is False
    assert alert["robust_z"] <= -2.5

    # Check triggering numbers are stored accurately
    nums = alert["triggering_numbers"]
    assert "robust_z" in nums
    assert "cusum_s" in nums
    assert "current_score" in nums
    assert "baseline_median" in nums
    assert nums["current_score"] == pytest.approx(0.30, abs=0.01)
    assert nums["baseline_median"] == pytest.approx(0.85, abs=0.01)

    # Check non-diagnostic copy
    assert is_safe_message(alert["safe_caregiver_message"]) is True
    assert "Consider a check-up with a doctor" in alert["safe_caregiver_message"]


def test_nightly_anomaly_detects_sustained_cusum_drift():
    """Verify one-sided CUSUM detects persistent downward drift across multiple days."""
    patient_id = "patient-cusum-drift"
    # 14 healthy baseline days at 0.85, followed by 7 mildly shifted days (~0.77)
    # Each day has z ~ -1.5 (does not trigger z <= -2.5), but CUSUM accumulates > 4.0
    events = _generate_mock_events(
        patient_id=patient_id,
        domain="memory_match",
        accuracy_profile=[0.85] * 14 + [0.77, 0.77, 0.77, 0.77, 0.77, 0.77, 0.77],
    )

    alerts = process_patient_anomaly_trend(patient_id=patient_id, events=events)
    alert = next(a for a in alerts if a["domain"] == "memory_match")
    assert alert["has_alert"] is True
    assert alert["cusum_s"] >= 4.0
    assert "CUSUM" in alert["trigger_metric"]
    assert alert["triggering_numbers"]["cusum_s"] >= 4.0


def test_nightly_anomaly_suppression_on_unwell_flag():
    """Verify unwell flag suppresses the alert and documents the suppression reason."""
    patient_id = "patient-unwell"
    events = _generate_mock_events(
        patient_id=patient_id,
        domain="memory_match",
        accuracy_profile=[0.85, 0.85, 0.85, 0.85, 0.85, 0.30],
    )

    alerts = process_patient_anomaly_trend(
        patient_id=patient_id,
        events=events,
        is_unwell_today=True,  # Caregiver flagged unwell
    )
    alert = next(a for a in alerts if a["domain"] == "memory_match")
    assert alert["has_alert"] is False
    assert alert["suppressed"] is True
    assert "unwell" in alert["suppression_reason"].lower()
    assert alert["triggering_numbers"]["current_score"] == pytest.approx(0.30, abs=0.01)


def test_nightly_anomaly_suppression_on_new_device_flag():
    """Verify new device adaptation (< 3 sessions) suppresses the alert."""
    patient_id = "patient-new-device"
    events = _generate_mock_events(
        patient_id=patient_id,
        domain="memory_match",
        accuracy_profile=[0.85, 0.85, 0.85, 0.85, 0.85, 0.30],
    )

    alerts = process_patient_anomaly_trend(
        patient_id=patient_id,
        events=events,
        is_unwell_today=False,
        sessions_on_current_device=2,  # < 3 sessions
    )
    alert = next(a for a in alerts if a["domain"] == "memory_match")
    assert alert["has_alert"] is False
    assert alert["suppressed"] is True
    assert "New device" in alert["suppression_reason"]


def test_run_nightly_job_across_multiple_patients():
    """Run full nightly batch job and verify aggregation."""
    class MockDB:
        def __init__(self):
            self.patients = {
                "p-normal": {"id": "p-normal"},
                "p-dip": {"id": "p-dip"},
                "p-unwell": {"id": "p-unwell"},
            }
            self.game_events = {}

    mock_db = MockDB()

    # Normal patient events (consistently high)
    normal_events = _generate_mock_events("p-normal", "memory_match", [0.85, 0.85, 0.85, 0.85, 0.85, 0.85])
    # Dip patient events (acute dip on day 6)
    dip_events = _generate_mock_events("p-dip", "memory_match", [0.85, 0.85, 0.85, 0.85, 0.85, 0.30])
    # Unwell patient events (dip but flagged unwell)
    unwell_events = _generate_mock_events("p-unwell", "memory_match", [0.85, 0.85, 0.85, 0.85, 0.85, 0.30])

    for ev in normal_events + dip_events + unwell_events:
        mock_db.game_events[ev["id"]] = ev

    summary = run_nightly_anomaly_processing(
        db_instance=mock_db,
        unwell_flags={"p-unwell": True},
    )

    assert summary["status"] == "completed"
    assert summary["total_patients"] == 3
    assert summary["active_alerts_count"] >= 1
    assert summary["suppressed_alerts_count"] >= 1
    assert len(ALERTS_REGISTRY) > 0
