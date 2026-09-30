"""
Memora Safe Alert Language Service (B18).
Generates caregiver-friendly alert explanations safely using LLM with deterministic guardrails.

Hard Invariants:
1. Every alert message must end with: "Consider a check-up with a doctor."
2. Never output or imply clinical diagnosis or staging (no "Alzheimer", "dementia", "stage", "decline", "disease").
3. is_safe_message validation strictly enforced.
4. If LLM phrasing fails validation or contains blocked words -> use fixed-template fallback immediately.
"""

from typing import Dict, Any, Optional, Callable
from app.services.anomaly import is_safe_message

MANDATORY_CONCLUSION = "Consider a check-up with a doctor."

FIXED_FALLBACK_TEMPLATE = (
    "Recent activity scores ({current_score}) were lower than their typical range ({baseline_median}). "
    "Daily performance naturally varies and can reflect ordinary factors like fatigue, minor illness, or distraction. "
    f"{MANDATORY_CONCLUSION}"
)


def get_fixed_template_alert(current_score: float, baseline_median: float) -> str:
    """Generate deterministic, medically safe fallback alert message."""
    return FIXED_FALLBACK_TEMPLATE.format(
        current_score=round(current_score, 2),
        baseline_median=round(baseline_median, 2),
    )


class SafeAlertGenerator:
    """
    Caregiver alert messaging generator with LLM paraphrasing and safety fallbacks.
    """

    def __init__(self, llm_provider: Optional[Callable[[str], str]] = None):
        self.llm_provider = llm_provider

    def generate_prompt(self, evidence: Dict[str, Any]) -> str:
        current = evidence.get("current_score", 0.0)
        median = evidence.get("baseline_median", 0.0)
        domain = evidence.get("domain", "memory activity")

        return (
            "You are a calm, supportive assistant for family caregivers in North East India.\n"
            f"The elder's recent performance in {domain} was {round(current, 2)}, compared to their usual range of {round(median, 2)}.\n"
            "Explain this observation to the caregiver in 2-3 calm, comforting sentences.\n"
            "CRITICAL CONSTRAINTS:\n"
            "1. NEVER use words like Alzheimer's, dementia, disease, decline, stage, deterioration, or diagnosis.\n"
            "2. Note that performance variations are common and may be caused by tiredness, poor sleep, or temporary distraction.\n"
            f"3. You MUST conclude the message with exactly: '{MANDATORY_CONCLUSION}'\n"
        )

    def generate_alert_message(
        self,
        evidence: Dict[str, Any],
        custom_llm: Optional[Callable[[str], str]] = None,
    ) -> str:
        """
        Generate safe alert message.
        Validates LLM output through is_safe_message and mandatory closing sentence.
        Falls back to fixed template on any failure.
        """
        current = float(evidence.get("current_score") or 0.0)
        median = float(evidence.get("baseline_median") or 0.0)

        provider = custom_llm or self.llm_provider

        if provider:
            try:
                prompt = self.generate_prompt(evidence)
                llm_candidate = provider(prompt).strip()

                # 1. Blocklist and non-diagnostic vocabulary check
                if is_safe_message(llm_candidate):
                    # 2. Ensure mandatory conclusion is present
                    if not llm_candidate.endswith(MANDATORY_CONCLUSION):
                        llm_candidate = f"{llm_candidate.rstrip('.')} {MANDATORY_CONCLUSION}"

                    # Final re-validation
                    if is_safe_message(llm_candidate):
                        return llm_candidate
            except Exception:
                # Any LLM error -> graceful fallback
                pass

        # Fixed safe template fallback
        return get_fixed_template_alert(current, median)
