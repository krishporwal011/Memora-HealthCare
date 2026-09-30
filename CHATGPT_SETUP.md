# ChatGPT full setup for Memora (teacher + research + deep thinking)

Roles: **ChatGPT = learn, research, think, review.** **Antigravity = build.** `AGENTS.md` = shared memory. (Antigravity side: `Memora_AI_Setup.md` Part B, `bootstrap_agents.py`.)

> Verify first: custom GPTs, Projects, Deep Research and Thinking models depend on your ChatGPT plan and current UI. If Custom GPT is unavailable, use a **Project**: same instructions in Project instructions, same files in Project files.

## 1. Create the Custom GPT (10 min)
1. ChatGPT > Explore GPTs > Create > **Configure**.
2. **Name:** `Memora Mentor`
3. **Description:** `Solo-dev teacher and researcher for Memora (SIH26003): teaches, researches, reasons, writes agent briefs, reviews reports, judge mode.`
4. **Instructions:** paste the whole of `GPT_INSTRUCTIONS.txt` (under the 8,000 character limit).
5. **Conversation starters:** `start` / `R1` / `T1` / `Review my AGENT REPORT` / `Judge mode`
6. **Knowledge (upload):** `AGENTS.md`, `docs/01_PRD.md` ... `docs/09_PITCH_AND_QA.md`, `db/schema.sql`, `api/openapi.yaml`, `agent-briefs/BUILD_PLAN.md`, and every `docs/research/R*.md` as you create them.
7. **Capabilities:** Web search ON, Code interpreter ON, Image generation OFF, Actions none, Sharing only me.
8. Re-upload `AGENTS.md` and new research notes after every change (the GPT does not see your repo live).

## 2. Which ChatGPT mode for which job
| Job | Use | Why |
|---|---|---|
| R1-R10 sourced research (`research/RESEARCH_PROMPTS.md`) | **Deep research** (run it in a normal chat, attach AGENTS.md, paste the prompt) | long, cited, multi-source reports |
| T1-T6 design reasoning, threat model, trade-offs | **Thinking / Pro reasoning model** in a normal chat or the Mentor GPT | step-by-step reasoning, red-teaming |
| Lessons, quizzes, briefs, report review, judge mode | **Memora Mentor GPT** | has your files and loop |
| Quick lookups | normal chat with search | cheap |

Deep research runs may not see custom GPT knowledge; always **attach AGENTS.md and paste the context block** from the prompt file.

## 3. Loop
1. Run the research prompt (R#). Save the answer as `docs/research/R#-slug.md` (template in `research/RESEARCH_NOTE_TEMPLATE.md`).
2. Upload it to Mentor. Ask `start` for the lesson, pass the 3-question check.
3. Take the next brief from `agent-briefs/BUILD_PLAN.md`, paste into Antigravity (role prompt from `.agent/AGENT_ROSTER.md`). A0 plans, you approve, builder builds.
4. Paste the AGENT REPORT into Mentor: MERGE / FIX / REDO. You merge.
5. End of day: Mentor prints **AGENTS.md UPDATE** -> A6 `/update-memory` -> re-upload AGENTS.md.

## 4. Research order (do these first)
R1 SIH rules, R7 tech versions, R3 Bhashini, R4 legal (they block scaffold, speech, consent). Then R2, R6, R8, R9, R5, R10 during build.

## 5. Rules for using research
- Research notes are **evidence, not truth**: check the top 3 sources yourself.
- Anything legal or clinical: a lawyer or clinician verifies before real patients. Memora stays non-diagnostic.
- If a note is older than 60 days, rerun it (AGENTS.md rule 11).
