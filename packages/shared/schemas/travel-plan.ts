import { z } from "zod"

/**
 * 여행 계획 생성 스키마
 */
export const createTravelPlanSchema = z
  .object({
    title: z.string().min(1, "제목은 필수입니다").max(100, "제목은 100자 이하여야 합니다"),
    destination: z
      .string()
      .min(1, "목적지는 필수입니다")
      .max(200, "목적지는 200자 이하여야 합니다"),
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "날짜 형식이 올바르지 않습니다 (YYYY-MM-DD)"),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "날짜 형식이 올바르지 않습니다 (YYYY-MM-DD)"),
    total_budget: z.number().min(0, "예산은 0 이상이어야 합니다").optional(),
    description: z.string().max(1000, "설명은 1000자 이하여야 합니다").optional(),
    course_type: z.enum(["date", "travel"]).default("travel"),
    places: z
      .array(
        z.object({
          place_id: z.string().uuid("place_id는 유효한 UUID 형식이어야 합니다"),
          day_number: z.number().int().min(1, "일차는 1 이상이어야 합니다"),
          order_index: z.number().int().min(0, "순서는 0 이상이어야 합니다").default(0),
        })
      )
      .optional(),
    budget_items: z
      .array(
        z.object({
          category: z.string().min(1, "카테고리는 필수입니다"),
          name: z.string().min(1, "항목명은 필수입니다"),
          planned_amount: z.number().min(0, "예산 금액은 0 이상이어야 합니다"),
        })
      )
      .optional(),
  })
  .refine(
    data => {
      const start = new Date(data.start_date)
      const end = new Date(data.end_date)
      return end >= start
    },
    {
      message: "종료일은 시작일 이후여야 합니다",
      path: ["end_date"],
    }
  )

export type CreateTravelPlanInput = z.infer<typeof createTravelPlanSchema>

/**
 * 여행 계획 수정 스키마
 */
export const updateTravelPlanSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  destination: z.string().min(1).max(200).optional(),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  total_budget: z.number().min(0).optional(),
  description: z.string().max(1000).optional(),
  course_type: z.enum(["date", "travel"]).optional(),
  status: z.enum(["planning", "in_progress", "completed", "cancelled"]).optional(),
})

export type UpdateTravelPlanInput = z.infer<typeof updateTravelPlanSchema>
