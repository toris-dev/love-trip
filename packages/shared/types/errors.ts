/**
 * Error Types
 *
 * 공통 에러 타입 정의
 */

/**
 * 서비스 에러 클래스
 */
export class ServiceError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number
  ) {
    super(message)
    this.name = "ServiceError"
  }
}

/**
 * 인증 에러
 */
export class AuthenticationError extends ServiceError {
  constructor(message: string = "인증이 필요합니다") {
    super(message, "AUTHENTICATION_ERROR", 401)
    this.name = "AuthenticationError"
  }
}

/**
 * 권한 에러
 */
export class AuthorizationError extends ServiceError {
  constructor(message: string = "권한이 없습니다") {
    super(message, "AUTHORIZATION_ERROR", 403)
    this.name = "AuthorizationError"
  }
}

/**
 * 리소스 없음 에러
 */
export class NotFoundError extends ServiceError {
  constructor(message: string = "리소스를 찾을 수 없습니다") {
    super(message, "NOT_FOUND", 404)
    this.name = "NotFoundError"
  }
}

/**
 * 유효성 검사 에러
 */
export class ValidationError extends ServiceError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", 400)
    this.name = "ValidationError"
  }
}
