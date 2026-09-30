import math
import pytest
from app.services.adaptive import (
    calculate_probability,
    calculate_k,
    calculate_target_difficulty,
    update_theta,
    batch_update_ability,
    LN_3,
    MIN_THETA,
    MAX_THETA,
)


def test_probability_calculation():
    assert calculate_probability(0.0, 0.0) == pytest.approx(0.5, abs=1e-5)
    assert calculate_probability(2.0, 2.0) == pytest.approx(0.5, abs=1e-5)
    # Expected target success rate at b* = theta - ln(3) must be 0.75
    theta = 1.0
    b_star = calculate_target_difficulty(theta)
    assert calculate_probability(theta, b_star) == pytest.approx(0.75, abs=1e-5)


def test_k_decay():
    assert calculate_k(0) == pytest.approx(0.40, abs=1e-5)
    assert calculate_k(15) == pytest.approx(0.25, abs=1e-5)
    assert calculate_k(30) == pytest.approx(0.10, abs=1e-5)
    assert calculate_k(100) == pytest.approx(0.10, abs=1e-5)


def test_target_difficulty():
    assert calculate_target_difficulty(0.0) == pytest.approx(-LN_3, abs=1e-5)
    assert calculate_target_difficulty(2.0) == pytest.approx(2.0 - LN_3, abs=1e-5)


def test_theta_update_and_clamping():
    # Correct answer on target item
    new_theta, p, k = update_theta(0.0, -LN_3, True, 0)
    assert p == pytest.approx(0.75, abs=1e-5)
    assert k == pytest.approx(0.40, abs=1e-5)
    # delta = 0.40 * (1.0 - 0.75) = +0.10
    assert new_theta == pytest.approx(0.10, abs=1e-5)

    # Clamping bounds
    high_theta, _, _ = update_theta(3.95, -2.0, True, 0)
    assert high_theta <= MAX_THETA

    low_theta, _, _ = update_theta(-3.95, 2.0, False, 0)
    assert low_theta >= MIN_THETA


def test_batch_update_ability():
    # Succeeding on items increases theta
    success_events = [
        {"difficulty": 0.0, "correct": True},
        {"difficulty": 0.5, "correct": True},
    ]
    theta_after_success = batch_update_ability(0.0, success_events)
    assert theta_after_success > 0.0

    # In IRT, failing an easy item (-0.5) has higher penalty than failing a hard item (+1.5)
    theta_fail_easy = batch_update_ability(0.0, [{"difficulty": -0.5, "correct": False}])
    theta_fail_hard = batch_update_ability(0.0, [{"difficulty": 1.5, "correct": False}])
    # Failing an easy item drops theta further down than failing a hard item
    assert theta_fail_easy < theta_fail_hard
