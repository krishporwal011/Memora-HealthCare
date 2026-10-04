# Rule 02: Patient UI
- One primary action per screen. Every icon has a visible text label. Buttons bordered, min 64px high (44px minimum anywhere).
- No auto-moving carousels, no auto-advance, no visible timers, no streak pressure.
- Each screen has all context needed to act. Max 2 lines / 20 words of instruction, present tense.
- No patronising words ("good job", "well done", pet names). Use "That is right." / "Here is the answer."
- Contrast 7:1 for patient text. Animation under 200ms, only after a tap, respect prefers-reduced-motion.
- Tokens only from `frontend/src/styles/tokens.css`. No new colours without updating DESIGN.md.
