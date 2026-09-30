# AGENTS.md — Memora project memory (read this first)

> Canonical context file for any AI coding agent (Claude Code, Cursor, Copilot, Codex). `CLAUDE.md` points here.
> Read order for Antigravity: GEMINI.md -> this file -> `.agent/rules/` -> the brief. Research facts live in `docs/research/`.
> Keep it short, current, and true. Update the "Current state" and "Decision log" sections at the end of every work session.

## 1. What we are building
**Memora** is an AI-powered cognitive-stimulation and memory-assistance platform for elderly people living with dementia, built for the North Eastern Region (NER) of India. Smart India Hackathon 2026, problem statement **SIH26003** (verify exact wording on sih.gov.in).

One sentence: *a calm, offline-first, local-language app where a person with dementia plays personalised memory activities, while an AI layer adapts difficulty, tracks their own trend over time, and tells caregivers and ASHA/clinicians when something changes.*

**Memora is NOT**: a diagnostic tool, a cure claim, or a medical device. It provides cognitive stimulation, reminiscence, monitoring and caregiver support. All alert/report wording must say "consider consulting a doctor", never name a disease or stage.

## 2. Users
| Role | Who | Primary job |
|---|---|---|
| Patient | 60+ person with mild-moderate dementia | Play 5-10 min of activities, feel calm and capable |
| Caregiver | Family member | Upload memories (photos, songs, stories), see daily/weekly progress, get alerts |
| ASHA / clinician | Community health worker or doctor | Monitor 20-30 patients, see who needs a visit, export report |
| Admin | Solo developer / NGO | Content packs, languages, audit |

## 3. Team and constraints
- **ONE developer builds everything.** Prefer boring, well-documented tech, managed services, and fewer moving parts. Never add a service (Redis, Kafka, k8s) unless a written reason is added to the Decision log.
- Must work on low-end Android phones, weak/no network (offline-first PWA).
- Data residency: store in India region (Supabase ap-south-1 / Mumbai).
- Hackathon demo must be a real end-to-end flow, no hardcoded fake data in the live path. Seeded *synthetic* demo patients are allowed and must be labelled synthetic.

## 4. Tech stack (decided)
- **Frontend:** Next.js (App Router) + React + TypeScript, Tailwind CSS v4, PWA via Serwist, Dexie (IndexedDB) for offline queue, Zustand, Recharts, next-intl for i18n. Verify latest stable versions at install time.
- **Backend:** FastAPI (Python 3.12), Pydantic v2, SQLAlchemy 2 + Alembic, httpx.
- **Data:** Supabase (Postgres 16, Auth, Storage, RLS, pgvector). Region: Mumbai.
- **AI:** (a) Adaptive difficulty: 1-PL IRT / Elo in pure Python (`backend/app/services/adaptive.py`). (b) Trend/anomaly: robust z-score (median/MAD) + one-sided CUSUM (`anomaly.py`). (c) Content + summaries: Anthropic API, models configurable via env (`LLM_FAST_MODEL`, `LLM_SMART_MODEL`). (d) RAG over caregiver memories: pgvector + multilingual embeddings. (e) Speech: Bhashini ASR/TTS/translation first, recorded-audio fallback.
- **Infra:** Vercel (web), Render or Fly.io (API), GitHub Actions CI, Sentry for errors.
- Full rationale: `docs/02_ARCHITECTURE.md`.

## 5. Repo layout
```
AGENTS.md / CLAUDE.md   agent context
README.md               human quick start
docs/                   PRD, architecture, flowcharts, design system, AI spec, compliance, tests, roadmap, pitch
docs/research/          dated research notes from ChatGPT Deep Research (R1-R10). Source of truth for changing facts
agent-briefs/           BUILD_PLAN.md (B01-B26) and _TEMPLATE.md
.agent/  GEMINI.md      Antigravity rules, workflows, skills, roster (made by bootstrap_agents.py)
design/                 clickable UI prototype (HTML)
db/schema.sql           Postgres schema + RLS
api/openapi.yaml        API contract (source of truth for frontend types)
backend/                FastAPI app, services (adaptive, anomaly, llm), tests
frontend/               Next.js app scaffold, tokens, offline queue, locales
```

## 6. Commands
```
# backend
cd backend && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
pytest -q
uvicorn app.main:app --reload
# frontend
cd frontend && pnpm install && pnpm dev
# full local stack
docker compose up --build
```

## 7. Hard rules for agents
1. **No diagnosis language.** Never output or store words like "Alzheimer's detected", "stage 2", "you have dementia". Use: "performance has dipped compared with their usual; consider a check-up."
2. **No facial emotion recognition, no always-on camera/mic.** Mic only on explicit tap. Camera only for caregiver photo upload.
3. **Consent first.** No patient data is written before a `consents` row exists (see `docs/07_COMPLIANCE_ETHICS.md`). Guardian flow for patients who lack capacity.
4. **Minimise data.** Store scores and events, not raw audio. Delete audio after transcription. Photos are caregiver-provided and stay in private Storage buckets.
5. **Patient UI rules are non-negotiable** (`DESIGN.md` §Patient mode): one primary action per screen, text label on every icon, min 64px targets, no auto-moving content, no patronising praise ("good job!"), every screen self-explanatory without memory of the previous one.
6. **Offline first.** Every patient-facing feature must work with no network; sync is queued and idempotent (client-generated UUIDs).
7. **Explainable AI only.** Every alert must carry the numbers that triggered it.
8. **Synthetic data only** in repo, demos and tests. Never commit real patient data or secrets.
9. **API contract first.** Change `api/openapi.yaml` before changing endpoints.
10. **Tests with every service change**; adaptive and anomaly modules must keep 100% of their unit tests green.
11. **Changing facts come from `docs/research/`**, not from model memory: library versions, Bhashini language coverage, SIH rules, law and clinical wording. If the note is missing or older than 60 days, stop and ask the human to run the research prompt.
12. **One agent, one branch, one brief.** Plan before build for anything touching more than 2 files. Every task ends with an AGENT REPORT. Humans merge, agents never do.
13. **Design system compliance.** All UI work must follow `DESIGN.md`. Do not invent new colors, sizes or components.

## 8. Current state (update every session)
- Phase: **All Phases Complete (Phase 1: Foundation B01-B05, Phase 2: Patient Core B06-B09, Phase 3: Caregiver & Memories B10-B13, Phase 4: ASHA & Clinician Triage B14-B22, Phase 5: Production Polish B23-B26).**
- Done:
  - P1 Foundation: B01 (PWA plan), B02 (Frontend scaffold + tokens + Dexie + locales), B03 (FastAPI auth + RLS + consent gating + idempotent events), B04 (Anomaly detection + Monte Carlo simulation + synthetic evidence), B05 (Playwright E2E + axe a11y + CI).
  - P2 Patient Core: B06 (Patient home + Memory Match game with NER cultural pairs), B07 (Adaptive session flow + 3-consecutive-error stop rules + orientation card), B08 (Backend sync + ability recalculation + ability history endpoint), B09 (Offline sync client with batching up to 200, strict ack deletion, backoff, and reconnect auto-sync).
  - P3 Caregiver & Memories: B10 (Onboarding API with capacity question, guardian note, consent versioning & consent gating), B11 (Caregiver onboarding UI with 6-step flow, 200% text zoom, and lawyer review pending flag), B12 (Private memories storage API with signed URLs, RLS isolation, and cascading file & embedding deletion), B13 (Caregiver memories upload UI with photos/songs/stories, required caption, offline progress, and approval toggles).
  - P4 AI & Clinical Triage: B14 (AI Quiz Generator with pgvector similarity, schema validation, blocklist check, and 1-retry fallback), B15 (Approval queue API with strict patient quarantine of unapproved items), B16 (Caregiver approval UI + Patient photo question reminiscence game), B17 (Nightly anomaly engine with daily domain scores, robust z-score, CUSUM drift, illness suppression, and cold-start suppression), B18 (Safe alert language service with LLM guardrails, is_safe_message check, mandatory doctor check-up conclusion, and fixed template fallback), B19 (Caregiver dashboard with 14-day longitudinal Recharts line chart, shaded usual range, screen-reader table alternative, unwell-today control, and alert card with statistical evidence), B20 (ASHA API with triage priority ordering, assigned patient RLS isolation, and pure-Python PDF report export), B21 (ASHA UI with triage status chips, patient detail with explainable numbers, and PDF download trigger), B22 (Synthetic demo seed with deterministic UUIDv5, 3-session dip for Patient 1, illness suppression for Patient 2, and steady baseline for Patient 3).
  - P5 Production Polish & Verification: B23 (next-intl i18n supporting en, hi, as, bn, brx, mni, script-specific Noto fonts, 30% expansion tests, and 200% text zoom readiness), B24 (Bhashini speech proxy with 3-tier fallback, zero raw audio persistence, on-demand explicit tap mic capture, and language coverage documentation), B25 (Complete safety, compliance and privacy review across all 11 criteria with zero critical issues), B26 (Final production QA, Lighthouse shell budget verification, low-end Android layout check, offline sync test, and full 4-minute demo rehearsal).
  - All 92 automated tests green (40 Vitest, 52 Pytest). Next.js compiles 26 static pages across 6 locales with zero errors.
- Research status: R1 [x] R2 [ ] R3 [x] R4 [x] R5 [ ] R6 [ ] R7 [x] R8 [ ] R9 [ ] R10 [ ]  (tick when the note exists in docs/research/)
- Known gaps: native-speaker review of Assamese/Hindi/Bengali/Bodo/Meitei strings; Bhashini credentials not yet obtained; ASR coverage per NER language unverified; legal/clinical wording not yet reviewed by a lawyer/clinician.

## 9. Decision log (append only)
| Date | Decision | Why |
|---|---|---|
| 2026-10 | Name = Memora | Short, pronounceable across NER languages |
| 2026-10 | Monolith API (FastAPI) + Supabase, no queue service | Solo dev; Postgres + BackgroundTasks is enough |
| 2026-10 | Statistical anomaly detection, not deep learning | No clinical dataset; must be explainable; per-patient baseline |
| 2026-10 | Font = Atkinson Hyperlegible + Noto Sans per script | Designed for low vision; script coverage for NER |
| 2026-10 | No face-emotion recognition | Privacy and accuracy risk for vulnerable users |
| 2026-10 | ChatGPT = teacher + research (Deep Research, Thinking); Antigravity = builder | Separate learning and sourcing from typing; every agent task has a brief and a report |
| 2026-10 | Research notes stored in docs/research/ with date and source URLs | Changing facts must be traceable and re-checkable |
| 2026-10 | Pin Next.js 16.3 + React 19 + Tailwind v4 + Serwist 9.5 | Verified stable npm releases with mutual compatibility (R7) |
| 2026-10 | Idempotent event primary key = client UUIDv7 | Guarantees offline replay safe ingestion via ON CONFLICT DO NOTHING |
| 2026-10 | Use Math.log(3) for optimal difficulty offset | JS Math does not have Math.LN3; Math.log(3) provides exact offset ln(3) |
| 2026-10 | Strict consent gating: 403 on writes without active consent | Enforces DPDP Act 2023 compliance at database and API layers |
| 2026-10 | Strict acking: acknowledge only persisted event IDs | Prevents client queue from purging unpersisted or foreign events |
| 2026-10 | Continuous ability answers count tracking | Preserves decaying learning rate K across sequential batch syncs |
| 2026-10 | Plain-language consent with lawyer review pending badge | Ensures ethical transparency and compliance with DPDP 2023 guidelines |
| 2026-10 | Private storage bucket with time-limited signed URLs | Safeguards family photos and voice stories from unauthorized public access |
| 2026-10 | Cascading media and embedding deletion | Guarantees right to erasure under DPDP Act 2023 |
| 2026-10 | Pure Python PDF generator | Eliminates heavy C binary dependencies for cross-platform portability |
| 2026-10 | Strict unapproved item quarantine | Ensures AI-generated questions are never exposed to patients before caregiver review |
| 2026-10 | Three-tier speech fallback | Guarantees multimodal accessibility regardless of cloud connectivity or language |
| 2026-10 | Zero raw audio retention | Ephemeral in-memory transcription eliminates voice biometric privacy liabilities |

## 10. Glossary
ASHA: Accredited Social Health Activist. ANM: Auxiliary Nurse Midwife. PHC: Primary Health Centre. NER: North Eastern Region. RLS: Row Level Security. Reminiscence: activities using a person's own past (photos, songs). θ (theta): patient ability. b: item difficulty.

## 11. Working model (ChatGPT + Antigravity)
ChatGPT "Memora Mentor": teaches, runs Deep Research, reviews reports, runs judge mode. Antigravity agents A0-A6 (see `.agent/AGENT_ROSTER.md`): plan and build on branches. Loop: research note -> lesson + quiz -> AGENT BRIEF -> A0 plan -> build -> AGENT REPORT -> Mentor review -> human merge -> A6 updates sections 8-9. Full details: `CHATGPT_SETUP.md`, `agent-briefs/BUILD_PLAN.md`.
