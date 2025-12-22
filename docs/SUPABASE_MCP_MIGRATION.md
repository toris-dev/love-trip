# Supabase MCP를 통한 마이그레이션 관리

## 개요

이 프로젝트는 Supabase MCP (Model Context Protocol)를 통해 데이터베이스 마이그레이션을 관리합니다.

## 적용된 마이그레이션

### 1. 온보딩 완료 필드 추가

**마이그레이션 이름**: `add_onboarding_completed_to_profiles`

**상태**: ✅ 적용 완료

**변경 사항**:

- `profiles` 테이블에 `onboarding_completed` BOOLEAN 필드 추가
- 기본값: `false`
- 인덱스 생성: `idx_profiles_onboarding_completed`

**확인 쿼리**:

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
- 모든 작업이 단일 트랜잭션으로 처리
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

## API에서의 사용

### 현재 구현

`/api/travel-plans` POST 엔드포인트는 다음과 같은 우선순위로 트랜잭션을 처리합니다:

1. **PostgreSQL 함수 우선 사용** (`create_travel_plan_with_transaction`)
   - 더 강력한 트랜잭션 보장
   - 데이터베이스 레벨에서 원자성 보장

2. **JavaScript 레벨 트랜잭션으로 폴백**
   - PostgreSQL 함수 실패 시 자동 폴백
   - `withTransaction` 헬퍼 사용

### 사용 예시

```typescript
import { createTravelPlanWithTransaction } from "@lovetrip/api/supabase/transaction-manager"

try {
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
} catch (error) {
  // 에러 처리
}
```

## 마이그레이션 관리

### 마이그레이션 목록 확인

Supabase MCP를 통해 마이그레이션 목록을 확인할 수 있습니다:

```typescript
// MCP 도구 사용
mcp_supabase_list_migrations({ project_id: "dyomownljgsbwaxnljau" })
```

### 새 마이그레이션 적용

```typescript
// MCP 도구 사용
mcp_supabase_apply_migration({
  project_id: "dyomownljgsbwaxnljau",
  name: "migration_name_snake_case",
  query: `
    -- SQL 쿼리
    ALTER TABLE ...
  `,
})
```

## 장점

1. **원자성 보장**: PostgreSQL 함수는 데이터베이스 레벨에서 트랜잭션을 보장합니다.
2. **자동 롤백**: 에러 발생 시 모든 변경사항이 자동으로 롤백됩니다.
3. **성능**: 단일 함수 호출로 모든 작업을 처리하므로 네트워크 왕복이 줄어듭니다.
4. **폴백 전략**: 함수 실패 시 JavaScript 레벨 트랜잭션으로 자동 폴백됩니다.

## 주의사항

1. **JSONB 파라미터**: Supabase RPC는 배열을 자동으로 JSONB로 변환합니다.
2. **에러 처리**: 함수 내부에서 발생한 에러는 자동으로 롤백되지만, 외부에서 적절히 처리해야 합니다.
3. **타입 재생성**: 마이그레이션 후 `pnpm gen-types`를 실행하여 TypeScript 타입을 업데이트하세요.
