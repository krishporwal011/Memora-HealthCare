# Memora research + deep-thinking prompts (ChatGPT)

How to use: open a new ChatGPT chat, switch on **Deep research** (R prompts) or a **Thinking** model (T prompts), attach `AGENTS.md`, paste the CONTEXT block, then the prompt. Save the result as `docs/research/R#-slug.md` using `RESEARCH_NOTE_TEMPLATE.md`. Today's date when written: 2026-10-01; always ask for the newest sources.

## CONTEXT block (paste first, every time)
```
Project: Memora, for Smart India Hackathon 2026, problem statement SIH26003. An offline-first PWA for elderly people with dementia in North East India (Assamese, Hindi, Bengali, Manipuri, Bodo, Nepali etc.). Patient plays memory activities, caregiver uploads memories, ASHA/clinician sees who needs a visit. Solo student developer. Stack: Next.js PWA, FastAPI, Supabase (Mumbai), Anthropic API, Bhashini. It is NOT a diagnostic tool or medical device.
Rules for your answer: use primary sources (government, WHO, peer-reviewed, official docs), give a URL and date for every claim, mark anything unverified as VERIFY, say when sources conflict, and end with "What changes in Memora" and VERIFY-BY-HUMAN. Output in the RESEARCH NOTE format: findings table (claim | source URL | source date | confidence), conflicts, what changes in Memora, suggested decision row, open questions, verify-by-human.
```

## Deep research prompts

**R1 SIH26003 and competition rules** (blocks planning)
Find the exact SIH 2026 problem statement SIH26003 text, theme, organisation, category, and the official timeline, evaluation criteria, team rules, and required deliverables (PPT, video, prototype, GitHub) for the grand finale. List what judges reward in past healthtech winners. Flag anything that differs from my assumptions in AGENTS.md.

**R2 Evidence base and safe claims**
What does peer-reviewed evidence say about cognitive stimulation therapy, reminiscence therapy and digital cognitive games for people with mild-moderate dementia? Give effect sizes and limits. Then list the claims Memora may safely make and the claims it must never make. Include guidance on non-diagnostic alert wording used by reputable dementia organisations.

**R3 Bhashini and language coverage** (blocks speech)
For each NER language (Assamese, Bengali, Hindi, Nepali, Manipuri/Meitei, Bodo, Mizo, Khasi, Garo, others supported): which Bhashini services exist now (ASR, TTS, translation, transliteration), their quality notes, how a student gets API access, rate limits, licensing, and the exact pipeline API call shape. Give a fallback plan per language where coverage is missing, including offline TTS options.

**R4 Legal, privacy and ethics (India)** (blocks consent design)
Explain for a health-adjacent app: DPDP Act 2023 and current Rules (consent, verifiable guardian consent for persons with disability, children, data fiduciary duties, cross-border, breach notice, retention), Rights of Persons with Disabilities Act guardianship, Mental Healthcare Act 2017 points, ICMR ethics guidance for digital health and human participants, ABDM relevance, and when software becomes a medical device under CDSCO rules. Conclude with a checklist for a non-clinical wellness tool and a consent-text outline in plain language. State clearly that a lawyer must verify.

**R5 Prior art and gap analysis**
Find existing dementia cognitive-stimulation and caregiver apps (global and India), what they do, pricing, language support, offline support, evidence, and weaknesses. Identify Memora's real differentiators for NER and offline use, and claims I should avoid because others do them better.

**R6 Validity of adaptive scoring and trend alerts**
Review research on IRT/Elo adaptive testing for cognitive games, practice effects, day-to-day variability in older adults with dementia, minimum baseline length, and robust statistics (median/MAD z-score, CUSUM) for change detection. Recommend thresholds, baseline windows and false-alert controls. Tell me what my current design (target success 0.75, 7-day baseline, z below -2.5 in 2 of 3 sessions, CUSUM) gets wrong or over-claims.

**R7 Tech versions and compatibility** (blocks scaffold)
As of today, give the latest stable versions and known breaking changes for Next.js App Router, React, Tailwind CSS v4, Serwist (PWA), Dexie, next-intl, Zustand, Recharts, FastAPI, Pydantic v2, SQLAlchemy 2, Supabase (Auth, Storage, pgvector, RLS), and the Anthropic API/SDK model names and pricing tiers. Flag incompatibilities between them and give one pinned, working version set. Include Vercel and Render/Fly free-tier limits and PWA performance tips for low-end Android.

**R8 Dementia-friendly UX and script support**
Collect design guidelines for people with dementia and older users (Alzheimer's Society/Alzheimer's Disease International style guidance, WCAG 2.2 AA/AAA, touch target and contrast research). Check font and rendering support for Assamese, Bengali script, Devanagari and Meitei Mayek, Ol Chiki/Bodo as relevant, and recommend Noto fonts and loading strategy for a 300 KB shell. Include cultural considerations for NER (music, food, festivals, family roles) for memory content.

**R9 ASHA/PHC workflow and pilot path**
How do ASHA workers, ANMs and PHCs work in NER states, what digital tools they already use (and their constraints: phones, data, time), what data an ASHA would need per patient, and how a student team can responsibly pilot (NGOs, geriatric/memory clinics, institutional ethics committee). Give realistic steps and contacts categories, not invented names.

**R10 Pitch, impact and sustainability**
List likely SIH judge questions for a dementia-care product, strong answers with honest limits, impact metrics that are defensible without clinical trials, a cost model for running costs at 1,000 patients, and a sustainability plan (NGO, state health mission, CSR). Mark claims needing evidence from R2/R5.

## Deep-thinking prompts (Thinking model, no web needed)

**T1 Threat model:** Threat-model Memora (patient data, photos, caregiver accounts, LLM prompts, ASHA access, offline device theft). List top 10 risks, likelihood, impact, mitigation I can build solo in 2 weeks, and what to tell judges honestly.
**T2 Alert trade-off:** Given 7-day baseline, noisy daily scores and caregivers with alert fatigue, compare three alert policies (current, stricter, weekly-only). Show reasoning with numbers, false alerts per month, and my recommended default plus how to explain it.
**T3 Scope cut:** I have <N> days before the finale. Rank features by demo impact vs build risk, cut to a 4-minute end-to-end demo, and give a day-by-day plan with fallback if each risky piece fails. (Replace <N>.)
**T4 Architecture red-team:** Attack the decisions in AGENTS.md section 9 and docs/02_ARCHITECTURE.md. For each, give the strongest counterargument, a cheaper alternative, and whether to keep it.
**T5 Wording red-team:** Take these 20 alert/report/patient strings [paste] and find any that imply diagnosis, blame, condescension or false certainty. Rewrite each and explain.
**T6 Explain-it-to-judges:** Turn adaptive difficulty (IRT/Elo) and CUSUM into 60-second explanations for (a) a doctor, (b) a judge from IT, (c) a caregiver. Then ask me 5 follow-up questions and grade my answers.

## After each run
1. Save note -> `docs/research/`. 2. Tick status in AGENTS.md section 8. 3. Upload to Memora Mentor. 4. Give the "Suggested DECISION ROW" to A6.
