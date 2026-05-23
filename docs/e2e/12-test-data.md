# E2E - 테스트 데이터

## 범위

Playwright E2E가 안정적으로 재현될 수 있도록 test user, seed data, Gmail fixture, API mocking 기준을 정의한다.

## 테스트 사용자

| 항목 | 값/정책 |
| --- | --- |
| OAuth 계정 | Google OAuth consent screen Testing 모드에 등록된 test user |
| 사용자 이름 | `오지송` 또는 test profile name |
| 이메일 | test Gmail 계정 |
| 권한 | `openid`, `email`, `profile`, `gmail.readonly`, `gmail.send`, `contacts.readonly` |

## Persona Seed

기본 persona ID는 현재 `lib/data.ts`와 호환되도록 유지한다.

| ID | 이름 | 관계/용도 | 우선 검증 |
| --- | --- | --- | --- |
| `lead` | 김지훈 팀장 | 직속 상사 | 결론 우선, 짧은 보고 |
| `partner` | 박서연 책임 | 외부 협력사 | 정중한 이메일 |
| `friend` | 정다은 | 친구 | 캐주얼 메시지 |
| `colleague` | 이민호 사원 | 옆 팀 | 데이터 요청 |
| `mentor` | 최은영 책임 | 멘토 | 정중한 일정 조정 |
| `mom` | 엄마 | 가족 | 짧은 안심 메시지 |

SPEC 구현 후 persona backend shape는 최소 `id`, `user_id`, `name`, `relation`, `tone`, `notes`, `source`를 가진다. UI가 기존 `mbti`, `keywords`, `channel`을 계속 쓰면 backend 응답 또는 frontend adapter에서 보강해야 한다.

## Mail Format Seed

| 필드 | 값 |
| --- | --- |
| greeting | `안녕하세요, 오지송입니다.` |
| signature | `오지송\nMello team` |
| structure | `인사 -> 본문 -> 요청 -> 마무리` |
| language | `한국어 · 존댓말 기본` |

## Gmail Fixture

테스트 Gmail 계정에는 최소 다음 메일을 준비한다.

| ID 별칭 | 조건 | 목적 |
| --- | --- | --- |
| `gmail-reply-basic` | 최근 30개 안에 있는 일반 메일 | Inbox 목록/상세/답장 생성 |
| `gmail-reply-thread` | 기존 thread가 있는 메일 | In-Reply-To/References 유지 |
| `gmail-long-subject` | 긴 subject/snippet | Inbox 레이아웃 회귀 |
| `gmail-empty-body` | snippet은 있으나 body가 짧거나 비어 있음 | reply_context fallback |

## History Seed

초기 history는 0개 또는 소량 fixture 둘 중 하나로 고정한다.

- CI 골든패스 권장: 시작 전 history 0개
- UI 회귀 권장: 현재 mock과 유사한 5~7개 history fixture

생성 테스트는 각 케이스 시작 전에 사용자별 history를 정리하거나, test run id를 brief/subject에 포함해 격리한다.

## API Fixture/Mock 기준

| 영역 | 방식 |
| --- | --- |
| Google OAuth | 가능하면 test user 실계정. CI에서는 auth bypass token fixture 허용 |
| Gmail read/send | 로컬/CI는 mock 가능, 제출 전 staging에서는 실 Gmail API 1회 이상 실행 |
| Solar SSE | CI에서는 deterministic SSE fixture, staging에서는 실제 Solar 호출 smoke |
| Postgres | test schema 또는 test user 단위 cleanup |

## 공통 Cleanup

- 테스트 실행 전 해당 test user의 personas/history/reply_contexts/mail_format을 seed 기준으로 재설정한다.
- Gmail 실제 발송 테스트는 제목 prefix에 `[Mello E2E]`를 붙인다.
- 실제 발송 recipient는 테스트 계정 또는 팀 내부 허용 계정으로 제한한다.
- 외부 API rate limit 방지를 위해 P0 smoke와 full regression suite를 분리한다.
