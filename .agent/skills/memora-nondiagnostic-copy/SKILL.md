---
name: memora-nondiagnostic-copy
description: Use when writing or reviewing any user-facing text, alert, report, LLM prompt or translation in Memora.
---

# Non-diagnostic copy
1. Patient text: present tense, under 20 words, adult tone, no praise words, no blame. Use "That is right." and "Let us try another one."
2. Alert text: evidence first, then "This can have many causes. Consider a check-up with a doctor."
3. Never name a disease, stage or prognosis. Never say a score "means" anything clinical.
4. Run the vocabulary check (`backend/app/services/anomaly.py: is_safe_message`) on any generated text.
5. Translations: mark machine-assisted strings with a `_note` and require native-speaker review before real use.
