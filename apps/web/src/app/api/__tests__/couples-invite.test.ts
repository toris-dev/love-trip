import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST, generateInviteToken } from "../couples/invite/route"
import { NextRequest } from "next/server"

// Mock Supabase
const mockSupabase = {
  auth: {
    getUser: vi.fn(() => ({
      data: { user: { id: "user-1" } },
    })),
  },
  from: vi.fn(() => ({
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
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
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
    })),
  })),
}

// Mock modules
vi.mock("@lovetrip/api/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}))

describe("Couples Invite API", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase.auth.getUser.mockReturnValue({
      data: { user: { id: "user-1" } },
    })
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000"
  })

  describe("POST /api/couples/invite", () => {
    it("초대 링크를 생성할 수 있어야 함", async () => {
      const request = new NextRequest("http://localhost/api/couples/invite", {
        method: "POST",
      })

      // Mock - 커플 없음
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

      // Mock - pending 요청 없음
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

      // Mock - 초대 생성
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: {
                id: "couple-1",
                user1_id: "user-1",
                user2_id: "user-1",
                status: "invite_pending:mock-token-1234567890abcdef",
                created_at: "2024-01-01T00:00:00Z",
              },
              error: null,
            })),
          })),
        })),
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json.inviteToken).toBeDefined()
      expect(typeof json.inviteToken).toBe("string")
      expect(json.inviteToken.length).toBeGreaterThan(0)
      expect(json.inviteLink).toContain(json.inviteToken)
      expect(json.expiresAt).toBeDefined()
    })

    it("이미 커플로 연결되어 있으면 400을 반환해야 함", async () => {
      const request = new NextRequest("http://localhost/api/couples/invite", {
        method: "POST",
      })

      // Mock - 이미 커플로 연결됨
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          or: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({
                data: {
                  id: "couple-1",
                  user1_id: "user-1",
                  user2_id: "user-2",
                  status: "accepted",
                },
                error: null,
              })),
            })),
          })),
        })),
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.error).toContain("이미 커플로 연결되어 있습니다")
    })

    it("로그인하지 않은 사용자는 401을 반환해야 함", async () => {
      const request = new NextRequest("http://localhost/api/couples/invite", {
        method: "POST",
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
