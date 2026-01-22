import type { Metadata } from "next"
import { createClient } from "@lovetrip/api/supabase/server"
import { getPublicCourses } from "@lovetrip/planner/services"
import { isPremiumUser } from "@lovetrip/subscription/services"
import { CoursesExploreClient } from "@/components/features/courses/courses-explore-client"
import type { UserCourseWithAuthor } from "@lovetrip/shared/types"

export const dynamic = "force-dynamic"

export async function generateMetadata({ searchParams }: CoursesPageProps): Promise<Metadata> {
  const params = await searchParams
  const courseType = params.type === "travel" ? "travel" : "date"
  const region = params.region
  const isTravel = courseType === "travel"

  const title = region
    ? `${region} ${isTravel ? "여행" : "데이트"} 코스`
    : `모든 ${isTravel ? "여행" : "데이트"} 코스`

  return {
    title,
    description: region
      ? `${region} 지역의 ${isTravel ? "여행" : "데이트"} 코스를 탐색하세요. 다양한 코스를 확인하고 특별한 여행을 계획해보세요.`
      : `${isTravel ? "여행" : "데이트"} 코스를 탐색하세요. 다양한 지역과 테마의 코스를 확인하고 특별한 여행을 계획해보세요.`,
    keywords: [
      isTravel ? "여행코스" : "데이트코스",
      "여행",
      region || "전국",
      "여행추천",
      "데이트추천",
    ],
    openGraph: {
      title: `${title} | LOVETRIP`,
      description: `${region || "전국"} 지역의 ${isTravel ? "여행" : "데이트"} 코스를 탐색하고 특별한 여행을 계획해보세요.`,
      url: `https://love2trip.vercel.app/courses${params.type ? `?type=${params.type}` : ""}${region ? `&region=${region}` : ""}`,
      type: "website",
    },
    alternates: {
      canonical: `/courses${params.type ? `?type=${params.type}` : ""}${region ? `&region=${region}` : ""}`,
    },
  }
}

interface CoursesPageProps {
  searchParams: Promise<{
    type?: string
    region?: string
    sort?: string
    page?: string
    targetAudience?: string
  }>
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const params = await searchParams
  const courseType = (params.type === "travel" ? "travel" : "date") as "travel" | "date" | undefined
  const region = params.region || undefined
  const targetAudience = params.targetAudience as
    | "couple"
    | "friend"
    | "family"
    | "solo"
    | "business"
    | undefined
  const sort = (params.sort as "popular" | "recent" | "views" | "likes") || "popular"
  const page = parseInt(params.page || "1")
  const limit = 20
  const offset = (page - 1) * limit

  // user_courses의 공개 코스 가져오기
  const publicCourses = await getPublicCourses({
    region,
    courseType,
    targetAudience,
    sort,
    limit,
    offset,
    userId: user?.id,
  })

  // date_courses와 travel_courses 테이블에서도 코스 가져오기
  const allCourses: UserCourseWithAuthor[] = [...publicCourses]

  // date_courses 테이블에서 코스 가져오기 (courseType이 date이거나 undefined일 때)
  if (!courseType || courseType === "date") {
    const { data: dateCoursesData } = await supabase
      .from("date_courses")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1)

    if (dateCoursesData && dateCoursesData.length > 0) {
      const dateCourses: UserCourseWithAuthor[] = dateCoursesData.map(course => ({
        ...course,
        course_type: "date" as const,
        is_public: true,
        status: "published" as const,
        user_id: null,
        author: null,
        view_count: 0,
        like_count: 0,
        save_count: 0,
        isLiked: false,
        isSaved: false,
      }))
      allCourses.push(...dateCourses)
    }
  }

  // travel_courses 테이블에서 코스 가져오기 (courseType이 travel이거나 undefined일 때)
  if (!courseType || courseType === "travel") {
    const { data: travelCoursesData } = await supabase
      .from("travel_courses")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1)

    if (travelCoursesData && travelCoursesData.length > 0) {
      const travelCourses: UserCourseWithAuthor[] = travelCoursesData.map(course => ({
        ...course,
        course_type: "travel" as const,
        is_public: true,
        status: "published" as const,
        user_id: null,
        author: null,
        view_count: 0,
        like_count: 0,
        save_count: 0,
        isLiked: false,
        isSaved: false,
      }))
      allCourses.push(...travelCourses)
    }
  }

  // region 필터 적용
  const filteredCourses = region
    ? allCourses.filter(course => course.region === region)
    : allCourses

  // courseType 필터 적용
  const typeFilteredCourses = courseType
    ? filteredCourses.filter(course => course.course_type === courseType)
    : filteredCourses

  // targetAudience 필터 적용
  const finalCourses = targetAudience
    ? typeFilteredCourses.filter(course => course.target_audience === targetAudience)
    : typeFilteredCourses

  // 정렬 적용
  const sortedCourses = [...finalCourses].sort((a, b) => {
    switch (sort) {
      case "popular":
        const aScore = (a.like_count || 0) + (a.save_count || 0)
        const bScore = (b.like_count || 0) + (b.save_count || 0)
        return bScore - aScore
      case "recent":
        const aDate = a.published_at || a.created_at || ""
        const bDate = b.published_at || b.created_at || ""
        return new Date(bDate).getTime() - new Date(aDate).getTime()
      case "views":
        return (b.view_count || 0) - (a.view_count || 0)
      case "likes":
        return (b.like_count || 0) - (a.like_count || 0)
      default:
        return 0
    }
  })

  // 프리미엄 구독자 확인
  const isPremium = user ? await isPremiumUser(user.id) : false

  return (
    <CoursesExploreClient
      initialCourses={sortedCourses}
      initialFilters={{
        type: courseType,
        region,
        sort,
        targetAudience,
      }}
      initialPage={page}
      userId={user?.id}
      isPremium={isPremium}
    />
  )
}
