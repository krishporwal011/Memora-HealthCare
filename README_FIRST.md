# Memora v2 pack: start here

Copy these into your repo root (unzipped Memora_Project_Pack), overwriting `AGENTS.md`:

| File | Goes to | Purpose |
|---|---|---|
| AGENTS.md | repo root (replace) | Modified shared memory: read order, rules 11-12, research status, working model |
| agent-briefs/BUILD_PLAN.md | repo/agent-briefs/ | 26 ready briefs for the full build |
| research/RESEARCH_PROMPTS.md, RESEARCH_NOTE_TEMPLATE.md | repo/research/ | ChatGPT Deep Research R1-R10 + Thinking T1-T6 |
| CHATGPT_SETUP.md, GPT_INSTRUCTIONS.txt | anywhere (not needed in repo) | Custom GPT setup and paste-in instructions |
| Memora_AI_Setup.md | keep | Antigravity part (bootstrap_agents.py, rules, workflows, roster) |

## 10-step start
1. Replace AGENTS.md. Create `docs/research/` (already in pack).
2. Open repo in Antigravity. Run `python bootstrap_agents.py` (from Memora_AI_Setup.md Part B).
3. Create the Custom GPT (CHATGPT_SETUP.md). Upload AGENTS.md, docs, schema, API, BUILD_PLAN.
4. Run R1, R7, R3, R4 in ChatGPT Deep Research. Save notes to docs/research/.
5. In Mentor: `start`, learn M2, pass the check.
6. Antigravity: B01 (A0 plan) -> approve -> B02 (A2 build).
7. Paste AGENT REPORT into Mentor -> MERGE/FIX/REDO -> you merge.
8. Continue B03...B26 in order; run R2, R5, R6, R8, R9, R10 when their briefs need them.
9. Daily: Mentor "AGENTS.md UPDATE" -> A6 /update-memory -> re-upload AGENTS.md.
10. Before demo: B25 safety review, B26 a11y + demo check.

Verify first: Antigravity folder name (.agent vs .agents), ChatGPT plan features, SIH26003 wording on sih.gov.in.
