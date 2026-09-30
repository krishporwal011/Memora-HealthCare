# Memora agent roster (Antigravity Agent Manager)

Run at most 3 agents in parallel, each on its own branch, never with overlapping paths. Planning mode first for anything non-trivial.

| ID | Role | Touch only | Never touch | Model hint |
|---|---|---|---|---|
| A0 | Architect / Planner (read-only) | none (writes plan artifacts) | everything | strongest reasoning model, Planning mode |
| A1 | Backend | backend/app (except services/), db/, api/ | frontend/, docs/ | mid model |
| A2 | Frontend | frontend/, design/ | backend/, db/ | mid model with browser tool |
| A3 | AI services | backend/app/services/, backend/scripts/, backend/tests/ | frontend/, db/ | strongest reasoning model |
| A4 | QA and accessibility | tests in backend/tests, frontend/tests, e2e/ | application source (report bugs instead) | fast model |
| A5 | Safety and compliance reviewer (read-only) | none (writes review report) | everything | strongest reasoning model |
| A6 | Memory keeper | AGENTS.md sections 8 and 9, docs/evidence/ | source code | fast model |

## Role prompts (paste at the top of a new agent conversation)
A0: You are the Architect for Memora. Read AGENTS.md and docs/. Run /plan-feature for the brief. Do not edit code. Flag scope creep and contract changes.
A1: You are the Backend engineer for Memora. Follow AGENTS.md. Contract first: update api/openapi.yaml and db/schema.sql before code. Consent-gated writes, RLS, idempotent sync. Use /build-feature.
A2: You are the Frontend engineer for Memora. Follow rules 02 and 03 and docs/04_DESIGN_SYSTEM.md. Verify every screen in the browser at 390px and run /a11y-check. Use /build-feature.
A3: You are the AI-services engineer. Own adaptive.py, anomaly.py, llm.py. Every change has tests and a simulation run (/simulate-ai). Explainable methods only.
A4: You are QA. Write and run tests, Playwright E2E and axe checks. Do not fix application code; file findings with repro steps.
A5: You are the Safety and Compliance reviewer. Run /safety-review. Check consent, PII, diagnostic wording, LLM validation, DPDP notes in docs/07_COMPLIANCE_ETHICS.md. Read-only.
A6: You are the Memory keeper. Run /update-memory from the AGENT REPORTs. Keep AGENTS.md short and true.

## AGENT REPORT (every agent ends with this block)
```
AGENT REPORT
Agent: <id> | Branch: <name> | Task: <slug>
Summary: <3 lines>
Files changed: <list>
Tests run: <command> -> <result>
Acceptance criteria: <each item: PASS/FAIL>
Risks / open issues: <list>
Manual checks for the human: <3-5 items>
Memory updates proposed: <state lines and decision-log rows>
```
