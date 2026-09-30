"""
Memora Nightly Anomaly Processing Engine (B17).
Computes daily domain scores, robust z-scores, CUSUM drift, and alerts with exact triggering numbers.
Enforces suppression rules (unwell flag, new-device adaptation) and strict non-diagnostic copy.
"""

from datetime import datetime, timezone
import uuid
from typing import List, Dict, Any, Optional

from app.services.anomaly import (
    AnomalyDetector,
    calculate_daily_scores,
    is_safe_message,
)

# In-memory registry for evaluated alerts
ALERTS_REGISTRY: List[Dict[str, Any]] = []


def clear_alerts():
    """Reset alerts registry for clean test isolation."""
    global ALERTS_REGISTRY
    ALERTS_REGISTRY.clear()


def get_alerts_for_patient(patient_id: str) -> List[Dict[str, Any]]:
    """Retrieve all alerts recorded for a patient."""
    return [a for a in ALERTS_REGISTRY if a["patient_id"] == patient_id]


def process_patient_anomaly_trend(
    patient_id: str,
    events: List[Dict[str, Any]],
    is_unwell_today: bool = False,
    sessions_on_current_device: int = 5,
    detector: Optional[AnomalyDetector] = None,
) -> List[Dict[str, Any]]:
    """
    Process events for a single patient across domains.
    Computes daily scores, robust z-score, CUSUM drift, and alert evidence with triggering numbers.
    """
    detector = detector or AnomalyDetector(z_threshold=-2.5, cusum_threshold=4.0)
    domain_daily_scores = calculate_daily_scores(events)
    patient_alerts: List[Dict[str, Any]] = []

    for domain, scores in domain_daily_scores.items():
        if len(scores) < 5:
            # Baseline requires at least 5 observations
            continue

        evidence = detector.evaluate_trend(
            daily_scores=scores,
            is_unwell_today=is_unwell_today,
            sessions_on_current_device=sessions_on_current_device,
        )

        # Record alert if triggered or suppressed (for auditability)
        if evidence["has_alert"] or evidence["suppressed"]:
            safe_msg = evidence.get("safe_caregiver_message")
            if safe_msg and not is_safe_message(safe_msg):
                # Safety fallback if message contains diagnostic vocabulary
                safe_msg = (
                    "Today's activity score was lower than usual. "
                    "Consider a check-up with a doctor."
                )

            alert_record: Dict[str, Any] = {
                "id": str(uuid.uuid4()),
                "patient_id": patient_id,
                "domain": domain,
                "has_alert": evidence["has_alert"],
                "suppressed": evidence["suppressed"],
                "suppression_reason": evidence.get("suppression_reason"),
                "trigger_metric": evidence.get("trigger_metric"),
                "triggering_numbers": evidence.get("triggering_numbers", {}),
                "robust_z": evidence.get("robust_z", 0.0),
                "cusum_s": evidence.get("cusum_s", 0.0),
                "current_score": evidence.get("current_score"),
                "baseline_median": evidence.get("baseline_median"),
                "safe_caregiver_message": safe_msg,
                "evaluated_at": datetime.now(timezone.utc).isoformat(),
            }
            patient_alerts.append(alert_record)

    return patient_alerts


def run_nightly_anomaly_processing(
    db_instance: Any = None,
    unwell_flags: Optional[Dict[str, bool]] = None,
    device_sessions: Optional[Dict[str, int]] = None,
) -> Dict[str, Any]:
    """
    Nightly cron/batch job:
    1. Iterates over all active patients in the repository.
    2. Gathers longitudinal game events.
    3. Computes domain-specific daily scores, robust z-scores, and CUSUM.
    4. Applies suppression rules (unwell flag, new device).
    5. Stores alert evidence with exact triggering numbers.
    """
    unwell_flags = unwell_flags or {}
    device_sessions = device_sessions or {}

    total_patients = 0
    active_alerts_count = 0
    suppressed_alerts_count = 0
    generated_alerts: List[Dict[str, Any]] = []

    if db_instance and hasattr(db_instance, "patients"):
        patients = list(db_instance.patients.values())
        all_events = list(db_instance.game_events.values())

        for patient in patients:
            total_patients += 1
            p_id = patient["id"]
            p_events = [ev for ev in all_events if ev.get("patient_id") == p_id]

            is_unwell = unwell_flags.get(p_id, False)
            device_cnt = device_sessions.get(p_id, 5)

            alerts = process_patient_anomaly_trend(
                patient_id=p_id,
                events=p_events,
                is_unwell_today=is_unwell,
                sessions_on_current_device=device_cnt,
            )

            for a in alerts:
                generated_alerts.append(a)
                ALERTS_REGISTRY.append(a)
                if a["has_alert"] and not a["suppressed"]:
                    active_alerts_count += 1
                elif a["suppressed"]:
                    suppressed_alerts_count += 1

    return {
        "status": "completed",
        "processed_at": datetime.now(timezone.utc).isoformat(),
        "total_patients": total_patients,
        "active_alerts_count": active_alerts_count,
        "suppressed_alerts_count": suppressed_alerts_count,
        "alerts": generated_alerts,
    }
