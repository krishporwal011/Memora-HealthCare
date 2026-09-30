---
description: Implement an approved plan on its own branch and report
---

1. Confirm an approved plan exists. If not, run /plan-feature first.
2. Create branch agent/<agent>/<slug>.
3. Implement in small steps; after each step run the relevant tests.
4. Add or update tests. Keep coverage of adaptive/anomaly/consent/sync at 100% of existing tests passing.
5. Run /safety-review on changed files.
6. Produce a Walkthrough artifact (screenshots for UI).
7. Finish with the AGENT REPORT block from .agent/AGENT_ROSTER.md.
