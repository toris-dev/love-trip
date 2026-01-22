# 계정 삭제 가이드

## 개요

계정 삭제는 **Soft Delete** 방식으로 구현되어 있으며, 90일 후 자동으로 **Hard Delete**가 수행됩니다.

## 구현 내용

### 1. 데이터베이스 스키마

#### `profiles` 테이블 필드 추가

- `is_deleted` (BOOLEAN): 계정 삭제 여부 (기본값: `false`)
- `deleted_at` (TIMESTAMPTZ): 계정 삭제 요청 시각

**마이그레이션**: `20250121000008_add_is_deleted_to_profiles.sql`

### 2. 계정 삭제 프로세스

#### Soft Delete (즉시 실행)

1. **API 호출**: `DELETE /api/profile/delete`
2. **처리 내용**:
   - `profiles.is_deleted`를 `true`로 설정
   - `profiles.deleted_at`에 현재 시간 저장
   - 민감한 정보 마스킹:
     - `display_name`: `삭제된 사용자_{user_id 일부}`
     - `nickname`: `null` (검색 불가능)
     - `avatar_url`: `null`
     - `bio`: `null`
3. **사용자 로그아웃**: 세션 종료

#### Hard Delete (90일 후 자동 실행)

1. **Edge Function**: `hard-delete-accounts`
   - 매일 자정에 실행 (Supabase Cron 설정 필요)
   - 90일 이상 지난 삭제된 계정 찾기
   - **모든 사용자 관련 데이터 삭제** (위의 "삭제되는 데이터 목록" 참조)
   - Supabase Auth에서 사용자 삭제 (`auth.users`)
   - `profiles` 테이블에서 데이터 영구 삭제

### 3. RLS (Row Level Security) 정책

삭제된 계정(`is_deleted = true`)은 모든 쿼리에서 제외됩니다:

- 프로필 검색에서 제외
- 자신의 프로필 조회도 불가능 (이미 로그아웃됨)
- UPDATE 정책에서도 제외

**마이그레이션**: `20250121000011_update_profiles_rls_for_deleted_accounts.sql`

## 설정 방법

### 1. 마이그레이션 적용

```bash
# Supabase MCP를 통해 마이그레이션 적용
# 또는 Supabase CLI 사용
supabase db push
```

### 2. Edge Function 배포

```bash
# Supabase CLI 사용
supabase functions deploy hard-delete-accounts
```

### 3. Cron Job 설정 (Supabase Dashboard)

**방법 1: Supabase Dashboard에서 설정 (권장)**

1. Supabase Dashboard → Edge Functions → `hard-delete-accounts`
2. Schedule 탭 → "Add Schedule" 클릭
3. 설정:
   - **Schedule**: `0 0 * * *` (매일 자정)
   - **Timezone**: `Asia/Seoul` (또는 원하는 시간대)
   - **Enabled**: `true`

**방법 2: pg_cron 사용 (선택사항)**

PostgreSQL 함수만 호출하는 경우 (profiles만 삭제, auth.users는 Edge Function에서 처리):

```sql
SELECT cron.schedule(
  'hard-delete-expired-accounts',
  '0 0 * * *', -- 매일 자정
  $$
  SELECT public.hard_delete_expired_accounts();
  $$
);
```

> ⚠️ **주의**: 방법 2는 `profiles`만 삭제하므로, `auth.users` 삭제를 위해서는 Edge Function을 사용해야 합니다.

## API 사용

### 계정 삭제 요청

```typescript
const response = await fetch("/api/profile/delete", {
  method: "DELETE",
})

if (response.ok) {
  const data = await response.json()
  // data.message: "계정 삭제가 요청되었습니다. 90일 후 영구적으로 삭제됩니다."
  // data.deletedAt: 삭제 요청 시각
}
```

### 응답 형식

**성공 (200)**:
```json
{
  "message": "계정 삭제가 요청되었습니다. 90일 후 영구적으로 삭제됩니다.",
  "deletedAt": "2025-01-21T12:00:00.000Z"
}
```

**에러 (401/500)**:
```json
{
  "error": "에러 메시지"
}
```

## 복구 방법

90일 이내에 계정을 복구하려면:

1. 데이터베이스에서 직접 수정:
```sql
UPDATE public.profiles
SET 
  is_deleted = false,
  deleted_at = NULL,
  display_name = '원래 이름', -- 복구
  nickname = '원래 닉네임' -- 복구
WHERE id = 'user_id';
```

2. Supabase Auth에서 사용자 재활성화 (필요시)

## 주의사항

1. **90일 유예 기간**: 삭제 요청 후 90일 동안은 데이터가 보존됩니다.
2. **자동 삭제**: 90일 후 Edge Function이 자동으로 영구 삭제합니다.
3. **복구 불가**: Hard Delete 후에는 데이터 복구가 불가능합니다.
4. **관련 데이터**: `profiles` 삭제 시 CASCADE로 관련 데이터도 자동 삭제됩니다.

## 삭제되는 데이터 목록

계정 삭제 시 다음 데이터가 모두 삭제됩니다:

### 사용자 생성 데이터
- `user_courses` - 사용자가 만든 코스
- `user_course_places` - 코스의 장소들
- `travel_plans` - 여행 계획
- `travel_days` - 여행 일정
- `travel_day_places` - 여행 일정의 장소들
- `travel_memories` - 여행 추억

### 사용자 액션 데이터
- `user_course_likes` - 코스 좋아요
- `user_course_saves` - 코스 저장
- `place_favorites` - 장소 즐겨찾기

### 지출 및 예산
- `expenses` - 지출 내역
- `expense_splits` - 지출 분할
- `budget_items` - 예산 항목

### 커플 관련
- `couples` - 커플 연결
- `shared_calendars` - 공유 캘린더
- `calendar_events` - 캘린더 이벤트

### 게이미피케이션
- `user_gamification` - 게이미피케이션 데이터
- `user_badges` - 배지
- `user_achievements` - 업적

### 구독 및 알림
- `subscriptions` - 구독 정보
- `push_subscriptions` - 푸시 알림 구독

### 기타
- `reservation_reminders` - 예약 리마인더
- `profiles` - 프로필 정보
- `auth.users` - Supabase Auth 사용자

## 관련 파일

- **마이그레이션**:
  - `supabase/migrations/20250121000008_add_is_deleted_to_profiles.sql`
  - `supabase/migrations/20250121000009_create_hard_delete_accounts_function.sql`
  - `supabase/migrations/20250121000010_setup_cron_hard_delete_accounts.sql`
  - `supabase/migrations/20250121000011_update_profiles_rls_for_deleted_accounts.sql`

- **API**: `apps/web/src/app/api/profile/delete/route.ts`

- **Edge Function**: 
  - `supabase/functions/hard-delete-accounts/index.ts`
  - `supabase/functions/hard-delete-accounts/README.md`

- **컴포넌트**: `apps/web/src/components/features/profile/components/settings-section.tsx`
