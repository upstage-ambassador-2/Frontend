# E2E - 인증 & 세션

## 범위

Google OAuth 단일 인증, HttpOnly 쿠키 기반 서버 세션, 로그아웃, 세션 유지/만료 처리를 검증한다. 매직링크/이메일+PW 플로우는 SPEC에서 제거되었으므로 테스트하지 않는다.

## 주요 API

- `POST /auth/google/start`
- `GET /auth/google/callback`
- `GET /me`
- `POST /auth/logout`

## 체크리스트

| ID | 우선순위 | 유형 | 체크리스트 | 검증 포인트 |
| --- | --- | --- | --- | --- |
| AUTH-01 | P0 | BE | [ ] 비로그인 상태에서 `/` 접근 시 로그인 화면이 표시된다 | 메인 앱 shell이 노출되지 않고 "Sign in with Google" CTA가 보인다 |
| AUTH-02 | P0 | BE | [ ] Google 로그인 CTA 클릭 시 OAuth 시작 API가 호출된다 | `POST /auth/google/start` 200, Google authorize URL로 이동 |
| AUTH-03 | P0 | BE | [ ] OAuth 요청 scope가 SPEC의 6개 scope와 일치한다 | `openid`, `email`, `profile`, `gmail.readonly`, `gmail.send`, `contacts.readonly` 포함 |
| AUTH-04 | P0 | BE | [ ] OAuth callback 성공 후 서버 세션 쿠키가 발급된다 | HttpOnly cookie 존재, SameSite/Secure가 배포 환경 기준으로 설정됨 |
| AUTH-05 | P0 | BE | [ ] callback 성공 후 메인 작성 화면으로 진입한다 | URL이 앱 화면으로 복귀, Sidebar/Topbar/Composer가 보임 |
| AUTH-06 | P0 | BE | [ ] 로그인 후 `/me` 응답의 사용자 정보가 Sidebar footer/Settings 계정 섹션에 반영된다 | Google profile email/name/picture가 UI와 일치 |
| AUTH-07 | P0 | BE | [ ] 새로고침 후에도 세션이 유지된다 | 로그인 화면으로 튕기지 않고 `/me` 200 |
| AUTH-08 | P0 | BE | [ ] 로그아웃 시 세션이 삭제되고 로그인 화면으로 복귀한다 | `POST /auth/logout`, 이후 `/me` 401 |
| AUTH-09 | P0 | BE | [ ] 세션 만료 상태에서 보호 화면 접근 시 로그인 화면으로 이동한다 | 모든 주요 라우트에서 공통 401 핸들러 동작 |
| AUTH-10 | P1 | BE | [ ] OAuth 사용자가 consent를 취소하면 명확한 에러 화면 또는 토스트가 표시된다 | 빈 화면/무한 로딩 없음 |
| AUTH-11 | P1 | BE | [ ] OAuth `state` mismatch는 로그인 실패로 처리된다 | 세션 미발급, 사용자에게 재시도 안내 |
| AUTH-12 | P1 | BE | [ ] refresh token 만료/폐기 시 재로그인 안내가 표시된다 | Gmail/Contacts 호출 실패가 앱 전체 크래시로 이어지지 않음 |

## 회귀 포인트

- Google OAuth 로그인 이후에도 매직링크 관련 UI/문구가 남아 있지 않아야 한다.
- Gmail/Contacts 권한은 별도 연결 버튼 없이 OAuth 동의 시점에 연결된 상태가 된다.
- API base URL이 Railway web/api 분리 배포에서도 쿠키를 정상 전달해야 한다.
