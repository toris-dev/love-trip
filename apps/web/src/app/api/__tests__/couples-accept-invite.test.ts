import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "../couples/accept-invite/route"
import { NextRequest } from "next/server"

// Mock Supabase
const mockSupabase = {
  auth: {
    getUser: vi.fn(() => ({
      data: { user: { id: "user-2" } },
    })),
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      like: vi.fn(() => ({
        single: vi.fn(() => ({
          data: {
            id: "couple-1",
            user1_id: "user-1",
            user2_id: "user-1",
            status: "invite_pending:token123",
            created_at: "2024-01-01T00:00:00Z",
          },
          error: null,
        })),
      })),
      or: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: null,
            error: { code: "PGRST116" },
          })),
        })),
      })),
      eq: vi.fn(() => ({
        limit: vi.fn(() => ({
          data: [],
          error: null,
        })),
        single: vi.fn(() => ({
          data: null,
          error: { code: "PGRST116" },
        })),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {
              id: "couple-1",
              user1_id: "user-1",
              user2_id: "user-2",
              status: "accepted",
              updated_at: "2024-01-01T00:00:00Z",
            },
            error: null,
          })),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      data: { id: "calendar-1" },
      error: null,
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => ({
        error: null,
      })),
    })),
  })),
}

// Mock modules
vi.mock("@lovetrip/api/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}))

describe("Couples Accept Invite API", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase.auth.getUser.mockReturnValue({
      data: { user: { id: "user-2" } },
    })
  })

  describe("POST /api/couples/accept-invite", () => {
    it("초대 링크로 커플 연결을 수락할 수 있어야 함", async () => {
      const request = new NextRequest("http://localhost/api/couples/accept-invite", {
        method: "POST",
        body: JSON.stringify({ token: "token123" }),
      })

      // Mock - 초대 찾기
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          like: vi.fn(() => ({
            single: vi.fn(() => ({
              data: {
                id: "couple-1",
                user1_id: "user-1",
                user2_id: "user-1",
                status: "invite_pending:token123",
              },
              error: null,
            })),
          })),
        })),
      })

      // Mock - 기존 커플 없음
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          or: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({
                data: null,
                error: { code: "PGRST116" },
              })),
            })),
          })),
        })),
      })

      // Mock - 커플 업데이트
      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => ({
                data: {
                  id: "couple-1",
                  user1_id: "user-1",
                  user2_id: "user-2",
                  status: "accepted",
                  updated_at: "2024-01-01T00:00:00Z",
                },
                error: null,
              })),
            })),
          })),
        })),
      })

      // Mock - 캘린더 확인
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

      // Mock - 캘린더 생성
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn(() => ({
          data: { id: "calendar-1" },
          error: null,
        })),
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json.success).toBe(true)
      expect(json.couple).toBeDefined()
      expect(json.couple.status).toBe("accepted")
      expect(json.couple.user2_id).toBe("user-2")
    })

    it("유효하지 않은 토큰이면 404를 반환해야 함", async () => {
      const request = new NextRequest("http://localhost/api/couples/accept-invite", {
        method: "POST",
        body: JSON.stringify({ token: "invalid-token" }),
      })

      // Mock - 초대 찾기 실패
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          like: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: { code: "PGRST116" },
            })),
          })),
        })),
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(404)
      expect(json.error).toContain("유효하지 않거나 만료된 초대 링크")
    })

    it("자신이 보낸 초대는 수락할 수 없어야 함", async () => {
      const request = new NextRequest("http://localhost/api/couples/accept-invite", {
        method: "POST",
        body: JSON.stringify({ token: "token123" }),
      })

      // Mock - 초대 찾기 (자신이 보낸 초대)
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          like: vi.fn(() => ({
            single: vi.fn(() => ({
              data: {
                id: "couple-1",
                user1_id: "user-1",
                user2_id: "user-1",
                status: "invite_pending:token123",
              },
              error: null,
            })),
          })),
        })),
      })

      // Mock - 자기 자신
      mockSupabase.auth.getUser.mockReturnValue({
        data: { user: { id: "user-1" } },
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.error).toContain("자신이 보낸 초대 링크는 수락할 수 없습니다")
    })

    it("토큰이 없으면 400을 반환해야 함", async () => {
      const request = new NextRequest("http://localhost/api/couples/accept-invite", {
        method: "POST",
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.error).toContain("초대 토큰이 필요합니다")
    })

    it("로그인하지 않은 사용자는 401을 반환해야 함", async () => {
      const request = new NextRequest("http://localhost/api/couples/accept-invite", {
        method: "POST",
        body: JSON.stringify({ token: "token123" }),
      })

      // Mock - 사용자 없음
      mockSupabase.auth.getUser.mockReturnValue({
        data: { user: null },
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(401)
      expect(json.error).toBe("로그인이 필요합니다")
    })
  })
})
