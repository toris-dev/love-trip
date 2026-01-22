-- Migration: Create function to hard delete accounts after 90 days
-- Created: 2025-01-21
-- Description: 90일이 지난 삭제된 계정을 영구적으로 삭제하는 함수

-- 90일이 지난 삭제된 계정을 찾아서 영구적으로 삭제하는 함수
CREATE OR REPLACE FUNCTION public.hard_delete_expired_accounts()
RETURNS TABLE(deleted_count INTEGER, deleted_user_ids UUID[])
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  deleted_user_ids UUID[];
  deleted_count INTEGER;
BEGIN
  -- 90일 이상 지난 삭제된 계정 찾기
  -- 주의: profiles.id가 auth.users.id를 직접 참조하므로 user_id 컬럼이 없음
  WITH expired_accounts AS (
    SELECT id
    FROM public.profiles
    WHERE is_deleted = true
      AND deleted_at IS NOT NULL
      AND deleted_at < NOW() - INTERVAL '90 days'
  )
  -- Supabase Auth에서 사용자 삭제 (auth.users 테이블)
  -- 주의: 실제 auth.users 삭제는 Supabase Admin API를 통해 해야 하므로,
  -- 여기서는 profiles 테이블의 데이터만 삭제하고, auth.users는 Edge Function에서 처리
  DELETE FROM public.profiles
  WHERE id IN (SELECT id FROM expired_accounts)
  RETURNING id INTO STRICT deleted_user_ids;

  deleted_count := array_length(deleted_user_ids, 1);
  
  -- 관련 데이터도 삭제 (CASCADE로 자동 삭제되지만 명시적으로 처리)
  -- user_courses, travel_plans 등은 user_id로 연결되어 있으므로
  -- profiles 삭제 시 CASCADE로 자동 삭제됨
  
  RETURN QUERY SELECT deleted_count, deleted_user_ids;
END;
$$;

COMMENT ON FUNCTION public.hard_delete_expired_accounts() IS '90일이 지난 삭제된 계정을 영구적으로 삭제하는 함수. Supabase Edge Function에서 호출하여 auth.users도 함께 삭제해야 함.';

-- 함수 실행 권한 부여
GRANT EXECUTE ON FUNCTION public.hard_delete_expired_accounts() TO authenticated;
