# Memora Master Redesign Progress Tracker

**Branch:** `agent/a2/redesign-full`  
**Lead Agent:** A0 (Plan) → A2 (Build)  
**Standard Gate per Phase:** `npm test && npx tsc --noEmit && npm run build` (all green)  
**Safety Safeguard:** PATIENT routes stay strictly under Rule 02; zero banned words; zero hardcoded hex; 100% offline.

---

## Phase Checklist & Status

| Phase | Description | Status | Commit / Notes |
|---|---|---|---|
| **Phase 0** | Inspection & Comprehensive Master Plan | ✅ Completed | Approved by owner |
| **Phase 1** | Foundation Fixes (Problems 1–5, 8–10, R7b deps, A1 amendment, tests) | ✅ Completed | All gates green; zero hex in src, all 6 locales synced |
| **Phase 2** | Design System Components & Dev Gallery (`/dev/components`) | ✅ Completed | 10 token-based UI components + dev gallery at /[locale]/dev/components; all 60 tests green |
| **Phase 3** | Shell, Navigation, Full-Screen Menu & Calm Mode Store | ✅ Completed | Compact header (48px targets, calm toggle), FullscreenMenu, PatientBottomBar, useMemoraStore; all 64 tests green |
| **Phase 4** | Patient Layer Redesign (`/play`, `/play/album`, `/play/talk`, `/play/reminders`) | ✅ Completed | Modular play page (3 big choices), SVG leaf card back, /play/album, /play/talk, /play/reminders; all 71 tests green |
| **Phase 5** | Cinematic Landing Showcase (`/[locale]`) | ✅ Completed | Gallery & Album dual-view, 4 chapters, entry modal, corner HUD, 100% static SSG; all 75 tests green |
| **Phase 6** | Caregiver Redesign (`/care`, `/care/timeline`, `/care/people`) | ✅ Completed | Plain-language stories, Disclosure numbers, photo-led detail view, /care/timeline, /care/people; all 78 tests green |
| **Phase 7** | ASHA Triage & PDF Redesign (`/asha`) | ✅ Completed | Token StatusChips, dense calm layout, explainable anomaly numbers, PDF export; all 78 tests green |
| **Phase 8** | Shared Utility Screens (`/sync`, `/settings`, `/privacy`, `/offline`, 404) | ✅ Completed | Offline sync center, settings, plain-language privacy, offline guide, friendly 404; all 83 tests green |
| **Phase 9** | 3D Memory House (`/[locale]/house`, lazy-loaded R3F + Album fallback) | ⏳ Pending | - |
| **Phase 10**| Full QA, Multi-Viewport Browser Verification & Hardening | ⏳ Pending | - |

---

## Detailed Phase Descriptions & Gates

### Phase 0: Inspection and Plan (Current)
- Complete audit of the 12 verified defects with exact file paths.
- Master Implementation Plan covering Phases 1 through 10.
- Zero code edits beyond tracking files.
- **Gate:** Owner approval to execute.

### Phase 1: Foundation Fixes & Dependencies
- Append approved Amendment A1 to `DESIGN.md` and `docs/DESIGN.md` with signature.
- Fix middleware matcher to include all 6 locales: `/(as|bn|brx|en|hi|mni)/:path*`.
- Ensure offline font bundling in `frontend/public/fonts/` with local `@font-face`.
- Ensure `/~offline` document fallback is precached and verified.
- Clean up invalid attributes (`style-hover` in `page.tsx`, `agentRules` in `next.config.mjs`).
- Remove "dementia" from `app/layout.tsx` metadata description.
- Install approved dependencies from `docs/research/R7b-ui-deps.md`: `motion`, `lenis`, `three`, `@types/three`, `@react-three/fiber`, `@react-three/drei`, `@axe-core/playwright`.
- Add automated regression tests for locale matching, hex scan, and banned words.
- **Gate:** `npm test && npx tsc --noEmit && npm run build` -> Commit `phase-1: foundation and deps`.

### Phase 2: Design System & Component Library
- Canonical tokens only (`tokens.css`).
- Build in `components/ui` and `components/patient`: `BigButton`, `FamilyCallBar`, `VoiceButton`, `PromptBubble`, `ActivityShell`, `ReminderCard`, `MemoryCard`, `DayHeader`, `SectionHeader`, `StatusChip` (Urgent/Watch/Steady), `Disclosure` ("Show the numbers"), `EmptyState`, `SyncStatusChip`, `OfflineBanner`, `SkeletonLoader`.
- Add isolated showcase gallery at `/[locale]/dev/components`.
- Loading, empty, error, and offline variants for all data-bearing components.
- **Gate:** `npm test && npx tsc --noEmit && npm run build` -> Commit `phase-2: design system components`.

### Phase 3: Shell & Navigation
- Compact header (logo mark, language selector with ≥48px targets, Calm mode toggle).
- Slim footer (disclaimer only; event badge behind `NEXT_PUBLIC_SHOW_EVENT_BADGE`).
- Full-screen animated overlay menu for Showcase routes with huge links and struck-through current page.
- Persistent bottom bar with Home and Call Family on Patient routes.
- Zustand store with `persist` for Calm mode and Gallery/Album preference.
- **Gate:** `npm test && npx tsc --noEmit && npm run build` -> Commit `phase-3: layout shell and navigation`.

### Phase 4: Patient Layer Redesign (`/play`)
- Keep existing adaptive IRT and event logging logic intact.
- Split monolithic `play/page.tsx` into modular sub-components.
- Memory Match: larger cards (min 120px), SVG leaf motif card back (no emojis), gentle flip (150–250ms), i18n hints.
- Add `/play/album`: Large photo memory album with "Listen" story button.
- Add `/play/talk`: Calm conversational companion with VoiceButton and PromptBubble using approved memories.
- Add `/play/reminders`: Daily routine sequencing with ReminderCard ("I Have Taken This" / "Remind Later").
- Strict Rule 01 and Rule 02 audit.
- **Gate:** `npm test && npx tsc --noEmit && npm run build` -> Commit `phase-4: patient layer redesign`.

### Phase 5: Cinematic Showcase Landing (`/[locale]`)
- Entry choice: Gallery (cinematic) vs. Album (editorial static), remembered via store.
- Wireframe orb loader with circular cursor-following Start button (desktop fine pointer only).
- 4 scroll chapters: (1) The Gap, (2) Personal Memories, (3) Three Roles, (4) Offline & Private.
- Hero height budget <= 45vh; three role cards visible above the fold at 1280×720 and 360×740.
- Heading reveal / scramble-to-readable (max 800ms, headings only, final text in DOM).
- Album mode provides 100% static editorial layout with identical content for Calm mode / low-end devices.
- **Gate:** `npm test && npx tsc --noEmit && npm run build` -> Commit `phase-5: cinematic landing showcase`.

### Phase 6: Caregiver Redesign (`/care`)
- Preserve logic: OnboardingWizard, MemoryUploadModal, QuizApprovalQueue, unwell-today control, 14-day trend.
- Photo-led Family Memories Bank grid with zoom transition to spec-table detail view.
- Weekly summary in plain language first; "Show the numbers" reveals today %, usual range, z-score, CUSUM.
- Add `/care/timeline`: Chronological memory journey.
- Add `/care/people`: Family & caregivers directory tagged in memories.
- Restyled DPDP consent & "Lawyer review pending" badges.
- **Gate:** `npm test && npx tsc --noEmit && npm run build` -> Commit `phase-6: caregiver portal redesign`.

### Phase 7: ASHA Portal Redesign (`/asha`)
- Preserve triage order, PDF export, patient detail with explainable numbers, scheduled-visit toggle.
- Dense but calm layout with token-based StatusChips (`Urgent Check-in`, `Watch`, `Steady`).
- Staggered list reveals for Showcase mode; static table fallback for Calm mode.
- Remove all hardcoded hex.
- **Gate:** `npm test && npx tsc --noEmit && npm run build` -> Commit `phase-7: asha triage redesign`.

### Phase 8: Shared Utility Screens
- Build `/[locale]/sync`: Offline and Sync Center (pending count, last sync timestamp, manual trigger, Dexie queue status).
- Build `/[locale]/settings`: Language, font size (M/L/XL), high-contrast toggle, Calm mode, voice on/off.
- Build `/[locale]/privacy`: Plain-language consent, storage breakdown, data export and erasure explanations.
- Build `/[locale]/offline` and friendly custom `not-found.tsx`.
- Complete i18n coverage across all 6 locales.
- **Gate:** `npm test && npx tsc --noEmit && npm run build` -> Commit `phase-8: shared utility screens`.

### Phase 9: 3D Memory House (`/[locale]/house`)
- Lazy-loaded Three.js + React Three Fiber wireframe hall showing approved synthetic memories.
- Camera controls: scroll, drag, arrow keys, and on-screen visible 56px Forward/Back/Left/Right buttons.
- Click frame zooms into detail panel (caption, year, people, "Listen" audio button).
- Automatic fallback to Album grid on: missing WebGL, FPS < 40 for 2s, deviceMemory <= 4, Save-Data, Calm mode, or reduced-motion.
- Zero CDN dependencies: all textures, models, and shaders bundled locally.
- Never imported into patient bundle.
- **Gate:** `npm test && npx tsc --noEmit && npm run build` -> Commit `phase-9: 3d memory house`.

### Phase 10: QA, Browser Verification & Hardening
- Complete test suite: `npm test`, `npx tsc --noEmit`, `npm run build`, `npm run lint`.
- Multi-viewport browser checks: 360px, 768px, 1280px, 1920px across all 6 languages.
- Test keyboard paths, Calm mode, 200% zoom, offline reload, and font persistence.
- Lighthouse shell budget comparison and route chunk size audit.
- Write `docs/redesign/QA_REPORT.md`.
- **Gate:** Commit `phase-10: production QA and hardening`.

---

## Resume Instructions
If execution is interrupted or context limits require pausing:
1. Ensure the current phase's commit is recorded on `agent/a2/redesign-full`.
2. Inspect `docs/redesign/PROGRESS.md` to identify the next pending phase.
3. Run `npm test && npx tsc --noEmit` to confirm a clean starting baseline.
4. Execute the pending phase, test, and commit.
