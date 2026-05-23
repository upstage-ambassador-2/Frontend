# E2E - 셸 & 내비게이션

## 범위

Sidebar, Topbar, 기능 단위 페이지 라우팅, 검색 진입점, 사용자 정보, 레이아웃 기본 동작을 검증한다.

## 주요 API

- `GET /me`
- `GET /personas`
- `GET /history`
- `GET /gmail/messages`

## 체크리스트

| ID | 우선순위 | 유형 | 체크리스트 | 검증 포인트 |
| --- | --- | --- | --- | --- |
| SHELL-01 | P0 | UI | [ ] Sidebar에 `작성`, `받은편지함`, `사람`, `히스토리`, `내 메일 형식`, `설정` 항목이 표시된다 | SPEC의 신규 받은편지함 항목 포함 |
| SHELL-02 | P0 | UI | [ ] 각 메뉴 클릭 시 `/compose/{persona_id}`, `/inbox`, `/people`, `/history`, `/format`, `/settings`로 URL이 변경되고 활성 항목 스타일이 갱신된다 | `next/link`, active class 검증 |
| SHELL-02A | P0 | UI/SSR | [ ] 각 기능 URL 직접 진입과 새로고침이 같은 화면을 유지한다 | `page.goto`, `page.reload`, URL/pathname 검증 |
| SHELL-02B | P0 | SSR | [ ] 각 기능 URL의 서버 응답 HTML에 핵심 화면 텍스트가 포함된다 | `/compose/{persona_id}`=`받는 사람`, `/people`=`자주 보내는 사람` 등 |
| SHELL-02C | P0 | UI/SSR | [ ] `/compose`는 첫 번째 persona route로 redirect하고, persona 변경 시 `/compose/{persona_id}`가 된다 | 상대방별 direct URL, 새로고침, SSR HTML 검증 |
| SHELL-03 | P0 | UI | [ ] `작성` 화면 Topbar breadcrumb가 `작성 > {페르소나명}에게`로 표시된다 | 페르소나 변경 시 breadcrumb 동기화 |
| SHELL-04 | P0 | UI/SSR/BE | [ ] `받은편지함` 클릭 시 Inbox 화면과 최근 메일 목록이 서버 렌더링된다 | 서버 HTML에 메일 행 포함, route loading/empty/error 상태 포함 |
| SHELL-05 | P1 | UI/BE | [ ] `사람` 메뉴 count가 사용자 persona 수와 일치한다 | `/personas` 응답 길이 |
| SHELL-06 | P1 | UI/BE | [ ] `히스토리` 메뉴 count가 사용자 history 수와 일치한다 | `/history` 응답 길이 또는 페이지네이션 총수 |
| SHELL-07 | P1 | UI | [ ] `자주 보내는 사람` 목록의 persona 클릭 시 `/compose/{persona_id}`로 이동하고 해당 persona가 선택된다 | recipient card, tone/length preset, URL 동기화 |
| SHELL-08 | P1 | UI/BE | [ ] Sidebar footer에 현재 로그인 사용자의 이름/이메일이 표시된다 | mock 값이 아닌 `/me` 값 |
| SHELL-09 | P1 | UI | [ ] Sidebar 검색 입력에 `Cmd+K`/`Ctrl+K`로 포커스된다 | `document.activeElement` 검증 |
| SHELL-10 | P1 | BE | [ ] 검색어 입력 시 persona/history 검색 결과가 표시된다 | 구현 방식에 따라 `/search?q=` 또는 클라이언트 필터 |
| SHELL-11 | P1 | UI | [ ] 검색 결과가 없을 때 비어있음 상태가 표시된다 | placeholder 또는 empty message |
| SHELL-12 | P2 | UI | [ ] Sidebar footer 더보기 버튼이 로그아웃/계정 관련 메뉴를 연다 | 키보드 접근 가능, 바깥 클릭으로 닫힘 |
| SHELL-13 | P2 | UI | [ ] 브랜드 배지/버전 표기가 환경별 build metadata와 충돌하지 않는다 | 고정 `v0.4 beta` 유지 또는 env 기반 표시 |
| SHELL-14 | P1 | UI | [ ] main scroll과 body scroll이 충돌하지 않는다 | body overflow, 100vh shell, main-scroll만 스크롤 |

## 회귀 포인트

- 기존 5개 메뉴 기준 테스트는 신규 `받은편지함` 항목 추가로 모두 갱신해야 한다.
- 기능 라우팅은 클라이언트 state만으로 처리하지 않는다. E2E에서는 URL 변경, 새로고침 유지, 서버 HTML을 함께 검증한다.
