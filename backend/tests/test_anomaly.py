import pytest
from app.services.anomaly import (
    compute_median_and_mad,
    compute_robust_z_score,
    AnomalyDetector,
    is_safe_message,
)


def test_median_and_mad_computation():
    values = [0.75, 0.78, 0.80, 0.82, 0.85]
    median, mad = compute_median_and_mad(values)
    assert median == pytest.approx(0.80, abs=1e-5)
    assert mad > 0.0


def test_robust_z_score():
    baseline = [0.80, 0.81, 0.82, 0.79, 0.80]
    # Normal value near median has z near 0
    assert abs(compute_robust_z_score(0.80, baseline)) < 0.5
    # Severe drop has strongly negative z
    assert compute_robust_z_score(0.40, baseline) < -3.0


def test_anomaly_detection_suppression_on_unwell_flag():
    detector = AnomalyDetector()
    scores = [0.80, 0.80, 0.81, 0.79, 0.80, 0.40]

    # Without unwell flag -> triggers alert
    res_alert = detector.evaluate_trend(scores, is_unwell_today=False)
    assert res_alert["has_alert"] is True
    assert res_alert["suppressed"] is False

    # With unwell flag -> alert is suppressed!
    res_suppressed = detector.evaluate_trend(scores, is_unwell_today=True)
    assert res_suppressed["has_alert"] is False
    assert res_suppressed["suppressed"] is True
    assert "unwell" in res_suppressed["suppression_reason"].lower()


def test_safety_blocklist_rejects_diagnostic_wording():
    # Safe text
    safe_text = "Today's performance was lower than usual. Consider consulting a doctor."
    assert is_safe_message(safe_text) is True

    # Banned words
    assert is_safe_message("Alzheimer's detected in session") is False
    assert is_safe_message("Patient has moderate dementia stage 2") is False
    assert is_safe_message("Severe cognitive decline observed") is False
    assert is_safe_message("Deteriorating memory performance") is False
