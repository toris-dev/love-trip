import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"
import {
  getBudgetItems,
  createBudgetItem,
  updateBudgetItem,
  deleteBudgetItem,
  getBudgetSummary,
} from "@lovetrip/expense/services"
import { createBudgetItemSchema, updateBudgetItemSchema } from "@lovetrip/shared/schemas"
import { validateRequest } from "@/lib/validation/validate-request"
import type { Database } from "@lovetrip/shared/types/database"

type BudgetItemInsert = Database["public"]["Tables"]["budget_items"]["Insert"]
type BudgetItemUpdate = Database["public"]["Tables"]["budget_items"]["Update"]

/**
 * GET /api/travel-plans/[id]/budget
 * 예산 현황 조회
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const { id: travelPlanId } = await params

    // 여행 계획 소유권 확인
    const { data: plan, error: planError } = await supabase
      .from("travel_plans")
      .select("id, user_id")
      .eq("id", travelPlanId)
      .eq("user_id", user.id)
      .single()

    if (planError || !plan) {
      return NextResponse.json({ error: "여행 계획을 찾을 수 없습니다" }, { status: 404 })
    }

    // 예산 요약 조회
    const summary = await getBudgetSummary(travelPlanId)
    const items = await getBudgetItems(travelPlanId)

    return NextResponse.json({
      summary,
      items,
    })
  } catch (error) {
    console.error("Error in GET /api/travel-plans/[id]/budget:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "예산 현황을 불러오는 중 오류가 발생했습니다",
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/travel-plans/[id]/budget
 * 예산 항목 추가
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const { id: travelPlanId } = await params

    // 여행 계획 소유권 확인
    const { data: plan, error: planError } = await supabase
      .from("travel_plans")
      .select("id, user_id")
      .eq("id", travelPlanId)
      .eq("user_id", user.id)
      .single()

    if (planError || !plan) {
      return NextResponse.json({ error: "여행 계획을 찾을 수 없습니다" }, { status: 404 })
    }

    // 입력 검증
    const validation = await validateRequest(request, createBudgetItemSchema)
    if (!validation.success) {
      return validation.error
    }

    const { category, name, planned_amount, travel_day_id } = validation.data

    const itemData: Omit<BudgetItemInsert, "travel_plan_id"> = {
      category,
      name,
      planned_amount,
      travel_day_id: travel_day_id || null,
    }

    const item = await createBudgetItem(travelPlanId, itemData)

    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/travel-plans/[id]/budget:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "예산 항목 추가 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
