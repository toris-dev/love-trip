"use server"

import { createClient } from "@lovetrip/api/supabase/server"
import type {
  Expense,
  ExpenseInsert,
  ExpenseUpdate,
  ExpenseWithSplits,
} from "../types"

/**
 * 여행 계획의 지출 내역 조회
 */
export async function getExpenses(travelPlanId: string): Promise<ExpenseWithSplits[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("expenses")
    .select(
      `
      *,
      expense_splits (*)
    `
    )
    .eq("travel_plan_id", travelPlanId)
    .order("expense_date", { ascending: false })

  if (error) {
    console.error("[ExpenseService] Error fetching expenses:", error)
    throw new Error("지출 내역을 불러오는데 실패했습니다")
  }

  return (data ?? []).map((exp) => ({
    ...exp,
    splits: exp.expense_splits ?? [],
  }))
}

/**
 * 지출 내역 생성
 */
export async function createExpense(
  travelPlanId: string,
  expense: Omit<ExpenseInsert, "travel_plan_id">,
  userIds?: string[] // 정산 대상 사용자 ID 목록 (있으면 자동으로 1/N 분할 생성)
): Promise<Expense> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("expenses")
    .insert({
      ...expense,
      travel_plan_id: travelPlanId,
    })
    .select()
    .single()

  if (error) {
    console.error("[ExpenseService] Error creating expense:", error)
    throw new Error("지출 내역을 생성하는데 실패했습니다")
  }

  // userIds가 제공되면 자동으로 1/N 분할 생성
  if (userIds && userIds.length > 0 && data) {
    const perPerson = expense.amount / userIds.length
    const splits = userIds.map((userId) => ({
      expense_id: data.id,
      user_id: userId,
      amount: perPerson,
      is_paid: false,
    }))

    const { error: splitsError } = await supabase.from("expense_splits").insert(splits)

    if (splitsError) {
      console.error("[ExpenseService] Error creating expense splits:", splitsError)
      // 분할 생성 실패해도 지출은 생성됨
    }
  }

  return data
}

/**
 * 지출 내역 업데이트
 */
export async function updateExpense(
  id: string,
  updates: ExpenseUpdate
): Promise<Expense> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("expenses")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("[ExpenseService] Error updating expense:", error)
    throw new Error("지출 내역을 업데이트하는데 실패했습니다")
  }

  return data
}

/**
 * 지출 내역 삭제
 */
export async function deleteExpense(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.from("expenses").delete().eq("id", id)

  if (error) {
    console.error("[ExpenseService] Error deleting expense:", error)
    throw new Error("지출 내역을 삭제하는데 실패했습니다")
  }
}

