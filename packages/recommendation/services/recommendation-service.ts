"use client"

import { createClient } from "@lovetrip/api/supabase/client"
import type { Place } from "@lovetrip/shared/types"

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
 */
export async function getCoupleRecommendations(
  options: CoupleRecommendationOptions = {}
): Promise<Place[]> {
  const supabase = createClient()
  const {
    user1Favorites = [],
    user2Favorites = [],
    preferredTypes = [],
    preferredArea,
    limit = 20,
  } = options

  try {
    // 지역 필터가 없으면 각 지역에서 별도로 쿼리 실행하여 균등하게 분배
    if (!preferredArea) {
      // 주요 지역 코드 목록
      const areaCodes = [1, 2, 3, 4, 5, 6, 7, 8, 31, 32, 33, 34, 35, 36, 37, 38, 39]
      // 각 지역에서 충분한 데이터를 가져오기 위해 최소 50개씩 확보
      const placesPerRegion = Math.max(50, Math.ceil(limit / areaCodes.length))

      // 각 지역에서 병렬로 데이터 가져오기
      const promises = areaCodes.map(async areaCode => {
        let query = supabase.from("places").select("*").eq("area_code", areaCode)

        // 타입 필터
        if (preferredTypes.length > 0) {
          query = query.in("type", preferredTypes)
        } else {
          query = query.in("type", ["VIEW", "MUSEUM", "CAFE", "FOOD"])
        }

        query = query.order("rating", { ascending: false }).limit(placesPerRegion)

        const { data, error } = await query

        if (error) {
          console.error(`Error fetching places for area_code ${areaCode}:`, error)
          return []
        }

        return (data || []) as Place[]
      })

      const results = await Promise.all(promises)
      const data = results.flat()

      // 즐겨찾기 장소가 있으면 우선순위 조정
      const allFavorites = [...user1Favorites, ...user2Favorites]
      let result = data

      if (allFavorites.length > 0) {
        const favoritePlaces = result.filter(p => allFavorites.includes(p.id))
        const otherPlaces = result.filter(p => !allFavorites.includes(p.id))
        result = [...favoritePlaces, ...otherPlaces]
      }

      return result.slice(0, limit)
    }

    // 지역 필터가 있으면 기존 방식 사용
    let query = supabase.from("places").select("*").eq("area_code", preferredArea)

    // 타입 필터
    if (preferredTypes.length > 0) {
      query = query.in("type", preferredTypes)
    }

    // 기본적으로 관광지와 문화시설 우선 (커플 데이트에 적합)
    if (preferredTypes.length === 0) {
      query = query.in("type", ["VIEW", "MUSEUM", "CAFE", "FOOD"])
    }

    query = query.order("rating", { ascending: false })

    const { data, error } = await query.limit(limit)

    if (error) {
      console.error("Recommendation error:", error)
      return []
    }

    if (!data) {
      return []
    }

    // 즐겨찾기 장소가 있으면 우선순위 조정
    const allFavorites = [...user1Favorites, ...user2Favorites]
    let result = data as Place[]

    if (allFavorites.length > 0) {
      const favoritePlaces = result.filter(p => allFavorites.includes(p.id))
      const otherPlaces = result.filter(p => !allFavorites.includes(p.id))
      result = [...favoritePlaces, ...otherPlaces]
    }

    return result.slice(0, limit)
  } catch (error) {
    console.error("Failed to get couple recommendations:", error)
    return []
  }
}

/**
 * 지역 기반 추천 장소 조회
 */
export async function getAreaRecommendations(
  areaCode: number,
  filters: RecommendationFilters = {}
): Promise<Place[]> {
  const supabase = createClient()
  const { contentTypeId, category1, minRating, maxPriceLevel, limit = 20 } = filters

  try {
    let query = supabase.from("places").select("*").eq("area_code", areaCode)

    if (contentTypeId) {
      query = query.eq("tour_content_type_id", contentTypeId)
    }

    if (category1) {
      query = query.eq("category1", category1)
    }

    if (minRating !== undefined) {
      query = query.gte("rating", minRating)
    }

    if (maxPriceLevel !== undefined) {
      query = query.lte("price_level", maxPriceLevel)
    }

    const { data, error } = await query.order("rating", { ascending: false }).limit(limit)

    if (error) {
      console.error("Area recommendation error:", error)
      return []
    }

    return (data || []) as Place[]
  } catch (error) {
    console.error("Failed to get area recommendations:", error)
    return []
  }
}

/**
 * 테마별 추천 장소 조회
 */
export async function getThemeRecommendations(
  theme: "로맨틱" | "힐링" | "액티브" | "기념일" | "야경" | "카페투어",
  limit: number = 20
): Promise<Place[]> {
  const supabase = createClient()

  try {
    let query = supabase.from("places").select("*")

    // 테마별 필터링
    switch (theme) {
      case "로맨틱":
        query = query.in("type", ["VIEW", "MUSEUM"]).in("tour_content_type_id", [12, 14]) // 관광지, 문화시설
        break
      case "힐링":
        query = query.in("type", ["VIEW"]).eq("tour_content_type_id", 12) // 관광지
        break
      case "액티브":
        query = query.eq("tour_content_type_id", 28) // 레포츠
        break
      case "기념일":
        query = query
          .in("type", ["VIEW", "MUSEUM", "FOOD"])
          .in("tour_content_type_id", [12, 14, 39])
        break
      case "야경":
        query = query
          .in("type", ["VIEW"])
          .ilike("overview", "%야경%")
          .or("name.ilike.%타워%,name.ilike.%전망%")
        break
      case "카페투어":
        query = query.in("type", ["CAFE", "FOOD"]).eq("tour_content_type_id", 39)
        break
    }

    const { data, error } = await query.order("rating", { ascending: false }).limit(limit)

    if (error) {
      console.error("Theme recommendation error:", error)
      return []
    }

    return (data || []) as Place[]
  } catch (error) {
    console.error("Failed to get theme recommendations:", error)
    return []
  }
}

/**
 * 사용자 즐겨찾기 기반 추천
 */
export async function getFavoriteBasedRecommendations(
  userId: string,
  limit: number = 20
): Promise<Place[]> {
  const supabase = createClient()

  try {
    // 사용자의 즐겨찾기 장소 조회
    const { data: favorites, error: favError } = await supabase
      .from("place_favorites")
      .select("place_id")
      .eq("user_id", userId)
      .limit(10)

    if (favError) {
      console.error("Failed to get favorites:", favError)
      return []
    }

    if (!favorites || favorites.length === 0) {
      return []
    }

    const favoritePlaceIds = favorites.map(f => f.place_id)

    // 즐겨찾기 장소들의 타입과 지역 분석
    const { data: favoritePlaces } = await supabase
      .from("places")
      .select("type, area_code, category1")
      .in("id", favoritePlaceIds)

    if (!favoritePlaces || favoritePlaces.length === 0) {
      return []
    }

    // 가장 많이 선택된 타입과 지역 찾기
    const typeCounts = favoritePlaces.reduce(
      (acc, p) => {
        acc[p.type] = (acc[p.type] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const areaCounts = favoritePlaces.reduce(
      (acc, p) => {
        if (p.area_code) {
          acc[p.area_code] = (acc[p.area_code] || 0) + 1
        }
        return acc
      },
      {} as Record<number, number>
    )

    const preferredType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
    const preferredArea = Object.entries(areaCounts).sort((a, b) => b[1] - a[1])[0]?.[0]

    // 유사한 장소 추천
    let query = supabase.from("places").select("*")

    if (preferredType) {
      query = query.eq("type", preferredType)
    }

    if (preferredArea) {
      query = query.eq("area_code", preferredArea)
    }

    // 이미 즐겨찾기에 있는 장소는 제외
    query = query.not("id", "in", `(${favoritePlaceIds.join(",")})`)

    const { data, error } = await query.order("rating", { ascending: false }).limit(limit)

    if (error) {
      console.error("Favorite-based recommendation error:", error)
      return []
    }

    return (data || []) as Place[]
  } catch (error) {
    console.error("Failed to get favorite-based recommendations:", error)
    return []
  }
}
