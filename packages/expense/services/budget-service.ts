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

/**
 * 예산 최적화 제안
 */
export interface BudgetOptimizationSuggestion {
  category: ExpenseCategory
  currentPlanned: number
  suggestedPlanned: number
  reduction: number
  reason: string
}

export interface BudgetOptimizationResult {
  isOverBudget: boolean
  overAmount: number
  suggestions: BudgetOptimizationSuggestion[]
  optimizedDistribution: Record<ExpenseCategory, number>
}

/**
 * 예산 최적화 알고리즘
 *
 * 예산 초과 시 최적화 제안을 생성합니다.
 *
 * @param travelPlanId - 여행 계획 ID
 * @param options - 최적화 옵션
 * @param options.targetBudget - 목표 예산 (선택사항)
 * @returns 예산 최적화 제안
 *
 * @example
 * ```typescript
 * const optimization = await optimizeBudget("plan-1", { targetBudget: 500000 })
 * if (optimization.isOverBudget) {
 *   console.log(`예산 초과: ${optimization.overAmount}원`)
 *   console.log("제안:", optimization.suggestions)
 * }
 * ```
 */
export async function optimizeBudget(
  travelPlanId: string,
  options: { targetBudget?: number } = {}
): Promise<BudgetOptimizationResult> {
  const summary = await getBudgetSummary(travelPlanId)
  const { totalPlanned, totalActual, remaining, byCategory } = summary

  const isOverBudget = remaining < 0
  const overAmount = isOverBudget ? Math.abs(remaining) : 0
  const targetBudget = options.targetBudget ?? totalPlanned

  const suggestions: BudgetOptimizationSuggestion[] = []
  const optimizedDistribution: Record<ExpenseCategory, number> = {
    교통비: 0,
    숙박비: 0,
    식비: 0,
    액티비티: 0,
    쇼핑: 0,
    기타: 0,
  }

  // 예산 초과가 아닌 경우 현재 분배 반환
  if (!isOverBudget && !options.targetBudget) {
    Object.entries(byCategory).forEach(([category, data]) => {
      optimizedDistribution[category as ExpenseCategory] = data.planned
    })
    return {
      isOverBudget: false,
      overAmount: 0,
      suggestions: [],
      optimizedDistribution,
    }
  }

  // 목표 예산이 현재 예산보다 작은 경우 최적화 필요
  const needsOptimization = targetBudget < totalPlanned || isOverBudget
  const reductionNeeded = needsOptimization ? totalPlanned - targetBudget : 0

  if (needsOptimization && reductionNeeded > 0) {
    // 카테고리별 초과분 계산
    const categoryOverages: Array<{
      category: ExpenseCategory
      overAmount: number
      planned: number
      actual: number
      usageRate: number
    }> = []

    Object.entries(byCategory).forEach(([category, data]) => {
      const categoryData = data as { planned: number; actual: number }
      const categoryOver = categoryData.actual - categoryData.planned
      const usageRate = categoryData.planned > 0 ? categoryData.actual / categoryData.planned : 0

      if (categoryOver > 0 || usageRate > 1) {
        categoryOverages.push({
          category: category as ExpenseCategory,
          overAmount: categoryOver,
          planned: categoryData.planned,
          actual: categoryData.actual,
          usageRate,
        })
      }
    })

    // 초과분이 큰 순서대로 정렬
    categoryOverages.sort((a, b) => b.overAmount - a.overAmount)

    // 절감 가능한 카테고리 찾기 (실제 지출이 계획보다 적은 카테고리)
    const categoriesWithSavings: Array<{
      category: ExpenseCategory
      planned: number
      actual: number
      savings: number
      savingsRate: number
    }> = []

    Object.entries(byCategory).forEach(([category, data]) => {
      const categoryData = data as { planned: number; actual: number }
      const savings = categoryData.planned - categoryData.actual
      const savingsRate = categoryData.planned > 0 ? savings / categoryData.planned : 0

      if (savings > 0 && categoryData.planned > 0) {
        categoriesWithSavings.push({
          category: category as ExpenseCategory,
          planned: categoryData.planned,
          actual: categoryData.actual,
          savings,
          savingsRate,
        })
      }
    })

    // 절감 가능한 카테고리를 절감률이 높은 순서대로 정렬
    categoriesWithSavings.sort((a, b) => b.savingsRate - a.savingsRate)

    // 최적화 제안 생성
    let remainingReduction = reductionNeeded

    // 1. 초과한 카테고리에서 절감 제안
    for (const overage of categoryOverages) {
      if (remainingReduction <= 0) break

      const reduction = Math.min(overage.overAmount, remainingReduction)
      const suggestedPlanned = overage.planned - reduction

      if (suggestedPlanned >= 0) {
        suggestions.push({
          category: overage.category,
          currentPlanned: overage.planned,
          suggestedPlanned,
          reduction,
          reason: `현재 ${overage.overAmount.toLocaleString()}원 초과 중입니다. ${reduction.toLocaleString()}원 절감 제안`,
        })
        remainingReduction -= reduction
      }
    }

    // 2. 절감 가능한 카테고리에서 추가 절감 제안
    for (const saving of categoriesWithSavings) {
      if (remainingReduction <= 0) break

      // 절감 가능한 금액의 일부만 제안 (너무 많이 줄이지 않도록)
      const maxReduction = Math.min(saving.savings * 0.3, saving.planned * 0.2) // 절감 가능액의 30% 또는 계획의 20% 중 작은 값
      const reduction = Math.min(maxReduction, remainingReduction)
      const suggestedPlanned = saving.planned - reduction

      if (suggestedPlanned >= 0 && reduction > 0) {
        suggestions.push({
          category: saving.category,
          currentPlanned: saving.planned,
          suggestedPlanned,
          reduction,
          reason: `현재 ${saving.savings.toLocaleString()}원 절감 여유가 있습니다. ${reduction.toLocaleString()}원 추가 절감 제안`,
        })
        remainingReduction -= reduction
      }
    }

    // 3. 나머지 절감이 필요한 경우 모든 카테고리에 비례 분배
    if (remainingReduction > 0) {
      const totalPlannedForDistribution = Object.values(byCategory).reduce(
        (sum, data) => sum + (data as { planned: number }).planned,
        0
      )

      if (totalPlannedForDistribution > 0) {
        Object.entries(byCategory).forEach(([category, data]) => {
          const categoryData = data as { planned: number }
          const proportion = categoryData.planned / totalPlannedForDistribution
          const additionalReduction = remainingReduction * proportion
          const currentSuggestion = suggestions.find(s => s.category === category)

          if (currentSuggestion) {
            currentSuggestion.reduction += additionalReduction
            currentSuggestion.suggestedPlanned -= additionalReduction
          } else if (categoryData.planned > 0) {
            suggestions.push({
              category: category as ExpenseCategory,
              currentPlanned: categoryData.planned,
              suggestedPlanned: Math.max(0, categoryData.planned - additionalReduction),
              reduction: additionalReduction,
              reason: `비례 분배로 ${additionalReduction.toLocaleString()}원 절감 제안`,
            })
          }
        })
      }
    }

    // 최적화된 분배 계산
    Object.entries(byCategory).forEach(([category, data]) => {
      const categoryData = data as { planned: number }
      const suggestion = suggestions.find(s => s.category === category)
      optimizedDistribution[category as ExpenseCategory] = suggestion
        ? suggestion.suggestedPlanned
        : categoryData.planned
    })
  } else {
    // 최적화가 필요 없는 경우 현재 분배 반환
    Object.entries(byCategory).forEach(([category, data]) => {
      optimizedDistribution[category as ExpenseCategory] = (data as { planned: number }).planned
    })
  }

  return {
    isOverBudget,
    overAmount,
    suggestions,
    optimizedDistribution,
  }
}
