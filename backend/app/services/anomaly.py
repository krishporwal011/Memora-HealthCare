"""
Memora Cognitive Trend and Anomaly Detection Service.
Uses explainable statistics: Median/MAD Robust Z-Score + One-Sided CUSUM.
Does NOT use deep learning or opaque black-box models.
Does NOT output clinical diagnosis or disease staging.
"""

from typing import List, Dict, Any, Tuple, Optional
import math

# Banned diagnostic/clinical terms per safety rule 01
BANNED_WORDS = [
    "alzheimer",
    "dementia",
    "stage",
    "diagnos",
    "disease",
    "decline",
    "deteriorat",
    "severe",
    "moderate",
    "patholog",
    "incurable",
]


def is_safe_message(text: str) -> bool:
    """
    Safety check: Ensure text does NOT contain any banned clinical/diagnostic words.
    """
    lower = text.lower()
    for word in BANNED_WORDS:
        if word in lower:
            return False
    return True


def compute_median_and_mad(values: List[float]) -> Tuple[float, float]:
    """
    Compute median and Median Absolute Deviation (MAD).
    Normalized scale factor 1.4826 makes MAD an unbiased estimator of standard deviation
    for normally distributed data while resisting outlier distortion.
    """
    if not values:
        return 0.0, 1.0

    sorted_vals = sorted(values)
    n = len(sorted_vals)
    median = (
        sorted_vals[n // 2]
        if n % 2 != 0
        else (sorted_vals[n // 2 - 1] + sorted_vals[n // 2]) / 2.0
    )

    deviations = sorted([abs(x - median) for x in values])
    mad = (
        deviations[n // 2]
        if n % 2 != 0
        else (deviations[n // 2 - 1] + deviations[n // 2]) / 2.0
    )

    # Scale by 1.4826 for asymptotic normal consistency; floor at epsilon 0.05
    mad_scaled = max(1.4826 * mad, 0.05)
    return median, mad_scaled


def compute_robust_z_score(value: float, baseline_values: List[float]) -> float:
    """
    Calculate robust z-score: z = (x - median) / (1.4826 * MAD)
    Negative z indicates score below baseline usual range.
    """
    if len(baseline_values) < 3:
        return 0.0

    median, scale = compute_median_and_mad(baseline_values)
    return (value - median) / scale


class AnomalyDetector:
    """
    Longitudinal monitor tracking daily scores and detecting meaningful persistent changes.
    """

    def __init__(self, z_threshold: float = -2.5, cusum_threshold: float = 4.0):
        self.z_threshold = z_threshold
        self.cusum_threshold = cusum_threshold

    def evaluate_trend(
        self,
        daily_scores: List[float],
        is_unwell_today: bool = False,
        sessions_on_current_device: int = 5,
    ) -> Dict[str, Any]:
        """
        Evaluate recent scores against rolling baseline with suppression rules.
        """
        evidence: Dict[str, Any] = {
            "has_alert": False,
            "suppressed": False,
            "suppression_reason": None,
            "trigger_metric": None,
            "current_score": daily_scores[-1] if daily_scores else None,
            "baseline_median": None,
            "robust_z": 0.0,
            "cusum_s": 0.0,
            "safe_caregiver_message": None,
        }

        # Need at least 5 baseline points
        if len(daily_scores) < 5:
            return evidence

        baseline = daily_scores[:-1]  # Exclude current observation
        current = daily_scores[-1]

        # Compute median and scaled MAD
        median, mad_scaled = compute_median_and_mad(baseline)
        z = compute_robust_z_score(current, baseline)
        evidence["baseline_median"] = round(median, 3)
        evidence["robust_z"] = round(z, 3)

        # 1. Suppression Check: Unwell Today
        if is_unwell_today:
            evidence["suppressed"] = True
            evidence["suppression_reason"] = "Caregiver flagged patient as unwell today"
            evidence["triggering_numbers"] = {
                "robust_z": round(z, 3),
                "cusum_s": 0.0,
                "current_score": round(current, 3),
                "baseline_median": round(median, 3),
                "baseline_mad": round(mad_scaled, 3),
                "sample_size": len(daily_scores),
            }
            return evidence

        # 2. Suppression Check: New Device Adaptation (< 3 sessions)
        if sessions_on_current_device < 3:
            evidence["suppressed"] = True
            evidence["suppression_reason"] = "New device calibration period (< 3 sessions)"
            evidence["triggering_numbers"] = {
                "robust_z": round(z, 3),
                "cusum_s": 0.0,
                "current_score": round(current, 3),
                "baseline_median": round(median, 3),
                "baseline_mad": round(mad_scaled, 3),
                "sample_size": len(daily_scores),
            }
            return evidence

        # 3. Compute One-Sided CUSUM for downward drift
        # S_0 = 0, S_t = max(0, S_{t-1} + (k - z_t)) where reference k = 0.5
        cusum_s = 0.0
        for score in daily_scores[-7:]:
            score_z = compute_robust_z_score(score, baseline)
            # Downward shift detection: -score_z measures drop
            cusum_s = max(0.0, cusum_s + (-score_z - 0.5))

        evidence["cusum_s"] = round(cusum_s, 3)
        evidence["triggering_numbers"] = {
            "robust_z": round(z, 3),
            "cusum_s": round(cusum_s, 3),
            "current_score": round(current, 3),
            "baseline_median": round(median, 3),
            "baseline_mad": round(mad_scaled, 3),
            "sample_size": len(daily_scores),
        }

        # Trigger conditions:
        # a) Acute dip: z < -2.5
        # b) Sustained shift: cusum_s > cusum_threshold
        if z <= self.z_threshold:
            evidence["has_alert"] = True
            evidence["trigger_metric"] = f"Acute score dip (z = {round(z, 2)} <= {self.z_threshold})"
        elif cusum_s >= self.cusum_threshold:
            evidence["has_alert"] = True
            evidence["trigger_metric"] = f"Sustained downward shift (CUSUM = {round(cusum_s, 2)} >= {self.cusum_threshold})"

        if evidence["has_alert"]:
            # Deterministic, safe caregiver copy (strict non-diagnostic wording)
            evidence["safe_caregiver_message"] = (
                f"Today's memory activity performance was lower than their usual range "
                f"(score {round(current, 2)} vs typical {round(median, 2)}). "
                f"This can have many temporary causes such as tiredness, distraction, or mild fever. "
                f"Consider a check-up with a doctor if this pattern continues."
            )

        return evidence


def calculate_daily_scores(events: List[Dict[str, Any]]) -> Dict[str, List[float]]:
    """
    Aggregate activity events by day and domain into chronological daily accuracy scores.
    Returns a dictionary mapping each domain to a chronological list of daily scores [0.0 - 1.0].
    """
    if not events:
        return {}

    # Group by domain and date (YYYY-MM-DD)
    domain_dates: Dict[str, Dict[str, List[bool]]] = {}
    overall_dates: Dict[str, List[bool]] = {}

    for ev in events:
        ts = ev.get("timestamp") or ev.get("created_at") or ""
        date_key = ts[:10] if len(ts) >= 10 else "unknown"
        if date_key == "unknown":
            continue

        domain = ev.get("domain", "general")
        correct = bool(ev.get("correct", False))

        if domain not in domain_dates:
            domain_dates[domain] = {}
        if date_key not in domain_dates[domain]:
            domain_dates[domain][date_key] = []
        domain_dates[domain][date_key].append(correct)

        if date_key not in overall_dates:
            overall_dates[date_key] = []
        overall_dates[date_key].append(correct)

    result: Dict[str, List[float]] = {}

    for domain, dates in domain_dates.items():
        sorted_dates = sorted(dates.keys())
        daily_scores = [
            round(sum(1 for c in dates[d] if c) / len(dates[d]), 4)
            for d in sorted_dates
        ]
        result[domain] = daily_scores

    # Include overall composite
    sorted_overall_dates = sorted(overall_dates.keys())
    result["overall"] = [
        round(sum(1 for c in overall_dates[d] if c) / len(overall_dates[d]), 4)
        for d in sorted_overall_dates
    ]

    return result
