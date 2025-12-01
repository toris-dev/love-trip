# 아키텍처 가이드

LOVETRIP 프로젝트의 아키텍처와 구조를 설명합니다.

## 개요

LOVETRIP은 모노레포 구조를 사용하며, Feature-Sliced Design (FSD) 원칙을 따릅니다.

## 프로젝트 구조

```
love-trip/
├── apps/
│   └── web/              # Next.js 15 웹 애플리케이션
│       ├── src/
│       │   ├── app/      # App Router (Next.js 15)
│       │   ├── components/
│       │   └── lib/
│       └── public/
├── packages/
│   ├── ui/               # UI 컴포넌트 라이브러리
│   ├── shared/           # 공통 타입 및 유틸리티
│   ├── api/              # API 클라이언트 (Supabase)
│   ├── utils/            # 유틸리티 함수
│   ├── couple/           # 커플 도메인
│   ├── planner/          # 여행 계획 도메인
│   ├── recommendation/   # 추천 도메인
│   └── user/             # 사용자 도메인
└── cypress/              # E2E 테스트
```

## 아키텍처 원칙

### 1. 모노레포 구조

- **장점**: 코드 공유, 일관된 버전 관리, 통합 테스트
- **도구**: pnpm workspaces

### 2. Feature-Sliced Design (FSD)

- **레이어 구조**: 
  - `shared`: 공통 타입, 유틸리티
  - `features`: 도메인별 기능 패키지
  - `app`: 애플리케이션 조립 레이어

- **의존성 규칙**:
  - Feature 패키지는 `shared`와 `ui`만 의존
  - Feature 패키지 간 직접 의존 금지
  - App은 모든 패키지 사용 가능

### 3. Component-Driven Development (CDD)

- UI 컴포넌트는 `packages/ui`에 집중
- Storybook을 통한 컴포넌트 개발 및 문서화

## Next.js 15 최적화

### Edge Functions

빠른 응답이 필요한 API는 Edge Runtime을 사용:

```typescript
export const runtime = "edge"
```

### ISR (Incremental Static Regeneration)

정적 페이지의 주기적 재생성:

```typescript
export const revalidate = 3600 // 1시간
export const dynamic = "force-static"
```

### ISG (Incremental Static Generation)

빌드 시점에 정적 페이지 생성:

```typescript
export async function generateStaticParams() {
  // 정적 경로 생성
}
```

### Lazy Loading

코드 스플리팅 및 동적 임포트:

```typescript
const Component = dynamic(() => import("./component"), {
  ssr: true,
  loading: () => <Loading />,
})
```

## 패키지 구조

### @lovetrip/ui

재사용 가능한 UI 컴포넌트:

```
packages/ui/
├── components/     # UI 컴포넌트
├── tokens/         # 디자인 토큰
└── styles/        # 전역 스타일
```

### @lovetrip/shared

공통 타입 및 유틸리티:

```
packages/shared/
├── types/          # 공통 타입
├── constants/      # 상수
└── utils/          # 유틸리티 함수
```

### Feature 패키지

도메인별 기능 패키지:

```
packages/[feature]/
├── components/     # Feature 컴포넌트
├── hooks/          # Feature 훅
├── services/      # Feature 서비스
└── types/         # Feature 타입
```

## 데이터 흐름

1. **클라이언트 요청** → Next.js App Router
2. **서버 컴포넌트** → Feature 서비스 호출
3. **Feature 서비스** → API 클라이언트 사용
4. **API 클라이언트** → Supabase 호출
5. **응답** → 클라이언트 컴포넌트 렌더링

## 상태 관리

- **서버 상태**: React Server Components + Supabase
- **클라이언트 상태**: React Hooks (useState, useReducer)
- **전역 상태**: 필요 시 Context API 또는 Zustand

## 스타일링

- **CSS Framework**: Tailwind CSS
- **컴포넌트 스타일**: CSS Modules 또는 Tailwind 클래스
- **디자인 시스템**: `packages/ui/tokens`

## 테스트 전략

- **Unit 테스트**: Vitest
- **컴포넌트 테스트**: Cypress Component Testing
- **E2E 테스트**: Cypress

## 빌드 및 배포

- **빌드 도구**: Next.js (Turbopack)
- **패키지 관리**: pnpm
- **배포 플랫폼**: Vercel (권장)

## 성능 최적화

1. **코드 스플리팅**: 자동 (Next.js)
2. **이미지 최적화**: next/image
3. **폰트 최적화**: next/font
4. **캐싱**: ISR, ISG
5. **Edge Functions**: 빠른 API 응답

## 보안

- **인증**: Supabase Auth
- **환경 변수**: `.env.local` (git에 커밋하지 않음)
- **CORS**: Next.js 기본 설정
- **CSRF**: Next.js 기본 보호

## 확장성

### 새로운 Feature 추가

1. `packages/[feature-name]/` 디렉토리 생성
2. `package.json` 생성 및 workspace 설정
3. Feature 구조 생성 (components, hooks, services, types)
4. `apps/web`에서 import 및 사용

### 새로운 UI 컴포넌트 추가

1. `packages/ui/components/[component-name]/` 생성
2. 컴포넌트 및 Storybook 스토리 작성
3. `packages/ui/components/index.ts`에 export 추가

## 모범 사례

1. **타입 안정성**: TypeScript 엄격 모드 사용
2. **코드 품질**: ESLint + Prettier
3. **커밋 메시지**: Conventional Commits
4. **문서화**: JSDoc 주석 작성
5. **테스트**: 테스트 커버리지 유지

## 추가 리소스

- [Next.js 문서](https://nextjs.org/docs)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [pnpm 문서](https://pnpm.io/)
- [Supabase 문서](https://supabase.com/docs)

