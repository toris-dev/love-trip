import { z } from "zod"

/**
 * 예산 항목 생성 스키마
 */
export const createBudgetItemSchema = z.object({
  category: z.string().min(1, "카테고리는 필수입니다"),
  name: z.string().min(1, "항목명은 필수입니다").max(100, "항목명은 100자 이하여야 합니다"),
  planned_amount: z.number().min(0, "예산 금액은 0 이상이어야 합니다"),
  travel_day_id: z.string().uuid("travel_day_id는 유효한 UUID 형식이어야 합니다").optional(),
})

export type CreateBudgetItemInput = z.infer<typeof createBudgetItemSchema>

/**
 * 예산 항목 수정 스키마
 */
export const updateBudgetItemSchema = z.object({
  category: z.string().min(1).optional(),
  name: z.string().min(1).max(100).optional(),
  planned_amount: z.number().min(0).optional(),
  travel_day_id: z.string().uuid().optional().nullable(),
})

export type UpdateBudgetItemInput = z.infer<typeof updateBudgetItemSchema>
