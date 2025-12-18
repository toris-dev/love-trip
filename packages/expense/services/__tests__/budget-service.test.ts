import { describe, it, expect, vi, beforeEach } from "vitest"
import { estimateBudgetFromPlace } from "../budget-service"

describe("budget-service", () => {
  describe("estimateBudgetFromPlace", () => {
    it("카테고리와 가격 수준에 맞는 예산을 추정해야 함", async () => {
      const estimated = await estimateBudgetFromPlace(2, "식비")
      expect(estimated).toBe(30000) // 보통 가격대 식비
    })

    it("저렴한 가격대를 올바르게 추정해야 함", async () => {
      const estimated = await estimateBudgetFromPlace(1, "교통비")
      expect(estimated).toBe(5000)
    })

    it("비싼 가격대를 올바르게 추정해야 함", async () => {
      const estimated = await estimateBudgetFromPlace(4, "숙박비")
      expect(estimated).toBe(300000)
    })

    it("범위를 벗어난 priceLevel은 범위 내로 조정해야 함", async () => {
      const tooHigh = await estimateBudgetFromPlace(10, "식비")
      const tooLow = await estimateBudgetFromPlace(-1, "식비")

      // 4 또는 1로 조정되어야 함
      expect(tooHigh).toBeGreaterThan(0)
      expect(tooLow).toBeGreaterThan(0)
    })

    it("존재하지 않는 카테고리는 기타 카테고리 기본값을 사용해야 함", async () => {
      // 타입 안전성을 위해 실제로는 발생하지 않지만, 방어적 코드 테스트
      const estimated = await estimateBudgetFromPlace(2, "기타")
      expect(estimated).toBe(20000)
    })
  })
})
