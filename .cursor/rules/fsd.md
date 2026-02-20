# FSD (Feature-Sliced Design) 규칙

이 프로젝트는 FSD를 **앱/웹 레이어**에 적용하고, **도메인 로직**은 `packages/*`에 둡니다.

## 레이어 구조 (apps/web 기준)

```
apps/web/src/
├── app/                    # [Layer] App — 라우팅, 레이아웃, 페이지 진입점
│   ├── (routes)/           # 페이지, layout.tsx, loading.tsx, error.tsx
│   └── api/                # API Route Handlers
├── components/
│   ├── features/           # [Layer] Features — 기능 단위 UI
│   ├── layout/             # [Layer] Shared (Layout) — 레이아웃
│   └── shared/             # [Layer] Shared — 공통 UI·위젯
├── design-system/         # [Layer] Shared — 토큰, 기초 컴포넌트
├── lib/                    # [Layer] Shared — 유틸, 보안, 에러
└── hooks/                  # [Layer] Shared — 공통 훅
```

**도메인(엔티티·비즈니스 로직)** 은 `packages/*`에 있음 (shared, api, couple, planner, user 등).

## 의존성 방향 (FSD)

- **app** → **features** → **shared** (같은 앱 내)
- **app / features** → **packages/** (도메인·API·UI 패키지)
- **shared** → 다른 레이어나 features에 의존하지 않음 (가능한 한 순수 유틸·UI만)
- **features** → 다른 feature 직접 import 지양 (공통은 shared로 올리기)

즉: `app` → `features` → `shared`, 그리고 어디서든 `@lovetrip/*` 패키지 사용 가능.

## Features (기능 슬라이스)

각 feature는 한 도메인/화면 단위로 묶습니다.

- `components/features/home/` — 홈
- `components/features/travel/` — 여행 코스
- `components/features/date/` — 데이트 코스
- `components/features/calendar/` — 캘린더
- `components/features/courses/` — 코스 탐색·목록·상세
- `components/features/my-trips/` — 내 여행
- `components/features/expense/` — 예산·경비
- `components/features/profile/` — 프로필
- `components/features/favorites/` — 찜
- `components/features/onboarding/` — 온보딩

### Feature 내부 구조 (권장)

```
features/<feature-name>/
├── <feature>-page-client.tsx   # 페이지용 클라이언트 컴포넌트
├── components/                 # 해당 feature 전용 하위 컴포넌트
├── hooks/                      # 해당 feature 전용 훅
├── types.ts                    # 해당 feature 전용 타입 (공통은 shared/types)
└── index.ts                    # (선택) public API
```

- 다른 feature를 쓸 땐 **페이지/라우트**에서 조합 (예: `app/my-trips/[id]/page.tsx`에서 `TravelPlanDetailClient`에 `DaysSection={TravelPlanDaysSection}`, `ExpenseSection={TripExpenseSection}` 주입). feature 간 직접 import는 하지 않기.

## Shared

- **layout/** — Header, Footer, LayoutWrapper 등.
- **shared/** — 지도, 푸시 알림, 테마, 게이미피케이션 등 여러 feature에서 쓰는 UI.
- **design-system/** — 디자인 토큰, 기본 스타일.
- **lib/** — request 검증, 에러 처리, 보안, SEO, analytics 등.
- **hooks/** — useDebouncedValue 등 앱 공통 훅.

공통 타입·스키마는 `packages/shared`에 두고 `@lovetrip/shared`로 참조.

## 네이밍

- 디렉터리/파일: **kebab-case** (예: `travel-day-places.tsx`, `place-search.tsx`).
- 컴포넌트: **PascalCase** (예: `TravelDayPlaces`, `PlaceSearch`).
- 페이지용 클라이언트 컴포넌트: `*-page-client.tsx` (예: `home-page-client.tsx`).

## 새 기능 추가 시

1. **Feature 추가**: `components/features/<new-feature>/` 생성 후, 페이지는 `app/<route>/page.tsx`에서 데이터 페칭하고 `features/<new-feature>/*-page-client.tsx` 등으로 조합.
2. **여러 feature에서 쓰는 UI/로직**: `components/shared/` 또는 `lib/`, `hooks/`로 올리기.
3. **도메인 로직/DB/API**: `packages/*`에 서비스·타입 추가 후 `@lovetrip/*`로 사용.
