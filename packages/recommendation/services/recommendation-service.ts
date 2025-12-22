"use server"

import type { Place } from "@lovetrip/shared/types"
import { placeService } from "@lovetrip/planner/services/place-service"
import { createClient } from "@lovetrip/api/supabase/server"

export interface RecommendationFilters {
  areaCode?: number
  contentTypeId?: number
  category1?: string
  category2?: string
  minRating?: number
  maxPriceLevel?: number
  limit?: number
}

export interface CoupleRecommendationOptions {
  user1Favorites?: string[] // place IDs
  user2Favorites?: string[] // place IDs
  preferredTypes?: ("CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC")[]
  preferredArea?: number
  limit?: number
}

/**
 * 커플을 위한 추천 장소 조회
 * 선호 타입과 지역을 기반으로 추천
 */
export async function getCoupleRecommendations(
  options: CoupleRecommendationOptions = {}
): Promise<Place[]> {
  const limit = options.limit || 50

  // 지역 기반 추천
  if (options.preferredArea) {
    const areaPlaces = await placeService.getPlaces({
      limit,
      areaCode: String(options.preferredArea),
    })

    // 타입 필터링
    if (options.preferredTypes && options.preferredTypes.length > 0) {
      return areaPlaces.filter(place => options.preferredTypes!.includes(place.type))
    }

    return areaPlaces
  }

  // 타입별 추천
  if (options.preferredTypes && options.preferredTypes.length > 0) {
    // 각 타입별로 장소 조회
    const allPlaces: Place[] = []
    for (const type of options.preferredTypes) {
      const typePlaces = await placeService.getPlaces({
        limit: Math.ceil(limit / options.preferredTypes.length),
      })
      const filtered = typePlaces.filter(p => p.type === type)
      allPlaces.push(...filtered)
    }

    return allPlaces.slice(0, limit)
  }

  // 기본 추천 (인기 장소)
  return placeService.getPlaces({ limit })
}

/**
 * 지역 기반 추천 장소 조회
 */
export async function getAreaRecommendations(
  areaCode: number,
  filters: RecommendationFilters = {}
): Promise<Place[]> {
  const limit = filters.limit || 50

  const places = await placeService.getPlaces({
    limit,
    areaCode: String(areaCode),
    contentTypeId: filters.contentTypeId ? String(filters.contentTypeId) : undefined,
  })

  // 추가 필터링
  let filtered = places

  if (filters.minRating !== undefined) {
    filtered = filtered.filter(p => (p.rating || 0) >= filters.minRating!)
  }

  if (filters.maxPriceLevel !== undefined) {
    filtered = filtered.filter(p => (p.price_level || 0) <= filters.maxPriceLevel!)
  }

  return filtered
}

/**
 * 테마별 추천 장소 조회
 */
export async function getThemeRecommendations(
  theme: "로맨틱" | "힐링" | "액티브" | "기념일" | "야경" | "카페투어",
  limit: number = 20
): Promise<Place[]> {
  // 테마별 타입 매핑
  const themeTypeMap: Record<string, ("CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC")[]> = {
    로맨틱: ["VIEW", "CAFE", "FOOD"],
    힐링: ["VIEW", "MUSEUM"],
    액티브: ["VIEW", "MUSEUM"],
    기념일: ["VIEW", "FOOD", "CAFE"],
    야경: ["VIEW"],
    카페투어: ["CAFE"],
  }

  const types = themeTypeMap[theme] || ["VIEW", "CAFE", "FOOD"]

  // 각 타입별로 장소 조회
  const allPlaces: Place[] = []
  for (const type of types) {
    const typePlaces = await placeService.getPlaces({ limit: Math.ceil(limit / types.length) })
    const filtered = typePlaces.filter(p => p.type === type)
    allPlaces.push(...filtered)
  }

  return allPlaces.slice(0, limit)
}

/**
 * 사용자 즐겨찾기 기반 추천
 * 즐겨찾기한 장소와 유사한 장소 추천
 */
export async function getFavoriteBasedRecommendations(
  userId: string,
  limit: number = 20
): Promise<Place[]> {
  const supabase = await createClient()

  // 사용자의 즐겨찾기 장소 조회
  const { data: favorites } = await supabase
    .from("place_favorites")
    .select("place_id")
    .eq("user_id", userId)
    .limit(10)

  if (!favorites || favorites.length === 0) {
    // 즐겨찾기가 없으면 기본 추천
    return placeService.getPlaces({ limit })
  }

  // 즐겨찾기한 장소의 타입 분석
  const favoritePlaceIds = favorites.map(f => f.place_id).filter(Boolean) as string[]

  if (favoritePlaceIds.length === 0) {
    return placeService.getPlaces({ limit })
  }

  // 즐겨찾기 장소 정보 조회
  const favoritePlaces: Place[] = []
  for (const placeId of favoritePlaceIds.slice(0, 5)) {
    const place = await placeService.getPlaceById(placeId)
    if (place) {
      favoritePlaces.push(place)
    }
  }

  if (favoritePlaces.length === 0) {
    return placeService.getPlaces({ limit })
  }

  // 가장 많이 즐겨찾기한 타입 찾기
  const typeCount: Record<string, number> = {}
  favoritePlaces.forEach(place => {
    typeCount[place.type] = (typeCount[place.type] || 0) + 1
  })

  const preferredType = Object.entries(typeCount).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0] as Place["type"]

  // 해당 타입의 장소 추천
  const recommendations = await placeService.getPlaces({ limit })
  const filtered = recommendations.filter(p => p.type === preferredType)

  return filtered.slice(0, limit)
}
