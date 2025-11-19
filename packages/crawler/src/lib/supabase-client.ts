import { createClient } from "@supabase/supabase-js"
import { config } from "../config.js"
import type { PlaceInsertData } from "../types/tour-api.js"

export const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

/**
 * Tour API 아이템을 Supabase places 테이블 형식으로 변환
 */
export function transformTourItemToPlace(item: {
  contentid: string
  contenttypeid: string
  title: string
  addr1?: string
  addr2?: string
  areacode?: string
  sigungucode?: string
  mapx?: string
  mapy?: string
  tel?: string
  firstimage?: string
  firstimage2?: string
  homepage?: string
  zipcode?: string
  overview?: string
  cat1?: string
  cat2?: string
  cat3?: string
  mlevel?: string
  createdtime?: string
  modifiedtime?: string
  usetime?: string
  restdate?: string
}): PlaceInsertData {
  // contenttypeid를 type으로 매핑
  const contentTypeId = parseInt(item.contenttypeid)
  const typeMapping: Record<number, "CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC"> = {
    12: "VIEW", // 관광지
    14: "MUSEUM", // 문화시설
    15: "ETC", // 축제공연행사
    25: "ETC", // 여행코스
    28: "ETC", // 레포츠
    32: "ETC", // 숙박
    38: "ETC", // 쇼핑
    39: "FOOD", // 음식점
  }

  // 좌표 변환 (Tour API는 문자열로 제공)
  const lng = item.mapx ? parseFloat(item.mapx) : 0
  const lat = item.mapy ? parseFloat(item.mapy) : 0

  // 주소 합치기
  const address = [item.addr1, item.addr2].filter(Boolean).join(" ") || null

  // 운영시간 (usetime과 restdate 결합)
  const openingHours = [item.usetime, item.restdate].filter(Boolean).join(" / ") || null

  return {
    tour_content_id: item.contentid,
    tour_content_type_id: contentTypeId,
    name: item.title,
    lat,
    lng,
    type: typeMapping[contentTypeId] || "ETC",
    rating: 0, // Tour API에는 평점이 없으므로 기본값
    price_level: 0, // Tour API에는 가격대 정보가 없으므로 기본값
    description: null, // overview를 사용
    image_url: item.firstimage || null,
    image_url2: item.firstimage2 || null,
    address,
    phone: item.tel || null,
    opening_hours: openingHours,
    homepage: item.homepage || null,
    zipcode: item.zipcode || null,
    overview: item.overview || null,
    area_code: item.areacode ? parseInt(item.areacode) : null,
    sigungu_code: item.sigungucode ? parseInt(item.sigungucode) : null,
    category1: item.cat1 || null,
    category2: item.cat2 || null,
    category3: item.cat3 || null,
    map_level: item.mlevel ? parseInt(item.mlevel) : null,
    created_time: item.createdtime || null,
    modified_time: item.modifiedtime || null,
  }
}

/**
 * 장소를 Supabase에 저장 (중복 체크)
 */
export async function upsertPlace(placeData: PlaceInsertData): Promise<{ id: string; isNew: boolean }> {
  // tour_content_id로 기존 데이터 확인
  const { data: existing } = await supabase
    .from("places")
    .select("id")
    .eq("tour_content_id", placeData.tour_content_id)
    .single()

  if (existing) {
    // 업데이트
    const { data, error } = await supabase
      .from("places")
      .update(placeData)
      .eq("id", existing.id)
      .select("id")
      .single()

    if (error) {
      throw new Error(`Failed to update place: ${error.message}`)
    }

    return { id: data.id, isNew: false }
  } else {
    // 새로 삽입
    const { data, error } = await supabase
      .from("places")
      .insert(placeData)
      .select("id")
      .single()

    if (error) {
      throw new Error(`Failed to insert place: ${error.message}`)
    }

    return { id: data.id, isNew: true }
  }
}

/**
 * 여러 장소를 배치로 저장
 */
export async function upsertPlacesBatch(
  places: PlaceInsertData[]
): Promise<{ inserted: number; updated: number; errors: number }> {
  let inserted = 0
  let updated = 0
  let errors = 0

  for (const place of places) {
    try {
      const result = await upsertPlace(place)
      if (result.isNew) {
        inserted++
      } else {
        updated++
      }
    } catch (error) {
      console.error(`Failed to upsert place ${place.tour_content_id}:`, error)
      errors++
    }
  }

  return { inserted, updated, errors }
}

