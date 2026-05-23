# E2E - 사람/페르소나

## 범위

사용자별 persona CRUD, Google Contacts 임포트, Compose와의 연결을 검증한다.

## 주요 API

- `GET /personas`
- `POST /personas`
- `PATCH /personas/{id}`
- `DELETE /personas/{id}`
- `POST /personas/import-contacts`

## 체크리스트

| ID | 우선순위 | 유형 | 체크리스트 | 검증 포인트 |
| --- | --- | --- | --- | --- |
| PEOPLE-01 | P1 | BE | [ ] People 화면 진입 시 사용자별 persona 목록이 표시된다 | `/personas`, 타 사용자 데이터 미노출 |
| PEOPLE-02 | P1 | UI | [ ] 카드에 이름, 관계, 톤/메모 요약, 마지막 사용 정보가 표시된다 | SPEC 필드와 현재 UI 필드 차이는 구현 시 정리 |
| PEOPLE-03 | P0 | UI | [ ] persona 카드 클릭 시 Compose로 이동하고 해당 persona가 선택된다 | recipient, breadcrumb, scale preset 갱신 |
| PEOPLE-04 | P1 | UI/BE | [ ] `사람 추가` 버튼으로 persona 생성 모달/폼이 열린다 | 필수 필드 표시 |
| PEOPLE-05 | P1 | BE | [ ] 이름/관계/tone/notes 입력 후 저장하면 목록에 즉시 추가된다 | `POST /personas`, optimistic 또는 refetch |
| PEOPLE-06 | P1 | BE | [ ] 필수 필드 누락 시 저장이 차단되고 에러 메시지가 표시된다 | 422 또는 클라이언트 검증 |
| PEOPLE-07 | P1 | BE | [ ] 기존 persona를 수정하면 목록과 Compose picker에 반영된다 | `PATCH /personas/{id}` |
| PEOPLE-08 | P1 | BE | [ ] persona 삭제 시 확인 다이얼로그 후 목록에서 제거된다 | `DELETE /personas/{id}` |
| PEOPLE-09 | P1 | BE | [ ] 삭제된 persona가 연결된 history는 안전하게 표시된다 | 이름 fallback 또는 삭제 제한 정책 |
| PEOPLE-10 | P0 | BE | [ ] `Contacts에서 가져오기`로 Google Contacts 상위 N개를 임포트한다 | N=20 권장, OAuth contacts scope 필요 |
| PEOPLE-11 | P1 | BE | [ ] Contacts 임포트 중 중복 이메일/이름은 중복 생성되지 않는다 | merge/skip 정책 명확화 |
| PEOPLE-12 | P1 | UI/BE | [ ] 임포트 완료 후 생성 개수와 skip 개수를 사용자에게 표시한다 | 토스트 또는 결과 모달 |
| PEOPLE-13 | P2 | UI | [ ] persona가 0개일 때 empty state와 생성 CTA가 표시된다 | 처음 가입한 사용자 |
| PEOPLE-14 | P2 | UI | [ ] 긴 이름/관계/메모가 카드 레이아웃을 깨지 않는다 | ellipsis 또는 wrapping |

## 회귀 포인트

- mock의 MBTI/키워드 중심 구조와 SPEC의 이름/관계/톤/메모 중심 구조 차이를 구현 단계에서 정리해야 한다.
- Contacts 임포트는 Settings와 People 중 최소 한 곳에서 진입 가능해야 한다.
