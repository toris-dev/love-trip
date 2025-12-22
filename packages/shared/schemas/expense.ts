import { z } from "zod"

/**
 * 지출 생성 스키마
 */
export const createExpenseSchema = z.object({
  amount: z.number().min(0.01, "지출 금액은 0보다 커야 합니다"),
  category: z.string().min(1, "카테고리는 필수입니다"),
  description: z.string().max(500, "설명은 500자 이하여야 합니다").optional(),
  travel_day_id: z.string().uuid("travel_day_id는 유효한 UUID 형식이어야 합니다").optional(),
  paid_by_user_id: z.string().uuid("paid_by_user_id는 유효한 UUID 형식이어야 합니다"),
  receipt_url: z.string().url("영수증 URL 형식이 올바르지 않습니다").optional().nullable(),
})

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>

/**
 * 지출 수정 스키마
 */
export const updateExpenseSchema = z.object({
  amount: z.number().min(0.01).optional(),
  category: z.string().min(1).optional(),
  description: z.string().max(500).optional(),
  travel_day_id: z.string().uuid().optional().nullable(),
  paid_by_user_id: z.string().uuid().optional(),
  receipt_url: z.string().url().optional().nullable(),
})

export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>

/**
 * 지출 분할 스키마
 */
export const createExpenseSplitSchema = z.object({
  user_id: z.string().uuid("user_id는 유효한 UUID 형식이어야 합니다"),
  amount: z.number().min(0, "분할 금액은 0 이상이어야 합니다"),
})

export type CreateExpenseSplitInput = z.infer<typeof createExpenseSplitSchema>
