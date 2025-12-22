import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"
import { getExpenses, createExpense } from "@lovetrip/expense/services"
import { createExpenseSchema } from "@lovetrip/shared/schemas"
import { validateRequest } from "@/lib/validation/validate-request"

/**
 * GET /api/travel-plans/[id]/expenses
 * 지출 내역 조회
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
      {
        error:
          error instanceof Error ? error.message : "지출 내역을 불러오는 중 오류가 발생했습니다",
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/travel-plans/[id]/expenses
 * 지출 기록
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

    const { id } = await params

    // 입력 검증 (기본 스키마 + 추가 필드)
    const body = await request.json()
    const expenseValidation = createExpenseSchema.safeParse({
      amount: body.amount,
      category: body.category,
      description: body.name || body.notes,
      paid_by_user_id: body.paidByUserId || user.id,
      receipt_url: body.receiptUrl,
    })

    if (!expenseValidation.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message:
              expenseValidation.error.errors[0]?.message || "입력 데이터가 올바르지 않습니다",
            details: expenseValidation.error.errors,
          },
        },
        { status: 400 }
      )
    }

    const { category, amount, paid_by_user_id, receipt_url, description } = expenseValidation.data
    const { expenseDate, notes, userIds } = body

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
        name: description || notes || "",
        amount,
        expense_date: expenseDate,
        paid_by_user_id: paid_by_user_id,
        notes: notes || null,
        receipt_url: receipt_url || null,
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
