import { describe, it, expect, beforeEach, vi } from "vitest"
import { travelService, serverTravelService } from "@/lib/services/travel-service"

// Mock Supabase clients
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          data: mockPlaces,
          error: null,
        })),
        or: vi.fn(() => ({
          order: vi.fn(() => ({
            data: mockPlaces.filter((p) => p.name.includes("서울")),
            error: null,
          })),
        })),
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: mockBudgetItems,
            error: null,
          })),
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: mockBudgetItems[0],
              error: null,
            })),
          })),
        })),
        single: vi.fn(() => ({
          data: mockPlaces[0],
          error: null,
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: mockTravelPlan,
            error: null,
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: { ...mockTravelPlan, title: "Updated Plan" },
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
  })),
}))

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            data: mockPlaces,
            error: null,
          })),
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              data: [mockTravelPlan],
              error: null,
            })),
          })),
        })),
      })),
    }),
  ),
}))

// Mock data
const mockPlaces = [
  {
    id: "1",
    name: "서울타워",
    description: "서울의 랜드마크",
    address: "서울시 용산구",
    latitude: 37.5512,
    longitude: 126.9882,
    category: "attraction",
    rating: 4.5,
    price_range: "medium",
    image_url: "/seoul-tower.jpg",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "부산 해운대",
    description: "아름다운 해변",
    address: "부산시 해운대구",
    latitude: 35.1588,
    longitude: 129.1603,
    category: "beach",
    rating: 4.8,
    price_range: "free",
    image_url: "/haeundae.jpg",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
]

const mockTravelPlan = {
  id: "1",
  user_id: "user1",
  title: "서울 여행",
  description: "2박 3일 서울 여행",
  start_date: "2024-03-01",
  end_date: "2024-03-03",
  total_budget: 500000,
  status: "planning" as const,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
}

const mockBudgetItems = [
  {
    id: "1",
    travel_plan_id: "1",
    category: "accommodation",
    name: "호텔 숙박",
    planned_amount: 200000,
    actual_amount: 180000,
    date: "2024-03-01",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
]

describe("Travel Service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Places", () => {
    it("should get all places", async () => {
      const places = await travelService.getPlaces()
      expect(places).toEqual(mockPlaces)
      expect(places).toHaveLength(2)
    })

    it("should search places by query", async () => {
      const results = await travelService.searchPlaces("서울")
      expect(results).toHaveLength(1)
      expect(results[0].name).toBe("서울타워")
    })

    it("should handle empty search results", async () => {
      const results = await travelService.searchPlaces("존재하지않는장소")
      expect(results).toEqual([])
    })
  })

  describe("Travel Plans", () => {
    it("should get travel plans", async () => {
      const plans = await travelService.getTravelPlans()
      expect(plans).toBeDefined()
    })

    it("should create travel plan", async () => {
      const newPlan = {
        user_id: "user1",
        title: "새로운 여행",
        description: "테스트 여행",
        start_date: "2024-04-01",
        end_date: "2024-04-03",
        total_budget: 300000,
        status: "planning" as const,
      }

      const result = await travelService.createTravelPlan(newPlan)
      expect(result).toEqual(mockTravelPlan)
    })

    it("should update travel plan", async () => {
      const updates = { title: "Updated Plan" }
      const result = await travelService.updateTravelPlan("1", updates)
      expect(result.title).toBe("Updated Plan")
    })
  })

  describe("Budget Items", () => {
    it("should get budget items for travel plan", async () => {
      const items = await travelService.getBudgetItems("1")
      expect(items).toEqual(mockBudgetItems)
    })

    it("should create budget item", async () => {
      const newItem = {
        travel_plan_id: "1",
        category: "food",
        name: "저녁식사",
        planned_amount: 50000,
        date: "2024-03-01",
      }

      const result = await travelService.createBudgetItem(newItem)
      expect(result).toBeDefined()
    })

    it("should update budget item", async () => {
      const updates = { actual_amount: 45000 }
      const result = await travelService.updateBudgetItem("1", updates)
      expect(result).toBeDefined()
    })

    it("should delete budget item", async () => {
      await expect(travelService.deleteBudgetItem("1")).resolves.not.toThrow()
    })
  })

  describe("Server Travel Service", () => {
    it("should get places from server", async () => {
      const places = await serverTravelService.getPlaces()
      expect(places).toEqual(mockPlaces)
    })

    it("should get travel plans for user", async () => {
      const plans = await serverTravelService.getTravelPlansForUser("user1")
      expect(plans).toEqual([mockTravelPlan])
    })
  })
})
