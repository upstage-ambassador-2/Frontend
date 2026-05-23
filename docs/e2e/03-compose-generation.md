# E2E - 작성 & AI 생성

## 범위

Compose 화면의 recipient 선택, brief 입력, tone/length 조정, Upstage Solar SSE 스트리밍 생성, regenerate, history 생성까지 검증한다. SPEC에 따라 A/B/C 버전 선택자는 제거 대상이다.

## 주요 API

- `GET /personas`
- `GET /format`
- `POST /ai/generate` (SSE)
- `GET /history`

## 체크리스트

| ID | 우선순위 | 유형 | 체크리스트 | 검증 포인트 |
| --- | --- | --- | --- | --- |
| COMPOSE-01 | P0 | UI/BE | [ ] Compose 진입 시 기본 persona와 mail format이 로드된다 | recipient card, format summary, `/personas`, `/format` |
| COMPOSE-02 | P1 | UI | [ ] recipient card에 이름/관계/역할/키워드가 표시된다 | 데이터 매핑, 태그 컬러 |
| COMPOSE-03 | P1 | UI | [ ] `받는 사람 변경` 클릭 시 persona picker가 열린다 | 현재 선택 항목 표시, 바깥 클릭 닫힘 |
| COMPOSE-04 | P0 | UI | [ ] picker에서 persona를 변경하면 recipient, scale preset, breadcrumb가 함께 갱신된다 | 이전 persona 상태 잔류 없음 |
| COMPOSE-05 | P0 | UI | [ ] brief가 비어 있거나 공백뿐이면 생성 버튼이 disabled다 | `disabled`, 키보드 단축키도 무동작 |
| COMPOSE-06 | P1 | UI | [ ] 한국어 IME 입력이 끊김 없이 textarea에 반영된다 | composition 중 조기 제출/문자 손상 없음 |
| COMPOSE-07 | P1 | UI | [ ] textarea 높이가 입력량에 따라 96px~260px 범위에서 자동 조정된다 | 레이아웃 밀림 없음 |
| COMPOSE-08 | P1 | UI | [ ] tone control은 5단계 스케일을 가진다 | `매우 격식`, `격식`, `중립`, `친근`, `매우 친근` |
| COMPOSE-09 | P1 | UI | [ ] length control은 5단계 스케일을 가진다 | `매우 짧게`, `짧게`, `보통`, `자세히`, `매우 자세히` |
| COMPOSE-10 | P0 | BE | [ ] 생성 버튼 클릭 시 `POST /ai/generate` SSE 요청이 시작된다 | payload: `brief`, `tone`, `length`, `persona_id?`, `reply_context_id?` |
| COMPOSE-11 | P0 | BE | [ ] SSE chunk 수신 중 subject/body가 실시간으로 증가 표시된다 | 완료 전에도 partial body 관찰 가능 |
| COMPOSE-12 | P0 | BE | [ ] 생성 중 상태가 스크린리더와 시각적으로 표현된다 | `role=status` 또는 `aria-live`, spinner/cursor |
| COMPOSE-13 | P0 | BE | [ ] 생성 완료 시 subject와 body가 최종 응답과 일치한다 | 스트림 조립 결과 검증 |
| COMPOSE-14 | P0 | BE | [ ] 생성 완료 후 history에 draft 항목 1건이 생성된다 | `/history` 첫 행 또는 detail에서 `status=draft` |
| COMPOSE-15 | P0 | UI/BE | [ ] `Regenerate` 클릭 시 동일 입력으로 새 생성 요청이 호출된다 | 이전 결과가 새 스트림으로 교체됨 |
| COMPOSE-16 | P0 | UI | [ ] 버전 선택자(A/B/C tabs)가 노출되지 않는다 | SPEC non-goal 회귀 검증 |
| COMPOSE-17 | P1 | UI | [ ] 복사 버튼 클릭 시 현재 body가 클립보드에 복사되고 토스트가 뜬다 | `navigator.clipboard.readText()` |
| COMPOSE-18 | P1 | BE | [ ] mail format의 greeting/signature가 generation prompt에 반영된다 | `/format` 변경 후 생성 결과 또는 request context 확인 |
| COMPOSE-19 | P0 | BE | [ ] Solar 5xx 발생 시 이전 결과를 보존하고 에러 토스트를 표시한다 | 빈 결과로 덮어쓰기 없음 |
| COMPOSE-20 | P0 | BE | [ ] 네트워크 타임아웃/abort 시 사용자가 재시도할 수 있다 | 버튼 재활성화, 명확한 메시지 |
| COMPOSE-21 | P0 | BE | [ ] 중복 클릭 또는 빠른 regenerate에서 늦은 응답이 최신 결과를 덮지 않는다 | request id/race condition 검증 |
| COMPOSE-22 | P1 | UI | [ ] `Cmd+Enter`/`Ctrl+Enter`가 생성 버튼과 같은 동작을 한다 | brief empty일 때 무동작 |

## 회귀 포인트

- `versions[].body/label/sub/tags` 기반 UI 테스트는 제거한다.
- 단일 응답은 최소 `subject`, `body`, `history_id` 또는 그에 준하는 완료 식별자를 제공해야 한다.
- 답장 생성은 `04-inbox-reply.md`와 함께 검증한다.
