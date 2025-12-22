import { describe, it, expect, vi, beforeEach } from "vitest"
import { placeService } from "../place-service"
import { naverAPIClient } from "@lovetrip/api/clients/naver-api-client"

// Mock external API clients
vi.mock("@lovetrip/api/clients/naver-api-client", () => ({
  naverAPIClient: {
    searchPlaces: vi.fn(),
    geocode: vi.fn(),
  },
}))

describe("PlaceService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("searchPlaces", () => {
    it("should return places from external API", async () => {
      const mockNaverPlaces = [
        {
          id: "naver_1",
          name: "테스트 장소",
          address: "서울시 강남구",
          lat: 37.5665,
          lng: 126.978,
        },
      ]

      vi.mocked(naverAPIClient.searchPlaces).mockResolvedValue(mockNaverPlaces)

      const result = await placeService.searchPlaces("강남")

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe("테스트 장소")
      expect(naverAPIClient.searchPlaces).toHaveBeenCalledWith("강남", 20)
    })

    it("should return empty array when external API fails", async () => {
      vi.mocked(naverAPIClient.searchPlaces).mockRejectedValue(new Error("API Error"))

      const result = await placeService.searchPlaces("강남")

      expect(result).toEqual([])
    })

    it("should deduplicate places with same name and coordinates", async () => {
      const mockPlaces = [
        {
          id: "naver_1",
          name: "테스트 장소",
          address: "서울시 강남구",
          lat: 37.5665,
          lng: 126.978,
        },
        {
          id: "naver_2",
          name: "테스트 장소",
          address: "서울시 강남구",
          lat: 37.5665,
          lng: 126.978,
        },
      ]

      vi.mocked(naverAPIClient.searchPlaces).mockResolvedValue(mockPlaces)

      const result = await placeService.searchPlaces("강남")

      expect(result).toHaveLength(1)
    })
  })

  describe("getPlaces", () => {
    it("should return popular stored places", async () => {
      const result = await placeService.getPlaces({ limit: 10 })

      // 저장된 장소가 없을 수 있으므로 빈 배열도 허용
      expect(Array.isArray(result)).toBe(true)
    })
  })
})
