-- Migration: Add onboarding_completed field to profiles table
-- Created: 2025-01-01
-- Description: 온보딩 완료 여부를 추적하기 위한 필드 추가

-- Add onboarding_completed column
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed 
ON public.profiles(onboarding_completed) 
WHERE onboarding_completed = false;

-- Add comment
COMMENT ON COLUMN public.profiles.onboarding_completed IS '온보딩 완료 여부';
