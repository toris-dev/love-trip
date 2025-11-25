import dotenv from "dotenv"
import { z } from "zod"
import { fileURLToPath } from "url"
import { dirname, resolve } from "path"

// ESM에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 루트 프로젝트의 .env.local 파일 로드
const rootEnvPath = resolve(__dirname, "../../../.env.local")
const adminEnvPath = resolve(__dirname, "../.env")

// 크롤러 디렉토리의 .env 파일 먼저 로드
try {
  dotenv.config({ path: adminEnvPath })
} catch (error) {
  // 파일이 없어도 계속 진행
}

// 루트 프로젝트의 .env.local 파일 로드
try {
  dotenv.config({ path: rootEnvPath })
} catch (error) {
  // 파일이 없어도 계속 진행
}

// 현재 작업 디렉토리 기준으로도 시도
try {
  dotenv.config({ path: resolve(process.cwd(), ".env.local") })
} catch (error) {
  // 파일이 없어도 계속 진행
}

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  ADMIN_SECRET: z.string().optional(), // 관리자 페이지 접근 비밀번호 (선택사항)
})

export const config = envSchema.parse({
  PORT: process.env.PORT || 3001,
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  ADMIN_SECRET: process.env.ADMIN_SECRET,
})

