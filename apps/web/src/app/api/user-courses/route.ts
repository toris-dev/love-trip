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
    const type = searchParams.get("type") // "my" | "public" | "all" | undefined (기본값: "all")

    if (type === "my") {
      // 내 코스 목록만
      if (!user) {
        return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
      }

      const courses = await getMyCourses(user.id)
      return NextResponse.json({ courses })
    } else if (type === "public") {
      // 공개 코스 목록만
      const region = searchParams.get("region") || undefined
      const courseType = searchParams.get("courseType") as "travel" | "date" | undefined
      const targetAudience = searchParams.get("targetAudience") as
        | "couple"
        | "friend"
        | "family"
        | "solo"
        | "business"
        | undefined
      const sort =
        (searchParams.get("sort") as "popular" | "recent" | "views" | "likes") || "popular"
      const limit = parseInt(searchParams.get("limit") || "20")
      const offset = parseInt(searchParams.get("offset") || "0")

      const courses = await getPublicCourses({
        region,
        courseType,
        targetAudience,
        sort,
        limit,
        offset,
        userId: user?.id,
      })

      return NextResponse.json({ courses })
    } else {
      // 기본값: 모든 코스 (내 코스 + 공개 코스 + date_courses + travel_courses)
      const region = searchParams.get("region") || undefined
      const courseType = searchParams.get("courseType") as "travel" | "date" | undefined
      const targetAudience = searchParams.get("targetAudience") as
        | "couple"
        | "friend"
        | "family"
        | "solo"
        | "business"
        | undefined
      const sort =
        (searchParams.get("sort") as "popular" | "recent" | "views" | "likes") || "popular"
      const limit = parseInt(searchParams.get("limit") || "500")
      const offset = parseInt(searchParams.get("offset") || "0")

      // 내 코스, 공개 코스, date_courses, travel_courses를 모두 가져오기
      const [myCourses, publicCourses, dateCourses, travelCourses] = await Promise.all([
        user ? getMyCourses(user.id).catch(() => []) : Promise.resolve([]),
        getPublicCourses({
          region,
          courseType,
          targetAudience,
          sort,
          limit,
          offset,
          userId: user?.id,
        }).catch(() => []),
        // date_courses 테이블에서 모든 코스 가져오기
        (async () => {
          let query = supabase.from("date_courses").select("*")
          if (region) {
            query = query.eq("region", region)
          }
          const { data, error } = await query.order("created_at", { ascending: false }).limit(limit)
          if (error) {
            console.error("Error fetching date_courses:", error)
            return []
          }
          // user_courses 형식으로 변환
          return (data || []).map(course => ({
            ...course,
            course_type: "date" as const,
            is_public: true,
            status: "published" as const,
            user_id: null,
            author: null,
          }))
        })(),
        // travel_courses 테이블에서 모든 코스 가져오기
        (async () => {
          let query = supabase.from("travel_courses").select("*")
          if (region) {
            query = query.eq("region", region)
          }
          const { data, error } = await query.order("created_at", { ascending: false }).limit(limit)
          if (error) {
            console.error("Error fetching travel_courses:", error)
            return []
          }
          // user_courses 형식으로 변환
          return (data || []).map(course => ({
            ...course,
            course_type: "travel" as const,
            is_public: true,
            status: "published" as const,
            user_id: null,
            author: null,
          }))
        })(),
      ])

      // 중복 제거: 내 코스 > 공개 코스 > date_courses > travel_courses 순서로 우선순위
      const courseMap = new Map<
        string,
        (
          | typeof myCourses
          | typeof publicCourses
          | typeof dateCourses
          | typeof travelCourses
        )[number]
      >()

      // 순서대로 추가 (나중에 추가된 것이 우선순위가 낮음)
      travelCourses.forEach(course => {
        if (!courseMap.has(course.id)) {
          courseMap.set(course.id, course)
        }
      })
      dateCourses.forEach(course => {
        if (!courseMap.has(course.id)) {
          courseMap.set(course.id, course)
        }
      })
      publicCourses.forEach(course => {
        if (!courseMap.has(course.id)) {
          courseMap.set(course.id, course)
        }
      })
      myCourses.forEach(course => {
        courseMap.set(course.id, course) // 내 코스가 최우선
      })

      let uniqueCourses = Array.from(courseMap.values())

      // courseType 필터 적용
      if (courseType) {
        uniqueCourses = uniqueCourses.filter(c => c.course_type === courseType)
      }

      return NextResponse.json({ courses: uniqueCourses })
    }
  } catch (error) {
    console.error("Error fetching courses:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "코스를 불러오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
