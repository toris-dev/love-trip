"use server"

import { createClient, createServiceClient } from "@lovetrip/api/supabase/server"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@lovetrip/shared/types/database"

type SupabaseClientType = SupabaseClient<Database>

/**
 * Transaction Manager
 * 다중 테이블 작업의 일관성을 보장하기 위한 트랜잭션 관리자
 *
 * 주의: Supabase는 각 쿼리가 자동으로 트랜잭션으로 처리되지 않으므로,
 * 에러 발생 시 수동으로 롤백해야 합니다.
 *
 * 향후 개선: PostgreSQL 함수를 통해 실제 트랜잭션 구현
 */

interface TransactionOperation {
  type: "insert" | "update" | "delete"
  table: string
  data?: unknown
  id?: string
  updates?: unknown
  filters?: Record<string, unknown>
}

interface TransactionContext {
  operations: TransactionOperation[]
  rollbackOperations: Array<() => Promise<void>>
  createdIds: Map<string, string> // table -> id 매핑
}

/**
 * 트랜잭션으로 여러 작업을 실행
 * 에러 발생 시 자동 롤백
 */
export async function withTransaction<T>(
  callback: (supabase: SupabaseClientType, context: TransactionContext) => Promise<T>
): Promise<T> {
  const supabase = await createClient()
  const context: TransactionContext = {
    operations: [],
    rollbackOperations: [],
    createdIds: new Map(),
  }

  try {
    const result = await callback(supabase, context)
    return result
  } catch (error) {
    // 롤백 실행
    console.error("Transaction error, rolling back:", error)
    await rollback(context, supabase)
    throw error
  }
}

/**
 * 롤백 실행
 */
async function rollback(context: TransactionContext, supabase: SupabaseClientType): Promise<void> {
  // 역순으로 롤백
  for (let i = context.rollbackOperations.length - 1; i >= 0; i--) {
    try {
      await context.rollbackOperations[i]()
    } catch (rollbackError) {
      console.error("Rollback operation failed:", rollbackError)
      // 롤백 실패는 로그만 남기고 계속 진행
    }
  }
}

/**
 * 트랜잭션 내에서 레코드 삽입
 * 롤백을 위해 생성된 ID 저장
 */
export async function transactionInsert<T>(
  supabase: SupabaseClientType,
  context: TransactionContext,
  table: string,
  data: unknown
): Promise<T> {
  const { data: inserted, error } = await supabase.from(table).insert(data).select().single()

  if (error) throw error
  if (!inserted) throw new Error(`Failed to insert into ${table}`)

  // 롤백을 위한 삭제 작업 등록
  const insertedId = (inserted as { id: string }).id
  context.createdIds.set(table, insertedId)
  context.rollbackOperations.push(async () => {
    await supabase.from(table).delete().eq("id", insertedId)
  })

  return inserted as T
}

/**
 * 트랜잭션 내에서 여러 레코드 삽입
 */
export async function transactionInsertMany<T>(
  supabase: SupabaseClientType,
  context: TransactionContext,
  table: string,
  data: unknown[]
): Promise<T[]> {
  const { data: inserted, error } = await supabase.from(table).insert(data).select()

  if (error) throw error
  if (!inserted || inserted.length === 0) {
    throw new Error(`Failed to insert into ${table}`)
  }

  // 롤백을 위한 삭제 작업 등록
  const insertedIds = (inserted as Array<{ id: string }>).map(item => item.id)
  context.rollbackOperations.push(async () => {
    await supabase.from(table).delete().in("id", insertedIds)
  })

  return inserted as T[]
}

/**
 * 트랜잭션 내에서 레코드 업데이트
 * 롤백을 위해 이전 값 저장
 */
export async function transactionUpdate<T>(
  supabase: SupabaseClientType,
  context: TransactionContext,
  table: string,
  id: string,
  updates: unknown
): Promise<T> {
  // 이전 값 조회 (롤백용)
  const { data: previous } = await supabase.from(table).select("*").eq("id", id).single()

  const { data: updated, error } = await supabase
    .from(table)
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  if (!updated) throw new Error(`Failed to update ${table} with id ${id}`)

  // 롤백을 위한 업데이트 작업 등록
  if (previous) {
    context.rollbackOperations.push(async () => {
      await supabase.from(table).update(previous).eq("id", id)
    })
  }

  return updated as T
}

/**
 * 트랜잭션 내에서 레코드 삭제
 * 롤백을 위해 삭제된 값 저장
 */
export async function transactionDelete(
  supabase: SupabaseClientType,
  context: TransactionContext,
  table: string,
  id: string
): Promise<void> {
  // 삭제 전 값 조회 (롤백용)
  const { data: previous } = await supabase.from(table).select("*").eq("id", id).single()

  const { error } = await supabase.from(table).delete().eq("id", id)

  if (error) throw error

  // 롤백을 위한 삽입 작업 등록
  if (previous) {
    context.rollbackOperations.push(async () => {
      await supabase.from(table).insert(previous)
    })
  }
}

/**
 * PostgreSQL 함수를 통한 실제 트랜잭션
 * create_travel_plan_with_transaction 함수 사용
 */
export async function createTravelPlanWithTransaction(
  supabase: SupabaseClientType,
  params: {
    user_id: string
    title: string
    destination: string
    start_date: string
    end_date: string
    total_budget?: number
    description?: string
    course_type?: string
    places?: Array<{
      place_id: string
      day_number: number
      order_index?: number
    }>
    budget_items?: Array<{
      category: string
      name: string
      planned_amount: number
    }>
  }
): Promise<string> {
  // JSONB 파라미터는 배열을 직접 전달 (Supabase가 자동으로 JSONB로 변환)
  const { data, error } = await (supabase.rpc as any)("create_travel_plan_with_transaction", {
    p_user_id: params.user_id,
    p_title: params.title,
    p_destination: params.destination,
    p_start_date: params.start_date,
    p_end_date: params.end_date,
    p_total_budget: params.total_budget || 0,
    p_description: params.description || null,
    p_course_type: params.course_type || "travel",
    p_places: (params.places && params.places.length > 0 ? params.places : []) as unknown,
    p_budget_items: (params.budget_items && params.budget_items.length > 0
      ? params.budget_items
      : []) as unknown,
  })

  if (error) throw error
  if (!data) throw new Error("여행 계획 생성에 실패했습니다")

  // UUID는 문자열로 반환됨 (PostgreSQL UUID 타입은 문자열로 변환됨)
  return typeof data === "string" ? data : String(data)
}
