import { z } from "zod"

/**
 * 사용자 코스 생성 스키마
 */
export const createUserCourseSchema = z.object({
  title: z.string().min(1, "제목은 필수입니다").max(100, "제목은 100자 이하여야 합니다"),
  description: z.string().max(1000, "설명은 1000자 이하여야 합니다").optional(),
  course_type: z.enum(["date", "travel"], {
    errorMap: () => ({ message: "코스 타입은 'date' 또는 'travel'이어야 합니다" }),
  }),
  region: z.string().min(1, "지역은 필수입니다").max(100, "지역은 100자 이하여야 합니다"),
  is_public: z.boolean().default(false),
  target_audience: z
    .enum(["couple", "friend", "family", "solo", "business"], {
      errorMap: () => ({
        message: "타겟 오디언스는 'couple', 'friend', 'family', 'solo', 'business' 중 하나여야 합니다",
      }),
    })
    .default("couple"),
  places: z
    .array(
      z.object({
        place_id: z.string().uuid("place_id는 유효한 UUID 형식이어야 합니다").optional().nullable(),
        place_name: z.string().min(1).optional(),
        place_address: z.string().optional().nullable(),
        place_lat: z.number().optional().nullable(),
        place_lng: z.number().optional().nullable(),
        place_type: z.enum(["CAFE", "FOOD", "VIEW", "MUSEUM", "ETC"]).optional(),
        day_number: z.number().int().min(1).default(1),
        order_index: z.number().int().min(0).default(0),
      })
    )
    .min(1, "최소 1개 이상의 장소가 필요합니다"),
  estimated_budget: z.number().min(0).optional().nullable(),
})

export type CreateUserCourseInput = z.infer<typeof createUserCourseSchema>

/**
 * 사용자 코스 수정 스키마
 */
export const updateUserCourseSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
  region: z.string().min(1).max(100).optional(),
  is_public: z.boolean().optional(),
  estimated_budget: z.number().min(0).optional().nullable(),
  target_audience: z
    .enum(["couple", "friend", "family", "solo", "business"], {
      errorMap: () => ({
        message: "타겟 오디언스는 'couple', 'friend', 'family', 'solo', 'business' 중 하나여야 합니다",
      }),
    })
    .optional(),
})

export type UpdateUserCourseInput = z.infer<typeof updateUserCourseSchema>
