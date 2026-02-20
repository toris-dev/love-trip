# 모노레포 규칙 (Monorepo)

이 프로젝트는 **pnpm workspace** 기반 모노레포입니다.

## 구조

```
love-trip/
├── apps/
│   └── web/                 # Next.js 웹 앱 (메인 진입점)
├── packages/                # 공유 패키지
│   ├── api/                 # Supabase 클라이언트, API 유틸, 외부 API 래퍼
│   ├── shared/              # 공통 타입, 스키마, 상수, 유틸
│   ├── ui/                  # shadcn/ui 기반 공유 UI 컴포넌트
│   ├── couple/              # 커플/캘린더/기념일 도메인 서비스
│   ├── planner/             # 여행 계획, 장소, 메모리 도메인 서비스
│   ├── expense/             # 예산/경비 도메인 서비스
│   ├── subscription/       # 구독/프리미엄 도메인 서비스
│   ├── recommendation/     # 추천 도메인 서비스
│   ├── user/                # 사용자/인증/프로필 도메인
│   └── gamification/        # 레벨/경험치/업적 도메인
├── supabase/                # 마이그레이션, Edge Functions
├── docs/
└── pnpm-workspace.yaml
```

## 규칙

### 패키지 간 의존성

- **apps/web** → `packages/*` 참조 가능 (shared, api, ui, couple, planner 등).
- **packages** 끼리는 도메인 단위로만 의존. 순환 의존 금지.
- `packages/shared`는 다른 패키지에 의존하지 않도록 유지 (타입·스키마·상수만).
- `packages/api`는 Supabase/외부 API만 담당; 비즈니스 로직은 도메인 패키지(couple, planner 등)에 둠.

### 패키지 참조

- 워크스페이스 패키지는 `package.json`의 `dependencies`에 `"@lovetrip/패키지명": "workspace:*"` 형태로 선언.
- 앱/다른 패키지에서 import 시 `@lovetrip/shared`, `@lovetrip/ui` 등 사용.

### 스크립트

- 루트에서 실행: `pnpm dev`, `pnpm build`, `pnpm lint` 등.
- 특정 앱/패키지만: `pnpm --filter web dev`, `pnpm --filter @repo/shared build`.
- DB 타입 생성: `pnpm gen-types` (Supabase → `packages/shared/types/database.ts`).

### 새 패키지 추가 시

1. `packages/<이름>/package.json` 생성, `name`: `@lovetrip/<이름>`.
2. `pnpm-workspace.yaml`에 이미 `packages/*`가 있으므로 자동 포함.
3. 필요한 쪽 `package.json`에 `"@lovetrip/<이름>": "workspace:*"` 추가 후 `pnpm install`.

### 금지 사항

- `apps/web` 안에서 다른 앱(`apps/*`)을 import 하지 않기.
- 패키지 간 순환 참조 만들지 않기.
- 루트가 아닌 앱/패키지 내부에서만 쓰는 코드를 루트에 두지 않기.
