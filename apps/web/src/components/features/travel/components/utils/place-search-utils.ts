/**
 * 장소 검색 관련 유틸리티 함수
 */

import { createClient } from "@lovetrip/api/supabase/client"
import type { Database } from "@lovetrip/shared/types/database"

type Place = Database["public"]["Tables"]["places"]["Row"]

/**
 * 검색 쿼리 최적화
 * @param query - 원본 검색어
 * @returns 최적화된 검색어
 */
export function optimizeSearchQuery(query: string): string {
  return query.trim().replace(/\s+/g, " ")
}

/**
 * 장소 검색 API 호출
 * @param query - 검색어
 * @param limit - 결과 제한 (기본: 20)
 * @returns 검색된 장소 배열
 */
export async function searchPlaces(query: string, limit: number = 20): Promise<Place[]> {
  const optimizedQuery = optimizeSearchQuery(query)

  if (!optimizedQuery) {
    return []
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from("places")
    .select("*")
    .or(
      `name.ilike.%${optimizedQuery}%,description.ilike.%${optimizedQuery}%,address.ilike.%${optimizedQuery}%`
    )
    .order("rating", { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`장소 검색 실패: ${error.message}`)
  }

  return data || []
}

/**
 * 검색 결과 필터링
 * @param places - 장소 배열
 * @param filters - 필터 옵션
 * @returns 필터링된 장소 배열
 */
export function filterSearchResults(
  places: Place[],
  filters: {
    minRating?: number
    maxPriceLevel?: number
    types?: string[]
  }
): Place[] {
  return places.filter(place => {
    if (filters.minRating !== undefined && (place.rating ?? 0) < filters.minRating) {
      return false
    }

    if (filters.maxPriceLevel !== undefined && (place.price_level ?? 0) > filters.maxPriceLevel) {
      return false
    }

    if (filters.types && filters.types.length > 0 && !filters.types.includes(place.type)) {
      return false
    }

    return true
  })
}
