-- Migration: Setup cron job documentation for hard delete accounts
-- Created: 2025-01-21
-- Description: 90일이 지난 삭제된 계정을 영구적으로 삭제하는 cron job 설정 가이드

-- 주의: Supabase에서는 pg_cron이 Edge Function을 직접 호출할 수 없습니다.
-- 따라서 다음 두 가지 방법 중 하나를 선택해야 합니다:

-- 방법 1: Supabase Dashboard에서 Edge Function Cron 설정 (권장)
-- 1. Supabase Dashboard → Edge Functions → hard-delete-accounts
-- 2. Schedule 탭 → "Add Schedule" 클릭
-- 3. 설정:
--    - Schedule: "0 0 * * *" (매일 자정)
--    - Timezone: Asia/Seoul
--    - Enabled: true
-- 4. 이 방법은 auth.users와 profiles 모두 삭제할 수 있습니다.

-- 방법 2: PostgreSQL 함수를 pg_cron으로 호출 (profiles만 삭제)
-- auth.users 삭제는 Edge Function에서 처리해야 하므로, 이 방법은 완전하지 않습니다.
-- Edge Function에서 이 함수를 호출하는 것을 권장합니다.

-- PostgreSQL 함수를 cron으로 호출하는 예시 (선택사항)
-- SELECT cron.schedule(
--   'hard-delete-expired-accounts',
--   '0 0 * * *', -- 매일 자정
--   $$
--   SELECT public.hard_delete_expired_accounts();
--   $$
-- );

-- Cron job 확인 (방법 2 사용 시)
-- SELECT * FROM cron.job WHERE jobname = 'hard-delete-expired-accounts';

-- Cron job 삭제 (방법 2 사용 시)
-- SELECT cron.unschedule('hard-delete-expired-accounts');

COMMENT ON FUNCTION public.hard_delete_expired_accounts() IS '90일이 지난 삭제된 계정을 영구적으로 삭제하는 함수. Edge Function과 함께 사용하여 auth.users도 삭제해야 함.';
