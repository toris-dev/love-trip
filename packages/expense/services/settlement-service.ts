"use server"

import { createClient } from "@lovetrip/api/supabase/server"
import type { SettlementSummary } from "../types"

/**
 * 1/N 정산 계산
 * 커플 간 지출을 균등 분할하여 정산 요약 생성
 */
export async function calculateSettlement(
  travelPlanId: string,
  userIds: string[]
): Promise<SettlementSummary[]> {
  const supabase = await createClient()

  // 모든 지출 및 분할 정보 조회
  const { data: expenses, error: expenseError } = await supabase
    .from("expenses")
    .select(
      `
      id,
      amount,
      paid_by_user_id,
      expense_splits (
        user_id,
        amount,
        is_paid
      )
    `
    )
    .eq("travel_plan_id", travelPlanId)

  if (expenseError) {
    console.error("[SettlementService] Error fetching expenses:", expenseError)
    throw new Error("지출 정보를 불러오는데 실패했습니다")
  }

  // 사용자별 집계
  const summary: Record<string, SettlementSummary> = {}

  userIds.forEach((userId) => {
    summary[userId] = {
      userId,
      totalPaid: 0,
      totalOwed: 0,
      netAmount: 0,
    }
  })

  // 각 지출에 대해 정산 계산
  expenses?.forEach((expense) => {
    const totalAmount = expense.amount
    const splitCount = expense.expense_splits?.length ?? userIds.length
    const perPerson = totalAmount / splitCount

    // 결제한 사람이 낸 금액
    if (expense.paid_by_user_id && summary[expense.paid_by_user_id]) {
      summary[expense.paid_by_user_id].totalPaid += totalAmount
    }

    // 각 사용자가 내야 할 금액
    if (expense.expense_splits && expense.expense_splits.length > 0) {
      // 분할 정보가 있으면 그대로 사용
      expense.expense_splits.forEach((split) => {
        if (summary[split.user_id]) {
          summary[split.user_id].totalOwed += split.amount
        }
      })
    } else {
      // 분할 정보가 없으면 균등 분할
      userIds.forEach((userId) => {
        if (summary[userId]) {
          summary[userId].totalOwed += perPerson
        }
      })
    }
  })

  // Net Amount 계산 (받을 돈 - 낼 돈)
  Object.values(summary).forEach((s) => {
    s.netAmount = s.totalPaid - s.totalOwed
  })

  return Object.values(summary)
}

/**
 * 예산 초과 여부 확인
 */
export async function checkBudgetExceeded(
  travelPlanId: string,
  threshold: number = 0.1 // 10% 초과 시 경고
): Promise<{ exceeded: boolean; percentage: number; message?: string }> {
  const supabase = await createClient()

  // 예산 총액 조회
  const { data: travelPlan } = await supabase
    .from("travel_plans")
    .select("total_budget")
    .eq("id", travelPlanId)
    .single()

  if (!travelPlan?.total_budget) {
    return { exceeded: false, percentage: 0 }
  }

  // 실제 지출 총액 조회
  const { data: expenses } = await supabase
    .from("expenses")
    .select("amount")
    .eq("travel_plan_id", travelPlanId)

  const totalActual = expenses?.reduce((sum, exp) => sum + exp.amount, 0) ?? 0
  const totalBudget = travelPlan.total_budget

  const percentage = ((totalActual - totalBudget) / totalBudget) * 100

  return {
    exceeded: percentage > threshold * 100,
    percentage,
    message:
      percentage > threshold * 100
        ? `예산을 ${percentage.toFixed(1)}% 초과했습니다. 대안 코스를 확인해보세요.`
        : undefined,
  }
}

