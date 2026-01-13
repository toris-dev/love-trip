import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"

/**
 * GET /api/travel-plans/[id]/places
 * 여행 계획의 모든 장소 조회
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const { id: travelPlanId } = await params

    // 여행 계획 소유권 확인
    const { data: plan, error: planError } = await supabase
      .from("travel_plans")
      .select("id, user_id")
      .eq("id", travelPlanId)
      .eq("user_id", user.id)
      .single()

    if (planError || !plan) {
      return NextResponse.json({ error: "여행 계획을 찾을 수 없습니다" }, { status: 404 })
    }

    // travel_days 조회
    const { data: days, error: daysError } = await supabase
      .from("travel_days")
      .select("id, day_number")
      .eq("travel_plan_id", travelPlanId)
      .order("day_number", { ascending: true })

    if (daysError) {
      console.error("Error fetching travel days:", daysError)
      return NextResponse.json(
        { error: "일차 정보를 불러오는 중 오류가 발생했습니다" },
        { status: 500 }
      )
    }

    if (!days || days.length === 0) {
      return NextResponse.json({ places: [] })
    }

    const dayIds = days.map(d => d.id)

    // travel_day_places 조회 (travel_days와 조인하여 day_number 포함)
    const { data: places, error: placesError } = await supabase
      .from("travel_day_places")
      .select(
        `
        *,
        travel_days!inner(day_number)
      `
      )
      .in("travel_day_id", dayIds)
      .order("travel_days.day_number", { ascending: true })
      .order("order_index", { ascending: true })

    if (placesError) {
      console.error("Error fetching places:", placesError)
      return NextResponse.json(
        { error: "장소 정보를 불러오는 중 오류가 발생했습니다" },
        { status: 500 }
      )
    }

    // day_number를 플랫하게 변환
    const formattedPlaces = (places || []).map(
      (p: { travel_days?: { day_number: number } | null; [key: string]: unknown }) => ({
        ...p,
        day_number: p.travel_days?.day_number || 1,
      })
    )

    return NextResponse.json({ places: formattedPlaces })
  } catch (error) {
    console.error("Error in GET /api/travel-plans/[id]/places:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "장소 목록을 불러오는 중 오류가 발생했습니다",
      },
      { status: 500 }
    )
  }
}
