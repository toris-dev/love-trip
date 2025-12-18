import { describe, it, expect, vi, beforeEach } from "vitest"
import { calculateSettlement } from "../settlement-service"

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        data: [],
        error: null,
      })),
    })),
  })),
}

vi.mock("@lovetrip/api/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}))

describe("settlement-service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("calculateSettlement", () => {
    it("1/N 정산을 올바르게 계산해야 함", async () => {
      const mockExpenses = [
        {
          id: "expense-1",
          amount: 100000,
          paid_by_user_id: "user-1",
          expense_splits: [
            { user_id: "user-1", amount: 50000, is_paid: false },
            { user_id: "user-2", amount: 50000, is_paid: false },
          ],
        },
      ]

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            data: mockExpenses,
            error: null,
          })),
        })),
      })

      const summaries = await calculateSettlement("plan-1", ["user-1", "user-2"])

      expect(summaries).toHaveLength(2)

      const user1Summary = summaries.find(s => s.userId === "user-1")
      const user2Summary = summaries.find(s => s.userId === "user-2")

      expect(user1Summary?.totalPaid).toBe(100000)
      expect(user1Summary?.totalOwed).toBe(50000)
      expect(user1Summary?.netAmount).toBe(50000) // 받을 돈

      expect(user2Summary?.totalPaid).toBe(0)
      expect(user2Summary?.totalOwed).toBe(50000)
      expect(user2Summary?.netAmount).toBe(-50000) // 낼 돈
    })

    it("분할 정보가 없으면 균등 분할해야 함", async () => {
      const mockExpenses = [
        {
          id: "expense-1",
          amount: 60000,
          paid_by_user_id: "user-1",
          expense_splits: null,
        },
      ]

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            data: mockExpenses,
            error: null,
          })),
        })),
      })

      const summaries = await calculateSettlement("plan-1", ["user-1", "user-2"])

      const user1Summary = summaries.find(s => s.userId === "user-1")
      const user2Summary = summaries.find(s => s.userId === "user-2")

      // 60000원을 2명이 나눔 = 각 30000원
      expect(user1Summary?.totalOwed).toBe(30000)
      expect(user2Summary?.totalOwed).toBe(30000)
    })
  })
})
