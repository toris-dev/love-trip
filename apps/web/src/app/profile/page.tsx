import type { Metadata } from "next"
import { cache } from "react"
import { createClient } from "@lovetrip/api/supabase/server"
import { ProfilePageClient } from "@/components/features/profile/profile-page-client"
import { getOrCreateUserGamification } from "@lovetrip/gamification"

// React.cache()로 요청당 중복 호출 방지
const getCachedProfileStats = cache(getProfileStats)
const getCachedProfileData = cache(getProfileData)
const getCachedUserCourses = cache(getUserCourses)
const getCachedTravelPlans = cache(getTravelPlans)

export const metadata: Metadata = {
  title: "프로필",
  description: "내 프로필, 통계, 업적, 배지를 확인하고 관리하세요.",
  robots: {
    index: false,
    follow: false,
  },
}

async function getProfileStats(userId: string) {
  const supabase = await createClient()

  // 1. 게이미피케이션 데이터 조회
  const gamification = await getOrCreateUserGamification(userId)
  const xpPerLevel = 1000
  const level = gamification.level ?? 1
  const xpToNextLevel = level * xpPerLevel

  // 2. 여행 통계 조회
  const [travelPlansResult, completedPlansResult, placesResult, badgesResult, achievementsResult] =
    await Promise.all([
      // 전체 여행 계획 수
      supabase
        .from("travel_plans")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
      // 완료된 여행 계획 수
      supabase
        .from("travel_plans")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "completed"),
      // 방문한 장소 수 (최적화: 직접 조회)
      (async () => {
        const { data: plans } = await supabase
          .from("travel_plans")
          .select("id")
          .eq("user_id", userId)

        if (!plans || plans.length === 0) return { data: [], error: null }

        const planIds = plans.map(p => p.id)
        const { data: days } = await supabase
          .from("travel_days")
          .select("id")
          .in("travel_plan_id", planIds)

        if (!days || days.length === 0) return { data: [], error: null }

        const dayIds = days.map(d => d.id)
        const { data: places, error: placesError } = await supabase
          .from("travel_day_places")
          .select("place_id")
          .in("travel_day_id", dayIds)

        return { data: places, error: placesError }
      })(),
      // 배지 수
      supabase
        .from("user_badges")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
      // 업적 조회
      supabase.from("user_achievements").select("*").eq("user_id", userId),
    ])

  // 방문한 장소 수 계산 (중복 제거)
  const visitedPlaceIds = new Set<string>()
  if (placesResult.data && Array.isArray(placesResult.data)) {
    placesResult.data.forEach((place: { place_id?: string }) => {
      if (place.place_id) {
        visitedPlaceIds.add(place.place_id)
      }
    })
  }

  return {
    gamification: {
      level,
      currentXP: gamification.current_xp ?? 0,
      xpToNextLevel,
      totalXP: gamification.total_xp ?? 0,
      points: gamification.points ?? 0,
      streak: gamification.streak ?? 0,
    },
    stats: {
      totalPlans: travelPlansResult.count || 0,
      completedTrips: completedPlansResult.count || 0,
      planningTrips: (travelPlansResult.count || 0) - (completedPlansResult.count || 0),
      visitedPlaces: visitedPlaceIds.size,
      badgeCount: badgesResult.count || 0,
    },
    achievements: achievementsResult.data || [],
  }
}

async function getProfileData(userId: string) {
  const supabase = await createClient()
  const { data: profileData } = await supabase
    .from("profiles")
    .select("display_name, nickname, avatar_url, created_at")
    .eq("id", userId)
    .single()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return {
    name: profileData?.display_name || user?.user_metadata?.full_name || "사용자",
    email: user?.email || "",
    nickname: profileData?.nickname || "",
    bio: "커플 여행을 좋아하는 여행러입니다. 새로운 곳을 탐험하는 것을 즐깁니다.",
    joinDate: profileData?.created_at
      ? new Date(profileData.created_at).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    avatar: profileData?.avatar_url || "",
  }
}

async function getUserCourses(userId: string): Promise<
  Array<{
    id: string
    title: string
    description?: string | null
    course_type: "date" | "travel"
    region: string
    place_count: number
    duration?: string | null
    image_url?: string | null
    created_at: string
  }>
> {
  const supabase = await createClient()

  const { data: courses, error } = await supabase
    .from("user_courses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(6)

  if (error || !courses) {
    return []
  }

  return courses.map(course => ({
    id: course.id,
    title: course.title,
    description: course.description,
    course_type: course.course_type as "date" | "travel",
    region: course.region,
    place_count: course.place_count ?? 0,
    duration: course.duration,
    image_url: course.image_url,
    created_at: course.created_at ?? new Date().toISOString(),
  }))
}

async function getTravelPlans(userId: string) {
  const supabase = await createClient()

  const { data: plans, error } = await supabase
    .from("travel_plans")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(6)

  if (error || !plans || plans.length === 0) {
    return []
  }

  const planIds = plans.map(p => p.id)

  // 병렬로 모든 여행 계획의 일차와 장소 개수 조회
  const [daysResult, placesCountResult] = await Promise.all([
    supabase
      .from("travel_days")
      .select("id, travel_plan_id")
      .in("travel_plan_id", planIds),
    supabase
      .from("travel_day_places")
      .select("travel_day_id, travel_days!inner(travel_plan_id)", { count: "exact", head: false })
      .in("travel_days.travel_plan_id", planIds),
  ])

  // 일차별로 그룹화
  const daysByPlan = new Map<string, string[]>()
  daysResult.data?.forEach(day => {
    if (!daysByPlan.has(day.travel_plan_id)) {
      daysByPlan.set(day.travel_plan_id, [])
    }
    daysByPlan.get(day.travel_plan_id)!.push(day.id)
  })

  // 장소 개수 계산
  const placesByDay = new Map<string, number>()
  placesCountResult.data?.forEach(place => {
    const dayId = place.travel_day_id
    placesByDay.set(dayId, (placesByDay.get(dayId) || 0) + 1)
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 각 여행 계획의 정보 구성
  return plans.map(plan => {
    const dayIds = daysByPlan.get(plan.id) || []
    const places = dayIds.reduce((sum, dayId) => sum + (placesByDay.get(dayId) || 0), 0)

    const startDate = new Date(plan.start_date)
    const endDate = new Date(plan.end_date)
    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(0, 0, 0, 0)

    let status: "planning" | "ongoing" | "completed" = "planning"
    if (endDate < today) {
      status = "completed"
    } else if (startDate <= today && today <= endDate) {
      status = "ongoing"
    }

    return {
      id: plan.id,
      title: plan.title,
      destination: plan.destination,
      start_date: plan.start_date,
      end_date: plan.end_date,
      total_budget: plan.total_budget || 0,
      status,
      places,
    }
  })
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const [stats, profile, userCourses, travelPlans] = await Promise.all([
    getProfileStats(user.id),
    getProfileData(user.id),
    getUserCourses(user.id),
    getTravelPlans(user.id),
  ])

  return (
    <ProfilePageClient
      initialStats={stats}
      initialProfile={profile}
      initialUserCourses={userCourses}
      initialTravelPlans={travelPlans}
    />
  )
}
