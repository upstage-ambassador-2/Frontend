# E2E - 내 메일 형식

## 범위

사용자별 인사말/서명 등 메일 형식 저장과 AI 생성 반영을 검증한다.

## 주요 API

- `GET /format`
- `PUT /format`
- `POST /ai/generate`

## 체크리스트

| ID | 우선순위 | 유형 | 체크리스트 | 검증 포인트 |
| --- | --- | --- | --- | --- |
| FORMAT-01 | P1 | BE | [ ] Format 화면 진입 시 사용자별 메일 형식이 표시된다 | `/format`, 타 사용자 값 미노출 |
| FORMAT-02 | P1 | UI | [ ] 기본 형식에 인사말/본문 구조/마무리/서명 등 주요 필드가 표시된다 | SPEC 최소 필드: greeting, signature |
| FORMAT-03 | P1 | BE | [ ] 편집 후 저장하면 값이 DB에 영속화된다 | `PUT /format`, 새로고침 후 유지 |
| FORMAT-04 | P1 | BE | [ ] 빈 필수 필드는 저장이 차단되고 메시지가 표시된다 | greeting/signature 정책은 구현 결정에 맞춤 |
| FORMAT-05 | P0 | BE | [ ] 형식 변경 후 Compose 생성 결과에 새 인사말/서명이 반영된다 | `PUT /format` -> `POST /ai/generate` |
| FORMAT-06 | P1 | UI | [ ] multiline signature의 줄바꿈이 화면에서 보존된다 | `white-space: pre-wrap` 또는 동등 처리 |
| FORMAT-07 | P1 | BE | [ ] 처음 가입한 사용자는 기본 format이 자동 생성되거나 empty state에서 저장 가능하다 | `/format` 404 처리 없음 |
| FORMAT-08 | P2 | UI | [ ] 긴 서명/인사말이 카드 레이아웃을 깨지 않는다 | wrapping, overflow |
| FORMAT-09 | P2 | BE | [ ] HTML/script 입력이 표시 또는 생성 prompt에서 안전하게 처리된다 | XSS 방지, escape/sanitize |

## 회귀 포인트

- 기존 UI의 상황별 형식 3슬롯은 SPEC 필수 요건이 아니다. 유지한다면 P2로 검증하고, AI prompt 반영 여부를 명확히 해야 한다.
- Format 변경은 단순 저장에 그치지 않고 AI 생성 request context에 들어가야 한다.
