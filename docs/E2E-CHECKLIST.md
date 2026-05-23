# Mello E2E 테스트 체크리스트

`docs/SPEC.md` 구현 전에 실행 기준을 페이지/기능 단위로 분리한 문서입니다. 이 파일은 인덱스이며, 실제 테스트 케이스는 `docs/e2e/` 아래 세부 파일에서 관리합니다.

## 기준

- 스펙 원본: `docs/SPEC.md`
- 테스트 레이어: Playwright 기반 브라우저 E2E
- 대상 상태: Next.js UI + FastAPI + Postgres + Google OAuth/Gmail/Contacts + Upstage Solar 연동 완료 상태
- 현재 프론트 단독 검증 모드: [`docs/MOCK-E2E.md`](./MOCK-E2E.md) 기준으로 `frontend/mock-server`와 Next.js proxy를 사용
- 현재 mock UI와 충돌하는 과거 항목은 SPEC 기준으로 갱신
  - 매직링크/이메일+PW 제거, Google OAuth 단일화
  - 작성 결과 A/B/C 버전 선택자 제거, 단일 SSE 스트리밍 + Regenerate로 변경
  - Sidebar에 받은편지함 신규 추가
  - Gmail 발송/답장 스레드 유지 검증 추가

## 범례

| 표기 | 의미 |
| --- | --- |
| P0 | 데모 골든패스 또는 회귀 차단 후보 |
| P1 | 주요 기능 검증 |
| P2 | 품질, 접근성, 보조 UX 검증 |
| BE | FastAPI/DB/외부 API 연동 이후 검증 |
| UI | 프론트엔드 상태/상호작용만으로 검증 가능 |

## 파일 구성

| 영역 | 상세 체크리스트 | 우선순위 | 주요 API/계약 |
| --- | --- | --- | --- |
| 인증 & 세션 | [`docs/e2e/01-auth-session.md`](./e2e/01-auth-session.md) | P0 | `/auth/google/start`, `/auth/google/callback`, `/me`, `/auth/logout` |
| 셸 & 내비게이션 | [`docs/e2e/02-shell-navigation.md`](./e2e/02-shell-navigation.md) | P0 | `/me`, `/personas`, `/history` |
| 작성 & AI 생성 | [`docs/e2e/03-compose-generation.md`](./e2e/03-compose-generation.md) | P0 | `POST /ai/generate` SSE |
| 받은편지함 & 답장 진입 | [`docs/e2e/04-inbox-reply.md`](./e2e/04-inbox-reply.md) | P0 | `/gmail/messages?limit&pageToken`, `/gmail/messages/{id}` |
| Gmail 발송 | [`docs/e2e/05-gmail-send.md`](./e2e/05-gmail-send.md) | P0 | `POST /gmail/send` |
| 사람/페르소나 | [`docs/e2e/06-people-personas.md`](./e2e/06-people-personas.md) | P1 | `/personas`, `/personas/import-contacts` |
| 히스토리 | [`docs/e2e/07-history.md`](./e2e/07-history.md) | P1 | `/history`, `/history/{id}` |
| 내 메일 형식 | [`docs/e2e/08-format.md`](./e2e/08-format.md) | P1 | `/format` |
| 설정 & 통합 | [`docs/e2e/09-settings-integrations.md`](./e2e/09-settings-integrations.md) | P1 | `/me`, Google OAuth scope 상태 |
| 공통 UX/회귀 | [`docs/e2e/10-common-ux-regression.md`](./e2e/10-common-ux-regression.md) | P1/P2 | 공통 fetch, toast, layout |
| 배포/운영 | [`docs/e2e/11-deployment-readme.md`](./e2e/11-deployment-readme.md) | P0/P1 | Railway web/api/db, env, README |
| 테스트 데이터 | [`docs/e2e/12-test-data.md`](./e2e/12-test-data.md) | P0 | seed, fixtures, OAuth test user |

## 권장 실행 순서

1. [`12-test-data.md`](./e2e/12-test-data.md) 기준으로 테스트 계정, seed, Gmail fixture 준비
2. [`01-auth-session.md`](./e2e/01-auth-session.md)으로 로그인/세션 골든패스 검증
3. [`02-shell-navigation.md`](./e2e/02-shell-navigation.md)으로 주요 라우트 접근성 확인
4. [`03-compose-generation.md`](./e2e/03-compose-generation.md)으로 신규 메일 초안 생성 검증
5. [`05-gmail-send.md`](./e2e/05-gmail-send.md)으로 Gmail 발송 및 history 상태 전이 검증
6. [`04-inbox-reply.md`](./e2e/04-inbox-reply.md)으로 받은 메일 답장 생성 검증
7. People/History/Format/Settings와 공통 UX 회귀를 병렬로 확장
8. [`11-deployment-readme.md`](./e2e/11-deployment-readme.md)로 Railway 공개 URL 데모 경로 확인

## 데모 골든패스

- 비로그인 사용자가 공개 URL 접근
- Google OAuth 로그인
- 메인 작성 화면 진입
- 페르소나 선택, brief 입력, tone/length 조정
- Solar SSE 스트리밍으로 subject/body 표시
- Gmail로 발송
- 성공 토스트 확인
- History 첫 행이 `sent` 상태로 갱신
- 받은편지함에서 최근 메일 선택
- Compose로 이동해 reply_context 포함 답장 초안 생성
- 답장 발송 시 Gmail thread가 유지됨

## 작성 규칙

- 테스트 ID는 파일 접두어를 따른다. 예: `AUTH-01`, `COMPOSE-04`, `SEND-03`
- P0는 CI 차단 후보로 작성한다.
- 외부 API 실패 케이스는 네트워크 mocking 또는 dedicated test account로 재현한다.
- Google OAuth consent screen은 데모 단계에서 Testing 모드와 등록된 test user를 기준으로 한다.
- 사용자별 데이터 격리는 모든 DB 기반 화면에서 최소 1개 케이스 이상 검증한다.
