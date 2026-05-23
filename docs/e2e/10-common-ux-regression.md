# E2E - 공통 UX/회귀

## 범위

화면 공통 UX, 접근성, 한국어 입력, 레이아웃, 에러 처리, fetch 공통 정책을 검증한다.

## 체크리스트

| ID | 우선순위 | 유형 | 체크리스트 | 검증 포인트 |
| --- | --- | --- | --- | --- |
| UX-01 | P1 | UI | [ ] 토스트는 여러 개가 겹쳐도 읽을 수 있고 일정 시간 후 dismiss된다 | 1.8초 또는 구현 기준 |
| UX-02 | P1 | UI | [ ] 1280px/1440px/1920px 뷰포트에서 주요 화면 레이아웃이 깨지지 않는다 | Sidebar 고정폭, main flex |
| UX-03 | P2 | UI | [ ] 작은 데스크톱/태블릿 폭에서 텍스트와 버튼이 겹치지 않는다 | 최소 지원 viewport 구현 기준 |
| UX-04 | P1 | UI | [ ] body와 main scroll이 이중으로 충돌하지 않는다 | shell 100vh, main-scroll |
| UX-05 | P1 | UI | [ ] 키보드만으로 주요 액션에 도달할 수 있다 | nav, generate, send, picker, modal |
| UX-06 | P1 | UI | [ ] focus ring이 시각적으로 보이고 순서가 자연스럽다 | Tab/Shift+Tab |
| UX-07 | P1 | UI | [ ] 한국어 IME composition 중 입력/제출이 깨지지 않는다 | Compose, 검색, form 입력 |
| UX-08 | P2 | UI | [ ] Pretendard 로드 실패 시 system fallback으로 텍스트가 깨지지 않는다 | CDN 차단 시뮬레이션 |
| UX-09 | P2 | UI | [ ] OS 다크 모드에서도 앱은 의도한 라이트 테마를 유지한다 | `prefers-color-scheme` |
| UX-10 | P1 | BE | [ ] 모든 fetch의 401 응답이 공통 세션 만료 처리로 이어진다 | 보호 화면, API action 모두 |
| UX-11 | P1 | BE | [ ] 5xx/네트워크 실패는 빈 화면 대신 에러 상태나 토스트로 표시된다 | retry 가능 여부 |
| UX-12 | P2 | UI | [ ] 스크린리더가 생성 중/완료/에러 상태를 인지할 수 있다 | `aria-live`, `role=status/alert` |
| UX-13 | P2 | UI | [ ] 긴 한국어/영문 텍스트가 버튼, 카드, 테이블 셀을 밀어내지 않는다 | wrapping/ellipsis |
| UX-14 | P1 | UI | [ ] 주요 modal/popover는 ESC와 바깥 클릭으로 닫힌다 | focus trap 여부는 modal 범위 |
| UX-15 | P1 | BE | [ ] API base URL, CORS, credentials 설정이 배포 환경에서도 유지된다 | web/api 분리 도메인 |

## 회귀 포인트

- 기능별 테스트가 통과해도 공통 fetch/세션/토스트 실패가 전체 데모를 망칠 수 있으므로 P1 이상으로 관리한다.
- 접근성 검증은 사용자가 보는 UI 문구를 늘리는 방식이 아니라 semantic attribute 중심으로 처리한다.
