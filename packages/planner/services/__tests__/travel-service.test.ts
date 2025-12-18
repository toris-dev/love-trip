import { describe, it, expect, vi, beforeEach } from "vitest"
import { travelService } from "../travel-service"

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          data: [],
          error: null,
        })),
        single: vi.fn(() => ({
          data: null,
          error: null,
        })),
      })),
      in: vi.fn(() => ({
        order: vi.fn(() => ({
          data: [],
          error: null,
        })),
      })),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => ({
          data: { id: "new-id" },
          error: null,
        })),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: "updated-id" },
            error: null,
          })),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => ({
        error: null,
      })),
    })),
  })),
}

vi.mock("@lovetrip/api/supabase/client", () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}))

describe("travelService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("addPlaceToDay", () => {
    it("장소를 일차에 추가할 수 있어야 함", async () => {
      const travelDayId = "day-1"
      const placeId = "place-1"

      mockSupabaseClient.from.mockReturnValueOnce({
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
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: {
                id: "new-place",
                travel_day_id: travelDayId,
                place_id: placeId,
                order_index: 0,
              },
              error: null,
            })),
          })),
        })),
      })

      const result = await travelService.addPlaceToDay(travelDayId, placeId)

      expect(result).toBeDefined()
      expect(result.place_id).toBe(placeId)
    })

    it("orderIndex가 없으면 자동으로 계산해야 함", async () => {
      const travelDayId = "day-1"
      const placeId = "place-1"

      // 기존 장소가 있는 경우
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                data: [{ order_index: 2 }],
                error: null,
              })),
            })),
          })),
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: {
                id: "new-place",
                travel_day_id: travelDayId,
                place_id: placeId,
                order_index: 3, // 2 + 1
              },
              error: null,
            })),
          })),
        })),
      })

      const result = await travelService.addPlaceToDay(travelDayId, placeId)

      expect(result.order_index).toBe(3)
    })
  })

  describe("removePlaceFromDay", () => {
    it("장소를 일차에서 제거할 수 있어야 함", async () => {
      const travelDayPlaceId = "place-1"

      mockSupabaseClient.from.mockReturnValueOnce({
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            error: null,
          })),
        })),
      })

      await expect(travelService.removePlaceFromDay(travelDayPlaceId)).resolves.not.toThrow()
    })
  })

  describe("updatePlaceOrder", () => {
    it("장소의 순서를 변경할 수 있어야 함", async () => {
      const travelDayPlaceId = "place-1"
      const newOrderIndex = 5

      mockSupabaseClient.from.mockReturnValueOnce({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => ({
                data: {
                  id: travelDayPlaceId,
                  order_index: newOrderIndex,
                },
                error: null,
              })),
            })),
          })),
        })),
      })

      const result = await travelService.updatePlaceOrder(travelDayPlaceId, newOrderIndex)

      expect(result.order_index).toBe(newOrderIndex)
    })
  })
})
