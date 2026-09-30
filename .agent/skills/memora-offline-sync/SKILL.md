---
name: memora-offline-sync
description: Use when touching the IndexedDB queue, service worker, /v1/events:batch or anything that must work offline.
---

# Offline sync
1. Write the event to Dexie first (`frontend/src/lib/offline.ts`), with a UUIDv7 id.
2. Sync in batches of at most 200 to `/v1/events:batch`; delete only acknowledged ids.
3. Server is idempotent: upsert with ON CONFLICT DO NOTHING; return acked ids and the new ability.
4. Test: airplane mode session, reconnect, each event appears exactly once; kill the tab mid-sync and retry.
5. Cache the app shell and item bank in the service worker; budget 300 KB gzipped for the shell.
