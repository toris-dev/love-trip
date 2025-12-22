import { NextRequest, NextResponse } from "next/server"
import { placeService } from "@lovetrip/planner/services/place-service"

/**
 * GET /api/places/search
 * 장소 검색
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("query")

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: "검색어는 최소 2자 이상이어야 합니다" },
        { status: 400 }
      )
    }

    const limit = parseInt(searchParams.get("limit") || "20", 10)
    const preferExternal = searchParams.get("preferExternal") !== "false"

    const places = await placeService.searchPlaces(query, {
      limit,
      preferExternal,
    })

    return NextResponse.json({ places })
  } catch (error) {
    console.error("Error in /api/places/search:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "장소 검색 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
