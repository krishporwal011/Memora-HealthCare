---
name: memora-adaptive-engine
description: Use when changing difficulty selection, ability updates, item banks or session caps in Memora.
---

# Adaptive engine
1. Formula: p = sigmoid(theta - b); update theta += K*(y - p); K decays 0.40 to 0.10 over 30 answers; clamp theta to [-4, 4].
2. Target success 0.75, so target difficulty b* = theta - ln 3. Choose the item nearest b*, excluding only the last 20 answered items (cooldown, not never-repeat).
3. Safety: 3 errors in a row ends the session and lowers theta by 0.3. 10 minute cap.
4. Change `backend/app/services/adaptive.py` and `frontend/src/lib/adaptive.ts` together. Run `cd backend && pytest -q tests/test_adaptive.py`.
5. Re-run the simulation and report mean success (target 0.70-0.82) and theta error (under 0.4).
6. Keep at least 15 items per 0.5 difficulty band per domain.
