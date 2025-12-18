"use server"

import { createClient } from "@lovetrip/api/supabase/server"
import type {
  BudgetItem,
  BudgetItemInsert,
  BudgetItemUpdate,
  BudgetSummary,
  ExpenseCategory,
} from "../types"

/**
 * 여행 계획의 예산 항목 조회
 */
export async function getBudgetItems(travelPlanId: string): Promise<BudgetItem[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("budget_items")
    .select("*")
    .eq("travel_plan_id", travelPlanId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("[BudgetService] Error fetching budget items:", error)
    throw new Error("예산 항목을 불러오는데 실패했습니다")
  }

  return data ?? []
}

/**
 * 예산 항목 생성
 */
export async function createBudgetItem(
  travelPlanId: string,
  item: Omit<BudgetItemInsert, "travel_plan_id">
): Promise<BudgetItem> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("budget_items")
    .insert({
      ...item,
      travel_plan_id: travelPlanId,
    })
    .select()
    .single()

  if (error) {
    console.error("[BudgetService] Error creating budget item:", error)
    throw new Error("예산 항목을 생성하는데 실패했습니다")
  }

  return data
}

/**
 * 예산 항목 업데이트
 */
export async function updateBudgetItem(id: string, updates: BudgetItemUpdate): Promise<BudgetItem> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("budget_items")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("[BudgetService] Error updating budget item:", error)
    throw new Error("예산 항목을 업데이트하는데 실패했습니다")
  }

  return data
}

/**
 * 예산 항목 삭제
 */
export async function deleteBudgetItem(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.from("budget_items").delete().eq("id", id)

  if (error) {
    console.error("[BudgetService] Error deleting budget item:", error)
    throw new Error("예산 항목을 삭제하는데 실패했습니다")
  }
}

/**
 * 계획 예산 총액 계산
 */
function calculateTotalPlanned(budgetItems: BudgetItem[] | null): number {
  if (!budgetItems || budgetItems.length === 0) return 0
  return budgetItems.reduce((sum, item) => sum + (item.planned_amount ?? 0), 0)
}

/**
 * 실제 지출 총액 계산
 */
function calculateTotalActual(expenses: Array<{ amount: number }> | null): number {
  if (!expenses || expenses.length === 0) return 0
  return expenses.reduce((sum, exp) => sum + exp.amount, 0)
}

/**
 * 카테고리별 요약 초기화
 */
function initializeCategorySummary(): Record<ExpenseCategory, { planned: number; actual: number }> {
  return {
    교통비: { planned: 0, actual: 0 },
    숙박비: { planned: 0, actual: 0 },
    식비: { planned: 0, actual: 0 },
    액티비티: { planned: 0, actual: 0 },
    쇼핑: { planned: 0, actual: 0 },
    기타: { planned: 0, actual: 0 },
  }
}

/**
 * 카테고리별 집계
 */
function aggregateByCategory(
  budgetItems: BudgetItem[] | null,
  expenses: Array<{ amount: number; category: string }> | null,
  byCategory: Record<ExpenseCategory, { planned: number; actual: number }>
): void {
  // 예산 항목 집계
  budgetItems?.forEach(item => {
    const category = item.category as ExpenseCategory
    if (byCategory[category]) {
      byCategory[category].planned += item.planned_amount ?? 0
    }
  })

  // 실제 지출 집계
  expenses?.forEach(exp => {
    const category = exp.category as ExpenseCategory
    if (byCategory[category]) {
      byCategory[category].actual += exp.amount
    }
  })
}

/**
 * 예산 요약 조회 (계획 vs 실제)
 *
 * @param travelPlanId - 여행 계획 ID
 * @returns 예산 요약 (총계, 카테고리별 집계)
 * @throws {Error} 데이터 조회 실패 시
 */
export async function getBudgetSummary(travelPlanId: string): Promise<BudgetSummary> {
  const supabase = await createClient()

  // 예산 항목 조회
  const { data: budgetItems, error: budgetError } = await supabase
    .from("budget_items")
    .select("*")
    .eq("travel_plan_id", travelPlanId)

  if (budgetError) {
    console.error("[BudgetService] Error fetching budget items:", budgetError)
    throw new Error("예산 정보를 불러오는데 실패했습니다")
  }

  // 실제 지출 조회
  const { data: expenses, error: expenseError } = await supabase
    .from("expenses")
    .select("amount, category")
    .eq("travel_plan_id", travelPlanId)

  if (expenseError) {
    console.error("[BudgetService] Error fetching expenses:", expenseError)
    throw new Error("지출 정보를 불러오는데 실패했습니다")
  }

  // 총계 계산
  const totalPlanned = calculateTotalPlanned(budgetItems)
  const totalActual = calculateTotalActual(expenses)

  // 카테고리별 집계
  const byCategory = initializeCategorySummary()
  aggregateByCategory(budgetItems, expenses, byCategory)

  return {
    totalPlanned,
    totalActual,
    remaining: totalPlanned - totalActual,
    byCategory,
  }
}

/**
 * 카테고리별 기본 가격표
 * price_level: 1=저렴, 2=보통, 3=비쌈, 4=매우비쌈
 */
const BASE_PRICES: Record<ExpenseCategory, Record<number, number>> = {
  교통비: { 1: 5000, 2: 15000, 3: 30000, 4: 50000 },
  숙박비: { 1: 50000, 2: 100000, 3: 200000, 4: 300000 },
  식비: { 1: 15000, 2: 30000, 3: 60000, 4: 100000 },
  액티비티: { 1: 10000, 2: 30000, 3: 50000, 4: 100000 },
  쇼핑: { 1: 20000, 2: 50000, 3: 100000, 4: 200000 },
  기타: { 1: 10000, 2: 20000, 3: 40000, 4: 60000 },
}

/**
 * 장소 기반 예산 자동 추정
 * price_level을 기반으로 예상 비용 계산
 *
 * @param priceLevel - 장소의 가격 수준 (1-4)
 * @param category - 지출 카테고리
 * @returns 예상 비용 (원)
 *
 * @example
 * ```typescript
 * const estimated = await estimateBudgetFromPlace(2, "식비")
 * // 30000원 반환
 * ```
 */
export async function estimateBudgetFromPlace(
  priceLevel: number,
  category: ExpenseCategory
): Promise<number> {
  // 유효한 priceLevel 범위 확인
  const validPriceLevel = Math.max(1, Math.min(4, priceLevel))

  // 카테고리에 해당하는 가격표가 있으면 사용, 없으면 기본값(보통) 사용
  const categoryPrices = BASE_PRICES[category]
  if (!categoryPrices) {
    return BASE_PRICES.기타[2] ?? 0
  }

  return categoryPrices[validPriceLevel] ?? categoryPrices[2] ?? 0
}
