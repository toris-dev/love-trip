# Supabase 규칙

이 프로젝트의 백엔드·인증·DB는 **Supabase**를 사용합니다.

## 클라이언트 사용처

- **브라우저(클라이언트)**: `@supabase/supabase-js`로 `createBrowserClient` 사용. 보통 앱에서 래퍼를 만들어 쓰며, `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` 사용.
- **서버(API Routes, Server Components, Cron 등)**: `@lovetrip/api`의 Supabase 서버 클라이언트 사용 (`packages/api/supabase/`). `SUPABASE_SERVICE_ROLE_KEY`는 서버에서만 사용.

## 환경 변수

- `NEXT_PUBLIC_SUPABASE_URL` — 프로젝트 URL (클라이언트·서버)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon key (클라이언트)
- `SUPABASE_SERVICE_ROLE_KEY` — 서버 전용, RLS 우회 가능 (절대 클라이언트에 노출 금지)
- Cron 등 보호된 API용: `CRON_SECRET` 등 별도 시크릿 사용 권장

## DB 타입 생성

- 스키마 변경 후 타입 동기화: `pnpm gen-types`
- 출력: `packages/shared/types/database.ts`
- 프로젝트 ID는 스크립트에 지정됨 (`dyomownljgsbwaxnljau`). 변경 시 `package.json`의 `gen-types` 스크립트 수정.

## 마이그레이션

- **위치**: `supabase/migrations/`
- **이름**: `YYYYMMDDHHMMSS_설명.sql` (예: `20250220000000_create_anniversary_reminders.sql`).
- **내용**: DDL만 (CREATE TABLE, ALTER, INDEX, RLS, POLICY 등). 적용 순서는 파일명 타임스탬프 기준.
- 로컬/리모트 적용: Supabase CLI 또는 대시보드(MCP 등) 사용.

## RLS (Row Level Security)

- 모든 사용자 데이터 테이블에는 RLS 활성화 권장.
- 정책은 `CREATE POLICY`로 명시. anon key로 접근하는 클라이언트는 RLS 적용됨.
- 서버에서 `service_role` 사용 시 RLS 우회 가능 — 필요한 경우에만 사용하고, 입력 검증 필수.

## Edge Functions

- **위치**: `supabase/functions/`
- 계정 삭제 등 무거운/민감 작업은 `hard-delete-accounts` 같은 Edge Function에서 처리 가능.
- 새 함수 추가 시 `supabase/functions/<name>/index.ts` 및 설정 정리.

## 인증

- Supabase Auth (이메일/비밀번호, OAuth 등) 사용.
- 세션은 쿠키/서버 어댑터 연동 시 `@auth/supabase-adapter` 등 활용.
- API Route에서 사용자 식별이 필요하면 서버용 Supabase 클라이언트로 세션/유저 확인.

## 보안

- `SUPABASE_SERVICE_ROLE_KEY`는 환경 변수로만 관리, 코드/클라이언트에 포함 금지.
- 클라이언트에는 anon key만 사용. RLS로 테이블/행 단위 접근 제어.
- API Route에서 들어오는 파라미터·바디는 검증 후 사용 (`packages/shared` 스키마 등 활용 권장).
