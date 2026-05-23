# AGENTS.md

Guidance for coding agents working in this frontend repository.

## Repository

- GitHub: https://github.com/upstage-ambassador-2/Frontend
- Follow shared PR and issue conventions from https://github.com/upstage-ambassador-2/.github/blob/main/CONTRIBUTING.md.
- Use the organization PR and issue templates from `upstage-ambassador-2/.github` unless this repository defines a local override.

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

- Prefer the existing React state and plain CSS patterns.
- Keep dependencies minimal unless there is a clear reason to add one.
- Use `Promise.all` for independent app data loads after authentication.
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
