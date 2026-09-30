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
5. **Patient UI rules are non-negotiable** (`docs/04_DESIGN_SYSTEM.md` §Patient mode): one primary action per screen, text label on every icon, min 64px targets, no auto-moving content, no patronising praise ("good job!"), every screen self-explanatory without memory of the previous one.
6. **Offline first.** Every patient-facing feature must work with no network; sync is queued and idempotent (client-generated UUIDs).
7. **Explainable AI only.** Every alert must carry the numbers that triggered it.
8. **Synthetic data only** in repo, demos and tests. Never commit real patient data or secrets.
9. **API contract first.** Change `api/openapi.yaml` before changing endpoints.
10. **Tests with every service change**; adaptive and anomaly modules must keep 100% of their unit tests green.
11. **Changing facts come from `docs/research/`**, not from model memory: library versions, Bhashini language coverage, SIH rules, law and clinical wording. If the note is missing or older than 60 days, stop and ask the human to run the research prompt.
12. **One agent, one branch, one brief.** Plan before build for anything touching more than 2 files. Every task ends with an AGENT REPORT. Humans merge, agents never do.

## 8. Current state (update every session)
- Phase: **Phase 1 in progress (Foundation: B01-B05). Antigravity workspace bootstrapped (.agents / .agent). Prerequisite research notes R1, R3, R4, R7 completed.**
- Done: PRD & specs, build plan, agent setup files (GEMINI.md, .agent/, .agents/), bootstrap script, research notes R1, R3, R4, R7.
- Next: B01 (A0 plan scaffold) -> B02 (A2 build scaffold) -> B03 (A1 auth + consent + events) -> B04 (A3 adaptive simulation) -> B05 (A4 test baseline).
- Research status: R1 [x] R2 [ ] R3 [x] R4 [x] R5 [ ] R6 [ ] R7 [x] R8 [ ] R9 [ ] R10 [ ]  (tick when the note exists in docs/research/)
- Known gaps: native-speaker review of Assamese/Hindi strings; Bhashini credentials not yet obtained; ASR coverage per NER language unverified; legal/clinical wording not yet reviewed by a lawyer/clinician.

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

## 10. Glossary
ASHA: Accredited Social Health Activist. ANM: Auxiliary Nurse Midwife. PHC: Primary Health Centre. NER: North Eastern Region. RLS: Row Level Security. Reminiscence: activities using a person's own past (photos, songs). θ (theta): patient ability. b: item difficulty.

## 11. Working model (ChatGPT + Antigravity)
ChatGPT "Memora Mentor": teaches, runs Deep Research, reviews reports, runs judge mode. Antigravity agents A0-A6 (see `.agent/AGENT_ROSTER.md`): plan and build on branches. Loop: research note -> lesson + quiz -> AGENT BRIEF -> A0 plan -> build -> AGENT REPORT -> Mentor review -> human merge -> A6 updates sections 8-9. Full details: `CHATGPT_SETUP.md`, `agent-briefs/BUILD_PLAN.md`.
