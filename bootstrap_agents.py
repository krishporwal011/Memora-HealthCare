#!/usr/bin/env python3
"""Memora: creates the Antigravity working-agent setup in your repo root.
Usage (from repo root, next to AGENTS.md):  python bootstrap_agents.py [--agent-dir .agent] [--force]
Safe: skips files that already exist unless --force.
"""
import argparse, pathlib

ap = argparse.ArgumentParser()
ap.add_argument("--agent-dir", default=".agents", help="Antigravity config folder name (.agent or .agents, check your version)")
ap.add_argument("--force", action="store_true")
a = ap.parse_args()
A = a.agent_dir.strip("/")

F = {}

F["GEMINI.md"] = r'''# GEMINI.md (Antigravity overrides). Project memory lives in AGENTS.md, read it first.

- Always read `AGENTS.md` fully before any task. It is the source of truth; this file only adds Antigravity-specific behaviour.
- Planning first: for any task touching more than 2 files, produce an Implementation Plan artifact and STOP for approval before editing code.
- Finish every task with a Walkthrough artifact AND the AGENT REPORT block (format in `.agent/AGENT_ROSTER.md`).
- Stay inside the TOUCH ONLY paths given in the brief. If you need another path, stop and ask.
- Ask before: installing dependencies, running destructive commands, editing CI, touching `db/schema.sql` or `api/openapi.yaml` (contract-first).
- Never read or print `.env`. Never commit secrets. Synthetic data only.
- Branch per task: `agent/<agent-name>/<slug>`. Small commits. Never force-push. Never merge to main yourself.
- Keep it simple: one developer maintains this. No new service, queue or framework without a written reason in the brief.
- Do not use diagnostic wording (see rule 01). When unsure about clinical or legal wording, leave a TODO for a human.
'''

F[f"{A}/rules/00-project-memory.md"] = r'''# Rule 00: Project memory
- Read `AGENTS.md` before starting. If the task conflicts with it, stop and report the conflict.
- Do not edit `AGENTS.md` unless your agent is A6 (Memory) or the brief says so. Put proposed changes in your AGENT REPORT under "Memory updates".
'''
F[f"{A}/rules/01-safety-nondiagnostic.md"] = r'''# Rule 01: Non-diagnostic, dignified, safe
- Memora supports memory activities. It never diagnoses, stages, predicts disease or claims treatment.
- Banned in user-facing text, alerts, reports, prompts' outputs: alzheimer, dementia (as a label for a person), stage, diagnos*, disease, decline, deteriorat*, severe, moderate.
  (The word "dementia" may appear in internal docs and the required disclaimer context only.)
- Alerts must show evidence numbers and end with "Consider a check-up with a doctor."
- No facial emotion recognition. No always-on mic or camera. No raw audio retention. No location tracking.
- LLM outputs are data: validate against a schema, post-check vocabulary, never render raw model text to a patient.
'''
F[f"{A}/rules/02-patient-ui.md"] = r'''# Rule 02: Patient UI
- One primary action per screen. Every icon has a visible text label. Buttons bordered, min 64px high (44px minimum anywhere).
- No auto-moving carousels, no auto-advance, no visible timers, no streak pressure.
- Each screen has all context needed to act. Max 2 lines / 20 words of instruction, present tense.
- No patronising words ("good job", "well done", pet names). Use "That is right." / "Here is the answer."
- Contrast 7:1 for patient text. Animation under 200ms, only after a tap, respect prefers-reduced-motion.
- Tokens only from `frontend/src/styles/tokens.css`. No new colours without updating docs/04_DESIGN_SYSTEM.md.
'''
F[f"{A}/rules/03-offline-first.md"] = r'''# Rule 03: Offline first
- Every patient feature works with no network. Write to IndexedDB first, sync later.
- Events get client-generated UUIDv7 ids; server upserts with ON CONFLICT DO NOTHING (idempotent).
- Client adaptive code mirrors `backend/app/services/adaptive.py` exactly; change both or neither, with a test for each.
- Consent row must exist before any patient-data write (API returns 403 otherwise; RLS enforces it too).
'''
F[f"{A}/rules/04-git-and-scope.md"] = r'''# Rule 04: Git, scope, commands
- One agent, one branch, one outcome (about 2 hours of work). No drive-by refactors.
- Commit messages: `type(scope): summary` (feat, fix, test, docs, chore).
- Allowed without asking: read files, run tests, lint, type-check, run the dev server.
- Ask first: install/upgrade deps, network calls to new hosts, deleting files, DB migrations, anything outside TOUCH ONLY paths.
- Never run: `rm -rf` outside build folders, `git push --force`, `git reset --hard` on shared branches, commands that print env vars.
'''
F[f"{A}/rules/05-solo-dev-simplicity.md"] = r'''# Rule 05: Simple enough for one person
- Prefer boring, documented tech already in AGENTS.md section 4. Managed services over self-hosting.
- No Redis, queues, microservices, Kubernetes, or new ORMs without a written reason in the brief.
- Every function has a test when it touches adaptive, anomaly, consent, sync, or LLM validation.
- Explain non-obvious code with a short comment; the developer must be able to defend it in front of judges.
'''

def wf(desc, steps):
    return "---\ndescription: " + desc + "\n---\n\n" + "\n".join(f"{i}. {s}" for i, s in enumerate(steps, 1)) + "\n"

F[f"{A}/workflows/plan-feature.md"] = wf("Plan a Memora feature and stop for approval", [
    "Read AGENTS.md and every file listed under CONTEXT FILES in the brief.",
    "List the files you will touch, the files you will NOT touch, and the tests you will add.",
    "Produce an Implementation Plan artifact: steps, risks (privacy, consent, diagnostic wording, offline, accessibility), acceptance criteria.",
    "Check the plan against rules 00-05. Note any conflict.",
    "STOP and wait for human approval. Do not edit code."])
F[f"{A}/workflows/build-feature.md"] = wf("Implement an approved plan on its own branch and report", [
    "Confirm an approved plan exists. If not, run /plan-feature first.",
    "Create branch agent/<agent>/<slug>.",
    "Implement in small steps; after each step run the relevant tests.",
    "Add or update tests. Keep coverage of adaptive/anomaly/consent/sync at 100% of existing tests passing.",
    "Run /safety-review on changed files.",
    "Produce a Walkthrough artifact (screenshots for UI).",
    "Finish with the AGENT REPORT block from .agent/AGENT_ROSTER.md."])
F[f"{A}/workflows/safety-review.md"] = wf("Read-only safety, privacy and wording review", [
    "List changed files (git diff --name-only against main).",
    "Search user-facing strings and prompts for banned diagnostic terms (rule 01).",
    "Verify every patient-data write path checks consent (API and RLS).",
    "Verify no PII, names, photos or tokens are logged; no raw audio stored.",
    "Verify LLM output is schema-validated and post-checked before display.",
    "Report PASS/FAIL per item with file:line evidence. Do not edit code."])
F[f"{A}/workflows/a11y-check.md"] = wf("Accessibility pass on changed screens", [
    "Start the dev server and open each changed screen with the browser tool at 390px width.",
    "Run axe-core via Playwright; list violations.",
    "Check: 64px targets, visible text labels on icons, 7:1 contrast for patient text, focus ring visible, works at 200% text size, reduced motion.",
    "Capture screenshots and attach them to the Walkthrough.",
    "Report failures with the exact selector and fix suggestion."])
F[f"{A}/workflows/simulate-ai.md"] = wf("Run the synthetic evaluation and report numbers", [
    "Run the simulation scripts in backend/scripts (create them if missing, following docs/05_AI_SPEC.md section 8).",
    "Report: mean success rate after 30 items, theta error after 40 items, alert precision/recall on 5 scenarios x 200 runs, false alerts per month.",
    "Label every number as SYNTHETIC. Never describe results as clinical evidence.",
    "Save results to docs/evidence/YYYY-MM-DD.md."])
F[f"{A}/workflows/update-memory.md"] = wf("Keep AGENTS.md current (A6 only)", [
    "Read AGENTS.md and the latest AGENT REPORTs.",
    "Edit only section 8 (Current state) and section 9 (Decision log). Append to the log; never rewrite history.",
    "Keep the file under 250 lines. Remove outdated 'Next' items.",
    "Show the diff and stop for approval."])
F[f"{A}/workflows/demo-check.md"] = wf("Rehearse the 4-minute demo with the browser agent", [
    "Follow docs/09_PITCH_AND_QA.md demo script step by step in the running app.",
    "Test offline by disabling the network, then reconnect and confirm events sync once.",
    "Record failures, slow steps (over 2s) and any diagnostic wording seen.",
    "Output a pass/fail table and a fix list ordered by demo impact."])

def skill(name, desc, body):
    return f"---\nname: {name}\ndescription: {desc}\n---\n\n{body}\n"

F[f"{A}/skills/memora-adaptive-engine/SKILL.md"] = skill("memora-adaptive-engine",
  "Use when changing difficulty selection, ability updates, item banks or session caps in Memora.",
  r'''# Adaptive engine
1. Formula: p = sigmoid(theta - b); update theta += K*(y - p); K decays 0.40 to 0.10 over 30 answers; clamp theta to [-4, 4].
2. Target success 0.75, so target difficulty b* = theta - ln 3. Choose the item nearest b*, excluding only the last 20 answered items (cooldown, not never-repeat).
3. Safety: 3 errors in a row ends the session and lowers theta by 0.3. 10 minute cap.
4. Change `backend/app/services/adaptive.py` and `frontend/src/lib/adaptive.ts` together. Run `cd backend && pytest -q tests/test_adaptive.py`.
5. Re-run the simulation and report mean success (target 0.70-0.82) and theta error (under 0.4).
6. Keep at least 15 items per 0.5 difficulty band per domain.''')
F[f"{A}/skills/memora-offline-sync/SKILL.md"] = skill("memora-offline-sync",
  "Use when touching the IndexedDB queue, service worker, /v1/events:batch or anything that must work offline.",
  r'''# Offline sync
1. Write the event to Dexie first (`frontend/src/lib/offline.ts`), with a UUIDv7 id.
2. Sync in batches of at most 200 to `/v1/events:batch`; delete only acknowledged ids.
3. Server is idempotent: upsert with ON CONFLICT DO NOTHING; return acked ids and the new ability.
4. Test: airplane mode session, reconnect, each event appears exactly once; kill the tab mid-sync and retry.
5. Cache the app shell and item bank in the service worker; budget 300 KB gzipped for the shell.''')
F[f"{A}/skills/memora-nondiagnostic-copy/SKILL.md"] = skill("memora-nondiagnostic-copy",
  "Use when writing or reviewing any user-facing text, alert, report, LLM prompt or translation in Memora.",
  r'''# Non-diagnostic copy
1. Patient text: present tense, under 20 words, adult tone, no praise words, no blame. Use "That is right." and "Let us try another one."
2. Alert text: evidence first, then "This can have many causes. Consider a check-up with a doctor."
3. Never name a disease, stage or prognosis. Never say a score "means" anything clinical.
4. Run the vocabulary check (`backend/app/services/anomaly.py: is_safe_message`) on any generated text.
5. Translations: mark machine-assisted strings with a `_note` and require native-speaker review before real use.''')
F[f"{A}/skills/memora-supabase-rls/SKILL.md"] = skill("memora-supabase-rls",
  "Use when editing db/schema.sql, policies, migrations or any query that reads patient data.",
  r'''# Supabase RLS
1. Every table has RLS enabled. A user sees a patient only via `patient_members` (`is_member()`).
2. Writes of sessions, events and memories also require `has_consent()`.
3. Service-role key stays on the server only. Reads for caregivers use the user's JWT.
4. After any policy change, test with two users: B must not read A's patient, events, memories or alerts.
5. Update `db/schema.sql` and `api/openapi.yaml` first (contract-first), then code.''')
F[f"{A}/skills/memora-i18n/SKILL.md"] = skill("memora-i18n",
  "Use when adding or changing strings, languages, fonts, or speech (TTS/ASR) in Memora.",
  r'''# i18n and speech
1. Strings live in `frontend/locales/<lang>.json`; no sentence concatenation; every key exists in `en.json` first.
2. Scripts: Bengali script (as, bn), Devanagari (hi, ne, brx), Meitei Mayek (mni). Load the matching Noto font per language.
3. Test at 200% text size and 30% longer strings; no clipped buttons.
4. Speech order: Bhashini, then recorded audio, then text/icons. Verify coverage per language with the Bhashini pipeline API before claiming support. Audio is transcribed then discarded.
5. Machine-assisted translations need a `_note` and native-speaker review.''')

F[f"{A}/AGENT_ROSTER.md"] = r'''# Memora agent roster (Antigravity Agent Manager)

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
'''

F["agent-briefs/_TEMPLATE.md"] = r'''AGENT: <A0..A6>
BRANCH: agent/<name>/<slug>
WORKFLOW: </plan-feature | /build-feature | /safety-review | /a11y-check | /simulate-ai | /update-memory | /demo-check>
GOAL: <one sentence, one outcome, about 2 hours of work>
CONTEXT FILES: <paths to read>
TOUCH ONLY: <paths>
DO NOT TOUCH: <paths>
ACCEPTANCE CRITERIA:
- [ ] <testable item>
TESTS TO RUN: <commands>
OUT OF SCOPE: <list>
REPORT BACK: finish with the AGENT REPORT block from .agent/AGENT_ROSTER.md
'''

F[".antigravityignore"] = r'''.env
.env.*
node_modules/
.next/
.venv/
__pycache__/
*.log
dist/
coverage/
*.zip
'''

for path, text in F.items():
    p = pathlib.Path(path)
    if p.exists() and not a.force:
        print("skip (exists):", path); continue
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(text, encoding="utf-8")
    print("wrote:", path)
print(f"\nDone. {len(F)} files. Open Agent Manager and start with agent-briefs/_TEMPLATE.md")
