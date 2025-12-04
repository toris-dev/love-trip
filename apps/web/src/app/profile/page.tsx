import { createClient } from "@lovetrip/api/supabase/server"
import { ProfilePageClient } from "@/components/features/profile/profile-page-client"
import { getOrCreateUserGamification } from "@lovetrip/gamification"

async function getProfileStats(userId: string) {
  const supabase = await createClient()

  // 1. 게이미피케이션 데이터 조회
  const gamification = await getOrCreateUserGamification(userId)
  const xpPerLevel = 1000
  const xpToNextLevel = (gamification.level + 1) * xpPerLevel

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
      // 방문한 장소 수 (travel_day_places를 통해)
      supabase
        .from("travel_plans")
        .select(
          `
          id,
          travel_days (
            id,
            travel_day_places (place_id)
          )
        `
        )
        .eq("user_id", userId),
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
  if (placesResult.data) {
    placesResult.data.forEach(plan => {
      plan.travel_days?.forEach((day: any) => {
        day.travel_day_places?.forEach((place: any) => {
          if (place.place_id) {
            visitedPlaceIds.add(place.place_id)
          }
        })
      })
    })
  }

  return {
    gamification: {
      level: gamification.level,
      currentXP: gamification.current_xp,
      xpToNextLevel,
      totalXP: gamification.total_xp,
      points: gamification.points,
      streak: gamification.streak || 0,
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

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const [stats, profile] = await Promise.all([
    getProfileStats(user.id),
    getProfileData(user.id),
  ])

  return <ProfilePageClient initialStats={stats} initialProfile={profile} />
}
