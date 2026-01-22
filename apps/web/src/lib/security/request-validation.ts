/**
 * API 요청 보안 검증 유틸리티
 */

import { NextRequest } from "next/server"

/**
 * Content-Type 검증
 */
export function validateContentType(
  request: NextRequest,
  expectedTypes: string[]
): { valid: boolean; error?: string } {
  const contentType = request.headers.get("content-type")
  if (!contentType) {
    return { valid: false, error: "Content-Type 헤더가 없습니다" }
  }

  const isValid = expectedTypes.some((type) => contentType.includes(type))
  if (!isValid) {
    return {
      valid: false,
      error: `지원하지 않는 Content-Type입니다. 허용된 형식: ${expectedTypes.join(", ")}`,
    }
  }

  return { valid: true }
}

/**
 * 요청 크기 제한 검증
 */
export function validateRequestSize(
  request: NextRequest,
  maxSize: number
): { valid: boolean; error?: string } {
  const contentLength = request.headers.get("content-length")
  if (contentLength) {
    const size = parseInt(contentLength, 10)
    if (size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024)
      return {
        valid: false,
        error: `요청 크기는 ${maxSizeMB}MB 이하여야 합니다`,
      }
    }
  }

  return { valid: true }
}

/**
 * Origin 검증 (CORS)
 */
export function validateOrigin(request: NextRequest, allowedOrigins: string[]): boolean {
  const origin = request.headers.get("origin")
  if (!origin) {
    // 같은 origin에서의 요청은 origin 헤더가 없을 수 있음
    return true
  }

  return allowedOrigins.some((allowed) => origin.includes(allowed))
}
