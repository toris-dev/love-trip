/**
 * 여행 경로 최적화 유틸리티
 * 하버사인 공식을 사용한 거리 계산 및 최적 경로 찾기
 *
 * @module route-optimizer
 */

import type { Place } from "@lovetrip/shared/types"

/**
 * 좌표 인터페이스
 */
interface Coordinate {
  lat: number
  lng: number
}

/**
 * 지구 반지름 (km)
 */
const EARTH_RADIUS_KM = 6371

/**
 * 도(degree)를 라디안으로 변환
 * @param degrees - 도 단위 각도
 * @returns 라디안 단위 각도
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * 하버사인 공식을 사용하여 두 지점 간의 거리 계산 (km)
 *
 * @param coord1 - 첫 번째 좌표
 * @param coord2 - 두 번째 좌표
 * @returns 두 지점 간의 거리 (km)
 *
 * @example
 * ```typescript
 * const distance = calculateDistance(
 *   { lat: 37.5665, lng: 126.978 },
 *   { lat: 35.1796, lng: 129.0756 }
 * )
 * // 약 325km
 * ```
 */
export function calculateDistance(coord1: Coordinate, coord2: Coordinate): number {
  const dLat = toRadians(coord2.lat - coord1.lat)
  const dLng = toRadians(coord2.lng - coord1.lng)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.lat)) *
      Math.cos(toRadians(coord2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS_KM * c
}

/**
 * 시작점을 기준으로 장소들을 거리 순으로 정렬
 * Nearest Neighbor 휴리스틱 사용
 */
export function optimizeRoute(startPlace: Place, places: Place[]): Place[] {
  if (places.length === 0) return []

  const unvisited = [...places]
  const route: Place[] = []
  let current = startPlace

  while (unvisited.length > 0) {
    // 현재 위치에서 가장 가까운 장소 찾기
    let nearestIndex = 0
    let nearestDistance = calculateDistance(
      { lat: Number(current.lat), lng: Number(current.lng) },
      { lat: Number(unvisited[0].lat), lng: Number(unvisited[0].lng) }
    )

    for (let i = 1; i < unvisited.length; i++) {
      const distance = calculateDistance(
        { lat: Number(current.lat), lng: Number(current.lng) },
        { lat: Number(unvisited[i].lat), lng: Number(unvisited[i].lng) }
      )

      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestIndex = i
      }
    }

    // 가장 가까운 장소를 경로에 추가
    const nearest = unvisited.splice(nearestIndex, 1)[0]
    route.push(nearest)
    current = nearest
  }

  return route
}

/**
 * 여러 장소의 총 이동 거리 계산
 */
export function calculateTotalDistance(places: Place[]): number {
  if (places.length < 2) return 0

  let totalDistance = 0
  for (let i = 0; i < places.length - 1; i++) {
    const distance = calculateDistance(
      { lat: Number(places[i].lat), lng: Number(places[i].lng) },
      { lat: Number(places[i + 1].lat), lng: Number(places[i + 1].lng) }
    )
    totalDistance += distance
  }

  return totalDistance
}

/**
 * 지역별로 장소를 그룹화
 * @param places - 장소 배열
 * @returns 지역별로 그룹화된 Map
 */
function groupPlacesByRegion(places: Place[]): Map<string, Place[]> {
  const regionMap = new Map<string, Place[]>()

  places.forEach(place => {
    const region = place.area_code?.toString() || "기타"

    if (!regionMap.has(region)) {
      regionMap.set(region, [])
    }

    regionMap.get(region)!.push(place)
  })

  return regionMap
}

/**
 * 지역의 평균 좌표 계산
 * @param places - 지역 내 장소 배열
 * @returns 평균 좌표
 */
function calculateAverageCoordinate(places: Place[]): { lat: number; lng: number } {
  const totalLat = places.reduce((sum, p) => sum + Number(p.lat), 0)
  const totalLng = places.reduce((sum, p) => sum + Number(p.lng), 0)

  return {
    lat: totalLat / places.length,
    lng: totalLng / places.length,
  }
}

/**
 * 지역별로 장소를 그룹화하고 각 그룹 내에서 최적 경로 계산
 *
 * @param places - 전체 장소 배열
 * @returns 지역별 최적화된 경로 Map (key: 지역 코드, value: 최적화된 장소 배열)
 *
 * @example
 * ```typescript
 * const routes = optimizeRoutesByRegion(allPlaces)
 * const seoulRoute = routes.get("1") // 서울 지역 최적 경로
 * ```
 */
export function optimizeRoutesByRegion(places: Place[]): Map<string, Place[]> {
  const regionMap = groupPlacesByRegion(places)
  const optimizedRoutes = new Map<string, Place[]>()

  regionMap.forEach((regionPlaces, region) => {
    if (regionPlaces.length === 0) return

    // 평균 위치를 시작점으로 사용
    const avgCoord = calculateAverageCoordinate(regionPlaces)
    const startPlace: Place = {
      ...regionPlaces[0],
      lat: avgCoord.lat,
      lng: avgCoord.lng,
    }

    const optimized = optimizeRoute(startPlace, regionPlaces)
    optimizedRoutes.set(region, optimized)
  })

  return optimizedRoutes
}
