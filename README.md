# Mello Frontend

Next.js 14 frontend for Mello, an AI mail assistant that combines user personas, mail format preferences, Gmail inbox context, and Solar-style streaming draft generation.

This repository is frontend-only. The local test backend is an independent Node mock server in `mock-server/`; it mirrors the FastAPI backend contract from `../backend` without modifying the backend repository.

## Stack

- Next.js `14.2.35`
- React `18.3.1`
- TypeScript
- Plain CSS in `app/globals.css`
- Local mock API server with Node `http`

## Local Development

Install dependencies:

```bash
npm install
```

Run the mock API server:

```bash
npm run mock
```

Run the Next.js app in another terminal:

```bash
npm run dev
```

The app opens at `http://localhost:3000`.

If port `3000` is busy:

```bash
MELLO_WEB_URL=http://localhost:3001 npm run mock
MELLO_API_URL=http://localhost:4010 ./node_modules/.bin/next dev -p 3001
```

## API Proxy

Browser code calls the same backend contract paths in every environment, for example `/me`, `/auth/google/start`, `/personas`, `/ai/generate`, and `/gmail/messages`. Next.js rewrites those same-origin paths to the configured API target.

```bash
MELLO_API_URL=http://localhost:4010
```

For local mock E2E, point `MELLO_API_URL` at `mock-server/`. For Railway, point it at the real FastAPI service's private URL.

No browser code should call Google, Gmail, Contacts, Solar, or the FastAPI host directly. OAuth, Gmail, Contacts, and Solar behavior is handled behind the server-side API boundary.

## Backend Contract

The frontend and mock server follow the FastAPI backend routes:

- `GET /health`
- `POST /auth/google/start`
- `GET /auth/google/callback`
- `POST /auth/logout`
- `GET /me`
- `GET /integrations`
- `POST /integrations/:provider/toggle`
- `GET /personas`
- `POST /personas`
- `PATCH /personas/:id`
- `DELETE /personas/:id`
- `POST /personas/import-contacts`
- `GET /history`
- `GET /history/:id`
- `GET /format`
- `PUT /format`
- `POST /ai/generate` with SSE events: `delta`, `done`, `error`
- `GET /gmail/messages?limit=30`
- `GET /gmail/messages/:id`
- `POST /gmail/send`

Authentication state is detected through `GET /me`. There is no frontend dependency on `/auth/session`.

## Demo Path

1. Open the app while logged out.
2. Click `Sign in with Google`.
3. Confirm the Compose screen loads with the mock user.
4. Generate a draft and send it with Gmail.
5. Open `히스토리` and confirm the sent state.
6. Open `받은편지함`, choose a message, and generate a reply draft.
7. Open `사람` and use `Contacts에서 가져오기`.
8. Open `내 메일 형식`, edit the signature, save, then generate again.
9. Open `설정` and confirm Gmail/Contacts are connected while Slack/Notion are planned no-op integrations.

## Verification

```bash
node --check mock-server/server.mjs
npm run typecheck
npm run build
```

Mock browser checks can be run with `playwright-cli`; see `docs/MOCK-E2E.md`.

## Repository Notes

- `.agents/` and `.claude/` are intentionally tracked for local agent/Claude workflows.
- `node_modules/`, `.next/`, `*.tsbuildinfo`, local env files, and `.playwright-cli/` artifacts are ignored.
- Backend source lives in a separate repository. Align frontend API calls to the backend contract, but do not edit backend files from this repository.
