import { NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"
import { requirePremiumFeature, PREMIUM_FEATURES } from "@lovetrip/subscription"
import { optimizeRoute } from "@lovetrip/planner/services/route-optimizer"
import { placeService } from "@lovetrip/planner/services/place-service"
import type { Place } from "@lovetrip/shared/types"

/**
 * POST /api/travel-plans/[id]/reschedule
 * AI 일정 재편성 (프리미엄): 일차별로 장소 순서를 거리 기반 최적 경로로 재계산해 DB에 반영
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const { id: travelPlanId } = await params

    await requirePremiumFeature(user.id, PREMIUM_FEATURES.AI_RESCHEDULE)

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

    // 일차 목록 조회
    const { data: days, error: daysError } = await supabase
      .from("travel_days")
      .select("id, day_number")
      .eq("travel_plan_id", travelPlanId)
      .order("day_number", { ascending: true })

    if (daysError || !days || days.length === 0) {
      return NextResponse.json(
        { error: "일정이 없습니다." },
        { status: 400 }
      )
    }

    let updatedDays = 0

    for (const day of days) {
      const { data: dayPlaces, error: placesError } = await supabase
        .from("travel_day_places")
        .select("id, place_id, order_index")
        .eq("travel_day_id", day.id)
        .order("order_index", { ascending: true })

      if (placesError || !dayPlaces || dayPlaces.length < 2) {
        continue
      }

      const placesWithCoords: Array<{ dayPlaceId: string; place: Place }> = []

      for (const row of dayPlaces) {
        const place = await placeService.getPlaceById(row.place_id)
        if (place && place.lat != null && place.lng != null) {
          placesWithCoords.push({ dayPlaceId: row.id, place })
        }
      }

      if (placesWithCoords.length < 2) {
        continue
      }

      const [first, ...rest] = placesWithCoords
      const optimizedPlaces = optimizeRoute(first.place, rest.map(r => r.place))
      const newOrderDayPlaceIds: string[] = [first.dayPlaceId]
      for (const p of optimizedPlaces.slice(1)) {
        const found = placesWithCoords.find(
          r =>
            r.dayPlaceId !== first.dayPlaceId &&
            (r.place.id === p.id ||
              (Number(r.place.lat) === Number(p.lat) && Number(r.place.lng) === Number(p.lng)))
        )
        if (found && !newOrderDayPlaceIds.includes(found.dayPlaceId)) {
          newOrderDayPlaceIds.push(found.dayPlaceId)
        }
      }
      for (const r of placesWithCoords) {
        if (!newOrderDayPlaceIds.includes(r.dayPlaceId)) {
          newOrderDayPlaceIds.push(r.dayPlaceId)
        }
      }

      for (let newIndex = 0; newIndex < newOrderDayPlaceIds.length; newIndex++) {
        const dayPlaceId = newOrderDayPlaceIds[newIndex]
        const row = dayPlaces.find(d => d.id === dayPlaceId)
        if (!row || row.order_index === newIndex) continue
        const { error: updateError } = await supabase
          .from("travel_day_places")
          .update({ order_index: newIndex })
          .eq("id", dayPlaceId)
        if (!updateError) updatedDays++
      }
    }

    return NextResponse.json({
      success: true,
      message: "일정이 재편성되었습니다.",
      updatedDays,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "일정 재편성 중 오류가 발생했습니다"
    if (message.includes("프리미엄")) {
      return NextResponse.json({ error: message }, { status: 403 })
    }
    console.error("Error in POST /api/travel-plans/[id]/reschedule:", error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
