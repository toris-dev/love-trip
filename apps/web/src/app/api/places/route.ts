import { NextRequest, NextResponse } from "next/server"
import { placeService } from "@lovetrip/planner/services/place-service"

/**
 * GET /api/places
 * 장소 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get("limit") || "50", 10)
    const areaCode = searchParams.get("areaCode") || undefined
    const contentTypeId = searchParams.get("contentTypeId") || undefined

    const places = await placeService.getPlaces({
      limit,
      areaCode,
      contentTypeId,
    })

    return NextResponse.json({ places })
  } catch (error) {
    console.error("Error in /api/places:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "장소 조회 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
