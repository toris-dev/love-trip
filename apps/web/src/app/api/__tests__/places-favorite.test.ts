import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST, DELETE } from "../places/[id]/favorite/route"
import { NextRequest } from "next/server"

// Mock Supabase - must be defined before vi.mock
const mockSupabase = {
  auth: {
    getUser: vi.fn(() => ({
      data: { user: { id: "user-1" } },
    })),
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => ({
          data: null,
          error: null,
        })),
      })),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => ({
          data: { id: "favorite-1", user_id: "user-1", place_id: "place-1" },
          error: null,
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

// Mock @lovetrip/api/supabase/server
vi.mock("@lovetrip/api/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}))

describe("Places Favorite API", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("POST /api/places/[id]/favorite", () => {
    it("장소를 즐겨찾기에 추가할 수 있어야 함", async () => {
      const request = new NextRequest("http://localhost/api/places/place-1/favorite", {
        method: "POST",
      })

      const params = Promise.resolve({ id: "place-1" })

      // 장소 확인
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: { id: "place-1" },
              error: null,
            })),
          })),
        })),
      })

      // 기존 즐겨찾기 확인 (없음)
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({
                data: null,
                error: { code: "PGRST116" },
              })),
            })),
          })),
        })),
      })

      // 즐겨찾기 추가
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: {
                id: "favorite-1",
                user_id: "user-1",
                place_id: "place-1",
                places: { id: "place-1", name: "Test Place" },
              },
              error: null,
            })),
          })),
        })),
      })

      const response = await POST(request, { params })
      const json = await response.json()

      expect(response.status).toBe(201)
      expect(json.data).toBeDefined()
      expect(json.data.place_id).toBe("place-1")
    })

    it("이미 즐겨찾기에 있으면 400을 반환해야 함", async () => {
      const request = new NextRequest("http://localhost/api/places/place-1/favorite", {
        method: "POST",
      })

      const params = Promise.resolve({ id: "place-1" })

      // 장소 확인
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: { id: "place-1" },
              error: null,
            })),
          })),
        })),
      })

      // 기존 즐겨찾기 확인 (있음)
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({
                data: { id: "favorite-1" },
                error: null,
              })),
            })),
          })),
        })),
      })

      const response = await POST(request, { params })
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.error).toContain("이미 즐겨찾기")
    })
  })

  describe("DELETE /api/places/[id]/favorite", () => {
    it("즐겨찾기를 제거할 수 있어야 함", async () => {
      const request = new NextRequest("http://localhost/api/places/place-1/favorite", {
        method: "DELETE",
      })

      const params = Promise.resolve({ id: "place-1" })

      mockSupabase.from.mockReturnValueOnce({
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              error: null,
            })),
          })),
        })),
      })

      const response = await DELETE(request, { params })
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json.success).toBe(true)
    })
  })
})
