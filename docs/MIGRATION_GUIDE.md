# 마이그레이션 가이드

## 데이터베이스 마이그레이션

> ✅ **마이그레이션 완료**: Supabase MCP를 통해 모든 마이그레이션이 적용되었습니다.

### 1. 온보딩 완료 필드 추가

**마이그레이션 이름**: `add_onboarding_completed_to_profiles`

**상태**: ✅ 적용 완료

**변경 사항**:

- `profiles` 테이블에 `onboarding_completed` BOOLEAN 필드 추가
- 기본값: `false`
- 인덱스 추가 (온보딩 미완료 사용자 조회 최적화)

**확인 방법**:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name = 'onboarding_completed';
```

### 2. 여행 계획 생성 트랜잭션 함수

**마이그레이션 이름**: `create_travel_plan_transaction_function`

**상태**: ✅ 적용 완료

**변경 사항**:

- `create_travel_plan_with_transaction` PostgreSQL 함수 생성
- 모든 작업이 트랜잭션으로 처리됨
- 에러 발생 시 자동 롤백

**함수 확인**:

```sql
SELECT
  proname as function_name,
  pg_get_function_arguments(oid) as arguments,
  pg_get_function_result(oid) as return_type
FROM pg_proc
WHERE proname = 'create_travel_plan_with_transaction';
```

**사용 방법**:

```typescript
import { createTravelPlanWithTransaction } from "@lovetrip/api/supabase/transaction-manager"

const planId = await createTravelPlanWithTransaction(supabase, {
  user_id: userId,
  title: "부산 여행",
  destination: "부산",
  start_date: "2025-01-01",
  end_date: "2025-01-03",
  total_budget: 500000,
  description: "2박 3일 부산 여행",
  course_type: "travel",
  places: [{ place_id: "uuid-here", day_number: 1, order_index: 0 }],
  budget_items: [{ category: "숙박비", name: "호텔", planned_amount: 200000 }],
})
```

**현재 구현**:

- `/api/travel-plans` POST 엔드포인트에서 PostgreSQL 함수를 우선 사용
- 함수 실패 시 JavaScript 레벨 트랜잭션으로 자동 폴백

## 타입 재생성

마이그레이션 후 TypeScript 타입을 재생성해야 합니다:

```bash
pnpm gen-types
```

또는:

```bash
npx supabase gen types typescript --project-id dyomownljgsbwaxnljau > packages/shared/types/database.ts
```

## Supabase MCP를 통한 마이그레이션 관리

### 마이그레이션 목록 확인

```typescript
// Supabase MCP를 통해 마이그레이션 목록 확인
mcp_supabase_list_migrations({ project_id: "dyomownljgsbwaxnljau" })
```

### 새 마이그레이션 적용

```typescript
// Supabase MCP를 통해 마이그레이션 적용
mcp_supabase_apply_migration({
  project_id: "dyomownljgsbwaxnljau",
  name: "migration_name",
  query: "SQL 쿼리...",
})
```

## 주의사항

1. **마이그레이션 순서**: 마이그레이션 파일은 타임스탬프 순서대로 실행됩니다.
2. **백업**: 프로덕션 환경에서는 마이그레이션 전 백업을 권장합니다.
3. **롤백**: 마이그레이션 실패 시 롤백 스크립트를 준비하세요.
4. **함수 사용**: PostgreSQL 함수는 더 강력한 트랜잭션 보장을 제공하지만, 실패 시 JavaScript 레벨 트랜잭션으로 폴백됩니다.
