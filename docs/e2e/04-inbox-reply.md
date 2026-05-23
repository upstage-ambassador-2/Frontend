# E2E - 받은편지함 & 답장 진입

## 범위

신규 받은편지함 라우트, Gmail 최근 메일 SSR 조회, 메일 선택 후 `/compose/{persona_id}/reply/{message_id}` 답장 라우트 진입, 답장 초안 생성을 검증한다.

## 주요 API

- `GET /gmail/messages`
- `GET /gmail/messages/{id}`
- `POST /ai/generate` (SSE)

## 체크리스트

| ID | 우선순위 | 유형 | 체크리스트 | 검증 포인트 |
| --- | --- | --- | --- | --- |
| INBOX-01 | P0 | UI | [ ] Sidebar에서 `받은편지함` 항목을 클릭하면 Inbox 화면으로 이동한다 | 메뉴 활성 상태, Topbar breadcrumb |
| INBOX-02 | P0 | SSR/BE | [ ] Inbox 진입 시 서버에서 최근 받은 메일 N개를 조회한다 | 서버 HTML에 메일 행 포함, 기본 N=30 권장 |
| INBOX-03 | P0 | BE | [ ] 각 메일 행에 from, subject, snippet, date가 표시된다 | Gmail 응답 필드 매핑 |
| INBOX-04 | P1 | UI/SSR | [ ] 목록 로딩 중에는 route `loading.tsx` 상태가 표시된다 | 빈 화면/레이아웃 점프 없음, 초기 fetch를 client로 옮기지 않음 |
| INBOX-05 | P1 | UI/BE | [ ] 메일이 0개면 empty 상태가 표시된다 | 재시도/새로고침 진입점 |
| INBOX-06 | P1 | BE | [ ] Gmail rate limit 또는 권한 오류 시 명확한 에러 상태가 표시된다 | OAuth 재동의 필요 여부 안내 |
| INBOX-07 | P0 | SSR/BE | [ ] 메일 행 클릭 시 `/compose/{persona_id}/reply/{message_id}`로 이동하고 서버에서 상세 메일을 조회한다 | 서버 route가 `/gmail/messages/{id}` 조회, raw body/thread metadata 확보 |
| INBOX-08 | P0 | UI/SSR | [ ] 답장 route SSR 결과에 reply_context가 포함된다 | 서버 HTML에 `답장 컨텍스트`, brief는 비어 있음, 원문 메타 표시 |
| INBOX-09 | P0 | BE | [ ] 답장 컨텍스트가 포함된 Generate 요청이 전송된다 | payload에 `reply_context_id` 또는 raw context reference 포함 |
| INBOX-10 | P0 | BE | [ ] 생성된 초안이 원문 메일의 맥락을 반영한다 | subject/body가 답장 형태, 새 메일처럼 시작하지 않음 |
| INBOX-11 | P1 | UI | [ ] Compose에서 답장 컨텍스트를 제거하거나 받은편지함으로 돌아갈 수 있다 | 뒤로가기/취소 플로우 |
| INBOX-12 | P1 | BE | [ ] 같은 메일을 두 번 선택해도 reply_context 중복 생성이 통제된다 | DB unique 또는 재사용 정책 |
| INBOX-13 | P2 | UI | [ ] 긴 subject/snippet/from 텍스트가 레이아웃을 깨지 않는다 | ellipsis, tooltip 또는 detail |

## 회귀 포인트

- 받은편지함은 full mail client가 아니다. 라벨/검색/스레드 분류 기능은 E2E 필수 범위가 아니다.
- 답장 초안 생성의 핵심은 `reply_context`가 서버 렌더링된 답장 route로 안전하게 전달되는지와 Gmail thread 발송까지 이어지는지다.
