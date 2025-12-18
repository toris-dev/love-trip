import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"
import { getOrCreateUserGamification } from "@lovetrip/gamification"

/**
 * GET /api/profile/stats
 * 사용자 프로필 통계 조회 (게이미피케이션, 여행 통계)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    // 1. 게이미피케이션 데이터 조회
    const gamification = await getOrCreateUserGamification(user.id)
    const xpPerLevel = 1000
    const xpToNextLevel = (gamification.level + 1) * xpPerLevel

    // 2. 여행 통계 조회
    const [travelPlansResult, completedPlansResult, placesResult, badgesResult, achievementsResult] =
      await Promise.all([
        // 전체 여행 계획 수
        supabase
          .from("travel_plans")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        // 완료된 여행 계획 수
        supabase
          .from("travel_plans")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
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
          .eq("user_id", user.id),
        // 배지 수
        supabase
          .from("user_badges")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        // 업적 조회
        supabase.from("user_achievements").select("*").eq("user_id", user.id),
      ])

    // 방문한 장소 수 계산 (중복 제거)
    const visitedPlaceIds = new Set<string>()
    if (placesResult.data) {
      placesResult.data.forEach((plan) => {
        plan.travel_days?.forEach((day: any) => {
          day.travel_day_places?.forEach((place: any) => {
            if (place.place_id) {
              visitedPlaceIds.add(place.place_id)
            }
          })
        })
      })
    }

    const totalPlans = travelPlansResult.count || 0
    const completedTrips = completedPlansResult.count || 0
    const visitedPlaces = visitedPlaceIds.size
    const badgeCount = badgesResult.count || 0

    return NextResponse.json({
      gamification: {
        level: gamification.level,
        currentXP: gamification.current_xp,
        xpToNextLevel,
        totalXP: gamification.total_xp,
        points: gamification.points,
        streak: gamification.streak,
      },
      stats: {
        totalPlans,
        completedTrips,
        planningTrips: totalPlans - completedTrips,
        visitedPlaces,
        badgeCount,
      },
      achievements: achievementsResult.data || [],
    })
  } catch (error) {
    console.error("Error fetching profile stats:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "통계를 불러오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

