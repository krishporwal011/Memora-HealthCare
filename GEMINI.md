# GEMINI.md (Antigravity overrides). Project memory lives in AGENTS.md, read it first.

- Always read `AGENTS.md` fully before any task. It is the source of truth; this file only adds Antigravity-specific behaviour.
- Planning first: for any task touching more than 2 files, produce an Implementation Plan artifact and STOP for approval before editing code.
- Finish every task with a Walkthrough artifact AND the AGENT REPORT block (format in `.agent/AGENT_ROSTER.md`).
- Stay inside the TOUCH ONLY paths given in the brief. If you need another path, stop and ask.
- Ask before: installing dependencies, running destructive commands, editing CI, touching `db/schema.sql` or `api/openapi.yaml` (contract-first).
- Never read or print `.env`. Never commit secrets. Synthetic data only.
- Branch per task: `agent/<agent-name>/<slug>`. Small commits. Never force-push. Never merge to main yourself.
- Keep it simple: one developer maintains this. No new service, queue or framework without a written reason in the brief.
- Do not use diagnostic wording (see rule 01). When unsure about clinical or legal wording, leave a TODO for a human.
