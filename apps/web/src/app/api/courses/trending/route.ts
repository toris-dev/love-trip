import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"
import { getPublicCourses } from "@lovetrip/planner/services"

/**
 * GET /api/courses/trending
 * 트렌딩 목적지 조회 API
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get("limit") || "10")
    const region = searchParams.get("region") || undefined

    // 최근 일주일 조회수 기준으로 인기 코스 가져오기
    // 실제로는 조회수 테이블이 있어야 하지만, 여기서는 좋아요/저장 수 기준으로 정렬
    const courses = await getPublicCourses({
      region,
      sort: "popular", // 인기순 정렬
      limit,
      offset: 0,
      userId: user?.id,
    })

    // 지역별로 그룹화하여 트렌딩 목적지 생성
    const destinationsByRegion = new Map<string, typeof courses>()

    for (const course of courses) {
      const region = course.region || "기타"
      if (!destinationsByRegion.has(region)) {
        destinationsByRegion.set(region, [])
      }
      destinationsByRegion.get(region)!.push(course)
    }

    // 각 지역의 첫 번째 코스를 트렌딩 목적지로 사용
    const trendingDestinations = Array.from(destinationsByRegion.entries()).map(
      ([region, courses]) => ({
        region,
        course: courses[0],
        courseCount: courses.length,
      })
    )

    return NextResponse.json({ destinations: trendingDestinations })
  } catch (error) {
    console.error("Error in GET /api/courses/trending:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "트렌딩 목적지를 불러오는 중 오류가 발생했습니다",
      },
      { status: 500 }
    )
  }
}
