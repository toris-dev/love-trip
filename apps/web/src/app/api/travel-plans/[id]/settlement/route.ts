import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"
import { calculateSettlement } from "@lovetrip/expense/services"

/**
 * GET /api/travel-plans/[id]/settlement
 * 정산 요약 조회
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
    const { searchParams } = new URL(request.url)
    const userIdsParam = searchParams.get("userIds")

    if (!userIdsParam) {
      return NextResponse.json({ error: "userIds 파라미터가 필요합니다" }, { status: 400 })
    }

    const userIds = userIdsParam.split(",").filter(Boolean)

    // 여행 계획 소유권 확인
    const { data: plan } = await supabase
      .from("travel_plans")
      .select("user_id")
      .eq("id", id)
      .single()

    if (!plan || plan.user_id !== user.id) {
      return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 })
    }

    const summaries = await calculateSettlement(id, userIds)

    return NextResponse.json({ summaries })
  } catch (error) {
    console.error("Error calculating settlement:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "정산 계산 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

