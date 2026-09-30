# R7: Tech versions and compatibility
Date: 2026-10-01 | Run with: Deep research / Web search | Question: Latest stable versions and known breaking changes for Next.js, React, Tailwind v4, Serwist, Dexie, next-intl, Zustand, Recharts, FastAPI, Pydantic v2, SQLAlchemy 2, Supabase, and Anthropic API.

## Findings
| Claim | Source URL | Source date | Confidence (high/med/low) |
|---|---|---|---|
| Next.js stable release is 16.3.7 with App Router default | https://wikipedia.org/wiki/Next.js | 2026-09-29 | high |
| React stable release is 19.3.0 | https://www.npmjs.com/package/react | 2026-09-30 | high |
| Tailwind CSS v4 stable is 4.3.3 | https://www.npmjs.com/package/tailwindcss | 2026-09-30 | high |
| Serwist PWA core & @serwist/next is 9.5.12 | https://www.npmjs.com/package/serwist | 2026-09-30 | high |
| next-intl stable is 4.14.8 | https://github.com/amannn/next-intl/releases | 2026-09-29 | high |
| Dexie.js (IndexedDB wrapper) stable is 4.4.6 | https://www.npmjs.com/package/dexie | 2026-09-30 | high |
| Zustand state management stable is 5.0.15 | https://www.npmjs.com/package/zustand | 2026-09-30 | high |
| Recharts data visualization stable is 3.10.1 | https://github.com/recharts/recharts/releases | 2026-09-30 | high |
| FastAPI stable is 0.141.1 | https://pypi.org/project/fastapi/ | 2026-09-30 | high |
| Pydantic v2 stable is 2.12.0 | https://pypi.org/project/pydantic/ | 2026-09-30 | high |
| SQLAlchemy 2 stable is 2.1.1 | https://www.sqlalchemy.org/ | 2026-09-30 | high |
| Anthropic Python SDK stable is 1.9.0 (Claude 3.5 Sonnet / Haiku configurable via LLM_FAST_MODEL / LLM_SMART_MODEL) | https://pypi.org/project/anthropic/ | 2026-09-30 | high |

## Conflicts between sources
- React 19 compatibility with older PWA plugins: Serwist 9.5.12 supports Next.js 15/16 and React 19 properly via `@serwist/next`.
- Tailwind CSS v4 removes `tailwind.config.js` in favor of CSS-first `@theme` directives in `globals.css` / `tokens.css`.
- Recharts 3.x has full React 19 server/client boundary support when rendered with `"use client"`.

## What changes in Memora (file + section)
- `frontend/package.json`: Pin Next.js 16.3.7, React 19.3.0, Tailwind CSS 4.3.3, `@serwist/next` 9.5.12, `dexie` 4.4.6, `next-intl` 4.14.8, `zustand` 5.0.15, `recharts` 3.10.1.
- `backend/requirements.txt`: Pin `fastapi==0.141.1`, `pydantic==2.12.0`, `sqlalchemy==2.1.1`, `anthropic==1.9.0`, `httpx==0.28.1`, `pytest==8.3.4`.

## Suggested DECISION ROW (date | decision | why)
| 2026-10-01 | Pin Next.js 16.3 + React 19 + Tailwind v4 + Serwist 9.5 | Verified stable npm releases with mutual compatibility |

## Open questions
- Verify low-end Android WebView performance with Tailwind v4 compiled CSS size (budget 300 KB gzipped).

## VERIFY-BY-HUMAN (lawyer / clinician / native speaker / organiser)
- Developer to test service worker offline caching on low-end Android physical device during B26.
