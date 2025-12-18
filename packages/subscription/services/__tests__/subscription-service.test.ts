import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  getUserSubscription,
  createFreeSubscription,
  createSubscription,
  isPremiumUser,
} from "../subscription-service"

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => ({
          data: null,
          error: { code: "PGRST116" }, // Not found
        })),
      })),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => ({
          data: null,
          error: null,
        })),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: null,
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

describe("subscription-service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("getUserSubscription", () => {
    it("구독이 없으면 무료 구독을 생성해야 함", async () => {
      // 첫 번째 호출: 구독 없음
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: { code: "PGRST116" },
            })),
          })),
        })),
      })

      // 두 번째 호출: 무료 구독 생성
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: { code: "PGRST116" },
            })),
          })),
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: {
                id: "sub-1",
                user_id: "user-1",
                tier: "free",
                status: "active",
                start_date: new Date().toISOString(),
                end_date: null,
                cancel_at_period_end: false,
              },
              error: null,
            })),
          })),
        })),
      })

      const subscription = await getUserSubscription("user-1")

      expect(subscription).toBeDefined()
      expect(subscription?.tier).toBe("free")
    })

    it("기존 구독이 있으면 반환해야 함", async () => {
      const mockSubscription = {
        id: "sub-1",
        user_id: "user-1",
        tier: "premium",
        status: "active",
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancel_at_period_end: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: mockSubscription,
              error: null,
            })),
          })),
        })),
      })

      const subscription = await getUserSubscription("user-1")

      expect(subscription).toBeDefined()
      expect(subscription?.tier).toBe("premium")
    })
  })

  describe("isPremiumUser", () => {
    it("프리미엄 구독자는 true를 반환해야 함", async () => {
      const mockSubscription = {
        id: "sub-1",
        user_id: "user-1",
        tier: "premium",
        status: "active",
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancel_at_period_end: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: mockSubscription,
              error: null,
            })),
          })),
        })),
      })

      const isPremium = await isPremiumUser("user-1")

      expect(isPremium).toBe(true)
    })

    it("무료 구독자는 false를 반환해야 함", async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: { code: "PGRST116" },
            })),
          })),
        })),
      })

      // 무료 구독 생성
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: { code: "PGRST116" },
            })),
          })),
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: {
                id: "sub-1",
                user_id: "user-1",
                tier: "free",
                status: "active",
                start_date: new Date().toISOString(),
                end_date: null,
                cancel_at_period_end: false,
              },
              error: null,
            })),
          })),
        })),
      })

      const isPremium = await isPremiumUser("user-1")

      expect(isPremium).toBe(false)
    })
  })
})
