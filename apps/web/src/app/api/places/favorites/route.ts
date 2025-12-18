import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"

/**
 * GET /api/places/favorites
 * 사용자의 즐겨찾기 장소 목록 조회
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

    const { data, error } = await supabase
      .from("place_favorites")
      .select(
        `
        *,
        places (*)
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching favorites:", error)
      return NextResponse.json(
        { error: error.message || "즐겨찾기 목록을 불러오는 중 오류가 발생했습니다" },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: data || [] })
  } catch (error) {
    console.error("Error in GET /api/places/favorites:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "즐겨찾기 목록을 불러오는 중 오류가 발생했습니다",
      },
      { status: 500 }
    )
  }
}
