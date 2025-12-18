import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"

/**
 * GET /api/travel-plans/[id]
 * 여행 계획 상세 조회
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

    const { data: plan, error } = await supabase
      .from("travel_plans")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (error) throw error
    if (!plan) {
      return NextResponse.json({ error: "여행 계획을 찾을 수 없습니다" }, { status: 404 })
    }

    return NextResponse.json({ plan })
  } catch (error) {
    console.error("Error fetching travel plan:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "여행 계획을 불러오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

