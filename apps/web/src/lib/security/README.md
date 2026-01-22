# 보안 유틸리티

이 디렉토리는 Next.js 애플리케이션 레벨에서의 보안 검증 및 처리 유틸리티를 포함합니다.

## 파일 설명

### `file-validation.ts`
파일 업로드 보안 검증 유틸리티

**주요 기능**:
- MIME 타입 검증
- 파일 확장자 검증 (MIME 타입 스푸핑 방지)
- 파일 크기 제한
- 파일명 sanitization (경로 탐색 공격 방지)

**사용 예시**:
```typescript
import { validateImageFile } from "@/lib/security/file-validation"

const validation = validateImageFile(file)
if (!validation.valid) {
  return { error: validation.error }
}
```

### `error-sanitization.ts`
에러 메시지 보안 처리 유틸리티

**주요 기능**:
- Supabase 에러 코드를 사용자 친화적인 메시지로 변환
- 민감한 정보 제거 (UUID, 파일 경로, 이메일, SQL 쿼리 등)
- 스택 트레이스 제거

**사용 예시**:
```typescript
import { sanitizeError } from "@/lib/security/error-sanitization"

try {
  // ...
} catch (error) {
  const safeError = sanitizeError(error)
  return NextResponse.json({ error: safeError }, { status: 500 })
}
```

### `request-validation.ts`
API 요청 보안 검증 유틸리티

**주요 기능**:
- Content-Type 검증
- 요청 크기 제한
- Origin 검증 (CORS)

**사용 예시**:
```typescript
import { validateContentType, validateRequestSize } from "@/lib/security/request-validation"

const contentTypeValidation = validateContentType(request, ["multipart/form-data"])
if (!contentTypeValidation.valid) {
  return NextResponse.json({ error: contentTypeValidation.error }, { status: 400 })
}
```

## 보안 체크리스트

파일 업로드 API를 구현할 때 다음을 확인하세요:

- [ ] `validateImageFile()` 또는 적절한 파일 검증 함수 사용
- [ ] `sanitizeFilename()`으로 파일명 sanitization
- [ ] `validateContentType()`으로 Content-Type 검증
- [ ] `validateRequestSize()`로 요청 크기 제한
- [ ] `sanitizeError()`로 에러 메시지에서 민감한 정보 제거
- [ ] 클라이언트 사이드 사전 검증 (UX 개선)

## 참고

- 보안 점검 보고서: `docs/SECURITY_AUDIT_REPORT.md`
- Supabase RLS 정책: `supabase/migrations/`
