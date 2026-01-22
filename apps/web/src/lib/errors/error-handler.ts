import { NextResponse } from "next/server"
import {
  ServiceError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from "@lovetrip/shared/types/errors"
import { sanitizeError } from "@/lib/security/error-sanitization"

/**
 * 표준 에러 응답 형식
 */
export interface ErrorResponse {
  error: {
    code: string
    message: string
    details?: unknown
  }
}

/**
 * 에러를 표준 형식으로 변환
 */
export function handleError(error: unknown): NextResponse<ErrorResponse> {
  // ServiceError 계열 처리
  if (error instanceof ServiceError) {
    return NextResponse.json(
      {
        error: {
          code: error.code || "SERVICE_ERROR",
          message: error.message,
        },
      },
      { status: error.statusCode || 500 }
    )
  }

  // 특정 에러 타입별 처리
  if (error instanceof AuthenticationError) {
    return NextResponse.json(
      {
        error: {
          code: "AUTHENTICATION_ERROR",
          message: error.message,
        },
      },
      { status: 401 }
    )
  }

  if (error instanceof AuthorizationError) {
    return NextResponse.json(
      {
        error: {
          code: "AUTHORIZATION_ERROR",
          message: error.message,
        },
      },
      { status: 403 }
    )
  }

  if (error instanceof NotFoundError) {
    return NextResponse.json(
      {
        error: {
          code: "NOT_FOUND",
          message: error.message,
        },
      },
      { status: 404 }
    )
  }

  if (error instanceof ValidationError) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: error.message,
        },
      },
      { status: 400 }
    )
  }

  // 일반 Error 처리
  if (error instanceof Error) {
    // Supabase 에러 코드 매핑
    const supabaseErrorCode = (error as { code?: string }).code
    if (supabaseErrorCode === "PGRST116") {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "리소스를 찾을 수 없습니다",
          },
        },
        { status: 404 }
      )
    }

    // 민감한 정보 제거된 에러 메시지
    const safeMessage = sanitizeError(error)
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: safeMessage,
        },
      },
      { status: 500 }
    )
  }

  // 알 수 없는 에러
  return NextResponse.json(
    {
      error: {
        code: "UNKNOWN_ERROR",
        message: "알 수 없는 오류가 발생했습니다",
      },
    },
    { status: 500 }
  )
}

/**
 * 에러 로깅
 */
export function logError(error: unknown, context?: string): void {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorStack = error instanceof Error ? error.stack : undefined

  console.error(`[${context || "Error"}]`, {
    message: errorMessage,
    stack: errorStack,
    error,
  })

  // 향후 에러 추적 시스템 연동 (Sentry 등)
}
