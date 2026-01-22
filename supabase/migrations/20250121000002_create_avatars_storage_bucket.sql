-- Migration: Create avatars storage bucket
-- Created: 2025-01-21
-- Description: 프로필 이미지 저장을 위한 Storage 버킷 생성

-- Storage 버킷 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

-- 주의: Storage 정책은 Supabase 대시보드에서 수동으로 설정해야 합니다.
-- 또는 Supabase Management API를 사용하여 설정할 수 있습니다.
-- 
-- 필요한 정책:
-- 1. 업로드: 사용자는 자신의 폴더(user_id)에만 업로드 가능
-- 2. 읽기: 공개 버킷이므로 모든 인증된 사용자가 읽기 가능
-- 3. 삭제: 사용자는 자신의 파일만 삭제 가능
