import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"
import { createUserCourseDirectly } from "@lovetrip/planner/services"

/**
 * POST /api/user-courses/create
 * 사용자가 직접 코스를 생성 (공개/비공개 선택 가능)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      course_type,
      region,
      is_public = false,
      places,
      estimated_budget,
      duration,
      image_url,
    } = body

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "코스 제목을 입력해주세요" }, { status: 400 })
    }

    if (!course_type || !["date", "travel"].includes(course_type)) {
      return NextResponse.json({ error: "코스 타입이 올바르지 않습니다" }, { status: 400 })
    }

    if (!region || !region.trim()) {
      return NextResponse.json({ error: "지역을 입력해주세요" }, { status: 400 })
    }

    if (!places || !Array.isArray(places) || places.length === 0) {
      return NextResponse.json({ error: "최소 1개 이상의 장소를 추가해주세요" }, { status: 400 })
    }

    // places 배열 검증 및 변환 (하이브리드 방식)
    const validatedPlaces = places.map((place: any, index: number) => {
      // place_id가 있으면 사용, 없으면 place_info 사용
      if (place.place_id) {
        return {
          place_id: place.place_id,
          day_number: place.day_number || 1,
          order_index: place.order_index !== undefined ? place.order_index : index,
          visit_duration_minutes: place.visit_duration_minutes || null,
          notes: place.notes || null,
        }
      } else if (place.place_info) {
        return {
          place_id: null,
          place_info: {
            name: place.place_info.name,
            lat: place.place_info.lat,
            lng: place.place_info.lng,
            address: place.place_info.address,
            type: place.place_info.type || "ETC",
            rating: place.place_info.rating,
            price_level: place.place_info.price_level,
            image_url: place.place_info.image_url,
            description: place.place_info.description,
          },
          day_number: place.day_number || 1,
          order_index: place.order_index !== undefined ? place.order_index : index,
          visit_duration_minutes: place.visit_duration_minutes || null,
          notes: place.notes || null,
        }
      } else {
        throw new Error(`장소 ${index + 1}: place_id 또는 place_info가 필요합니다.`)
      }
    })

    const course = await createUserCourseDirectly(user.id, {
      title: title.trim(),
      description: description?.trim() || undefined,
      course_type,
      region: region.trim(),
      is_public: Boolean(is_public),
      places: validatedPlaces,
      estimated_budget: estimated_budget ? Number(estimated_budget) : undefined,
      duration,
      image_url,
    })

    return NextResponse.json({
      course,
      message: is_public ? "코스가 공개되었습니다!" : "코스가 저장되었습니다!",
    })
  } catch (error) {
    console.error("Error creating user course:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "코스 생성 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
