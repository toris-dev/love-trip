import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"
import { updateBudgetItem, deleteBudgetItem } from "@lovetrip/expense/services"
import type { Database } from "@lovetrip/shared/types/database"

type BudgetItemUpdate = Database["public"]["Tables"]["budget_items"]["Update"]

/**
 * PUT /api/travel-plans/[id]/budget/[itemId]
 * 예산 항목 수정
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const { id: travelPlanId, itemId } = await params

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

    // 예산 항목이 해당 여행 계획에 속하는지 확인
    const { data: item, error: itemError } = await supabase
      .from("budget_items")
      .select("id, travel_plan_id")
      .eq("id", itemId)
      .eq("travel_plan_id", travelPlanId)
      .single()

    if (itemError || !item) {
      return NextResponse.json({ error: "예산 항목을 찾을 수 없습니다" }, { status: 404 })
    }

    const body = await request.json()
    const updates: BudgetItemUpdate = {}

    if (body.category !== undefined) {
      updates.category = body.category
    }
    if (body.name !== undefined) {
      updates.name = body.name
    }
    if (body.planned_amount !== undefined) {
      updates.planned_amount = Number(body.planned_amount)
    }
    if (body.travel_day_id !== undefined) {
      updates.travel_day_id = body.travel_day_id || null
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "수정할 데이터가 없습니다" }, { status: 400 })
    }

    const updatedItem = await updateBudgetItem(itemId, updates)

    return NextResponse.json({ item: updatedItem })
  } catch (error) {
    console.error("Error in PUT /api/travel-plans/[id]/budget/[itemId]:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "예산 항목 수정 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/travel-plans/[id]/budget/[itemId]
 * 예산 항목 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const { id: travelPlanId, itemId } = await params

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

    // 예산 항목이 해당 여행 계획에 속하는지 확인
    const { data: item, error: itemError } = await supabase
      .from("budget_items")
      .select("id, travel_plan_id")
      .eq("id", itemId)
      .eq("travel_plan_id", travelPlanId)
      .single()

    if (itemError || !item) {
      return NextResponse.json({ error: "예산 항목을 찾을 수 없습니다" }, { status: 404 })
    }

    await deleteBudgetItem(itemId)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error in DELETE /api/travel-plans/[id]/budget/[itemId]:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "예산 항목 삭제 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
