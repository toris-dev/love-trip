import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"
import { updateExpense, deleteExpense } from "@lovetrip/expense/services"

/**
 * DELETE /api/travel-plans/[id]/expenses/[expenseId]
 * 지출 삭제
 */
export async function DELETE(
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

    const { id, expenseId } = await params

    // 여행 계획 소유권 확인
    const { data: plan } = await supabase
      .from("travel_plans")
      .select("user_id")
      .eq("id", id)
      .single()

    if (!plan || plan.user_id !== user.id) {
      return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 })
    }

    await deleteExpense(expenseId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting expense:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "지출 삭제 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

