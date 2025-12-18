import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"
import type { Database } from "@lovetrip/shared/types/database"

type ExpenseSplitUpdate = Database["public"]["Tables"]["expense_splits"]["Update"]

/**
 * PUT /api/travel-plans/[id]/settlement/[splitId]/pay
 * 분할 금액 지불 완료 처리
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; splitId: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const { id: travelPlanId, splitId } = await params

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

    // 분할 정보 확인
    const { data: split, error: splitError } = await supabase
      .from("expense_splits")
      .select(
        `
        *,
        expenses!inner(travel_plan_id)
      `
      )
      .eq("id", splitId)
      .single()

    if (splitError || !split) {
      return NextResponse.json({ error: "분할 정보를 찾을 수 없습니다" }, { status: 404 })
    }

    // 지출이 해당 여행 계획에 속하는지 확인
    const expense = split.expenses as { travel_plan_id: string } | null
    if (!expense || expense.travel_plan_id !== travelPlanId) {
      return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 })
    }

    const body = await request.json()
    const { is_paid } = body

    const updates: ExpenseSplitUpdate = {
      is_paid: is_paid !== undefined ? Boolean(is_paid) : true,
      paid_at: is_paid !== false ? new Date().toISOString() : null,
    }

    const { data, error } = await supabase
      .from("expense_splits")
      .update(updates)
      .eq("id", splitId)
      .select()
      .single()

    if (error) {
      console.error("Error updating expense split:", error)
      return NextResponse.json(
        { error: error.message || "지불 상태 업데이트에 실패했습니다" },
        { status: 500 }
      )
    }

    return NextResponse.json({ split: data })
  } catch (error) {
    console.error("Error in PUT /api/travel-plans/[id]/settlement/[splitId]/pay:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "지불 상태 업데이트 중 오류가 발생했습니다",
      },
      { status: 500 }
    )
  }
}
