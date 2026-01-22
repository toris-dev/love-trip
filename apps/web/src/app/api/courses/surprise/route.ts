import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"
import { getPublicCourses } from "@lovetrip/planner/services"

/**
 * GET /api/courses/surprise
 * 랜덤 코스 추천 API
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category") // 카테고리 필터 (선택사항)

    // 모든 공개 코스 가져오기
    const allCourses = await getPublicCourses({
      courseType: undefined, // 모든 타입
      sort: "popular",
      limit: 100, // 충분한 수의 코스를 가져와서 랜덤 선택
      offset: 0,
      userId: user?.id,
    })

    if (allCourses.length === 0) {
      return NextResponse.json({ error: "추천할 코스가 없습니다" }, { status: 404 })
    }

    // 카테고리 필터 적용 (선택사항)
    let filteredCourses = allCourses
    if (category) {
      // 카테고리를 코스의 테마나 타겟 오디언스와 매칭
      // 실제 구현은 데이터베이스 스키마에 따라 달라질 수 있음
      filteredCourses = allCourses.filter((course) => {
        // 예시: category를 target_audience나 theme과 매칭
        // 실제 로직은 프로젝트의 데이터 구조에 맞게 수정 필요
        return true // 일단 모든 코스 반환
      })
    }

    // 랜덤으로 하나 선택
    const randomIndex = Math.floor(Math.random() * filteredCourses.length)
    const surpriseCourse = filteredCourses[randomIndex]

    return NextResponse.json({ course: surpriseCourse })
  } catch (error) {
    console.error("Error in GET /api/courses/surprise:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "랜덤 코스를 불러오는 중 오류가 발생했습니다",
      },
      { status: 500 }
    )
  }
}
