import { describe, it, expect, vi, beforeEach, afterAll } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"
import { useTravelDayPlaces } from "../hooks/use-travel-day-places"

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe("useTravelDayPlaces", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
    // console.error를 mock하여 stderr 출력 방지
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })

  describe("loadPlaces", () => {
    it("장소 목록을 성공적으로 불러와야 함", async () => {
      const mockPlaces = [
        {
          id: "place-1",
          place_id: "p1",
          order_index: 0,
          visit_time: null,
          notes: null,
          places: { id: "p1", name: "Test Place", address: "서울" },
        },
      ]

      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ data: mockPlaces }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )

      const { result } = renderHook(() =>
        useTravelDayPlaces({
          travelPlanId: "plan-1",
          travelDayId: "day-1",
        })
      )

      let places: any
      await act(async () => {
        places = await result.current.loadPlaces()
      })

      expect(places).toEqual(mockPlaces)
      expect(mockFetch).toHaveBeenCalled()
      const callArgs = mockFetch.mock.calls[0]
      const url = typeof callArgs[0] === "string" ? callArgs[0] : callArgs[0].url
      expect(url).toContain("/api/travel-plans/plan-1/days/day-1/places")
    })

    it("에러 발생 시 빈 배열을 반환해야 함", async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "Failed to load" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      )

      const { result } = renderHook(() =>
        useTravelDayPlaces({
          travelPlanId: "plan-1",
          travelDayId: "day-1",
        })
      )

      let places: any
      await act(async () => {
        places = await result.current.loadPlaces()
      })

      expect(places).toEqual([])
    })
  })

  describe("addPlace", () => {
    it("장소를 성공적으로 추가해야 함", async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ data: { id: "new-place" } }), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        })
      )

      const onUpdate = vi.fn()
      const { result } = renderHook(() =>
        useTravelDayPlaces({
          travelPlanId: "plan-1",
          travelDayId: "day-1",
          onUpdate,
        })
      )

      let success!: boolean
      await act(async () => {
        success = await result.current.addPlace("place-1")
      })

      expect(success).toBe(true)
      expect(onUpdate).toHaveBeenCalled()
      expect(mockFetch).toHaveBeenCalled()
      const callArgs = mockFetch.mock.calls[0]
      const url = typeof callArgs[0] === "string" ? callArgs[0] : callArgs[0].url
      expect(url).toContain("/api/travel-plans/plan-1/days/day-1/places")
      if (callArgs[1]) {
        expect(callArgs[1].method).toBe("POST")
        expect(JSON.parse(callArgs[1].body)).toEqual({ place_id: "place-1" })
      }
    })
  })

  describe("removePlace", () => {
    it("장소를 성공적으로 제거해야 함", async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )

      const onUpdate = vi.fn()
      const { result } = renderHook(() =>
        useTravelDayPlaces({
          travelPlanId: "plan-1",
          travelDayId: "day-1",
          onUpdate,
        })
      )

      let success: boolean = false
      await act(async () => {
        success = await result.current.removePlace("place-1")
      })

      expect(success).toBe(true)
      expect(onUpdate).toHaveBeenCalled()
    })
  })
})
