import { describe, it, expect } from "vitest"
import { calculateDistance, optimizeRoute, calculateTotalDistance } from "../route-optimizer"
import type { Place } from "@lovetrip/shared/types"

describe("route-optimizer", () => {
  describe("calculateDistance", () => {
    it("서울과 부산 사이의 거리를 계산해야 함", () => {
      const seoul = { lat: 37.5665, lng: 126.978 }
      const busan = { lat: 35.1796, lng: 129.0756 }

      const distance = calculateDistance(seoul, busan)

      // 서울-부산 거리는 약 325km
      expect(distance).toBeGreaterThan(300)
      expect(distance).toBeLessThan(350)
    })

    it("같은 위치의 거리는 0이어야 함", () => {
      const coord = { lat: 37.5665, lng: 126.978 }
      const distance = calculateDistance(coord, coord)

      expect(distance).toBe(0)
    })

    it("가까운 두 지점의 거리를 정확히 계산해야 함", () => {
      const point1 = { lat: 37.5665, lng: 126.978 }
      const point2 = { lat: 37.5651, lng: 126.9895 }

      const distance = calculateDistance(point1, point2)

      // 약 1km 이내
      expect(distance).toBeGreaterThan(0)
      expect(distance).toBeLessThan(2)
    })
  })

  describe("optimizeRoute", () => {
    const createPlace = (id: string, lat: number, lng: number): Place => ({
      id,
      name: `Place ${id}`,
      lat,
      lng,
      address: "",
      type: "VIEW",
      rating: 4.0,
      price_level: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    it("빈 배열을 반환해야 함", () => {
      const startPlace = createPlace("start", 37.5665, 126.978)
      const result = optimizeRoute(startPlace, [])

      expect(result).toEqual([])
    })

    it("단일 장소를 올바르게 처리해야 함", () => {
      const startPlace = createPlace("start", 37.5665, 126.978)
      const place = createPlace("1", 37.5651, 126.9895)

      const result = optimizeRoute(startPlace, [place])

      expect(result).toEqual([place])
    })

    it("여러 장소를 거리 순으로 최적화해야 함", () => {
      const startPlace = createPlace("start", 37.5665, 126.978)
      const places = [
        createPlace("far", 37.5, 127.0), // 가장 멀리
        createPlace("near", 37.5651, 126.9895), // 가장 가까움
        createPlace("mid", 37.56, 126.99), // 중간
      ]

      const result = optimizeRoute(startPlace, places)

      expect(result).toHaveLength(3)
      // 첫 번째는 가장 가까운 장소여야 함
      expect(result[0].id).toBe("near")
    })

    it("최적 경로의 총 거리가 원래보다 작거나 같아야 함", () => {
      const startPlace = createPlace("start", 37.5665, 126.978)
      const places = [
        createPlace("1", 37.5, 127.0),
        createPlace("2", 37.5651, 126.9895),
        createPlace("3", 37.56, 126.99),
        createPlace("4", 37.55, 127.0),
      ]

      const optimized = optimizeRoute(startPlace, places)
      const originalDistance = calculateTotalDistance([startPlace, ...places])
      const optimizedDistance = calculateTotalDistance([startPlace, ...optimized])

      // 최적화된 경로가 더 짧거나 같아야 함
      expect(optimizedDistance).toBeLessThanOrEqual(originalDistance)
    })
  })

  describe("calculateTotalDistance", () => {
    const createPlace = (lat: number, lng: number): Place => ({
      id: `${lat}-${lng}`,
      name: "Test Place",
      lat,
      lng,
      address: "",
      type: "VIEW",
      rating: 4.0,
      price_level: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    it("장소가 2개 미만이면 0을 반환해야 함", () => {
      expect(calculateTotalDistance([])).toBe(0)
      expect(calculateTotalDistance([createPlace(37.5665, 126.978)])).toBe(0)
    })

    it("여러 장소의 총 거리를 계산해야 함", () => {
      const places = [
        createPlace(37.5665, 126.978),
        createPlace(37.5651, 126.9895),
        createPlace(37.56, 126.99),
      ]

      const totalDistance = calculateTotalDistance(places)

      expect(totalDistance).toBeGreaterThan(0)
      // 각 구간의 거리 합이어야 함
      const distance1 = calculateDistance(
        { lat: places[0].lat, lng: places[0].lng },
        { lat: places[1].lat, lng: places[1].lng }
      )
      const distance2 = calculateDistance(
        { lat: places[1].lat, lng: places[1].lng },
        { lat: places[2].lat, lng: places[2].lng }
      )

      expect(totalDistance).toBeCloseTo(distance1 + distance2, 1)
    })
  })
})
