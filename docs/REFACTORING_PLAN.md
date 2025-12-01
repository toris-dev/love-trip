# Monorepo 리팩토링 계획

## 목표 구조

```
packages/
  ui/                ← 순수 UI (토큰 / 컴포넌트 / 스타일 / 디자인 시스템)
  utils/             ← 순수 유틸 함수 / 공통 로직 (이미 존재)
  api/               ← Supabase / 외부 API 클라이언트
  shared/            ← 공통 타입 / 컨스턴트 / 훅 (이미 존재, 확장 필요)
  planner/           ← 여행 플래너 도메인
  expense/           ← 경비/정산 도메인 (현재 없음, 필요시 생성)
  recommendation/    ← AI 추천 도메인
  subscription/      ← 구독/결제 도메인 (현재 없음, 필요시 생성)
  user/              ← 사용자/로그인 도메인
  couple/            ← 커플/관계 도메인
```

## 현재 → 목표 매핑

### 1. packages/ui

- `apps/web/src/components/ui/` → `packages/ui/components/`
- `apps/web/src/design-system/tokens/` → `packages/ui/tokens/`
- `apps/web/src/design-system/components/` → `packages/ui/components/`

### 2. packages/api

- `apps/web/src/lib/supabase/` → `packages/api/supabase/`
- 외부 API 클라이언트 (Tour API 등) → `packages/api/clients/`

### 3. packages/user

- `apps/web/src/lib/auth/` → `packages/user/auth/`
- `apps/web/src/components/features/auth/` → `packages/user/components/` (또는 apps/web에 유지)

### 4. packages/couple

- `apps/web/src/lib/services/calendar-service.ts` (couple 관련 부분) → `packages/couple/`
- 커플 연결, 공동 캘린더 로직

### 5. packages/planner

- `apps/web/src/lib/services/travel-service.ts` → `packages/planner/`
- 여행 계획, 일정 관리 로직

### 6. packages/recommendation

- `apps/web/src/lib/services/recommendation-service.ts` → `packages/recommendation/`
- AI 추천 로직

### 7. packages/shared (확장)

- `apps/web/src/lib/types/` → `packages/shared/types/`
- 공통 상수, 타입 정의

### 8. packages/utils (확장)

- `apps/web/src/lib/utils.ts` → `packages/utils/`
- 순수 유틸 함수들

## 단계별 실행 계획

1. **Phase 1: 기반 패키지 생성**
   - packages/ui 생성 및 구조화
   - packages/api 생성
   - packages/shared 확장

2. **Phase 2: 도메인 패키지 생성**
   - packages/user
   - packages/couple
   - packages/planner
   - packages/recommendation

3. **Phase 3: 마이그레이션**
   - 각 서비스/로직을 해당 패키지로 이동
   - import 경로 업데이트
   - 테스트 및 검증

4. **Phase 4: 정리**
   - 사용하지 않는 파일 삭제
   - 문서 업데이트
   - CI/CD 설정 업데이트
