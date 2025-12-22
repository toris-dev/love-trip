import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"
import { placeService } from "@lovetrip/planner/services/place-service"

/**
 * POST /api/places/find-or-create
 * 장소 검색 및 조회 (하이브리드 방식)
 * 외부 API와 저장된 정보를 결합하여 반환
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, placeId, limit = 20 } = body

    // placeId가 있으면 ID로 조회
    if (placeId) {
      const place = await placeService.getPlaceById(placeId)
      if (!place) {
        return NextResponse.json({ error: "장소를 찾을 수 없습니다" }, { status: 404 })
      }
      return NextResponse.json({ place })
    }

    // query가 있으면 검색
    if (query && typeof query === "string") {
      const places = await placeService.searchPlaces(query, { limit })
      return NextResponse.json({ places })
    }

    return NextResponse.json(
      { error: "query 또는 placeId가 필요합니다" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error in /api/places/find-or-create:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "장소 조회 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
