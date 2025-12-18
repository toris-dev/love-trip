import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"

/**
 * POST /api/places/find-or-create
 * 장소를 찾거나 생성하여 place_id 반환
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
    const { name, address, lat, lng, type = "ETC" } = body

    if (!name || !lat || !lng) {
      return NextResponse.json({ error: "장소명, 위도, 경도는 필수입니다" }, { status: 400 })
    }

    // 1. 먼저 DB에서 검색 (이름과 좌표로)
    const { data: existingPlaces } = await supabase
      .from("places")
      .select("id, name")
      .ilike("name", `%${name}%`)
      .limit(5)

    // 좌표가 비슷한 장소 찾기 (약 100m 이내)
    let placeId: string | null = null

    if (existingPlaces && existingPlaces.length > 0) {
      // 정확히 일치하는 이름이 있으면 좌표 확인
      const exactMatch = existingPlaces.find(p => p.name === name)
      if (exactMatch) {
        // 좌표 확인을 위해 장소 정보 가져오기
        const { data: placeInfo } = await supabase
          .from("places")
          .select("id, lat, lng")
          .eq("id", exactMatch.id)
          .single()

        if (placeInfo) {
          // 좌표 거리 계산 (간단한 유클리드 거리)
          const distance = Math.sqrt(
            Math.pow(Number(placeInfo.lat) - lat, 2) + Math.pow(Number(placeInfo.lng) - lng, 2)
          )
          // 약 0.001도 = 약 100m 이내면 같은 장소로 간주
          if (distance < 0.001) {
            placeId = placeInfo.id
          }
        }
      }

      // 정확히 일치하는 것이 없으면 부분 매치 결과들도 좌표 검증
      if (!placeId && existingPlaces.length > 0) {
        // 모든 부분 매치 결과에 대해 좌표 확인
        for (const place of existingPlaces) {
          const { data: placeInfo } = await supabase
            .from("places")
            .select("id, lat, lng")
            .eq("id", place.id)
            .single()

          if (placeInfo) {
            // 좌표 거리 계산
            const distance = Math.sqrt(
              Math.pow(Number(placeInfo.lat) - lat, 2) + Math.pow(Number(placeInfo.lng) - lng, 2)
            )
            // 약 0.001도 = 약 100m 이내면 같은 장소로 간주
            if (distance < 0.001) {
              placeId = placeInfo.id
              break
            }
          }
        }
      }
    }

    // 2. DB에 없으면 새로 생성
    if (!placeId) {
      // 지역 코드 추출
      let areaCode: number | null = null
      if (address) {
        const regionMatch = address.match(
          /(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)/
        )
        const regionMap: Record<string, number> = {
          서울: 1,
          부산: 6,
          대구: 4,
          인천: 2,
          광주: 5,
          대전: 3,
          울산: 7,
          세종: 8,
          경기: 31,
          강원: 32,
          충북: 33,
          충남: 34,
          전북: 37,
          전남: 38,
          경북: 35,
          경남: 36,
          제주: 39,
        }
        if (regionMatch) {
          areaCode = regionMap[regionMatch[1]] || null
        }
      }

      // course_type 자동 설정
      let courseType: ("date" | "travel")[] | null = null
      if (type === "CAFE" || type === "FOOD") {
        courseType = ["date"]
      } else if (type === "VIEW") {
        courseType = ["travel"]
      } else if (type === "MUSEUM") {
        courseType = ["date", "travel"]
      }

      const { data: newPlace, error: createError } = await supabase
        .from("places")
        .insert({
          name,
          lat,
          lng,
          type: type || "ETC",
          rating: 0,
          price_level: 0,
          address: address || null,
          area_code: areaCode,
          course_type: courseType || undefined,
          tour_content_id: null, // 수동 생성된 장소
          tour_content_type_id: null,
        })
        .select("id")
        .single()

      if (createError || !newPlace) {
        return NextResponse.json(
          { error: createError?.message || "장소 생성에 실패했습니다" },
          { status: 500 }
        )
      }

      placeId = newPlace.id
    }

    return NextResponse.json({ place_id: placeId })
  } catch (error) {
    console.error("Error finding or creating place:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "장소 처리 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
