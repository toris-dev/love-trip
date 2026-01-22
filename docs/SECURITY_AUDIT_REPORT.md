# 보안 점검 및 수정 보고서

**날짜**: 2025-01-21  
**점검 범위**: Supabase 테이블 RLS 정책 및 Storage 버킷 정책

## 수정 완료된 항목

### 1. profiles 테이블 RLS 정책 보안 강화 ✅

**문제점**:
- "Authenticated users can search profiles by nickname" 정책이 모든 인증된 사용자가 모든 프로필을 검색할 수 있도록 허용

**수정 내용**:
- 정책명 변경: "Authenticated users can search public profiles by nickname"
- `is_public = true` 체크 추가
- 공개 프로필이거나 자신의 프로필만 검색 가능하도록 제한

**수정 전**:
```sql
USING ((auth.uid() IS NOT NULL) AND (nickname IS NOT NULL))
```

**수정 후**:
```sql
USING (
  auth.uid() IS NOT NULL 
  AND nickname IS NOT NULL
  AND (
    is_public = true 
    OR auth.uid() = id
  )
)
```

### 2. contact_messages 테이블 RLS 정책 보안 강화 ✅

**문제점**:
- "Anyone can insert contact messages" 정책이 `WITH CHECK (true)`로 설정되어 무제한 접근 허용

**수정 내용**:
- 정책명 변경: "Authenticated users can insert contact messages"
- 인증된 사용자만 메시지 전송 가능하도록 제한
- `WITH CHECK (auth.uid() IS NOT NULL)` 추가

**수정 전**:
```sql
WITH CHECK (true)
```

**수정 후**:
```sql
WITH CHECK (auth.uid() IS NOT NULL)
```

### 3. 함수 search_path 보안 강화 ✅

**수정된 함수**:
- `update_updated_at_column()` - `SET search_path = public, pg_temp` 추가
- `update_subscriptions_updated_at()` - `SET search_path = public, pg_temp` 추가
- `calculate_distance()` - `SET search_path = public, pg_temp` 추가
- `calculate_distance_km()` - `SET search_path = public, pg_temp` 추가
- `create_travel_plan_with_transaction()` - `SET search_path = public, pg_temp` 추가
- `update_user_course_stats()` - `SET search_path = public, pg_temp` 추가
- `notify_couple_on_event_create()` - `SET search_path = public, pg_temp` 추가

## 수정 필요 항목 (추가 작업 필요)

### 1. 나머지 함수들의 search_path 설정

다음 함수들은 복잡한 코스 생성 함수들이므로, 필요시 개별적으로 수정이 필요합니다:
- `generate_date_courses()` - 코스 생성 함수 (복잡)
- `generate_travel_courses_for_region()` - 여행 코스 생성 함수 (복잡)
- `generate_date_courses_by_sigungu()` - 시군구별 코스 생성 함수 (복잡)
- `generate_date_courses_batch()` - 배치 코스 생성 함수 (복잡)

**참고**: 이 함수들은 내부 관리용 함수로, 외부에서 직접 호출되지 않으므로 우선순위가 낮습니다.

**권장 수정 방법**:
```sql
CREATE OR REPLACE FUNCTION public.function_name(...)
RETURNS ...
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- 이 줄 추가
AS $$
BEGIN
  -- 함수 본문
END;
$$;
```

### 2. Storage 버킷 정책 설정

**현재 상태**: `avatars` 버킷은 생성되었지만 정책이 설정되지 않음

**필요한 정책** (Supabase 대시보드에서 수동 설정 필요):

#### 업로드 정책 (INSERT)
- **Policy name**: "Users can upload their own avatars"
- **Allowed operation**: INSERT
- **Policy definition**: 
  ```sql
  (bucket_id = 'avatars') 
  AND (storage.foldername(name))[1] = (auth.uid())::text
  ```
- **Target roles**: authenticated

#### 읽기 정책 (SELECT)
- **Policy name**: "Public read access for avatars"
- **Allowed operation**: SELECT
- **Policy definition**: 
  ```sql
  bucket_id = 'avatars'
  ```
- **Target roles**: authenticated

#### 업데이트 정책 (UPDATE)
- **Policy name**: "Users can update their own avatars"
- **Allowed operation**: UPDATE
- **Policy definition**: 
  ```sql
  (bucket_id = 'avatars') 
  AND (storage.foldername(name))[1] = (auth.uid())::text
  ```
- **Target roles**: authenticated

#### 삭제 정책 (DELETE)
- **Policy name**: "Users can delete their own avatars"
- **Allowed operation**: DELETE
- **Policy definition**: 
  ```sql
  (bucket_id = 'avatars') 
  AND (storage.foldername(name))[1] = (auth.uid())::text
  ```
- **Target roles**: authenticated

### 3. Security Definer View

**문제점**:
- `expense_settlement_summary` 뷰가 `SECURITY DEFINER`로 정의됨

**권장 조치**:
- 뷰의 목적과 사용 사례를 검토
- 필요시 `SECURITY INVOKER`로 변경 고려
- 또는 뷰에 대한 적절한 RLS 정책 설정

### 4. Auth 설정

**문제점**:
- Leaked Password Protection이 비활성화됨

**권장 조치**:
- Supabase 대시보드 → Authentication → Password에서 "Leaked Password Protection" 활성화
- HaveIBeenPwned.org와 연동하여 유출된 비밀번호 사용 방지

## 보안 체크리스트

### 테이블 RLS 정책 ✅
- [x] 모든 테이블에 RLS 활성화됨
- [x] profiles 테이블 정책 보안 강화
- [x] contact_messages 테이블 정책 보안 강화
- [ ] 다른 테이블 정책 점검 (필요시)

### Storage 버킷 정책 ⚠️
- [x] avatars 버킷 생성됨
- [ ] 업로드 정책 설정 필요
- [ ] 읽기 정책 설정 필요
- [ ] 업데이트 정책 설정 필요
- [ ] 삭제 정책 설정 필요

### 함수 보안 ⚠️
- [x] 일부 함수의 search_path 설정 완료
- [ ] 나머지 함수들의 search_path 설정 필요
- [ ] Security Definer 함수 검토 필요

### 인증 보안 ⚠️
- [ ] Leaked Password Protection 활성화 필요

## Next.js 애플리케이션 레벨 보안 강화 ✅

### 1. 파일 업로드 보안 검증 강화

**구현 내용**:
- `lib/security/file-validation.ts`: 파일 검증 유틸리티 생성
  - MIME 타입 검증
  - 파일 확장자 검증 (MIME 타입 스푸핑 방지)
  - 파일 크기 제한
  - 파일명 sanitization (경로 탐색 공격 방지)
- `lib/security/request-validation.ts`: 요청 검증 유틸리티 생성
  - Content-Type 검증
  - 요청 크기 제한

**적용된 API**:
- `/api/profile/avatar` - 프로필 이미지 업로드
- `/api/travel-plans/[id]/expenses/[expenseId]/receipt` - 영수증 업로드
- `/api/travel-plans/[id]/memories/[memoryId]/photos` - 추억 사진 업로드

**클라이언트 사이드 검증**:
- `profile-card.tsx`: 파일 선택 시 즉시 검증
- 사용자 친화적인 에러 메시지 표시

### 2. 에러 메시지 보안 강화

**구현 내용**:
- `lib/security/error-sanitization.ts`: 에러 메시지 sanitization 유틸리티 생성
  - Supabase 에러 코드를 사용자 친화적인 메시지로 변환
  - 민감한 정보 제거 (UUID, 파일 경로, 이메일, SQL 쿼리 등)
  - 스택 트레이스 제거

**적용된 위치**:
- 모든 API 라우트의 에러 처리
- `lib/errors/error-handler.ts`: 표준 에러 핸들러에 통합

### 3. 보안 검증 체크리스트

**파일 업로드**:
- [x] MIME 타입 검증
- [x] 파일 확장자 검증
- [x] 파일 크기 제한
- [x] 파일명 sanitization
- [x] Content-Type 헤더 검증
- [x] 요청 크기 제한
- [x] 클라이언트 사이드 사전 검증

**에러 처리**:
- [x] 민감한 정보 제거
- [x] 사용자 친화적인 메시지 변환
- [x] Supabase 에러 코드 매핑

## 다음 단계

1. **즉시 조치 필요**:
   - Storage 버킷 정책 설정 (Supabase 대시보드)
   - Leaked Password Protection 활성화

2. **단기 조치**:
   - 나머지 함수들의 search_path 설정
   - Security Definer View 검토
   - Rate limiting 구현 고려 (추후)

3. **정기 점검**:
   - 월 1회 보안 어드바이저 실행
   - 새로운 테이블/함수 추가 시 보안 정책 검토
   - 파일 업로드 API 정기 보안 점검
