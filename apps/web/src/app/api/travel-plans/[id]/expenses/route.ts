import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"
import { getExpenses, createExpense } from "@lovetrip/expense/services"

/**
 * GET /api/travel-plans/[id]/expenses
 * 지출 내역 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const { id } = await params

    // 여행 계획 소유권 확인
    const { data: plan } = await supabase
      .from("travel_plans")
      .select("user_id")
      .eq("id", id)
      .single()

    if (!plan || plan.user_id !== user.id) {
      return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 })
    }

    const expenses = await getExpenses(id)

    return NextResponse.json({ expenses })
  } catch (error) {
    console.error("Error fetching expenses:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "지출 내역을 불러오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/travel-plans/[id]/expenses
 * 지출 기록
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { category, name, amount, expenseDate, paidByUserId, notes, receiptUrl, userIds } = body

    // 여행 계획 소유권 확인
    const { data: plan } = await supabase
      .from("travel_plans")
      .select("user_id")
      .eq("id", id)
      .single()

    if (!plan || plan.user_id !== user.id) {
      return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 })
    }

    // 커플 정보 조회 (userIds가 없으면)
    let splitUserIds = userIds
    if (!splitUserIds) {
      const { data: couple } = await supabase
        .from("couples")
        .select("user1_id, user2_id")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .single()

      if (couple) {
        splitUserIds = [couple.user1_id, couple.user2_id]
      } else {
        splitUserIds = [user.id] // 커플이 없으면 본인만
      }
    }

    const expense = await createExpense(
      id,
      {
        category,
        name,
        amount,
        expense_date: expenseDate,
        paid_by_user_id: paidByUserId || user.id,
        notes: notes || null,
        receipt_url: receiptUrl || null,
      },
      splitUserIds
    )

    return NextResponse.json({ expense })
  } catch (error) {
    console.error("Error creating expense:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "지출 기록 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

