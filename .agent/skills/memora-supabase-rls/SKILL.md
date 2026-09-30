---
name: memora-supabase-rls
description: Use when editing db/schema.sql, policies, migrations or any query that reads patient data.
---

# Supabase RLS
1. Every table has RLS enabled. A user sees a patient only via `patient_members` (`is_member()`).
2. Writes of sessions, events and memories also require `has_consent()`.
3. Service-role key stays on the server only. Reads for caregivers use the user's JWT.
4. After any policy change, test with two users: B must not read A's patient, events, memories or alerts.
5. Update `db/schema.sql` and `api/openapi.yaml` first (contract-first), then code.
