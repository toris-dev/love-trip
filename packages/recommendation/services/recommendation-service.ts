"use server"

import { createClient } from "@lovetrip/api/supabase/server"
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
  try {
    const supabase = await createClient()
    const {
      user1Favorites = [],
      user2Favorites = [],
      preferredTypes = [],
      preferredArea,
      limit = 20,
    } = options
    // 지역 필터가 없으면 각 지역에서 별도로 쿼리 실행하여 균등하게 분배
    if (!preferredArea) {
      // 주요 지역 코드 목록
      const areaCodes = [1, 2, 3, 4, 5, 6, 7, 8, 31, 32, 33, 34, 35, 36, 37, 38, 39]
      // 각 지역에서 충분한 데이터를 가져오기 위해 최소 50개씩 확보
      const placesPerRegion = Math.max(50, Math.ceil(limit / areaCodes.length))

      // 각 지역에서 병렬로 데이터 가져오기 (동시 요청 수 제한)
      const batchSize = 5 // 한 번에 최대 5개 지역만 요청
      const results: Place[][] = []

      for (let i = 0; i < areaCodes.length; i += batchSize) {
        const batch = areaCodes.slice(i, i + batchSize)

        const batchPromises = batch.map(async areaCode => {
          // 재시도 로직 (최대 3번)
          let retries = 3
          let lastError: Error | null = null

          while (retries > 0) {
            try {
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
                lastError = error
                // 네트워크 에러가 아니면 재시도하지 않음
                if (error.code && error.code !== "" && !error.message.includes("fetch")) {
                  console.error(`Error fetching places for area_code ${areaCode}:`, {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code,
                  })
                  return []
                }
                retries--
                if (retries > 0) {
                  // 지수 백오프: 1초, 2초, 4초
                  await new Promise(resolve => setTimeout(resolve, Math.pow(2, 3 - retries) * 1000))
                  continue
                }
                const errorDetails = lastError as unknown as {
                  message?: string
                  details?: string
                  hint?: string
                  code?: string
                }
                console.error(`Error fetching places for area_code ${areaCode} after retries:`, {
                  message: errorDetails.message || lastError.message,
                  details: errorDetails.details,
                  hint: errorDetails.hint,
                  code: errorDetails.code,
                })
                return []
              }

              return (data || []) as Place[]
            } catch (err: unknown) {
              lastError = err instanceof Error ? err : new Error(String(err))
              retries--
              if (retries > 0) {
                // 지수 백오프
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, 3 - retries) * 1000))
                continue
              }
              const errorMessage = err instanceof Error ? err.message : String(err)
              const errorStack = err instanceof Error ? err.stack : undefined
              console.error(`Exception fetching places for area_code ${areaCode}:`, {
                message: errorMessage,
                stack: errorStack,
              })
              return []
            }
          }

          return []
        })

        const batchResults = await Promise.all(batchPromises)
        results.push(...batchResults)
      }
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
      console.error("Recommendation error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: error,
      })
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
    console.error("Failed to get couple recommendations:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      fullError: error,
    })
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
  const supabase = await createClient()
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
 * 개선된 필터링 로직 적용
 */
export async function getThemeRecommendations(
  theme: "로맨틱" | "힐링" | "액티브" | "기념일" | "야경" | "카페투어",
  limit: number = 20
): Promise<Place[]> {
  const supabase = await createClient()

  try {
    let query = supabase.from("places").select("*")

    // 테마별 필터링 강화
    switch (theme) {
      case "로맨틱":
        // 관광지, 문화시설 중에서 높은 평점과 적절한 가격대
        query = query
          .in("type", ["VIEW", "MUSEUM"])
          .in("tour_content_type_id", [12, 14])
          .gte("rating", 4.0) // 4.0 이상 평점
          .lte("price_level", 3) // 가격대 3 이하
        break
      case "힐링":
        // 자연 관광지, 공원, 전망대 등
        query = query
          .in("type", ["VIEW"])
          .eq("tour_content_type_id", 12)
          .or("category1.ilike.%자연%,category1.ilike.%공원%,category1.ilike.%전망%")
        break
      case "액티브":
        // 레포츠, 체험 시설
        query = query
          .eq("tour_content_type_id", 28)
          .or("category1.ilike.%레포츠%,category1.ilike.%체험%,category1.ilike.%액티비티%")
        break
      case "기념일":
        // 특별한 장소, 레스토랑, 문화시설
        query = query
          .in("type", ["VIEW", "MUSEUM", "FOOD"])
          .in("tour_content_type_id", [12, 14, 39])
          .gte("rating", 4.2) // 높은 평점
        break
      case "야경":
        // 야경이 좋은 장소, 타워, 전망대
        query = query
          .in("type", ["VIEW"])
          .or("overview.ilike.%야경%,overview.ilike.%전망%,name.ilike.%타워%,name.ilike.%전망%")
          .gte("rating", 4.0)
        break
      case "카페투어":
        // 카페, 디저트, 브런치
        query = query
          .in("type", ["CAFE", "FOOD"])
          .eq("tour_content_type_id", 39)
          .or("category2.ilike.%카페%,category2.ilike.%디저트%,category2.ilike.%브런치%")
          .gte("rating", 4.0)
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
 * 개선된 알고리즘: 즐겨찾기 패턴 분석 및 유사 장소 추천
 */
export async function getFavoriteBasedRecommendations(
  userId: string,
  limit: number = 20
): Promise<Place[]> {
  const supabase = await createClient()

  try {
    // 사용자의 즐겨찾기 장소 조회
    const { data: favorites, error: favError } = await supabase
      .from("place_favorites")
      .select("place_id")
      .eq("user_id", userId)
      .limit(20) // 더 많은 즐겨찾기 분석

    if (favError) {
      console.error("Failed to get favorites:", favError)
      return []
    }

    if (!favorites || favorites.length === 0) {
      return []
    }

    const favoritePlaceIds = favorites.map((f: { place_id: string }) => f.place_id)

    // 즐겨찾기 장소들의 상세 정보 조회
    const { data: favoritePlaces } = await supabase
      .from("places")
      .select("type, area_code, category1, category2, rating, price_level")
      .in("id", favoritePlaceIds)

    if (!favoritePlaces || favoritePlaces.length === 0) {
      return []
    }

    // 가장 많이 선택된 타입, 지역, 카테고리 찾기
    const typeCounts = favoritePlaces.reduce(
      (acc: Record<string, number>, p: { type: string }) => {
        acc[p.type] = (acc[p.type] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const areaCounts = favoritePlaces.reduce(
      (acc: Record<number, number>, p: { area_code: number | null }) => {
        if (p.area_code) {
          acc[p.area_code] = (acc[p.area_code] || 0) + 1
        }
        return acc
      },
      {} as Record<number, number>
    )

    const categoryCounts = favoritePlaces.reduce(
      (acc: Record<string, number>, p: { category1: string | null }) => {
        if (p.category1) {
          acc[p.category1] = (acc[p.category1] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>
    )

    // 평균 평점과 가격대 계산
    const avgRating =
      favoritePlaces.reduce((sum, p) => sum + Number(p.rating || 0), 0) / favoritePlaces.length
    const avgPriceLevel =
      favoritePlaces.reduce((sum, p) => sum + Number(p.price_level || 0), 0) / favoritePlaces.length

    const preferredType = Object.entries(typeCounts).sort(
      (a, b) => (b[1] as number) - (a[1] as number)
    )[0]?.[0]
    const preferredAreaEntry = Object.entries(areaCounts).sort(
      (a, b) => (b[1] as number) - (a[1] as number)
    )[0]
    const preferredArea = preferredAreaEntry ? Number(preferredAreaEntry[0]) : undefined
    const preferredCategory = Object.entries(categoryCounts).sort(
      (a, b) => (b[1] as number) - (a[1] as number)
    )[0]?.[0]

    // 유사한 장소 추천 (개선된 필터링)
    let query = supabase.from("places").select("*")

    if (preferredType) {
      query = query.eq("type", preferredType)
    }

    if (preferredArea) {
      query = query.eq("area_code", preferredArea)
    }

    if (preferredCategory) {
      query = query.eq("category1", preferredCategory)
    }

    // 평균 평점과 유사한 평점 범위 (0.5점 차이 내)
    query = query.gte("rating", Math.max(0, avgRating - 0.5))
    query = query.lte("rating", Math.min(5, avgRating + 0.5))

    // 가격대 필터 (선택사항)
    if (avgPriceLevel > 0) {
      query = query.lte("price_level", Math.ceil(avgPriceLevel + 1))
    }

    // 이미 즐겨찾기에 있는 장소는 제외
    if (favoritePlaceIds.length > 0) {
      query = query.not("id", "in", `(${favoritePlaceIds.join(",")})`)
    }

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
