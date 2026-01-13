-- Migration: Add target_audience field to user_courses table
-- Created: 2025-01-02
-- Description: 코스의 타겟 오디언스(커플/친구/가족/혼자/비즈니스)를 저장하기 위한 필드 추가

-- Add target_audience column with default value 'couple' for backward compatibility
ALTER TABLE public.user_courses
ADD COLUMN IF NOT EXISTS target_audience TEXT NOT NULL DEFAULT 'couple';

-- Add constraint to ensure only valid values
ALTER TABLE public.user_courses
ADD CONSTRAINT check_target_audience 
CHECK (target_audience IN ('couple', 'friend', 'family', 'solo', 'business'));

-- Create index for faster filtering queries
CREATE INDEX IF NOT EXISTS idx_user_courses_target_audience 
ON public.user_courses(target_audience);

-- Create composite index for common query patterns (public courses filtered by target)
CREATE INDEX IF NOT EXISTS idx_user_courses_public_target 
ON public.user_courses(is_public, target_audience) 
WHERE is_public = true;

-- Update existing records to have 'couple' as target_audience (already default, but explicit)
UPDATE public.user_courses
SET target_audience = 'couple'
WHERE target_audience IS NULL;

-- Add comment
COMMENT ON COLUMN public.user_courses.target_audience IS '코스 타겟 오디언스: couple(커플), friend(친구), family(가족), solo(혼자), business(비즈니스)';
