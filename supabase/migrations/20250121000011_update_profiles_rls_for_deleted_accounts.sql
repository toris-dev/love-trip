-- Migration: Update RLS policies to exclude deleted accounts
-- Created: 2025-01-21
-- Description: is_deleted가 true인 계정은 모든 쿼리에서 제외

-- 기존 SELECT 정책에 is_deleted 체크 추가
-- 모든 profiles SELECT 정책을 찾아서 is_deleted = false 조건 추가 필요

-- 예시: 공개 프로필 검색 정책 업데이트
DROP POLICY IF EXISTS "Authenticated users can search public profiles by nickname" ON public.profiles;
CREATE POLICY "Authenticated users can search public profiles by nickname" ON public.profiles
FOR SELECT TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND nickname IS NOT NULL 
  AND is_deleted = false
  AND (
    is_public = true 
    OR auth.uid() = id
  )
);

-- 사용자 자신의 프로필 조회 정책 (기존 정책이 있다면 업데이트)
-- 주의: 기존 정책 이름을 확인하고 적절히 수정해야 함
-- 예시:
-- DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
-- CREATE POLICY "Users can read own profile" ON public.profiles
-- FOR SELECT TO authenticated
-- USING (auth.uid() = id AND is_deleted = false);

-- UPDATE 정책에도 is_deleted 체크 추가
-- DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
-- CREATE POLICY "Users can update own profile" ON public.profiles
-- FOR UPDATE TO authenticated
-- USING (auth.uid() = id AND is_deleted = false)
-- WITH CHECK (auth.uid() = id AND is_deleted = false);

COMMENT ON COLUMN public.profiles.is_deleted IS '계정 삭제 여부. true인 경우 모든 쿼리에서 제외되어야 함.';
