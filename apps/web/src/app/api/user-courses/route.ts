import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"
import { getPublicCourses, getMyCourses } from "@lovetrip/planner/services"

/**
 * GET /api/user-courses
 * 공개 코스 목록 조회 또는 내 코스 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get("type") // "public" | "my"

    if (type === "my") {
      // 내 코스 목록
      if (!user) {
        return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
      }

      const courses = await getMyCourses(user.id)
      return NextResponse.json({ courses })
    } else {
      // 공개 코스 목록
      const region = searchParams.get("region") || undefined
      const courseType = searchParams.get("courseType") as "travel" | "date" | undefined
      const sort = (searchParams.get("sort") as "popular" | "recent" | "views" | "likes") || "popular"
      const limit = parseInt(searchParams.get("limit") || "20")
      const offset = parseInt(searchParams.get("offset") || "0")

      const courses = await getPublicCourses({
        region,
        courseType,
        sort,
        limit,
        offset,
        userId: user?.id,
      })

      return NextResponse.json({ courses })
    }
  } catch (error) {
    console.error("Error fetching courses:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "코스를 불러오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

