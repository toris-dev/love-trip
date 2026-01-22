-- Migration: Add is_deleted and deleted_at fields to profiles table
-- Created: 2025-01-21
-- Description: 계정 삭제를 위한 soft delete 필드 추가

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_profiles_is_deleted ON public.profiles(is_deleted) WHERE is_deleted = true;
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON public.profiles(deleted_at) WHERE deleted_at IS NOT NULL;

COMMENT ON COLUMN public.profiles.is_deleted IS '계정 삭제 여부 (true: 삭제됨, false: 활성)';
COMMENT ON COLUMN public.profiles.deleted_at IS '계정 삭제 요청 시각 (90일 후 hard delete 예정)';
