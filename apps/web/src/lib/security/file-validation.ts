/**
 * 파일 업로드 보안 검증 유틸리티
 */

// 허용된 이미지 MIME 타입
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
] as const

// 허용된 파일 확장자
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"] as const

// 최대 파일 크기 (5MB) - 프로필 이미지용
const MAX_FILE_SIZE = 5 * 1024 * 1024

// 최대 파일 크기 (10MB) - 메모리/영수증용
export const MAX_FILE_SIZE_LARGE = 10 * 1024 * 1024

export interface FileValidationResult {
  valid: boolean
  error?: string
}

/**
 * 파일 확장자 검증
 */
function validateFileExtension(filename: string): boolean {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf("."))
  return ALLOWED_EXTENSIONS.some((allowed) => ext === allowed)
}

/**
 * 파일명 sanitization (보안 강화)
 */
export function sanitizeFilename(filename: string): string {
  // 위험한 문자 제거
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\.\./g, "_")
    .replace(/^\./, "_")
    .substring(0, 255) // 파일명 길이 제한
}

/**
 * 파일 업로드 검증
 */
export function validateImageFile(file: File): FileValidationResult {
  // 1. 파일 존재 확인
  if (!file) {
    return { valid: false, error: "파일이 제공되지 않았습니다" }
  }

  // 2. 파일 크기 검증
  if (file.size === 0) {
    return { valid: false, error: "빈 파일은 업로드할 수 없습니다" }
  }

  if (file.size > MAX_FILE_SIZE) {
    const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024)
    return {
      valid: false,
      error: `파일 크기는 ${maxSizeMB}MB 이하여야 합니다`,
    }
  }

  // 3. MIME 타입 검증
  if (!file.type || !file.type.startsWith("image/")) {
    return { valid: false, error: "이미지 파일만 업로드 가능합니다" }
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return { valid: false, error: "지원하지 않는 이미지 형식입니다" }
  }

  // 4. 파일 확장자 검증 (MIME 타입 스푸핑 방지)
  if (!validateFileExtension(file.name)) {
    return { valid: false, error: "허용되지 않은 파일 확장자입니다" }
  }

  // 5. 파일명 검증 (경로 탐색 공격 방지)
  const sanitized = sanitizeFilename(file.name)
  if (sanitized !== file.name) {
    return { valid: false, error: "파일명에 허용되지 않은 문자가 포함되어 있습니다" }
  }

  return { valid: true }
}

/**
 * 파일 크기를 사람이 읽기 쉬운 형식으로 변환
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
