import { createClient as createServerClient } from "@lovetrip/api/supabase/server"
import { naverAPIClient, type NaverPlace } from "@lovetrip/api/clients/naver-api-client"
import type { Place } from "@lovetrip/shared/types/course"
import { courseCache } from "./course-cache"
import type { Database } from "@lovetrip/shared/types/database"

type TravelCoursePlace = Database["public"]["Tables"]["travel_course_places"]["Row"]
type UserCoursePlace = Database["public"]["Tables"]["user_course_places"]["Row"]

const CACHE_TTL = 10 * 60 * 1000 // 10분

/**
 * 네이버 Place를 Place 형식으로 변환
 */
function convertNaverToPlace(naverPlace: NaverPlace): Place {
  // 카테고리에서 타입 추출
  const type = inferPlaceTypeFromCategory(naverPlace.category || "")

  return {
    id: naverPlace.id,
    name: naverPlace.name,
    address: naverPlace.address || null,
    lat: naverPlace.lat,
    lng: naverPlace.lng,
    type: type as Place["type"],
    rating: null,
    price_level: null,
    description: null,
    image_url: null,
  }
}

/**
 * 저장된 정보를 Place 형식으로 변환
 */
function convertStoredToPlace(stored: Partial<TravelCoursePlace | UserCoursePlace>): Place {
  return {
    id: stored.place_id || `stored_${Date.now()}_${Math.random()}`,
    name: stored.place_name || "이름 없음",
    address: stored.place_address || null,
    lat: Number(stored.place_lat || 0),
    lng: Number(stored.place_lng || 0),
    type: (stored.place_type as Place["type"]) || "ETC",
    rating: stored.place_rating ? Number(stored.place_rating) : null,
    price_level: stored.place_price_level ? Number(stored.place_price_level) : null,
    description: stored.place_description || null,
    image_url: stored.place_image_url || null,
  }
}

/**
 * 카테고리에서 Place 타입 추론
 */
function inferPlaceTypeFromCategory(category: string): string {
  const lowerCategory = category.toLowerCase()

  if (lowerCategory.includes("카페") || lowerCategory.includes("커피")) {
    return "CAFE"
  }
  if (
    lowerCategory.includes("음식") ||
    lowerCategory.includes("식당") ||
    lowerCategory.includes("레스토랑")
  ) {
    return "FOOD"
  }
  if (
    lowerCategory.includes("관광") ||
    lowerCategory.includes("명소") ||
    lowerCategory.includes("공원")
  ) {
    return "VIEW"
  }
  if (
    lowerCategory.includes("박물관") ||
    lowerCategory.includes("미술관") ||
    lowerCategory.includes("전시")
  ) {
    return "MUSEUM"
  }

  return "ETC"
}

/**
 * 중복 제거 (이름과 좌표 기준)
 */
function deduplicatePlaces(places: Place[]): Place[] {
  const seen = new Set<string>()

  return places.filter(place => {
    // 좌표 기반 키 생성 (소수점 4자리까지)
    const lat = place.lat.toFixed(4)
    const lng = place.lng.toFixed(4)
    const key = `${place.name}_${lat}_${lng}`

    if (seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

/**
 * 저장된 장소 정보 검색
 */
async function searchStoredPlaces(query: string, limit: number): Promise<Place[]> {
  const supabase = await createServerClient()

  // travel_course_places에서 검색
  const { data: travelPlaces } = await supabase
    .from("travel_course_places")
    .select(
      "place_id, place_name, place_address, place_lat, place_lng, place_type, place_rating, place_price_level, place_description, place_image_url"
    )
    .or(`place_name.ilike.%${query}%,place_address.ilike.%${query}%`)
    .limit(limit)

  // user_course_places에서 검색
  const { data: userCoursePlaces } = await supabase
    .from("user_course_places")
    .select(
      "place_id, place_name, place_address, place_lat, place_lng, place_type, place_rating, place_price_level, place_description, place_image_url"
    )
    .or(`place_name.ilike.%${query}%,place_address.ilike.%${query}%`)
    .limit(limit)

  const allStored = [...(travelPlaces || []), ...(userCoursePlaces || [])]

  // 중복 제거 및 Place 형식으로 변환
  const places = deduplicatePlaces(
    allStored
      .filter(
        (p): p is TravelCoursePlace | UserCoursePlace =>
          p !== null &&
          "place_name" in p &&
          p.place_name !== null &&
          "place_lat" in p &&
          p.place_lat !== null &&
          "place_lng" in p &&
          p.place_lng !== null
      )
      .map(p => convertStoredToPlace(p))
  )

  return places.slice(0, limit)
}

/**
 * 저장된 장소 ID로 조회
 */
async function getStoredPlaceById(placeId: string): Promise<Place | null> {
  const supabase = await createServerClient()

  // travel_course_places에서 조회
  const { data: travelPlace } = await supabase
    .from("travel_course_places")
    .select(
      "place_id, place_name, place_address, place_lat, place_lng, place_type, place_rating, place_price_level, place_description, place_image_url"
    )
    .eq("place_id", placeId)
    .limit(1)
    .single()

  if (travelPlace && travelPlace.place_name && travelPlace.place_lat && travelPlace.place_lng) {
    return convertStoredToPlace(travelPlace)
  }

  // user_course_places에서 조회
  const { data: userCoursePlace } = await supabase
    .from("user_course_places")
    .select(
      "place_id, place_name, place_address, place_lat, place_lng, place_type, place_rating, place_price_level, place_description, place_image_url"
    )
    .eq("place_id", placeId)
    .limit(1)
    .single()

  if (
    userCoursePlace &&
    userCoursePlace.place_name &&
    userCoursePlace.place_lat &&
    userCoursePlace.place_lng
  ) {
    return convertStoredToPlace(userCoursePlace)
  }

  return null
}

/**
 * 인기 저장된 장소 조회
 */
async function getPopularStoredPlaces(limit: number): Promise<Place[]> {
  const supabase = await createServerClient()

  // travel_course_places에서 많이 사용된 장소 조회
  const { data: popularPlaces, error } = await supabase
    .from("travel_course_places")
    .select(
      "place_id, place_name, place_address, place_lat, place_lng, place_type, place_rating, place_price_level, place_description, place_image_url"
    )
    .not("place_name", "is", null)
    .not("place_lat", "is", null)
    .not("place_lng", "is", null)
    .limit(limit)

  if (error || !popularPlaces || popularPlaces.length === 0) {
    return []
  }

  // 중복 제거 및 변환
  return deduplicatePlaces(
    popularPlaces
      .filter(
        (p): p is TravelCoursePlace =>
          p !== null &&
          "place_name" in p &&
          p.place_name !== null &&
          "place_lat" in p &&
          p.place_lat !== null &&
          "place_lng" in p &&
          p.place_lng !== null
      )
      .map(p => convertStoredToPlace(p))
  )
}

/**
 * 장소 검색 (하이브리드 방식)
 * 1. 외부 API 우선 조회 (네이버)
 * 2. 없으면 저장된 정보 활용
 */
export async function searchPlaces(
  query: string,
  options?: {
    limit?: number
    preferExternal?: boolean
  }
): Promise<Place[]> {
  const limit = options?.limit || 20
  const preferExternal = options?.preferExternal !== false

  // 캐시 확인
  const cacheKey = `place-search:${query}:${limit}`
  const cached = courseCache.get<Place[]>(cacheKey)
  if (cached) {
    return cached
  }

  const results: Place[] = []

  // 1. 외부 API 조회 (우선)
  if (preferExternal) {
    try {
      // 네이버 Places API
      const naverPlaces = await naverAPIClient.searchPlaces(query, limit)
      const convertedNaverPlaces = naverPlaces.map(np => convertNaverToPlace(np))
      results.push(...convertedNaverPlaces)
    } catch (error) {
      console.error("External API search failed:", error)
      // Fallback to stored data
    }
  }

  // 2. 저장된 정보 활용 (결과가 부족한 경우)
  if (results.length < limit) {
    try {
      const storedPlaces = await searchStoredPlaces(query, limit - results.length)
      results.push(...storedPlaces)
    } catch (error) {
      console.error("Stored places search failed:", error)
    }
  }

  // 중복 제거 (이름과 좌표 기준)
  const uniqueResults = deduplicatePlaces(results.slice(0, limit))

  // 캐시 저장
  courseCache.set(cacheKey, uniqueResults, CACHE_TTL)

  return uniqueResults
}

/**
 * 장소 ID로 조회
 */
export async function getPlaceById(placeId: string): Promise<Place | null> {
  // 캐시 확인
  const cacheKey = `place:${placeId}`
  const cached = courseCache.get<Place>(cacheKey)
  if (cached) {
    return cached
  }

  // 저장된 정보에서 조회
  const storedPlace = await getStoredPlaceById(placeId)
  if (storedPlace) {
    courseCache.set(cacheKey, storedPlace, CACHE_TTL)
    return storedPlace
  }

  // 외부 API는 ID로 직접 조회 불가 (검색으로 대체)
  return null
}

/**
 * 장소 목록 조회 (기본)
 * 저장된 정보 활용
 */
export async function getPlaces(options?: {
  limit?: number
  areaCode?: string
  contentTypeId?: string
}): Promise<Place[]> {
  const limit = options?.limit || 50

  // 저장된 정보에서 인기 장소 조회
  return getPopularStoredPlaces(limit)
}

// 기존 코드와의 호환성을 위한 객체 export
export const placeService = {
  searchPlaces,
  getPlaceById,
  getPlaces,
}
