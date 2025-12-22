import type { Metadata } from "next"
import { createClient } from "@lovetrip/api/supabase/server"
import { getPublicCourses } from "@lovetrip/planner/services"
import { isPremiumUser } from "@lovetrip/subscription/services"
import { CoursesExploreClient } from "@/components/features/courses/courses-explore-client"

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
      : `커플을 위한 ${isTravel ? "여행" : "데이트"} 코스를 탐색하세요. 다양한 지역과 테마의 코스를 확인하고 특별한 여행을 계획해보세요.`,
    keywords: [
      isTravel ? "여행코스" : "데이트코스",
      "커플여행",
      region || "전국",
      "여행추천",
      "데이트추천",
    ],
    openGraph: {
      title: `${title} | LOVETRIP`,
      description: `${region || "전국"} 지역의 ${isTravel ? "여행" : "데이트"} 코스를 탐색하고 특별한 여행을 계획해보세요.`,
      url: `https://lovetrip.vercel.app/courses${params.type ? `?type=${params.type}` : ""}${region ? `&region=${region}` : ""}`,
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
  const sort = (params.sort as "popular" | "recent" | "views" | "likes") || "popular"
  const page = parseInt(params.page || "1")
  const limit = 20
  const offset = (page - 1) * limit

  const courses = await getPublicCourses({
    region,
    courseType,
    sort,
    limit,
    offset,
    userId: user?.id,
  })

  // 프리미엄 구독자 확인
  const isPremium = user ? await isPremiumUser(user.id) : false

  return (
    <CoursesExploreClient
      initialCourses={courses}
      initialFilters={{
        type: courseType,
        region,
        sort,
      }}
      initialPage={page}
      userId={user?.id}
      isPremium={isPremium}
    />
  )
}
