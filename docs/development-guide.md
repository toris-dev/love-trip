# 👨‍💻 LOVETRIP 개발 가이드

## 📋 목차

- [시작하기](#시작하기)
- [개발 환경 설정](#개발-환경-설정)
- [코딩 컨벤션](#코딩-컨벤션)
- [Git 워크플로우](#git-워크플로우)
- [테스트](#테스트)
- [디버깅](#디버깅)
- [번들 및 성능](#번들-및-성능)

## 🚀 시작하기

### 필수 요구사항

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Git

### 초기 설정

```bash
# 저장소 클론
git clone <repository-url>
cd love-trip

# 의존성 설치
pnpm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 편집하여 필요한 값 입력

# 개발 서버 실행
pnpm dev
```

## ⚙️ 개발 환경 설정

### IDE 설정

#### VS Code 추천 확장

- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense

#### VS Code 설정 (`.vscode/settings.json`)

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

### 환경 변수

환경 변수는 루트 디렉토리의 `.env.local` 파일에 설정합니다.

**필수 환경 변수**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_NAVER_CLOUD_API_KEY_ID`

자세한 내용은 [README.md](../README.md#3-환경-변수-설정)를 참조하세요.

## 📝 코딩 컨벤션

### TypeScript

#### 타입 정의

- 인터페이스는 `I` 접두사 없이 사용
- 타입은 PascalCase 사용
- 공통 타입은 `packages/shared/types`에 정의

```typescript
// ✅ Good
interface User {
  id: string
  name: string
}

type UserRole = "admin" | "user"

// ❌ Bad
interface IUser {
  id: string
}
```

#### 함수 정의

- 화살표 함수 사용
- 명시적 반환 타입 지정

```typescript
// ✅ Good
const getUser = async (id: string): Promise<User> => {
  // ...
}

// ❌ Bad
function getUser(id) {
  // ...
}
```

### React 컴포넌트

#### 컴포넌트 구조

```typescript
// 1. Imports
import { useState } from "react"
import { Button } from "@lovetrip/ui/components"

// 2. Types
interface ComponentProps {
  title: string
  onAction: () => void
}

// 3. Component
export function Component({ title, onAction }: ComponentProps) {
  // 4. Hooks
  const [state, setState] = useState(false)

  // 5. Handlers
  const handleClick = () => {
    setState(true)
    onAction()
  }

  // 6. Render
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick}>Click</Button>
    </div>
  )
}
```

#### 네이밍

- 컴포넌트: PascalCase
- 파일명: kebab-case 또는 PascalCase (컴포넌트인 경우)
- 훅: `use` 접두사 사용

```typescript
// ✅ Good
// components/user-profile.tsx
export function UserProfile() {}

// hooks/use-user-data.ts
export function useUserData() {}
```

### 파일 구조

#### 기능별 그룹화

```
components/
├── features/
│   ├── travel/
│   │   ├── travel-page-client.tsx
│   │   └── components/
│   │       └── travel-sidebar.tsx
│   └── date/
└── shared/
    └── naver-map-view.tsx
```

### 스타일링

#### Tailwind CSS 사용

- 인라인 클래스 사용
- 공통 패턴은 컴포넌트로 추출

```typescript
// ✅ Good
<div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-md">

// ❌ Bad
<div className="my-custom-class">
```

## 🔀 Git 워크플로우

### 브랜치 전략

- `main`: 프로덕션 브랜치
- `develop`: 개발 브랜치
- `feature/*`: 기능 개발
- `fix/*`: 버그 수정
- `docs/*`: 문서 작업

### 커밋 메시지

커밋 메시지는 다음 형식을 따릅니다:

```
<type>: <subject>

<body>

<footer>
```

**타입**:

- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 포맷팅
- `refactor`: 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드/설정 변경

**예시**:

```
feat: 여행 계획 생성 기능 추가

- 여행 계획 생성 API 구현
- UI 컴포넌트 추가
- 테스트 작성

Closes #123
```

### Pull Request

PR 작성 시 다음을 포함하세요:

1. **제목**: 변경 사항 요약
2. **설명**:
   - 변경 사항 설명
   - 관련 이슈 번호
   - 스크린샷 (UI 변경인 경우)
3. **체크리스트**:
   - [ ] 테스트 통과
   - [ ] 문서 업데이트
   - [ ] 린트 통과

## 🧪 테스트

### 테스트 작성

#### Unit 테스트 (Vitest)

```typescript
import { describe, it, expect } from "vitest"
import { formatDate } from "@lovetrip/shared/utils"

describe("formatDate", () => {
  it("should format date correctly", () => {
    const date = new Date("2024-01-01")
    expect(formatDate(date)).toBe("2024-01-01")
  })
})
```

#### 컴포넌트 테스트

```typescript
import { render, screen } from "@testing-library/react"
import { Button } from "@lovetrip/ui/components"

describe("Button", () => {
  it("should render correctly", () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText("Click me")).toBeInTheDocument()
  })
})
```

### 테스트 실행

```bash
# 모든 테스트 실행
pnpm test

# 특정 파일만 실행
pnpm test path/to/file.test.ts

# UI 모드로 실행
pnpm test:ui

# Watch 모드
pnpm test --watch
```

## 🐛 디버깅

### 개발 서버

```bash
# 개발 서버 실행
pnpm dev

# 특정 포트로 실행
PORT=3001 pnpm dev
```

### 로깅

```typescript
// 개발 환경에서만 로그 출력
if (process.env.NODE_ENV === "development") {
  console.log("Debug info:", data)
}

// 또는 디버거 사용
debugger
```

### Supabase 디버깅

- Supabase Dashboard에서 쿼리 로그 확인
- RLS 정책 테스트
- 실시간 구독 상태 확인

## 📦 번들 및 성능

### 번들 분석

- **Webpack 기반 분석**: `apps/web`에서 `pnpm build:analyze` 실행 시 `ANALYZE=true next build --webpack`으로 번들 분석 리포트가 생성됩니다. (Turbopack 빌드에서는 `@next/bundle-analyzer` 미지원이므로 `--webpack` 플래그 사용)
- **Turbopack 분석**: Next.js 16.1+에서는 `npx next experimental-analyze`로 프로덕션 번들을 시각화할 수 있습니다.

### Tree-shaking 권장 사항

- **Barrel import**: `packages/*/index.ts`에서 `export * from "./heavy"` 형태는 해당 모듈 전체를 끌어올 수 있습니다. 사용처가 적은 대형 모듈은 가능한 경우 named import 경로로 직접 지정하세요 (예: `import { X } from "@lovetrip/ui/components/button"`).
- **lucide-react**: 아이콘 사용량이 많다면 `import { Icon } from "lucide-react"` 대신 [lucide 권장 방식](https://lucide.dev/guide/packages/lucide-react#tree-shaking)으로 개별 아이콘만 import하면 번들 크기를 줄일 수 있습니다.
- **미사용 의존성**: 주기적으로 `pnpm list` 또는 `depcheck`로 사용하지 않는 패키지를 정리하세요.

## 📚 관련 문서

- [프로젝트 기획서](./project-plan.md)
- [아키텍처 문서](./architecture.md)
- [API 명세서](./api-spec.md)
