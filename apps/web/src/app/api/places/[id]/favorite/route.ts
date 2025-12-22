import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"

/**
 * POST /api/places/[id]/favorite
 * 장소를 즐겨찾기에 추가
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

    const { id: placeId } = await params

    // places 테이블이 삭제되어 장소 존재 확인 불가
    // place_id는 유효한지 확인만 하고, 실제 places 테이블 조회는 하지 않음

    // 이미 즐겨찾기에 있는지 확인
    const { data: existing } = await supabase
      .from("place_favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("place_id", placeId)
      .single()

    if (existing) {
      return NextResponse.json({ error: "이미 즐겨찾기에 추가된 장소입니다" }, { status: 400 })
    }

    // 즐겨찾기 추가
    // places 테이블이 삭제되어 조인 제거
    const { data, error } = await supabase
      .from("place_favorites")
      .insert({
        user_id: user.id,
        place_id: placeId,
      })
      .select("*")
      .single()

    if (error) {
      console.error("Error adding favorite:", error)
      return NextResponse.json(
        { error: error.message || "즐겨찾기 추가 중 오류가 발생했습니다" },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/places/[id]/favorite:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "즐겨찾기 추가 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/places/[id]/favorite
 * 장소를 즐겨찾기에서 제거
 */
export async function DELETE(
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

    const { id: placeId } = await params

    const { error } = await supabase
      .from("place_favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("place_id", placeId)

    if (error) {
      console.error("Error removing favorite:", error)
      return NextResponse.json(
        { error: error.message || "즐겨찾기 제거 중 오류가 발생했습니다" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error in DELETE /api/places/[id]/favorite:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "즐겨찾기 제거 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
