import { createClient } from "@lovetrip/api/supabase/server"
import { getPublicCourses } from "@lovetrip/planner/services"
import { isPremiumUser } from "@lovetrip/subscription/services"
import { CoursesExploreClient } from "@/components/features/courses/courses-explore-client"

export const dynamic = "force-dynamic"

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
