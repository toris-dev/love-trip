import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"
import type { Database } from "@lovetrip/shared/types/database"

type TravelDayPlaceUpdate = Database["public"]["Tables"]["travel_day_places"]["Update"]

/**
 * PUT /api/travel-plans/[id]/days/[dayId]/places/[placeId]
 * 여행 일차의 장소 정보 수정 (순서 변경 포함)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; dayId: string; placeId: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const { id: travelPlanId, dayId: travelDayId, placeId } = await params

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

    // 일차가 해당 여행 계획에 속하는지 확인
    const { data: day, error: dayError } = await supabase
      .from("travel_days")
      .select("id, travel_plan_id")
      .eq("id", travelDayId)
      .eq("travel_plan_id", travelPlanId)
      .single()

    if (dayError || !day) {
      return NextResponse.json({ error: "일차를 찾을 수 없습니다" }, { status: 404 })
    }

    // travel_day_places 레코드 확인
    const { data: dayPlace, error: dayPlaceError } = await supabase
      .from("travel_day_places")
      .select("id, travel_day_id")
      .eq("id", placeId)
      .eq("travel_day_id", travelDayId)
      .single()

    if (dayPlaceError || !dayPlace) {
      return NextResponse.json({ error: "장소를 찾을 수 없습니다" }, { status: 404 })
    }

    const body = await request.json()
    const updates: TravelDayPlaceUpdate = {}

    if (body.order_index !== undefined) {
      updates.order_index = body.order_index
    }
    if (body.visit_time !== undefined) {
      updates.visit_time = body.visit_time || null
    }
    if (body.notes !== undefined) {
      updates.notes = body.notes || null
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "수정할 데이터가 없습니다" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("travel_day_places")
      .update(updates)
      .eq("id", placeId)
      .select(
        `
        *,
        places (*)
      `
      )
      .single()

    if (error) {
      console.error("Error updating place in day:", error)
      return NextResponse.json(
        { error: error.message || "장소 수정 중 오류가 발생했습니다" },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error in PUT /api/travel-plans/[id]/days/[dayId]/places/[placeId]:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "장소 수정 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/travel-plans/[id]/days/[dayId]/places/[placeId]
 * 여행 일차에서 장소 제거
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; dayId: string; placeId: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const { id: travelPlanId, dayId: travelDayId, placeId } = await params

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

    // 일차가 해당 여행 계획에 속하는지 확인
    const { data: day, error: dayError } = await supabase
      .from("travel_days")
      .select("id, travel_plan_id")
      .eq("id", travelDayId)
      .eq("travel_plan_id", travelPlanId)
      .single()

    if (dayError || !day) {
      return NextResponse.json({ error: "일차를 찾을 수 없습니다" }, { status: 404 })
    }

    // travel_day_places 레코드 확인
    const { data: dayPlace, error: dayPlaceError } = await supabase
      .from("travel_day_places")
      .select("id, travel_day_id")
      .eq("id", placeId)
      .eq("travel_day_id", travelDayId)
      .single()

    if (dayPlaceError || !dayPlace) {
      return NextResponse.json({ error: "장소를 찾을 수 없습니다" }, { status: 404 })
    }

    const { error } = await supabase.from("travel_day_places").delete().eq("id", placeId)

    if (error) {
      console.error("Error deleting place from day:", error)
      return NextResponse.json(
        { error: error.message || "장소 제거 중 오류가 발생했습니다" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error in DELETE /api/travel-plans/[id]/days/[dayId]/places/[placeId]:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "장소 제거 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
