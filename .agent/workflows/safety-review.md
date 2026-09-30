---
description: Read-only safety, privacy and wording review
---

1. List changed files (git diff --name-only against main).
2. Search user-facing strings and prompts for banned diagnostic terms (rule 01).
3. Verify every patient-data write path checks consent (API and RLS).
4. Verify no PII, names, photos or tokens are logged; no raw audio stored.
5. Verify LLM output is schema-validated and post-checked before display.
6. Report PASS/FAIL per item with file:line evidence. Do not edit code.
