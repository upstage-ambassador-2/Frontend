# E2E - 히스토리

## 범위

AI 생성 및 Gmail 발송 결과가 사용자별 history로 영속화되고, 목록/상세/상태 전이가 올바르게 표시되는지 검증한다.

## 주요 API

- `GET /history`
- `GET /history/{id}`
- `POST /ai/generate`
- `POST /gmail/send`

## 체크리스트

| ID | 우선순위 | 유형 | 체크리스트 | 검증 포인트 |
| --- | --- | --- | --- | --- |
| HISTORY-01 | P1 | BE | [ ] History 화면 진입 시 사용자별 history 목록이 표시된다 | 타 사용자 항목 미노출 |
| HISTORY-02 | P1 | BE | [ ] 목록은 생성 시각 desc로 정렬된다 | 최신 생성/발송 항목이 첫 행 |
| HISTORY-03 | P0 | BE | [ ] AI 생성 완료 후 draft history가 1건 생성된다 | `brief`, `subject`, `body`, `persona_id`, `status=draft` |
| HISTORY-04 | P0 | BE | [ ] Gmail 발송 성공 후 해당 history 상태가 `sent`로 바뀐다 | 새 항목 중복 생성 여부 정책 확인 |
| HISTORY-05 | P1 | UI | [ ] 행에는 제목/미리보기/대상 persona 또는 reply target/톤/작성 시각/상태가 표시된다 | 긴 텍스트 ellipsis |
| HISTORY-06 | P1 | BE | [ ] 행 클릭 시 상세를 조회하고 전체 subject/body를 표시한다 | `/history/{id}` |
| HISTORY-07 | P1 | BE | [ ] 답장 초안 history에는 reply_context 참조가 저장된다 | 원문 Gmail message id/thread id 확인 |
| HISTORY-08 | P1 | UI/BE | [ ] 필터 버튼으로 persona/status/date 조건을 적용할 수 있다 | 구현 범위에 포함 시 URL query 또는 state 검증 |
| HISTORY-09 | P1 | UI/BE | [ ] 검색 버튼으로 subject/body/brief 검색이 가능하다 | 구현 범위에 포함 시 `/history?q=` |
| HISTORY-10 | P1 | UI | [ ] history가 0개일 때 empty state가 표시된다 | "아직 작성한 메일이 없습니다" 류 메시지 |
| HISTORY-11 | P1 | BE | [ ] 삭제된 persona가 참조된 history도 깨지지 않는다 | fallback name/avatar |
| HISTORY-12 | P2 | UI | [ ] 페이지네이션 또는 무한 스크롤이 있을 경우 중복/누락 없이 동작한다 | SPEC 이후 확정 시 추가 |

## 회귀 포인트

- History는 생성 시점과 발송 시점 모두의 상태 변화를 추적해야 한다.
- 현재 mock의 `subj/prev/when` shape는 backend 스키마의 `subject/body/status/created_at`로 갱신된다.
