import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"

/**
 * GET /api/profile/badges
 * 사용자 배지 조회
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const { data: badges, error } = await supabase
      .from("user_badges")
      .select("*")
      .eq("user_id", user.id)
      .order("earned_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ badges: badges || [] })
  } catch (error) {
    console.error("Error fetching badges:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "배지를 불러오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

