# 테스트 가이드

LOVETRIP 프로젝트의 테스트 전략과 실행 방법을 안내합니다.

## 테스트 구조

이 프로젝트는 다음 테스트 도구를 사용합니다:

- **Vitest**: Unit 테스트 및 컴포넌트 테스트
- **Cypress**: E2E 테스트 및 컴포넌트 테스트

## 테스트 실행

### Unit 테스트 (Vitest)

```bash
# 모든 테스트 실행
pnpm test

# UI 모드로 실행
pnpm test:ui

# 특정 패키지의 테스트 실행
pnpm --filter @lovetrip/ui test
```

### E2E 테스트 (Cypress)

```bash
# 헤드리스 모드로 모든 E2E 테스트 실행
pnpm test:e2e

# Cypress UI 열기
pnpm test:e2e:open
```

**주의**: E2E 테스트를 실행하기 전에 개발 서버가 실행 중이어야 합니다:

```bash
# 터미널 1: 개발 서버 실행
pnpm dev

# 터미널 2: Cypress 실행
pnpm test:e2e:open
```

## 테스트 작성 가이드

### E2E 테스트 작성

E2E 테스트는 `cypress/e2e/` 디렉토리에 작성합니다.

```typescript
// cypress/e2e/example.cy.ts
describe("Feature Name", () => {
  beforeEach(() => {
    cy.visit("/")
    cy.waitForPageLoad()
  })

  it("should do something", () => {
    // 테스트 코드
  })
})
```

### 컴포넌트 테스트 작성

컴포넌트 테스트는 `cypress/component/` 디렉토리에 작성합니다.

```typescript
// cypress/component/example.cy.tsx
import { Component } from "./component"

describe("Component", () => {
  it("should render correctly", () => {
    cy.mount(<Component />)
    // 테스트 코드
  })
})
```

### 커스텀 명령어

프로젝트 전반에서 사용할 커스텀 명령어는 `cypress/support/commands.ts`에 정의합니다.

현재 사용 가능한 커스텀 명령어:

- `cy.login(email, password)`: 사용자 로그인
- `cy.waitForPageLoad()`: 페이지 로드 완료 대기

## 테스트 전략

### Unit 테스트

- **범위**: 유틸리티 함수, 훅, 서비스 로직
- **위치**: 각 패키지의 `__tests__` 또는 `*.test.ts` 파일
- **목표**: 개별 함수/로직의 정확성 검증

### 컴포넌트 테스트

- **범위**: UI 컴포넌트의 렌더링 및 상호작용
- **위치**: `cypress/component/` 또는 각 패키지의 테스트 파일
- **목표**: 컴포넌트의 동작 검증

### E2E 테스트

- **범위**: 사용자 시나리오 기반 통합 테스트
- **위치**: `cypress/e2e/`
- **목표**: 실제 사용자 플로우 검증

## CI/CD 통합

### GitHub Actions 예시

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test
      - run: pnpm build
      - run: pnpm test:e2e
        env:
          CYPRESS_BASE_URL: http://localhost:3000
```

## 모범 사례

1. **테스트는 독립적으로 작성**: 각 테스트는 다른 테스트에 의존하지 않아야 합니다.
2. **명확한 테스트 이름**: 테스트 이름은 무엇을 테스트하는지 명확히 표현해야 합니다.
3. **AAA 패턴**: Arrange-Act-Assert 패턴을 따릅니다.
4. **실제 사용자 시나리오**: E2E 테스트는 실제 사용자 플로우를 반영해야 합니다.
5. **테스트 데이터 관리**: 테스트 데이터는 일관되고 재현 가능해야 합니다.

## 문제 해결

### Cypress가 서버를 찾을 수 없는 경우

```bash
# 개발 서버가 실행 중인지 확인
pnpm dev

# 포트가 3000인지 확인
# .env 파일에서 포트 설정 확인
```

### 테스트가 느린 경우

- 불필요한 `cy.wait()` 제거
- `cy.intercept()`를 사용하여 API 호출 모킹
- 병렬 실행 고려

## 추가 리소스

- [Cypress 공식 문서](https://docs.cypress.io/)
- [Vitest 공식 문서](https://vitest.dev/)
- [Testing Library 문서](https://testing-library.com/)

