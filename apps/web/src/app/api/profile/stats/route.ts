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
    const level = gamification.level ?? 1
    const xpToNextLevel = level * xpPerLevel

    // 2. 여행 통계 조회
    const [
      travelPlansResult,
      completedPlansResult,
      placesResult,
      badgesResult,
      achievementsResult,
    ] = await Promise.all([
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
      // 방문한 장소 수 (최적화: 직접 조회)
      (async () => {
        // 1. 사용자의 travel_plan_ids 조회
        const { data: plans } = await supabase
          .from("travel_plans")
          .select("id")
          .eq("user_id", user.id)

        if (!plans || plans.length === 0) {
          return { data: [], error: null }
        }

        const planIds = plans.map(p => p.id)

        // 2. travel_day_ids 조회
        const { data: days } = await supabase
          .from("travel_days")
          .select("id")
          .in("travel_plan_id", planIds)

        if (!days || days.length === 0) {
          return { data: [], error: null }
        }

        const dayIds = days.map(d => d.id)

        // 3. travel_day_places에서 고유한 place_id 조회
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
        .eq("user_id", user.id),
      // 업적 조회
      supabase.from("user_achievements").select("*").eq("user_id", user.id),
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

    const totalPlans = travelPlansResult.count || 0
    const completedTrips = completedPlansResult.count || 0
    const visitedPlaces = visitedPlaceIds.size
    const badgeCount = badgesResult.count || 0

    return NextResponse.json({
      gamification: {
        level,
        currentXP: gamification.current_xp ?? 0,
        xpToNextLevel,
        totalXP: gamification.total_xp ?? 0,
        points: gamification.points ?? 0,
        streak: gamification.streak ?? 0,
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
