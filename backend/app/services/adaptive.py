"""
Memora Adaptive Difficulty Engine (1-PL Item Response Theory / Elo formulation)
Python service in exact parity with frontend/src/lib/adaptive.ts
"""

import math
from typing import List, Optional, Tuple, Dict, Any

MIN_THETA = -4.0
MAX_THETA = 4.0
TARGET_SUCCESS_RATE = 0.75
LN_3 = math.log(3.0)  # ln(3) ≈ 1.0986122886681098
COOLDOWN_WINDOW_SIZE = 20
MAX_CONSECUTIVE_ERRORS = 3
CONSECUTIVE_ERROR_PENALTY = 0.3
SESSION_MAX_DURATION_SECONDS = 600  # 10 minutes


def calculate_probability(theta: float, b: float) -> float:
    """Logistic sigmoid function: probability of a correct response."""
    z = theta - b
    # Avoid overflow in exp
    if z < -40.0:
        return 0.0
    if z > 40.0:
        return 1.0
    return 1.0 / (1.0 + math.exp(-z))


def calculate_k(answers_count: int) -> float:
    """Calculate dynamic learning rate K decaying from 0.40 to 0.10 over 30 items."""
    progress = min(max(answers_count / 30.0, 0.0), 1.0)
    return 0.40 - 0.30 * progress


def calculate_target_difficulty(theta: float) -> float:
    """Optimal difficulty b* for 75% target success: b* = theta - ln(3)."""
    return theta - LN_3


def update_theta(
    theta: float, item_difficulty: float, correct: bool, answers_count: int
) -> Tuple[float, float, float]:
    """Update ability theta given response correctness."""
    y = 1.0 if correct else 0.0
    p = calculate_probability(theta, item_difficulty)
    k = calculate_k(answers_count)

    updated = theta + k * (y - p)
    # Clamp within [-4.0, 4.0]
    updated = min(max(updated, MIN_THETA), MAX_THETA)
    return updated, p, k


def batch_update_ability(
    current_theta: float,
    events: List[Dict[str, Any]],
    current_answers_count: int = 0
) -> float:
    """
    Recalculate ability across an ingested batch of events.
    """
    theta = current_theta
    count = current_answers_count

    for ev in events:
        difficulty = float(ev.get("difficulty", 0.0))
        correct = bool(ev.get("correct", False))
        theta, _, _ = update_theta(theta, difficulty, correct, count)
        count += 1

    return theta
