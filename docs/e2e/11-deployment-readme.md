# E2E - 배포/운영/README

## 범위

Railway 3서비스 배포, 공개 URL 접근, 환경변수, README의 로컬 실행 및 데모 시나리오를 검증한다.

## 체크리스트

| ID | 우선순위 | 유형 | 체크리스트 | 검증 포인트 |
| --- | --- | --- | --- | --- |
| DEPLOY-01 | P0 | BE | [ ] Railway에 `mello-web`, `mello-api`, `mello-db` 3서비스가 존재한다 | SPEC 배포 토폴로지 |
| DEPLOY-02 | P0 | BE | [ ] 공개 web URL로 접속 시 로그인 화면이 열린다 | 브라우저 E2E 시작점 |
| DEPLOY-03 | P0 | BE | [ ] web에서 api로 내부/공개 URL 설정이 올바르다 | same-origin API proxy 또는 서버사이드 proxy |
| DEPLOY-04 | P0 | BE | [ ] api가 Postgres에 연결되고 migration/seed가 적용된다 | health 또는 smoke endpoint |
| DEPLOY-05 | P0 | BE | [ ] Google OAuth redirect URI가 Railway 공개 URL과 일치한다 | callback 400/redirect mismatch 없음 |
| DEPLOY-06 | P0 | BE | [ ] OAuth client secret, Solar API key, DB URL이 Railway secret으로만 관리된다 | repo에 비밀값 없음 |
| DEPLOY-07 | P0 | BE | [ ] SSE가 Railway 배포 환경에서 끊기지 않고 스트리밍된다 | buffering/proxy timeout 확인 |
| DEPLOY-08 | P1 | BE | [ ] Gmail send/read API가 배포 환경에서도 동작한다 | OAuth test user 등록 필요 |
| DEPLOY-09 | P1 | BE | [ ] CORS/쿠키 설정이 web/api 분리 도메인에서 정상 동작한다 | credentials include, SameSite/Secure |
| DEPLOY-10 | P1 | BE | [ ] README에 frontend/backend/db 로컬 실행 방법이 있다 | 명령어, env, migration |
| DEPLOY-11 | P1 | BE | [ ] README에 데모 골든패스가 명시되어 있다 | OAuth -> generate -> send -> history -> inbox reply |
| DEPLOY-12 | P1 | BE | [ ] README에 필요한 Google OAuth Testing 설정이 적혀 있다 | scope, test user, redirect URI |
| DEPLOY-13 | P2 | BE | [ ] API health/readiness endpoint가 문서화되어 있다 | Railway 장애 확인 |

## 회귀 포인트

- 로컬에서 동작해도 Railway의 SSE buffering, cookie domain, OAuth redirect URI 때문에 실패할 수 있다.
- README는 제출자가 그대로 따라 실행할 수 있는 수준이어야 한다.
