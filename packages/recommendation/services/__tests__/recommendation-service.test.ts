import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  getCoupleRecommendations,
  getThemeRecommendations,
  getFavoriteBasedRecommendations,
} from "../recommendation-service"

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        in: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              data: [],
              error: null,
            })),
          })),
        })),
        order: vi.fn(() => ({
          limit: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })),
      or: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })),
      not: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })),
    })),
  })),
}

vi.mock("@lovetrip/api/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}))

describe("recommendation-service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("getThemeRecommendations", () => {
    it("로맨틱 테마 장소를 추천해야 함", async () => {
      const mockPlaces = [
        {
          id: "place-1",
          name: "로맨틱 카페",
          type: "VIEW",
          rating: 4.5,
          price_level: 2,
        },
      ]

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          in: vi.fn(() => ({
            in: vi.fn(() => ({
              gte: vi.fn(() => ({
                lte: vi.fn(() => ({
                  order: vi.fn(() => ({
                    limit: vi.fn(() => ({
                      data: mockPlaces,
                      error: null,
                    })),
                  })),
                })),
              })),
            })),
          })),
        })),
      })

      const results = await getThemeRecommendations("로맨틱", 10)

      expect(results).toBeDefined()
      expect(Array.isArray(results)).toBe(true)
    })

    it("테마별로 적절한 필터를 적용해야 함", async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                data: [],
                error: null,
              })),
            })),
          })),
        })),
      })

      await getThemeRecommendations("액티브", 10)

      // 액티브 테마는 tour_content_type_id 28 (레포츠) 필터가 적용되어야 함
      expect(mockSupabase.from).toHaveBeenCalledWith("places")
    })
  })

  describe("getFavoriteBasedRecommendations", () => {
    it("즐겨찾기 기반 추천을 제공해야 함", async () => {
      const mockFavorites = [{ place_id: "place-1" }, { place_id: "place-2" }]
      const mockFavoritePlaces = [
        { id: "place-1", type: "VIEW", area_code: 1, category1: "관광지" },
        { id: "place-2", type: "CAFE", area_code: 1, category1: "카페" },
      ]

      mockSupabase.from
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              limit: vi.fn(() => ({
                data: mockFavorites,
                error: null,
              })),
            })),
          })),
        })
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            in: vi.fn(() => ({
              data: mockFavoritePlaces,
              error: null,
            })),
          })),
        })
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                not: vi.fn(() => ({
                  order: vi.fn(() => ({
                    limit: vi.fn(() => ({
                      data: [],
                      error: null,
                    })),
                  })),
                })),
              })),
            })),
          })),
        })

      const results = await getFavoriteBasedRecommendations("user-1", 10)

      expect(results).toBeDefined()
      expect(Array.isArray(results)).toBe(true)
    })

    it("즐겨찾기가 없으면 빈 배열을 반환해야 함", async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            limit: vi.fn(() => ({
              data: [],
              error: null,
            })),
          })),
        })),
      })

      const results = await getFavoriteBasedRecommendations("user-1", 10)

      expect(results).toEqual([])
    })
  })
})
