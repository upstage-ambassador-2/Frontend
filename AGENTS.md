# AGENTS.md

Guidance for coding agents working in this frontend repository.

## Scope

- This is the Mello frontend repository.
- Keep backend edits out of this repository. The backend lives separately at `../backend` and is only used here as the API contract reference.
- Implement local backend behavior in `mock-server/server.mjs` when frontend E2E needs deterministic data.

## API Rules

- Browser code must call the same-origin backend contract paths only, such as `/me`, `/auth/google/start`, `/personas`, and `/ai/generate`.
- `next.config.mjs` rewrites those API paths to `MELLO_API_URL`. In tests, set `MELLO_API_URL` to the local mock server; in deployment, set it to the real FastAPI service.
- Do not add direct browser calls to Google, Gmail, Contacts, Solar, or the FastAPI host.
- Keep `lib/api.ts` and `mock-server/server.mjs` aligned with the FastAPI routes in `../backend/app/routers` and schemas in `../backend/app/schemas.py`.
- Auth state is determined by `GET /me`. Do not reintroduce `/auth/session` as a frontend dependency.

## Development

- Use feature-level App Router pages for user-facing functionality: `/compose/{persona_id}`, `/inbox`, `/people`, `/history`, `/format`, and `/settings`.
- Do not model the selected compose recipient as a client-only screen condition. The selected persona must be represented in the URL.
- Keep authenticated app routes behind `app/(app)/layout.tsx` so session checks and initial data fetches happen server-side.
- Route entry data must be fetched in server components or server-only helpers. Do not use client `useEffect` for initial page data such as inbox messages, history, personas, or format.
- For slow server route transitions, add `loading.tsx` with a small spinner instead of moving the initial fetch back to the client.
- Prefer the existing React state and plain CSS patterns.
- Keep dependencies minimal unless there is a clear reason to add one.
- Use `Promise.all` for independent server-side app data loads after authentication.
- For manual edits, keep changes scoped and avoid unrelated refactors.

## Validation

Run these before publishing meaningful changes:

```bash
node --check mock-server/server.mjs
npm run typecheck
npm run build
```

Use `playwright-cli` for mock-server E2E flows. The runbook is in `docs/MOCK-E2E.md`.

## Git Hygiene

- `.agents/` and `.claude/` are intentionally committed.
- Do not commit `node_modules/`, `.next/`, `.playwright-cli/`, env files, or TypeScript build info.
- If comparing with the backend repository, read its files but do not modify them unless explicitly requested.
