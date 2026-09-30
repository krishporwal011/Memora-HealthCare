# Memora BUILD PLAN (B01-B26) for Antigravity

Order matters. Each brief = one agent, one branch `agent/<name>/<slug>`, about 2 hours. Max 3 in parallel, never overlapping paths. Paste into Agent Manager with the role prompt from `.agent/AGENT_ROSTER.md`. Every brief ends with an AGENT REPORT, then paste it into Memora Mentor (REVIEW), then you merge. Do backend contract before frontend.

Prereqs: run `python bootstrap_agents.py`; research R1, R3, R4, R7 done (see `research/RESEARCH_PROMPTS.md`). `Needs` lists research notes (R#), Mentor lessons (M#) and earlier briefs.

Parallel pairs that are safe: B04 with B02; B06 with B03; B12 with B09; B14 with B11; B20 with B19.

Phases: P1 foundation B01-B05 | P2 patient core B06-B09 | P3 caregiver + memories B10-B16 | P4 alerts B17-B19 | P5 ASHA B20-B22 | P6 language/speech B23-B24 | P7 harden + demo B25-B26

---

## B01
```
AGENT: A0
BRANCH: agent/a0/b01
WORKFLOW: /plan-feature
GOAL: Plan the Next.js PWA scaffold (App Router, TS, Tailwind v4, Serwist, next-intl, route groups /play /care /asha).
CONTEXT FILES: AGENTS.md, docs/ files for this area, docs/research/ notes listed in NEEDS
TOUCH ONLY: none (read-only)
DO NOT TOUCH: everything else, .env, db/schema.sql and api/openapi.yaml unless listed (contract-first)
ACCEPTANCE CRITERIA:
- [ ] Every file and command listed
- [ ] 300 KB shell budget + Lighthouse check
- [ ] Uses pinned versions from R7
TESTS TO RUN: none
NEEDS: R7, M2
OUT OF SCOPE: anything not named in GOAL
REPORT BACK: AGENT REPORT block from .agent/AGENT_ROSTER.md
```

## B02
```
AGENT: A2
BRANCH: agent/a2/b02
WORKFLOW: /build-feature
GOAL: Build the scaffold in frontend/ with tokens.css, offline.ts, adaptive.ts, locales en/hi/as, manifest, three empty role routes.
CONTEXT FILES: AGENTS.md, docs/ files for this area, docs/research/ notes listed in NEEDS
TOUCH ONLY: frontend/
DO NOT TOUCH: everything else, .env, db/schema.sql and api/openapi.yaml unless listed (contract-first)
ACCEPTANCE CRITERIA:
- [ ] pnpm dev renders /play /care /asha with tokens
- [ ] Vitest: adaptive.ts matches backend outputs
- [ ] Works offline after first load
- [ ] Lighthouse PWA + a11y pass
TESTS TO RUN: cd frontend && pnpm lint && pnpm test
NEEDS: B01
OUT OF SCOPE: anything not named in GOAL
REPORT BACK: AGENT REPORT block from .agent/AGENT_ROSTER.md
```

## B03
```
AGENT: A1
BRANCH: agent/a1/b03
WORKFLOW: /plan-feature then /build-feature
GOAL: Supabase JWT auth, patients, patient_members, consents, and /v1/events:batch (idempotent, consent-gated) with RLS tests.
CONTEXT FILES: AGENTS.md, docs/ files for this area, docs/research/ notes listed in NEEDS
TOUCH ONLY: backend/app (not services/), db/, api/, backend/tests/test_api_*.py
DO NOT TOUCH: everything else, .env, db/schema.sql and api/openapi.yaml unless listed (contract-first)
ACCEPTANCE CRITERIA:
- [ ] No consent row -> 403 on writes
- [ ] User B cannot read patient A data
- [ ] Same event id twice -> one row
- [ ] openapi.yaml updated first
TESTS TO RUN: cd backend && pytest -q
NEEDS: R4, M3
OUT OF SCOPE: anything not named in GOAL
REPORT BACK: AGENT REPORT block from .agent/AGENT_ROSTER.md
```

## B04
```
AGENT: A3
BRANCH: agent/a3/b04
WORKFLOW: /simulate-ai
GOAL: Add backend/scripts/simulate.py: 5 scenarios (stable, slow decline, sudden dip, noisy, illness) and save results.
CONTEXT FILES: AGENTS.md, docs/ files for this area, docs/research/ notes listed in NEEDS
TOUCH ONLY: backend/scripts/, backend/tests/, docs/evidence/
DO NOT TOUCH: everything else, .env, db/schema.sql and api/openapi.yaml unless listed (contract-first)
ACCEPTANCE CRITERIA:
- [ ] Mean success after 30 items 0.70-0.82
- [ ] Precision/recall + false alerts/month reported
- [ ] Every number labelled SYNTHETIC
TESTS TO RUN: cd backend && pytest -q && python scripts/simulate.py
NEEDS: R6
OUT OF SCOPE: anything not named in GOAL
REPORT BACK: AGENT REPORT block from .agent/AGENT_ROSTER.md
```

## B05
```
AGENT: A4
BRANCH: agent/a4/b05
WORKFLOW: /build-feature
GOAL: Test baseline: pytest config, Vitest, Playwright skeleton, axe helper, CI runs all (ask before editing CI).
CONTEXT FILES: AGENTS.md, docs/ files for this area, docs/research/ notes listed in NEEDS
TOUCH ONLY: .github/ (after approval), frontend/tests, e2e/, backend/tests
DO NOT TOUCH: everything else, .env, db/schema.sql and api/openapi.yaml unless listed (contract-first)
ACCEPTANCE CRITERIA:
- [ ] CI green on main
- [ ] One Playwright smoke test per role route
- [ ] axe runs on /play
TESTS TO RUN: pnpm test && pytest -q
NEEDS: B02, B03
OUT OF SCOPE: anything not named in GOAL
REPORT BACK: AGENT REPORT block from .agent/AGENT_ROSTER.md
```

## B06
```
AGENT: A2
BRANCH: agent/a2/b06
WORKFLOW: /build-feature
GOAL: Patient home + Memory Match game from the prototype, logging events to IndexedDB with UUIDv7.
CONTEXT FILES: AGENTS.md, docs/ files for this area, docs/research/ notes listed in NEEDS
TOUCH ONLY: frontend/src/app/play, frontend/src/lib
DO NOT TOUCH: everything else, .env, db/schema.sql and api/openapi.yaml unless listed (contract-first)
ACCEPTANCE CRITERIA:
- [ ] One primary action per screen, 64px targets, labelled icons
- [ ] Every answer writes an event offline
- [ ] No praise wording
TESTS TO RUN: pnpm test
NEEDS: B02
OUT OF SCOPE: anything not named in GOAL
REPORT BACK: AGENT REPORT block from .agent/AGENT_ROSTER.md
```

## B07
```
AGENT: A2
BRANCH: agent/a2/b07
WORKFLOW: /build-feature
GOAL: Session flow: adaptive item picker (target 0.75), hint then answer on wrong/20 s, 3-errors stop, 10 min cap, calm break + orientation card.
CONTEXT FILES: AGENTS.md, docs/ files for this area, docs/research/ notes listed in NEEDS
TOUCH ONLY: frontend/src/app/play, frontend/src/lib
DO NOT TOUCH: everything else, .env, db/schema.sql and api/openapi.yaml unless listed (contract-first)
ACCEPTANCE CRITERIA:
- [ ] Stop rules tested
- [ ] Break card shows date, next medicine text, who is home (caregiver-set)
- [ ] Works in airplane mode
TESTS TO RUN: pnpm test
NEEDS: B06, M4
OUT OF SCOPE: anything not named in GOAL
REPORT BACK: AGENT REPORT block from .agent/AGENT_ROSTER.md
```

## B08
```
AGENT: A1
BRANCH: agent/a1/b08
WORKFLOW: /build-feature
GOAL: Sync endpoint recomputes ability, stores ability_scores, returns acked ids + new ability.
CONTEXT FILES: AGENTS.md, docs/ files for this area, docs/research/ notes listed in NEEDS
TOUCH ONLY: backend/app (not services/), db/, api/
DO NOT TOUCH: everything else, .env, db/schema.sql and api/openapi.yaml unless listed (contract-first)
ACCEPTANCE CRITERIA:
- [ ] Acks only stored ids
- [ ] Ability matches adaptive.py
- [ ] RLS tests still pass
TESTS TO RUN: cd backend && pytest -q
NEEDS: B03
OUT OF SCOPE: anything not named in GOAL
REPORT BACK: AGENT REPORT block from .agent/AGENT_ROSTER.md
```

## B09
```
AGENT: A2
BRANCH: agent/a2/b09
WORKFLOW: /build-feature
GOAL: Sync client: batch up to 200, delete only acked, retry with backoff, offline status text.
CONTEXT FILES: AGENTS.md, docs/ files for this area, docs/research/ notes listed in NEEDS
TOUCH ONLY: frontend/src/lib, frontend/src/app/play
DO NOT TOUCH: everything else, .env, db/schema.sql and api/openapi.yaml unless listed (contract-first)
ACCEPTANCE CRITERIA:
- [ ] Kill tab mid-sync, retry -> one row each
- [ ] Reconnect syncs automatically
TESTS TO RUN: pnpm test && playwright offline test
NEEDS: B07, B08
OUT OF SCOPE: anything not named in GOAL
REPORT BACK: AGENT REPORT block from .agent/AGENT_ROSTER.md
```

## B10
```
AGENT: A1
BRANCH: agent/a1/b10
WORKFLOW: /build-feature
GOAL: Onboarding API: patient profile, capacity question, guardian flow, consent versioning.
CONTEXT FILES: AGENTS.md, docs/ files for this area, docs/research/ notes listed in NEEDS
TOUCH ONLY: backend/app (not services/), db/, api/
DO NOT TOUCH: everything else, .env, db/schema.sql and api/openapi.yaml unless listed (contract-first)
ACCEPTANCE CRITERIA:
- [ ] Guardian record stored with relationship + note
- [ ] Consent version + timestamp
- [ ] No patient data before consent
TESTS TO RUN: cd backend && pytest -q
NEEDS: R4, B03
OUT OF SCOPE: anything not named in GOAL
REPORT BACK: AGENT REPORT block from .agent/AGENT_ROSTER.md
```

## B11
```
AGENT: A2
BRANCH: agent/a2/b11
WORKFLOW: /build-feature
GOAL: Caregiver onboarding UI (sign in, profile, plain-language consent, guardian path, first memories, calibration hand-off).
CONTEXT FILES: AGENTS.md, docs/ files for this area, docs/research/ notes listed in NEEDS
TOUCH ONLY: frontend/src/app/care
DO NOT TOUCH: everything else, .env, db/schema.sql and api/openapi.yaml unless listed (contract-first)
ACCEPTANCE CRITERIA:
- [ ] Consent text from R4 outline, marked 'lawyer review pending'
- [ ] Works at 200% text
- [ ] en/hi/as strings
TESTS TO RUN: pnpm test
NEEDS: B10
OUT OF SCOPE: anything not named in GOAL
REPORT BACK: AGENT REPORT block from .agent/AGENT_ROSTER.md
```

## B12
```
AGENT: A1
BRANCH: agent/a1/b12
WORKFLOW: /build-feature
GOAL: Memories API: private Storage bucket, caption/people/year, signed URLs, delete.
CONTEXT FILES: AGENTS.md, docs/ files for this area, docs/research/ notes listed in NEEDS
TOUCH ONLY: backend/app (not services/), db/, api/
DO NOT TOUCH: everything else, .env, db/schema.sql and api/openapi.yaml unless listed (contract-first)
ACCEPTANCE CRITERIA:
- [ ] Bucket private
- [ ] Only members read
- [ ] Delete removes file and embedding
TESTS TO RUN: cd backend && pytest -q
NEEDS: B03
OUT OF SCOPE: anything not named in GOAL
REPORT BACK: AGENT REPORT block from .agent/AGENT_ROSTER.md
```

## B13
```
AGENT: A2
BRANCH: agent/a2/b13
WORKFLOW: /build-feature
GOAL: Caregiver memories upload UI (photo, song, story) with offline-friendly progress.
CONTEXT FILES: AGENTS.md, docs/ files for this area, docs/research/ notes listed in NEEDS
TOUCH ONLY: frontend/src/app/care
DO NOT TOUCH: everything else, .env, db/schema.sql and api/openapi.yaml unless listed (contract-first)
ACCEPTANCE CRITERIA:
- [ ] Upload works on 3G throttle
- [ ] Caption required
- [ ] Shows approval status
TESTS TO RUN: pnpm test
NEEDS: B12
OUT OF SCOPE: anything not named in GOAL
REPORT BACK: AGENT REPORT block from .agent/AGENT_ROSTER.md
```

## B14
```
AGENT: A3
BRANCH: agent/a3/b14
WORKFLOW: /build-feature
GOAL: Quiz generation: embed captions (pgvector), retrieve own patient's memories, LLM drafts JSON items, schema + blocklist validation, retry once.
CONTEXT FILES: AGENTS.md, docs/ files for this area, docs/research/ notes listed in NEEDS
TOUCH ONLY: backend/app/services, backend/tests
DO NOT TOUCH: everything else, .env, db/schema.sql and api/openapi.yaml unless listed (contract-first)
ACCEPTANCE CRITERIA:
- [ ] Invalid JSON/blocklist -> skipped
- [ ] No other patient's data ever retrieved (test)
- [ ] No diagnostic vocabulary
TESTS TO RUN: cd backend && pytest -q
NEEDS: R7, M6, B12
OUT OF SCOPE: anything not named in GOAL
REPORT BACK: AGENT REPORT block from .agent/AGENT_ROSTER.md
```

## B15
```
AGENT: A1
BRANCH: agent/a1/b15
WORKFLOW: /build-feature
GOAL: Approval queue endpoints; approved items become offline-available.
CONTEXT FILES: AGENTS.md, docs/ files for this area, docs/research/ notes listed in NEEDS
TOUCH ONLY: backend/app (not services/), api/, db/
DO NOT TOUCH: everything else, .env, db/schema.sql and api/openapi.yaml unless listed (contract-first)
ACCEPTANCE CRITERIA:
- [ ] Unapproved items never served to patient
- [ ] Approve/reject tested
TESTS TO RUN: cd backend && pytest -q
NEEDS: B14
OUT OF SCOPE: anything not named in GOAL
REPORT BACK: AGENT REPORT block from .agent/AGENT_ROSTER.md
```

## B16
```
AGENT: A2
BRANCH: agent/a2/b16
WORKFLOW: /build-feature
GOAL: Caregiver approval queue screen + patient photo question type using approved items.
CONTEXT FILES: AGENTS.md, docs/ files for this area, docs/research/ notes listed in NEEDS
TOUCH ONLY: frontend/src/app/care, frontend/src/app/play
DO NOT TOUCH: everything else, .env, db/schema.sql and api/openapi.yaml unless listed (contract-first)
ACCEPTANCE CRITERIA:
- [ ] Approve/reject works
- [ ] Item playable offline after sync
TESTS TO RUN: pnpm test
NEEDS: B15, B07
OUT OF SCOPE: anything not named in GOAL
REPORT BACK: AGENT REPORT block from .agent/AGENT_ROSTER.md
```

## B17
```
AGENT: A3
BRANCH: agent/a3/b17
WORKFLOW: /build-feature
GOAL: Nightly job: daily_scores per domain, robust z + CUSUM, suppress on unwell/new-device flag, create alert with evidence.
CONTEXT FILES: AGENTS.md, docs/ files for this area, docs/research/ notes listed in NEEDS
TOUCH ONLY: backend/app/services, backend/tests, backend/app/jobs
DO NOT TOUCH: everything else, .env, db/schema.sql and api/openapi.yaml unless listed (contract-first)
ACCEPTANCE CRITERIA:
- [ ] Alert stores numbers that triggered it
- [ ] Suppression tested
- [ ] 100% of adaptive/anomaly tests green
TESTS TO RUN: cd backend && pytest -q
NEEDS: R6, B08
OUT OF SCOPE: anything not named in GOAL
REPORT BACK: AGENT REPORT block from .agent/AGENT_ROSTER.md
```

## B18
```
AGENT: A3
BRANCH: agent/a3/b18
WORKFLOW: /build-feature
GOAL: LLM phrasing of alert in caregiver language with is_safe_message check and fixed-template fallback.
CONTEXT FILES: AGENTS.md, docs/ files for this area, docs/research/ notes listed in NEEDS
TOUCH ONLY: backend/app/services, backend/tests
DO NOT TOUCH: everything else, .env, db/schema.sql and api/openapi.yaml unless listed (contract-first)
ACCEPTANCE CRITERIA:
- [ ] Unsafe text -> template
- [ ] Every alert ends with 'Consider a check-up with a doctor.'
TESTS TO RUN: cd backend && pytest -q
NEEDS: B17, M6
OUT OF SCOPE: anything not named in GOAL
REPORT BACK: AGENT REPORT block from .agent/AGENT_ROSTER.md
```

## B19
```
AGENT: A2
BRANCH: agent/a2/b19
WORKFLOW: /build-feature
GOAL: Caregiver dashboard: today, 14-day chart with usual range, alert card with evidence, Acknowledge, Unwell today, weekly summary.
CONTEXT FILES: AGENTS.md, docs/ files for this area, docs/research/ notes listed in NEEDS
TOUCH ONLY: frontend/src/app/care
DO NOT TOUCH: everything else, .env, db/schema.sql and api/openapi.yaml unless listed (contract-first)
ACCEPTANCE CRITERIA:
- [ ] Matches design/ prototype
- [ ] Chart has text alternative
- [ ] Unwell flag pauses alert
TESTS TO RUN: pnpm test
NEEDS: B17, B18
OUT OF SCOPE: anything not named in GOAL
REPORT BACK: AGENT REPORT block from .agent/AGENT_ROSTER.md
```

## B20
```
AGENT: A1
BRANCH: agent/a1/b20
WORKFLOW: /build-feature
GOAL: ASHA API: patient list ordered by need, detail, PDF report export (server-side) with synthetic label.
CONTEXT FILES: AGENTS.md, docs/ files for this area, docs/research/ notes listed in NEEDS
TOUCH ONLY: backend/app (not services/), api/, db/
DO NOT TOUCH: everything else, .env, db/schema.sql and api/openapi.yaml unless listed (contract-first)
ACCEPTANCE CRITERIA:
- [ ] ASHA sees only assigned patients
- [ ] PDF has evidence and non-diagnostic wording
TESTS TO RUN: cd backend && pytest -q
NEEDS: B17
OUT OF SCOPE: anything not named in GOAL
REPORT BACK: AGENT REPORT block from .agent/AGENT_ROSTER.md
```

## B21
```
AGENT: A2
BRANCH: agent/a2/b21
WORKFLOW: /build-feature
GOAL: ASHA screens: list (Check-in suggested / Watch / Steady), patient detail, export button.
CONTEXT FILES: AGENTS.md, docs/ files for this area, docs/research/ notes listed in NEEDS
TOUCH ONLY: frontend/src/app/asha
DO NOT TOUCH: everything else, .env, db/schema.sql and api/openapi.yaml unless listed (contract-first)
ACCEPTANCE CRITERIA:
- [ ] Status chips have text
- [ ] Export downloads PDF
TESTS TO RUN: pnpm test
NEEDS: B20
OUT OF SCOPE: anything not named in GOAL
REPORT BACK: AGENT REPORT block from .agent/AGENT_ROSTER.md
```

## B22
```
AGENT: A1
BRANCH: agent/a1/b22
WORKFLOW: /build-feature
GOAL: Seed script: synthetic demo patients (labelled SYNTHETIC) incl. one with a 3-session dip.
CONTEXT FILES: AGENTS.md, docs/ files for this area, docs/research/ notes listed in NEEDS
TOUCH ONLY: backend/scripts, db/
DO NOT TOUCH: everything else, .env, db/schema.sql and api/openapi.yaml unless listed (contract-first)
ACCEPTANCE CRITERIA:
- [ ] Seed is idempotent
- [ ] No real names or data
TESTS TO RUN: python scripts/seed.py
NEEDS: B17
OUT OF SCOPE: anything not named in GOAL
REPORT BACK: AGENT REPORT block from .agent/AGENT_ROSTER.md
```

## B23
```
AGENT: A2
BRANCH: agent/a2/b23
WORKFLOW: /build-feature
GOAL: i18n: next-intl for en, hi, as (+ others per R3/R8), Noto fonts per script, 30% longer strings test.
CONTEXT FILES: AGENTS.md, docs/ files for this area, docs/research/ notes listed in NEEDS
TOUCH ONLY: frontend/
DO NOT TOUCH: everything else, .env, db/schema.sql and api/openapi.yaml unless listed (contract-first)
ACCEPTANCE CRITERIA:
- [ ] No clipped buttons at 200%
- [ ] Every key in en.json first
- [ ] _note on machine-translated strings
TESTS TO RUN: pnpm test
NEEDS: R3, R8
OUT OF SCOPE: anything not named in GOAL
REPORT BACK: AGENT REPORT block from .agent/AGENT_ROSTER.md
```

## B24
```
AGENT: A3
BRANCH: agent/a3/b24
WORKFLOW: /build-feature
GOAL: Speech proxy: Bhashini TTS/ASR with recorded-audio and text fallback; audio discarded after transcription; mic on explicit tap only.
CONTEXT FILES: AGENTS.md, docs/ files for this area, docs/research/ notes listed in NEEDS
TOUCH ONLY: backend/app/services, backend/app (routes), frontend/src/lib/speech.ts
DO NOT TOUCH: everything else, .env, db/schema.sql and api/openapi.yaml unless listed (contract-first)
ACCEPTANCE CRITERIA:
- [ ] Fallback chain tested
- [ ] No raw audio stored
- [ ] Coverage per language documented from R3
TESTS TO RUN: cd backend && pytest -q
NEEDS: R3
OUT OF SCOPE: anything not named in GOAL
REPORT BACK: AGENT REPORT block from .agent/AGENT_ROSTER.md
```

## B25
```
AGENT: A5
BRANCH: agent/a5/b25
WORKFLOW: /safety-review
GOAL: Full safety/compliance review: consent, PII in logs, diagnostic wording, LLM validation, RLS, DPDP notes.
CONTEXT FILES: AGENTS.md, docs/ files for this area, docs/research/ notes listed in NEEDS
TOUCH ONLY: none (read-only)
DO NOT TOUCH: everything else, .env, db/schema.sql and api/openapi.yaml unless listed (contract-first)
ACCEPTANCE CRITERIA:
- [ ] PASS/FAIL per item with file:line
- [ ] Fix list ordered by severity
TESTS TO RUN: none
NEEDS: B01-B24
OUT OF SCOPE: anything not named in GOAL
REPORT BACK: AGENT REPORT block from .agent/AGENT_ROSTER.md
```

## B26
```
AGENT: A4
BRANCH: agent/a4/b26
WORKFLOW: /a11y-check + /demo-check
GOAL: A11y + Lighthouse + low-end Android run; rehearse the 4-minute demo; deploy (Vercel + Render/Fly), Sentry on.
CONTEXT FILES: AGENTS.md, docs/ files for this area, docs/research/ notes listed in NEEDS
TOUCH ONLY: tests, e2e/, deploy config (after approval)
DO NOT TOUCH: everything else, .env, db/schema.sql and api/openapi.yaml unless listed (contract-first)
ACCEPTANCE CRITERIA:
- [ ] Demo passes offline then sync
- [ ] All steps under 2 s
- [ ] Pass/fail table delivered
TESTS TO RUN: playwright + lighthouse
NEEDS: B25, R1, R10
OUT OF SCOPE: anything not named in GOAL
REPORT BACK: AGENT REPORT block from .agent/AGENT_ROSTER.md
```
