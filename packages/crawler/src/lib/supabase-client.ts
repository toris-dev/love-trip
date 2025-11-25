import { createClient } from "@supabase/supabase-js"
import { config } from "../config.js"
import type { PlaceInsertData } from "../types/tour-api.js"
import type { CourseInsertData } from "../types/course.js"
import { logStream } from "../log-stream.js"

// 타임아웃을 위한 AbortController 생성 헬퍼
function createTimeoutSignal(timeoutMs: number): AbortSignal {
  const controller = new AbortController()
  setTimeout(() => controller.abort(), timeoutMs)
  return controller.signal
}

export const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  db: {
    schema: "public",
  },
  global: {
    fetch: async (url, options = {}) => {
      const timeoutMs = 60000 // 60초로 증가
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        })
        clearTimeout(timeoutId)
        return response
      } catch (error: any) {
        clearTimeout(timeoutId)
        // 타임아웃 오류인 경우 더 명확한 메시지
        if (error.name === "AbortError" || controller.signal.aborted) {
          throw new Error(`Request timeout after ${timeoutMs}ms: ${url}`)
        }
        throw error
      }
    },
  },
})

/**
 * 재시도 헬퍼 함수 (exponential backoff)
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 5, // 3회 → 5회로 증가
  baseDelay: number = 2000 // 1초 → 2초로 증가
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error

      // 네트워크 오류나 타임아웃 오류인 경우에만 재시도
      const errorMessage = error?.message || String(error)
      const isRetryableError =
        errorMessage.includes("fetch failed") ||
        errorMessage.includes("timeout") ||
        errorMessage.includes("ECONNRESET") ||
        errorMessage.includes("ETIMEDOUT") ||
        errorMessage.includes("AbortError") ||
        error?.code === "ECONNRESET" ||
        error?.code === "ETIMEDOUT" ||
        error?.name === "AbortError"

      if (!isRetryableError || attempt === maxRetries - 1) {
        // 마지막 시도 실패 시 상세 에러 로깅
        if (attempt === maxRetries - 1) {
          logStream.error(`재시도 실패 (${maxRetries}회 시도): ${errorMessage}`)
        }
        throw error
      }

      // exponential backoff: 2초, 4초, 8초, 16초, 32초
      const delay = baseDelay * Math.pow(2, attempt)
      logStream.warning(
        `재시도 중... (${attempt + 1}/${maxRetries}) - ${delay}ms 후 재시도 (오류: ${errorMessage.substring(0, 100)})`
      )
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError || new Error("Unknown error")
}

/**
 * Tour API 날짜 형식(YYYYMMDDHHmmss)을 PostgreSQL timestamp 형식으로 변환
 */
function parseTourApiDate(dateString: string | undefined | null): string | null {
  if (!dateString || dateString.length !== 14) {
    return null
  }

  try {
    // YYYYMMDDHHmmss 형식을 YYYY-MM-DD HH:mm:ss 형식으로 변환
    const year = dateString.substring(0, 4)
    const month = dateString.substring(4, 6)
    const day = dateString.substring(6, 8)
    const hour = dateString.substring(8, 10)
    const minute = dateString.substring(10, 12)
    const second = dateString.substring(12, 14)

    // 유효성 검사
    const monthNum = parseInt(month, 10)
    const dayNum = parseInt(day, 10)
    const hourNum = parseInt(hour, 10)
    const minuteNum = parseInt(minute, 10)
    const secondNum = parseInt(second, 10)

    if (
      monthNum < 1 ||
      monthNum > 12 ||
      dayNum < 1 ||
      dayNum > 31 ||
      hourNum > 23 ||
      minuteNum > 59 ||
      secondNum > 59
    ) {
      logStream.warning(`Invalid date format: ${dateString}`)
      return null
    }

    return `${year}-${month}-${day} ${hour}:${minute}:${second}`
  } catch (error) {
    logStream.warning(`Failed to parse date: ${dateString}`, error)
    return null
  }
}

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

  // 타입에 따라 course_type 자동 설정
  const placeType = typeMapping[contentTypeId] || "ETC"
  let courseType: ("travel" | "date")[] | null = null

  // 데이트 장소: 카페, 음식점, 쇼핑, 문화시설(일부)
  // 여행 장소: 관광지, 문화시설, 레포츠, 숙박, 여행코스
  if (
    placeType === "VIEW" ||
    contentTypeId === 25 ||
    contentTypeId === 28 ||
    contentTypeId === 32
  ) {
    // 관광지, 여행코스, 레포츠, 숙박은 여행 코스(1박 2일 이상)에 적합
    courseType = ["travel"]
  } else if (placeType === "CAFE" || placeType === "FOOD" || contentTypeId === 38) {
    // 카페, 맛집, 쇼핑은 데이트 코스(당일)에 적합
    courseType = ["date"]
  } else if (placeType === "MUSEUM" || contentTypeId === 14) {
    // 문화시설은 데이트와 여행 둘 다 가능
    courseType = ["date", "travel"]
  }
  // ETC 타입은 course_type을 null로 두어 나중에 수동 설정 가능

  return {
    tour_content_id: item.contentid,
    tour_content_type_id: contentTypeId,
    name: item.title,
    lat,
    lng,
    type: placeType,
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
    created_time: parseTourApiDate(item.createdtime),
    modified_time: parseTourApiDate(item.modifiedtime),
    course_type: courseType || undefined, // null 대신 undefined 사용
  }
}

/**
 * 장소를 Supabase에 저장 (중복 체크)
 * tour_content_id를 기준으로 중복 체크하여 없으면 삽입, 있으면 업데이트
 */
export async function upsertPlace(
  placeData: PlaceInsertData
): Promise<{ id: string; isNew: boolean }> {
  return retryWithBackoff(async () => {
    try {
      // 먼저 기존 데이터 확인
      const { data: existing, error: checkError } = await supabase
        .from("places")
        .select("id, tour_content_id")
        .eq("tour_content_id", placeData.tour_content_id)
        .maybeSingle()

      // 네트워크 오류인 경우 재시도를 위해 throw
      if (checkError) {
        const errorMessage = checkError.message || String(checkError)
        if (
          errorMessage.includes("fetch failed") ||
          errorMessage.includes("timeout") ||
          errorMessage.includes("ECONNRESET") ||
          checkError.code === "ECONNRESET"
        ) {
          throw checkError
        }
        // PGRST116은 "결과 없음"이므로 정상, 다른 오류는 무시하고 계속 진행
      }

      const isNew = !existing

      if (existing) {
        // 기존 데이터가 있으면 업데이트
        const { data, error } = await supabase
          .from("places")
          .update(placeData)
          .eq("id", existing.id)
          .select("id")
          .single()

        if (error) {
          const errorMessage = error.message || String(error)
          // 네트워크 오류인 경우 재시도
          if (
            errorMessage.includes("fetch failed") ||
            errorMessage.includes("timeout") ||
            errorMessage.includes("ECONNRESET")
          ) {
            throw error
          }
          throw new Error(`Failed to update place: ${errorMessage}`)
        }

        return { id: data.id, isNew: false }
      } else {
        // 새 데이터이면 삽입
        const { data, error } = await supabase
          .from("places")
          .insert(placeData)
          .select("id")
          .single()

        if (error) {
          const errorMessage = error.message || String(error)
          // 네트워크 오류인 경우 재시도
          if (
            errorMessage.includes("fetch failed") ||
            errorMessage.includes("timeout") ||
            errorMessage.includes("ECONNRESET")
          ) {
            throw error
          }

          // 중복 키 오류인 경우 (unique constraint가 나중에 추가된 경우)
          if (
            errorMessage.includes("duplicate key") ||
            errorMessage.includes("unique constraint") ||
            errorMessage.includes("duplicate key value")
          ) {
            // 다시 조회해서 업데이트 시도
            const { data: existingData, error: recheckError } = await supabase
              .from("places")
              .select("id")
              .eq("tour_content_id", placeData.tour_content_id)
              .single()

            if (recheckError) {
              throw new Error(`Failed to upsert place: ${errorMessage}`)
            }

            const { data: updateData, error: updateError } = await supabase
              .from("places")
              .update(placeData)
              .eq("id", existingData.id)
              .select("id")
              .single()

            if (updateError) {
              throw new Error(`Failed to upsert place: ${updateError.message}`)
            }

            return { id: updateData.id, isNew: false }
          }

          throw new Error(`Failed to insert place: ${errorMessage}`)
        }

        return { id: data.id, isNew: true }
      }
    } catch (error: any) {
      // 네트워크 오류를 명확히 식별하여 재시도
      const errorMessage = error?.message || String(error)
      if (
        errorMessage.includes("fetch failed") ||
        errorMessage.includes("timeout") ||
        errorMessage.includes("ECONNRESET") ||
        error?.name === "AbortError" ||
        error?.code === "ECONNRESET"
      ) {
        throw error // 재시도 로직으로 전달
      }
      throw error
    }
  })
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
  let consecutiveErrors = 0
  const MAX_CONSECUTIVE_ERRORS = 10 // 연속 오류 10개 이상 시 일시 중지

  for (let i = 0; i < places.length; i++) {
    const place = places[i]
    try {
      const result = await upsertPlace(place)
      if (result.isNew) {
        inserted++
      } else {
        updated++
      }
      consecutiveErrors = 0 // 성공 시 연속 오류 카운터 리셋
    } catch (error: any) {
      consecutiveErrors++
      errors++

      // 네트워크 오류인 경우에만 상세 로그 출력 (너무 많은 로그 방지)
      const isNetworkError =
        error?.message?.includes("fetch failed") ||
        error?.message?.includes("timeout") ||
        error?.message?.includes("ECONNRESET")

      if (isNetworkError && consecutiveErrors <= 5) {
        logStream.error(`Failed to upsert place ${place.tour_content_id}: ${error.message}`)
      }

      // 연속 오류가 너무 많으면 일시 중지 후 재시도
      if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        logStream.warning(`연속 오류 ${consecutiveErrors}개 발생 - 5초 대기 후 계속 진행...`)
        await new Promise(resolve => setTimeout(resolve, 5000))
        consecutiveErrors = 0 // 리셋
      }

      // 각 항목 처리 후 짧은 딜레이 (API 부하 방지)
      if (i < places.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 50))
      }
    }
  }

  return { inserted, updated, errors }
}

/**
 * 지역별 코스 요약 정보 생성 및 저장
 */
export async function upsertCourseSummary(
  region: string,
  courseType: "travel" | "date",
  places: PlaceInsertData[],
  areaCode: number | null,
  sigunguCode: number | null
): Promise<void> {
  if (places.length === 0) return

  // 코스 ID 생성 (지역명 + 코스 타입)
  const courseId = `${courseType}-${region}-${areaCode || "unknown"}`
    .toLowerCase()
    .replace(/\s+/g, "-")

  // 대표 이미지 선택 (첫 번째 장소의 이미지)
  const representativeImage = places.find(p => p.image_url)?.image_url || null

  // 코스 설명 생성
  const placeTypes = [...new Set(places.map(p => p.type))]
  const typeNames: Record<string, string> = {
    CAFE: "카페",
    FOOD: "맛집",
    VIEW: "전망",
    MUSEUM: "박물관",
    ETC: "기타",
  }
  const typeDescription = placeTypes.map(t => typeNames[t] || t).join(", ")

  const courseData: CourseInsertData = {
    id: courseId,
    title: `${region} ${courseType === "travel" ? "여행" : "데이트"} 코스`,
    region,
    course_type: courseType,
    description: `${region}의 ${typeDescription}을 포함한 ${courseType === "travel" ? "여행" : "데이트"} 코스입니다.`,
    image_url: representativeImage,
    place_count: places.length,
    area_code: areaCode,
    sigungu_code: sigunguCode,
  }

  // 코스 정보를 places 테이블에 메타데이터로 저장하거나 별도 테이블에 저장
  // 현재는 places 테이블에 course_title 필드가 없으므로,
  // 추후 courses 테이블을 만들거나 places 테이블에 course_title 필드를 추가해야 함
  // 일단은 로그만 출력
  logStream.info(`  📍 코스 요약: ${courseData.title} (${courseData.place_count}개 장소)`)
}
