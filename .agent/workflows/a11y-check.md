---
description: Accessibility pass on changed screens
---

1. Start the dev server and open each changed screen with the browser tool at 390px width.
2. Run axe-core via Playwright; list violations.
3. Check: 64px targets, visible text labels on icons, 7:1 contrast for patient text, focus ring visible, works at 200% text size, reduced motion.
4. Capture screenshots and attach them to the Walkthrough.
5. Report failures with the exact selector and fix suggestion.
