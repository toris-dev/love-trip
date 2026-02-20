# Components Directory Structure

이 디렉터리는 CDD(Component-Driven Development) 패턴과 Design Token을 기반으로 구성되어 있습니다.

## 디렉터리 구조

```
components/
├── design-system/        # Design System (토큰 및 기본 컴포넌트)
│   ├── tokens/          # Design Tokens (색상, 간격, 타이포그래피 등)
│   └── components/      # 기본 컴포넌트 (향후 확장)
├── features/           # 기능별 컴포넌트 (Feature-based)
│   ├── home/           # 홈 페이지 관련 컴포넌트
│   ├── travel/         # 여행 코스 관련 컴포넌트
│   ├── date/           # 데이트 코스 관련 컴포넌트
│   ├── calendar/       # 캘린더 관련 컴포넌트
│   ├── profile/        # 프로필 관련 컴포넌트
│   ├── contact/        # 문의 관련 컴포넌트
│   └── my-trips/       # 내 여행 관련 컴포넌트
├── layout/             # 레이아웃 컴포넌트
│   ├── footer.tsx
│   ├── header.tsx
│   ├── header-client.tsx
│   └── layout-wrapper.tsx
├── shared/             # [FSD Shared] 공유 컴포넌트 및 유틸리티
│   ├── travel-plan-wizard.tsx   # 여행 계획 만들기 (홈/캘린더 공용)
│   ├── onboarding/              # 온보딩 위저드 (홈 등에서 사용)
│   ├── naver-map-view.tsx
│   ├── push-notification-banner.tsx
│   ├── push-notification-settings.tsx
│   ├── pwa-install.tsx
│   ├── theme-provider-wrapper.tsx
│   ├── theme-provider.tsx
│   ├── msw-provider.tsx
│   └── gamification/            # 게이미피케이션 관련 컴포넌트
└── ui/                 # shadcn/ui 기본 컴포넌트 (유지, @lovetrip/ui 패키지)
```

## 컴포넌트 설계 원칙

### 1. Feature-Based Organization

- 각 기능별로 컴포넌트를 그룹화
- 관련된 컴포넌트들을 함께 관리하여 응집도 향상

### 2. Design Token 사용

- 모든 스타일은 `design-system/tokens`에서 정의된 토큰 사용
- 일관된 디자인 시스템 유지

### 3. CDD 패턴

- 작은 컴포넌트부터 큰 컴포넌트까지 계층적 구성
- 재사용 가능한 컴포넌트 우선 설계

### 4. 명확한 책임 분리

- **features/**: 특정 기능에 특화된 컴포넌트
- **layout/**: 레이아웃 관련 컴포넌트
- **shared/**: 여러 기능에서 공유되는 컴포넌트
- **ui/**: 기본 UI 컴포넌트 (shadcn/ui)

### 5. Feature public API (선택)

- feature 폴더에 `index.ts`를 두고 외부에 노출할 컴포넌트만 re-export 가능 (예: `expense/index.ts`).
- 페이지에서는 `@/components/features/<feature>/...` 경로로 직접 import해도 됨.

## 사용 예시

```tsx
// Feature 컴포넌트
import { HomePageClient } from "@/components/features/home/home-page-client"

// Layout 컴포넌트
import { Footer } from "@/components/layout/footer"

// Shared 컴포넌트
import { NaverMapView } from "@/components/shared/naver-map-view"

// Design Token
import { tokens } from "@/design-system/tokens"
```

## 컴포넌트 네이밍 규칙

- **파일명**: kebab-case (예: `home-page-client.tsx`)
- **컴포넌트명**: PascalCase (예: `HomePageClient`)
- **디렉터리명**: kebab-case (예: `my-trips/`)

## FSD 의존성 방향

- **app** → **features** → **shared** (같은 앱 내)
- **features** 간 직접 import 지양. 공통 UI는 `shared/`로 올리기.
- 상세 규칙: `.cursor/rules/fsd.md` 참고.

## 주의사항

- 새로운 컴포넌트를 추가할 때는 적절한 디렉터리에 배치
- 공유되는 컴포넌트는 `shared/` 디렉터리 사용
- 기능별 컴포넌트는 `features/` 디렉터리 사용
