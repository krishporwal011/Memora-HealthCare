# R7b: UI & Cinematic Showcase Dependencies
Date: 2026-10-04 | Run with: npm view / npm registry check | Question: Verified latest stable versions and compatibility for approved UI redesign packages: lucide-react, motion, lenis, three, @react-three/fiber, @react-three/drei, @axe-core/playwright.

## Findings
| Package | Verified Version | Source URL | Confidence | Purpose in Memora |
|---|---|---|---|---|
| `lucide-react` | 1.52.0 | https://www.npmjs.com/package/lucide-react | high | Accessible SVG iconography replacing emojis |
| `motion` | 14.0.0 | https://www.npmjs.com/package/motion | high | Showcase UI choreography, text-reveal, page transitions (Motion v14) |
| `lenis` | 1.3.26 | https://www.npmjs.com/package/lenis | high | Smooth momentum scroll on Showcase routes (disabled in Calm mode) |
| `three` | 0.186.1 | https://www.npmjs.com/package/three | high | Core 3D engine for wireframe Memory House |
| `@types/three` | 0.186.0 | https://www.npmjs.com/package/@types/three | high | TypeScript type definitions for Three.js |
| `@react-three/fiber` | 9.8.1 | https://www.npmjs.com/package/@react-three/fiber | high | React 19 renderer for Three.js (lazy-loaded on /house only) |
| `@react-three/drei` | 10.7.9 | https://www.npmjs.com/package/@react-three/drei | high | R3F helpers for camera, particle fields, text, and lighting |
| `@axe-core/playwright` | 4.13.0 | https://www.npmjs.com/package/@axe-core/playwright | high | Automated WCAG 2.2 AA accessibility audit in e2e suite |

## Compatibility & Bundle Isolation
- **React 19 Compatibility:** `motion@14.0.0`, `lenis@1.3.26`, `lucide-react@1.52.0`, and `@react-three/fiber@9.8.1` support React 19.
- **Bundle Isolation:** Three.js and `@react-three/*` are strictly lazy-loaded via `next/dynamic` with `ssr: false` exclusively on `/[locale]/house`. They will never enter the shared patient bundle or initial landing bundle.
- **Calm Mode Kill Switch:** Motion animations and Lenis scroll instances are conditional on `!isCalmMode && !prefersReducedMotion`. When Calm mode is active, native static CSS rendering is used with 0 overhead.

## Proposed Decision Log Rows (for AGENTS.md section 9)
| Date | Decision | Why |
|---|---|---|
| 2026-10-04 | Add lucide-react 1.52.0 | Accessible vector iconography with visible text labels per DESIGN.md §2 |
| 2026-10-04 | Add motion 14.0.0 for Showcase routes | Modern React 19 choreography for text-scramble and page transitions |
| 2026-10-04 | Add lenis 1.3.26 smooth scroll (Showcase only) | Editorial scroll feel on landing/care, disabled in Calm mode |
| 2026-10-04 | Add three 0.186.1 + R3F 9.8.1 + drei 10.7.9 lazy on /house | 3D Memory House walkthrough with automatic Album fallback |
| 2026-10-04 | Add @axe-core/playwright 4.13.0 (dev) | Automated WCAG AA regression testing in CI and Phase 10 QA |
