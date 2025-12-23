# Cypress E2E 테스트

## 사전 요구사항

### WSL2/Linux 환경

Cypress를 실행하기 위해 다음 시스템 라이브러리가 필요합니다:

```bash
sudo apt-get update
sudo apt-get install -y \
  libnss3 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libgbm1 \
  libasound2 \
  libpangocairo-1.0-0 \
  libcairo-gobject2 \
  libgtk-3-0 \
  libgdk-pixbuf2.0-0
```

### macOS 환경

일반적으로 추가 설치가 필요하지 않습니다.

### Windows 환경

일반적으로 추가 설치가 필요하지 않습니다.

## 테스트 실행

### 1. 개발 서버 실행

별도 터미널에서 개발 서버를 실행합니다:

```bash
pnpm dev
```

### 2. E2E 테스트 실행

#### 헤드리스 모드 (CI/CD용)

```bash
pnpm test:e2e
```

#### 인터랙티브 모드 (개발용, 권장)

```bash
pnpm test:e2e:open
```

## 테스트 파일 구조

```
cypress/
├── e2e/
│   ├── travel-plans.cy.ts      # 여행 계획 생성 및 관리
│   ├── budget.cy.ts             # 예산 관리 및 시각화
│   ├── couple.cy.ts            # 커플 연결 기능
│   ├── api-integration.cy.ts    # API 엔드포인트 통합 테스트
│   ├── home.cy.ts              # 홈페이지 테스트
│   ├── navigation.cy.ts        # 네비게이션 테스트
│   └── pwa.cy.ts               # PWA 테스트
├── support/
│   ├── commands.ts              # 커스텀 명령어
│   ├── e2e.ts                   # E2E 테스트 설정
│   └── component.ts             # 컴포넌트 테스트 설정
└── component/
    └── button.cy.tsx            # 컴포넌트 테스트 예시
```

## 커스텀 명령어

### `cy.login(email, password)`

사용자 로그인

```typescript
cy.login("user@example.com", "password")
```

### `cy.waitForPageLoad()`

페이지 로드 완료 대기

```typescript
cy.waitForPageLoad()
```

### `cy.createTravelPlan(planData)`

API를 통한 여행 계획 생성

```typescript
cy.createTravelPlan({
  title: "부산 여행",
  destination: "부산",
  start_date: "2024-01-01",
  end_date: "2024-01-03",
  total_budget: 500000,
})
```

### `cy.generateCoupleInvite()`

커플 초대 링크 생성

```typescript
cy.generateCoupleInvite()
```

### `cy.getBudgetOptimization(travelPlanId)`

예산 최적화 제안 조회

```typescript
cy.getBudgetOptimization("plan-id")
```

## 문제 해결

### libnss3.so 오류 (WSL2/Linux)

위의 "사전 요구사항" 섹션의 패키지를 설치하세요.

### Cypress 바이너리 누락

```bash
pnpm exec cypress install
```

### 포트 충돌

개발 서버가 다른 포트에서 실행 중인 경우 `cypress.config.ts`의 `baseUrl`을 수정하세요.

## 참고 자료

- [Cypress 공식 문서](https://docs.cypress.io/)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
