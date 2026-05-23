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
- Server-rendered paginated Gmail inbox listing, server-rendered message detail route, reply context injection
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
MELLO_WEB_URL=http://localhost:3004 npm run mock
MELLO_API_URL=http://localhost:4010 ./node_modules/.bin/next dev -p 3004
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
playwright-cli open http://localhost:3004/compose
playwright-cli snapshot
```

Expected:

- Logged-out users are redirected to `/login`.
- `Google 계정으로 계속하기` is visible.
- Network calls are same-origin backend contract paths such as `/auth/google/start`, `/me`, `/personas`, `/history`, and `/format`.

Login:

```bash
playwright-cli click "Google 계정으로 계속하기"
playwright-cli snapshot
playwright-cli network
```

Expected:

- URL is `/compose/{persona_id}` after login or `/compose` redirect.
- Sidebar contains `작성`, `받은편지함`, `사람`, `히스토리`, `내 메일 형식`, `설정`.
- Network calls include `/auth/google/start`, `/me`, `/personas`, `/history`, `/format`.
- No browser request goes to Google, Gmail, Contacts, or Upstage domains.

Feature route and SSR checks:

```bash
playwright-cli run-code 'async page => {
  const routes = [
    ["/compose/lead", "김지훈 팀장"],
    ["/inbox", "Re: Mello 소개 자료 일정 문의"],
    ["/compose/partner/reply/gmail-reply-basic", "답장 컨텍스트"],
    ["/people", "자주 보내는 사람"],
    ["/history", "생성된 초안"],
    ["/format", "기본 형식"],
    ["/settings", "계정"],
  ];
  const result = [];
  for (const [path, text] of routes) {
    await page.goto(`http://localhost:3004${path}`, { waitUntil: "networkidle" });
    await page.reload({ waitUntil: "networkidle" });
    const html = await page.evaluate(async (targetPath) => {
      const response = await fetch(targetPath, { credentials: "include", cache: "no-store" });
      return await response.text();
    }, path);
    result.push({ path, visible: await page.getByText(text).first().isVisible(), ssrHasText: html.includes(text) });
  }
  return result;
}'
```

Expected:

- Each route keeps its own URL after direct navigation and reload.
- `/compose` redirects to `/compose/{first_persona_id}`.
- Each persona compose route keeps the target persona in the path.
- Each route's server HTML contains the route's core text.
- `/inbox` server HTML contains inbox rows, and `/compose/{persona_id}/reply/{message_id}` server HTML contains the reply context.
- No response contains `/mock-api`.

Inbox pagination:

```bash
playwright-cli run-code 'async page => {
  const result = [];
  await page.goto("http://localhost:3004/inbox?limit=10", { waitUntil: "networkidle" });
  result.push({
    firstUrl: page.url(),
    hasFirstRow: await page.getByText("Re: Mello 소개 자료 일정 문의").first().isVisible(),
    hasNext: await page.getByRole("button", { name: "다음" }).isEnabled(),
  });
  await page.getByRole("button", { name: "다음" }).click();
  await page.waitForURL(/pageToken=mock-page-10/);
  result.push({
    nextUrl: page.url(),
    hasFixtureRow: await page.getByText("Mello pagination fixture 11").first().isVisible(),
    hasPrevious: await page.getByRole("button", { name: "이전" }).isEnabled(),
  });
  await page.getByLabel("페이지 크기").selectOption("50");
  await page.waitForURL(/limit=50/);
  result.push({ resizedUrl: page.url() });
  return result;
}'
```

Expected:

- `/inbox?limit=10` renders the first 10-message page with a next control.
- Clicking `다음` keeps data server-rendered through `/inbox?limit=10&pageToken=mock-page-10`.
- `이전` is enabled after in-session next navigation.
- Changing the page size resets to the first page for the selected `limit`.

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
playwright-cli eval "location.pathname"
playwright-cli click "Mello에게 작성 요청"
playwright-cli snapshot
playwright-cli network
```

Expected:

- URL is `/compose/partner/reply/gmail-reply-basic`.
- `답장 컨텍스트` appears on Compose.
- Generated subject starts with `Re:`.
- Browser network does not call `/gmail/messages/gmail-reply-basic` directly; the detail lookup is performed by the server route before rendering.
- Network calls include `/ai/generate` after clicking the generate button.

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
