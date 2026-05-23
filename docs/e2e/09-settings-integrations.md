# E2E - 설정 & 통합

## 범위

계정 정보, Gmail/Contacts 연결 상태, Slack/Notion no-op, 알림/정적 요금제 표시를 검증한다.

## 주요 API

- `GET /me`
- Google OAuth scope 상태
- `POST /auth/logout`

## 체크리스트

| ID | 우선순위 | 유형 | 체크리스트 | 검증 포인트 |
| --- | --- | --- | --- | --- |
| SETTINGS-01 | P1 | BE | [ ] Settings 계정 섹션에 현재 사용자 이메일/이름이 표시된다 | `/me`와 일치 |
| SETTINGS-02 | P1 | UI | [ ] 요금제는 `Free · 30회 / 월` 정적 라벨로 표시된다 | quota enforcement 없음 |
| SETTINGS-03 | P0 | BE | [ ] OAuth 로그인 완료 후 Gmail은 `연결됨` 상태로 표시된다 | 별도 Gmail 연결 플로우 없음 |
| SETTINGS-04 | P0 | BE | [ ] OAuth 로그인 완료 후 Google Contacts는 `연결됨` 상태로 표시된다 | contacts scope 포함 |
| SETTINGS-05 | P1 | BE | [ ] Gmail/Contacts 권한이 부족하면 연결 상태와 재동의 안내가 정확히 표시된다 | scope 누락 fixture |
| SETTINGS-06 | P1 | UI | [ ] Slack 버튼은 표시되되 클릭 시 `지원 예정` no-op 피드백을 준다 | 실제 OAuth/API 호출 없음 |
| SETTINGS-07 | P1 | UI | [ ] Notion 버튼은 표시되되 클릭 시 `지원 예정` no-op 피드백을 준다 | 실제 OAuth/API 호출 없음 |
| SETTINGS-08 | P1 | UI/BE | [ ] 로그아웃 진입점이 Settings 또는 계정 메뉴에서 접근 가능하다 | `POST /auth/logout` |
| SETTINGS-09 | P2 | UI | [ ] 알림 토글이 있다면 변경 후 즉시 UI에 반영된다 | backend 미구현 시 local/no-op 정책 명확화 |
| SETTINGS-10 | P2 | UI | [ ] 긴 이메일/이름이 설정 행 레이아웃을 깨지 않는다 | responsive wrapping |

## 회귀 포인트

- Gmail/Contacts는 OAuth 단일화로 "연결" 액션이 핵심 플로우가 아니다.
- Slack/Notion은 기능 제외/연기 대상이므로 실제 통합처럼 보이는 성공 상태를 만들지 않는다.
