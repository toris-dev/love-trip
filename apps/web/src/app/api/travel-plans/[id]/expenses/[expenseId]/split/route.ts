import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"
import type { Database } from "@lovetrip/shared/types/database"

type ExpenseSplitInsert = Database["public"]["Tables"]["expense_splits"]["Insert"]

/**
 * POST /api/travel-plans/[id]/expenses/[expenseId]/split
 * 지출 분할 설정
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; expenseId: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const { id: travelPlanId, expenseId } = await params

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

    // 지출 내역 확인
    const { data: expense, error: expenseError } = await supabase
      .from("expenses")
      .select("id, amount, travel_plan_id")
      .eq("id", expenseId)
      .eq("travel_plan_id", travelPlanId)
      .single()

    if (expenseError || !expense) {
      return NextResponse.json({ error: "지출 내역을 찾을 수 없습니다" }, { status: 404 })
    }

    const body = await request.json()
    const { splits } = body // [{ user_id, amount }] 형식

    if (!splits || !Array.isArray(splits) || splits.length === 0) {
      return NextResponse.json({ error: "분할 정보가 필요합니다" }, { status: 400 })
    }

    // 총액 검증
    const totalSplitAmount = splits.reduce((sum, split) => sum + Number(split.amount || 0), 0)
    if (Math.abs(totalSplitAmount - expense.amount) > 0.01) {
      return NextResponse.json(
        {
          error: `분할 금액의 합(${totalSplitAmount})이 지출 금액(${expense.amount})과 일치하지 않습니다`,
        },
        { status: 400 }
      )
    }

    // 기존 분할 정보 삭제
    const { error: deleteError } = await supabase
      .from("expense_splits")
      .delete()
      .eq("expense_id", expenseId)

    if (deleteError) {
      console.error("Error deleting existing expense splits:", deleteError)
      return NextResponse.json(
        { error: deleteError.message || "기존 분할 정보 삭제에 실패했습니다" },
        { status: 500 }
      )
    }

    // 새로운 분할 정보 생성
    const splitData: ExpenseSplitInsert[] = splits.map(
      (split: { user_id: string; amount: number }) => ({
        expense_id: expenseId,
        user_id: split.user_id,
        amount: Number(split.amount),
        is_paid: false,
      })
    )

    const { data, error } = await supabase.from("expense_splits").insert(splitData).select()

    if (error) {
      console.error("Error creating expense splits:", error)
      return NextResponse.json(
        { error: error.message || "지출 분할 설정에 실패했습니다" },
        { status: 500 }
      )
    }

    return NextResponse.json({ splits: data }, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/travel-plans/[id]/expenses/[expenseId]/split:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "지출 분할 설정 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
