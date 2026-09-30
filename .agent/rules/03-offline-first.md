# Rule 03: Offline first
- Every patient feature works with no network. Write to IndexedDB first, sync later.
- Events get client-generated UUIDv7 ids; server upserts with ON CONFLICT DO NOTHING (idempotent).
- Client adaptive code mirrors `backend/app/services/adaptive.py` exactly; change both or neither, with a test for each.
- Consent row must exist before any patient-data write (API returns 403 otherwise; RLS enforces it too).
