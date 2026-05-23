# PR and Issue Conventions

이 문서는 Mello Frontend 저장소의 PR과 이슈 작성 규칙을 정의한다.

## 기본 원칙

- PR은 기본적으로 리뷰 가능한 상태로 올린다. 아직 리뷰가 불가능한 작업만 Draft PR로 만든다.
- PR과 이슈 제목은 같은 형식을 사용한다.
- 제목은 변경의 성격과 범위를 짧게 드러낸다.
- 본문에는 리뷰어나 작업자가 판단에 필요한 맥락을 남긴다.

## 제목 형식

Conventional Commit 스타일을 사용한다.

```text
type(scope): summary
```

- `type`: 변경 종류
- `scope`: 변경 범위. 생략할 수 있지만 가능하면 작성한다.
- `summary`: 영어 소문자로 시작하는 짧은 설명. 마침표는 붙이지 않는다.

예시:

```text
feat(auth): add Google login callback handling
fix(api): align history response parsing
docs: add PR and issue conventions
chore(deps): update Next.js patch version
```

## Type 목록

- `feat`: 사용자에게 보이는 기능 추가 또는 개선
- `fix`: 버그 수정
- `docs`: 문서만 변경
- `design`: UI 디자인, 레이아웃, 스타일 변경
- `refactor`: 동작 변경 없이 코드 구조 개선
- `test`: 테스트 추가 또는 수정
- `chore`: 빌드, 설정, 의존성, 자동화 등 유지보수 작업
- `ci`: CI 설정 또는 워크플로 변경

## Scope 예시

- `auth`
- `api`
- `compose`
- `gmail`
- `history`
- `people`
- `format`
- `settings`
- `brand`
- `mock`
- `deps`

## PR 작성 규칙

PR 제목은 제목 형식을 따른다.

PR 본문에는 다음 항목을 포함한다.

```markdown
## Summary
- 변경한 내용을 요약한다.

## Impact
- 사용자, 개발자, 운영 관점의 영향을 적는다.

## Validation
- 실행한 검증 명령이나 확인 방법을 적는다.
```

버그 수정 PR에는 가능하면 원인도 포함한다.

```markdown
## Root Cause
- 문제가 발생한 원인을 적는다.
```

검증하지 못한 항목이 있으면 숨기지 말고 적는다.

```markdown
## Validation
- Not run: reason
```

## Issue 작성 규칙

이슈 제목도 제목 형식을 따른다.

이슈 본문은 목적에 맞게 작성한다. 버그는 재현 가능한 정보를 우선하고, 기능 요청은 기대 동작과 범위를 우선한다.

버그 이슈 템플릿:

```markdown
## Problem
- 현재 문제가 무엇인지 적는다.

## Steps To Reproduce
1. 재현 단계를 적는다.

## Expected
- 기대한 동작을 적는다.

## Actual
- 실제 동작을 적는다.

## Context
- 브라우저, 계정 상태, API 환경 등 필요한 맥락을 적는다.
```

기능 이슈 템플릿:

```markdown
## Goal
- 만들고 싶은 결과를 적는다.

## Scope
- 이번 작업에 포함할 범위를 적는다.

## Out Of Scope
- 이번 작업에 포함하지 않을 범위를 적는다.

## Acceptance Criteria
- 완료 여부를 판단할 수 있는 조건을 적는다.
```

## Draft PR 사용 기준

Draft PR은 다음 경우에만 사용한다.

- CI나 빌드가 아직 통과하지 않을 것으로 예상된다.
- 주요 구현이 남아 리뷰하면 안 되는 상태다.
- 방향성 공유가 목적이고 merge 대상이 아니다.

리뷰 가능한 상태가 되면 Draft를 해제한다.
