import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

/**
 * 요청 본문 검증 헬퍼
 */
export async function validateRequest<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: NextResponse }> {
  try {
    const body = await request.json()
    const data = schema.parse(body)
    return { success: true, data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      const message = firstError
        ? `${firstError.path.join(".")}: ${firstError.message}`
        : "입력 데이터가 올바르지 않습니다"

      return {
        success: false,
        error: NextResponse.json(
          {
            error: {
              code: "VALIDATION_ERROR",
              message,
              details: error.errors,
            },
          },
          { status: 400 }
        ),
      }
    }

    return {
      success: false,
      error: NextResponse.json(
        {
          error: {
            code: "INVALID_REQUEST",
            message: "요청 본문을 파싱할 수 없습니다",
          },
        },
        { status: 400 }
      ),
    }
  }
}
