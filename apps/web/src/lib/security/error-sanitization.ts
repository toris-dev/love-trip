/**
 * 에러 메시지 보안 처리 유틸리티
 * 민감한 정보가 포함된 에러 메시지를 안전한 메시지로 변환
 */

/**
 * Supabase 에러 코드를 사용자 친화적인 메시지로 변환
 */
export function sanitizeSupabaseError(error: unknown): string {
  if (typeof error !== "object" || error === null) {
    return "오류가 발생했습니다"
  }

  const supabaseError = error as {
    code?: string
    message?: string
    details?: string
    hint?: string
  }

  // Supabase 에러 코드별 처리
  switch (supabaseError.code) {
    case "PGRST116":
      return "요청한 데이터를 찾을 수 없습니다"
    case "23505": // unique_violation
      return "이미 존재하는 데이터입니다"
    case "23503": // foreign_key_violation
      return "관련된 데이터가 없습니다"
    case "42501": // insufficient_privilege
      return "권한이 없습니다"
    case "PGRST301": // RLS violation
      return "접근 권한이 없습니다"
    case "22P02": // invalid_text_representation
      return "잘못된 데이터 형식입니다"
    case "23514": // check_violation
      return "데이터 검증에 실패했습니다"
    default:
      // 원본 메시지에서 민감한 정보 제거
      const message = supabaseError.message || "오류가 발생했습니다"
      return sanitizeErrorMessage(message)
  }
}

/**
 * 에러 메시지에서 민감한 정보 제거
 */
function sanitizeErrorMessage(message: string): string {
  // 데이터베이스 내부 정보 제거
  let sanitized = message

  // UUID 패턴 제거 (예: "550e8400-e29b-41d4-a716-446655440000")
  sanitized = sanitized.replace(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
    "[ID]"
  )

  // 파일 경로 제거
  sanitized = sanitized.replace(/\/[^\s]+\/[^\s]+/g, "[경로]")

  // 이메일 주소 마스킹
  sanitized = sanitized.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    "[이메일]"
  )

  // SQL 쿼리 제거
  sanitized = sanitized.replace(/SELECT|INSERT|UPDATE|DELETE|FROM|WHERE/gi, "[쿼리]")

  // 스택 트레이스 제거
  sanitized = sanitized.split("\n")[0]

  // 너무 긴 메시지 자르기
  if (sanitized.length > 200) {
    sanitized = sanitized.substring(0, 200) + "..."
  }

  return sanitized || "오류가 발생했습니다"
}

/**
 * 일반 에러를 안전한 메시지로 변환
 */
export function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    // Supabase 에러인지 확인
    if ("code" in error || "message" in error) {
      return sanitizeSupabaseError(error)
    }
    return sanitizeErrorMessage(error.message)
  }

  if (typeof error === "string") {
    return sanitizeErrorMessage(error)
  }

  return "오류가 발생했습니다"
}
