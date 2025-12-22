import { describe, it, expect, vi, beforeEach } from "vitest"
import { withTransaction, transactionInsert, transactionInsertMany } from "../transaction-manager"
import { createClient } from "../server"

// Mock Supabase client
vi.mock("../server", () => ({
  createClient: vi.fn(),
}))

describe("TransactionManager", () => {
  const mockSupabase = {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
  })

  describe("withTransaction", () => {
    it("should execute callback successfully", async () => {
      const callback = vi.fn().mockResolvedValue({ success: true })

      const result = await withTransaction(callback)

      expect(result).toEqual({ success: true })
      expect(callback).toHaveBeenCalled()
    })

    it("should rollback on error", async () => {
      const callback = vi.fn().mockRejectedValue(new Error("Test error"))

      await expect(withTransaction(callback)).rejects.toThrow("Test error")
    })
  })

  describe("transactionInsert", () => {
    it("should insert and register rollback", async () => {
      const mockInsert = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: "test-id", name: "test" },
          error: null,
        }),
      }

      mockSupabase.from.mockReturnValue(mockInsert)

      const context = {
        operations: [],
        rollbackOperations: [],
        createdIds: new Map(),
      }

      const result = await transactionInsert(mockSupabase as any, context, "test_table", {
        name: "test",
      })

      expect(result).toEqual({ id: "test-id", name: "test" })
      expect(context.rollbackOperations).toHaveLength(1)
    })
  })
})
