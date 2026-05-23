# CLAUDE.md

Project notes for Claude when working in this repository.

## Shared Instructions

- Read `AGENTS.md` first for the frontend repository rules.
- Repository: https://github.com/upstage-ambassador-2/Frontend
- Follow shared PR and issue conventions from https://github.com/upstage-ambassador-2/.github/blob/main/CONTRIBUTING.md.

## Role

This repo is the Next.js frontend for Mello. It includes a local mock API server for E2E testing, but it is not the real backend.

## Key Constraints

- Do not edit the backend repository from frontend tasks.
- Match the API contract in `../backend/app/routers` and `../backend/app/schemas.py`.
- Route browser requests through same-origin backend contract paths (`/me`, `/auth/*`, `/personas`, `/ai/*`, `/gmail/*`); Next rewrites them to `MELLO_API_URL`.
- Do not call Google, Gmail, Contacts, Solar, or the real API host directly from browser code.
- Use `/me` for auth/session detection.
- Fetch route entry data in server components/server-only helpers. Do not add client-side initial loading for inbox, history, personas, or format data.

## Common Commands

```bash
npm run mock
npm run dev
node --check mock-server/server.mjs
npm run typecheck
npm run build
```

For port conflicts:

```bash
MELLO_WEB_URL=http://localhost:3001 npm run mock
MELLO_API_URL=http://localhost:4010 ./node_modules/.bin/next dev -p 3001
```

## E2E

Use `playwright-cli` against the running Next app and mock server. The expected flow is documented in `docs/MOCK-E2E.md`.

## Tracked Agent Files

`.agents/` and `.claude/` are intentionally tracked. Do not add them to `.gitignore`.
