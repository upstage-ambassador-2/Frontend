# Mock E2E Runbook

This runbook verifies the current frontend-only implementation of `docs/SPEC.md` using the local mock API server in `frontend/mock-server`.

## Scope

Covered in mock mode:

- Google OAuth-shaped login and logout
- HttpOnly mock session cookie
- People persona CRUD and Contacts import
- Compose generation through SSE
- Regenerate through the same generation endpoint
- History creation and sent-state update
- Gmail inbox listing, message detail, reply context injection
- Gmail send response with reply thread metadata
- Format save and prompt-affecting generation output
- Settings integration status and Slack/Notion planned no-op

Not covered in mock mode:

- Real Google OAuth consent screen
- Real Gmail/Contacts APIs
- Real Upstage Solar API
- Railway `mello-web`, `mello-api`, `mello-db` deployment
- Real Postgres persistence

## Start Servers

Default port:

```bash
npm run mock
npm run dev
```

If `3000` is occupied:

```bash
MELLO_WEB_URL=http://localhost:3001 npm run mock
MELLO_API_URL=http://localhost:4010 ./node_modules/.bin/next dev -p 3001
```

## Static Gates

```bash
npm run typecheck
npm run build
node --check mock-server/server.mjs
```

## Playwright CLI Golden Path

```bash
playwright-cli close-all
playwright-cli open http://localhost:3001
playwright-cli snapshot
```

Expected:

- `Sign in with Google` is visible.
- Network calls are same-origin `/mock-api/*`.

Login:

```bash
playwright-cli click "Sign in with Google"
playwright-cli snapshot
playwright-cli network
```

Expected:

- Sidebar contains `작성`, `받은편지함`, `사람`, `히스토리`, `내 메일 형식`, `설정`.
- Network calls include `/mock-api/auth/google/start`, `/mock-api/me`, `/mock-api/personas`, `/mock-api/history`, `/mock-api/format`.
- No browser request goes to Google, Gmail, Contacts, or Upstage domains.

Compose generate and send:

```bash
playwright-cli click "Mello에게 작성 요청"
playwright-cli snapshot
playwright-cli click "보내기"
playwright-cli snapshot
```

Expected:

- `작성 결과` appears.
- Result status moves from `draft` to `sent`.

Inbox reply:

```bash
playwright-cli click "받은편지함"
playwright-cli click "박서연 책임 <partner@mello.test>"
playwright-cli snapshot
playwright-cli click "Mello에게 작성 요청"
playwright-cli snapshot
playwright-cli network
```

Expected:

- `답장 컨텍스트` appears on Compose.
- Generated subject starts with `Re:`.
- Network calls include `/mock-api/gmail/messages`, `/mock-api/gmail/messages/gmail-reply-basic`, and `/mock-api/ai/generate`.

People import:

```bash
playwright-cli click "사람"
playwright-cli click "Contacts에서 가져오기"
playwright-cli snapshot
```

Expected:

- Imported Contacts personas appear.

Settings no-op and logout:

```bash
playwright-cli click "설정"
playwright-cli click "연결"
playwright-cli snapshot
playwright-cli click "로그아웃"
playwright-cli snapshot
```

Expected:

- Gmail and Google Contacts show `연결됨`.
- Slack/Notion show `지원 예정`.
- Logout returns to the login screen.
