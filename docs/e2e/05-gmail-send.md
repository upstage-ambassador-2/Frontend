# E2E - Gmail 발송

## 범위

Compose에서 생성된 초안을 Gmail API로 사용자 본인 명의 발송하고, 성공/실패 상태와 history 업데이트를 검증한다. 답장 발송 시 Gmail thread 유지도 포함한다.

## 주요 API

- `POST /gmail/send`
- `GET /history`
- `GET /history/{id}`

## 체크리스트

| ID | 우선순위 | 유형 | 체크리스트 | 검증 포인트 |
| --- | --- | --- | --- | --- |
| SEND-01 | P0 | UI | [ ] 생성 완료 전에는 보내기 버튼이 비활성 또는 안전하게 보호된다 | 빈 body/subject 발송 방지 |
| SEND-02 | P0 | BE | [ ] 새 메일 발송 시 Gmail send API가 호출된다 | payload: to, subject, body, history_id |
| SEND-03 | P0 | BE | [ ] 발송자는 로그인한 Google 계정이다 | From이 OAuth 사용자와 일치 |
| SEND-04 | P0 | UI/BE | [ ] 발송 성공 시 성공 토스트가 표시된다 | 사용자 관찰 가능한 완료 피드백 |
| SEND-05 | P0 | BE | [ ] 발송 성공 후 history 상태가 `sent`로 업데이트된다 | 목록 첫 행 또는 detail에서 status 확인 |
| SEND-06 | P0 | BE | [ ] 발송 성공 직후 History 화면에 최신 항목으로 노출된다 | 정렬 desc, cache 무효화 |
| SEND-07 | P0 | BE | [ ] 답장 발송 시 In-Reply-To/References/thread_id가 보존된다 | Gmail thread가 새 스레드로 분리되지 않음 |
| SEND-08 | P0 | BE | [ ] 발송 실패 시 에러 토스트를 표시하고 초안을 보존한다 | 사용자가 수정/재시도 가능 |
| SEND-09 | P0 | BE | [ ] 중복 클릭으로 같은 메일이 2번 발송되지 않는다 | in-flight lock 또는 idempotency |
| SEND-10 | P1 | BE | [ ] Gmail 401/403은 재로그인 또는 권한 재동의 안내로 처리된다 | 앱 전체 로그아웃 여부는 정책에 맞춤 |
| SEND-11 | P1 | BE | [ ] Gmail rate limit은 재시도 가능한 에러로 표시된다 | 원인 메시지와 버튼 상태 정상화 |
| SEND-12 | P1 | BE | [ ] HTML/텍스트 줄바꿈이 Gmail 수신 화면에서 의도대로 보존된다 | plain text 또는 MIME 구성 검증 |
| SEND-13 | P2 | UI | [ ] 발송 대상이 비어 있거나 유효하지 않으면 클라이언트/서버 검증 메시지가 표시된다 | 422 처리 |

## 회귀 포인트

- 별도 SMTP/SES/Resend 경로를 만들지 않는다.
- "전송 대기열에 추가되었습니다" 같은 mock 문구는 실제 발송 성공 문구로 갱신한다.
