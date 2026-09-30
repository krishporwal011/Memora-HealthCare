import pytest
from app.services.alert_language import (
    SafeAlertGenerator,
    get_fixed_template_alert,
    MANDATORY_CONCLUSION,
)
from app.services.anomaly import is_safe_message


def test_fixed_template_is_strictly_safe_and_has_mandatory_conclusion():
    """Verify fixed template contains no diagnostic terms and ends with doctor advisory."""
    msg = get_fixed_template_alert(current_score=0.45, baseline_median=0.82)
    assert is_safe_message(msg) is True
    assert msg.endswith(MANDATORY_CONCLUSION)
    assert "0.45" in msg
    assert "0.82" in msg


def test_safe_llm_generation_passes_validation():
    """Verify safe LLM phrasing is accepted and formatted properly."""
    def mock_safe_llm(prompt: str) -> str:
        return (
            "We noticed today's activity answers were lower than usual. "
            "Everyday changes in rest or surroundings can influence memory games. "
            "Consider a check-up with a doctor."
        )

    generator = SafeAlertGenerator(llm_provider=mock_safe_llm)
    evidence = {
        "current_score": 0.40,
        "baseline_median": 0.85,
        "domain": "memory_match",
    }
    result = generator.generate_alert_message(evidence)
    assert is_safe_message(result) is True
    assert result.endswith(MANDATORY_CONCLUSION)
    assert "We noticed today's activity answers" in result


def test_unsafe_llm_containing_diagnostic_terms_triggers_fixed_template_fallback():
    """If LLM outputs banned words (dementia, Alzheimer's, decline), fallback is used."""
    unsafe_outputs = [
        "Patient shows early signs of Alzheimer's disease. Consider a check-up with a doctor.",
        "Detected moderate dementia stage 2. Consider a check-up with a doctor.",
        "Significant cognitive decline observed in memory activities. Consider a check-up with a doctor.",
        "Deteriorating test scores suggest pathology. Consider a check-up with a doctor.",
    ]

    for unsafe_text in unsafe_outputs:
        generator = SafeAlertGenerator(llm_provider=lambda p, text=unsafe_text: text)
        evidence = {
            "current_score": 0.35,
            "baseline_median": 0.80,
            "domain": "memory_match",
        }
        result = generator.generate_alert_message(evidence)

        # Unsafe text must be discarded
        assert unsafe_text not in result
        # Fixed template used instead
        assert is_safe_message(result) is True
        assert result.endswith(MANDATORY_CONCLUSION)
        assert "Recent activity scores (0.35) were lower than their typical range (0.8)" in result


def test_llm_exception_falls_back_to_fixed_template():
    """Network error or exception in LLM cleanly triggers fixed template."""
    def mock_failing_llm(prompt: str) -> str:
        raise RuntimeError("API timeout connecting to LLM service")

    generator = SafeAlertGenerator(llm_provider=mock_failing_llm)
    evidence = {
        "current_score": 0.50,
        "baseline_median": 0.88,
        "domain": "memory_match",
    }
    result = generator.generate_alert_message(evidence)
    assert is_safe_message(result) is True
    assert result.endswith(MANDATORY_CONCLUSION)
    assert "0.5" in result
    assert "0.88" in result


def test_missing_mandatory_conclusion_is_safely_appended():
    """If LLM outputs safe text but forgets conclusion, it is appended and verified."""
    def mock_partial_llm(prompt: str) -> str:
        return "Performance was a little lower today, which could be due to tiredness or travel."

    generator = SafeAlertGenerator(llm_provider=mock_partial_llm)
    evidence = {"current_score": 0.40, "baseline_median": 0.80}
    result = generator.generate_alert_message(evidence)

    assert result.endswith(MANDATORY_CONCLUSION)
    assert is_safe_message(result) is True
    assert "Performance was a little lower today" in result
