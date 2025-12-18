import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"
import type { Database } from "@lovetrip/shared/types/database"

type TravelDayPlace = Database["public"]["Tables"]["travel_day_places"]["Row"]
type TravelDayPlaceInsert = Database["public"]["Tables"]["travel_day_places"]["Insert"]
type TravelDayPlaceUpdate = Database["public"]["Tables"]["travel_day_places"]["Update"]

/**
 * POST /api/travel-plans/[id]/days/[dayId]/places
 * 여행 일차에 장소 추가
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; dayId: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const { id: travelPlanId, dayId: travelDayId } = await params

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

    const body = await request.json()
    const { place_id, order_index, visit_time, notes } = body

    if (!place_id) {
      return NextResponse.json({ error: "장소 ID는 필수입니다" }, { status: 400 })
    }

    // 장소 존재 확인
    const { data: place, error: placeError } = await supabase
      .from("places")
      .select("id")
      .eq("id", place_id)
      .single()

    if (placeError || !place) {
      return NextResponse.json({ error: "장소를 찾을 수 없습니다" }, { status: 404 })
    }

    // order_index가 제공되지 않으면 현재 최대값 + 1로 설정
    let finalOrderIndex = order_index
    if (finalOrderIndex === undefined || finalOrderIndex === null) {
      const { data: existingPlaces } = await supabase
        .from("travel_day_places")
        .select("order_index")
        .eq("travel_day_id", travelDayId)
        .order("order_index", { ascending: false })
        .limit(1)

      finalOrderIndex =
        existingPlaces && existingPlaces.length > 0 ? (existingPlaces[0].order_index ?? 0) + 1 : 0
    }

    const insertData: TravelDayPlaceInsert = {
      travel_day_id: travelDayId,
      place_id,
      order_index: finalOrderIndex,
      visit_time: visit_time || null,
      notes: notes || null,
    }

    const { data, error } = await supabase
      .from("travel_day_places")
      .insert(insertData)
      .select(
        `
        *,
        places (*)
      `
      )
      .single()

    if (error) {
      console.error("Error adding place to day:", error)
      return NextResponse.json(
        { error: error.message || "장소 추가 중 오류가 발생했습니다" },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/travel-plans/[id]/days/[dayId]/places:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "장소 추가 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/travel-plans/[id]/days/[dayId]/places
 * 여행 일차의 장소 목록 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; dayId: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const { id: travelPlanId, dayId: travelDayId } = await params

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

    const { data, error } = await supabase
      .from("travel_day_places")
      .select(
        `
        *,
        places (*)
      `
      )
      .eq("travel_day_id", travelDayId)
      .order("order_index", { ascending: true })

    if (error) {
      console.error("Error fetching places for day:", error)
      return NextResponse.json(
        { error: error.message || "장소 목록을 불러오는 중 오류가 발생했습니다" },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: data || [] })
  } catch (error) {
    console.error("Error in GET /api/travel-plans/[id]/days/[dayId]/places:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "장소 목록을 불러오는 중 오류가 발생했습니다",
      },
      { status: 500 }
    )
  }
}
