import dotenv from "dotenv"
import { z } from "zod"
import { fileURLToPath } from "url"
import { dirname, resolve } from "path"

// ESM에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 루트 프로젝트의 .env.local 파일 로드 (여러 경로 시도)
const rootEnvPath = resolve(__dirname, "../../../.env.local")
const crawlerEnvPath = resolve(__dirname, "../.env")

// 크롤러 디렉토리의 .env 파일 먼저 로드 (우선순위 높음)
try {
  dotenv.config({ path: crawlerEnvPath })
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
  TOUR_API_KEY: z.string().min(1, "TOUR_API_KEY is required"),
  TOUR_API_BASE_URL: z.string().url().default("https://apis.data.go.kr/B551011/KorService1"),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  BATCH_SIZE: z.coerce.number().default(100),
  DELAY_MS: z.coerce.number().default(1000), // API 호출 간 딜레이 (ms)
})

export const config = envSchema.parse({
  TOUR_API_KEY: process.env.TOUR_API_KEY,
  TOUR_API_BASE_URL: process.env.TOUR_API_BASE_URL || "https://apis.data.go.kr/B551011/KorService1",
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  BATCH_SIZE: process.env.BATCH_SIZE || 100,
  DELAY_MS: process.env.DELAY_MS || 1000,
})

// Tour API Content Type IDs
export const CONTENT_TYPE_IDS = {
  TOURIST_SPOT: 12, // 관광지
  CULTURAL_FACILITY: 14, // 문화시설
  FESTIVAL: 15, // 축제공연행사
  TRAVEL_COURSE: 25, // 여행코스
  LEISURE_SPORTS: 28, // 레포츠
  ACCOMMODATION: 32, // 숙박
  SHOPPING: 38, // 쇼핑
  RESTAURANT: 39, // 음식점
} as const

// 지역 코드 (주요 지역)
export const AREA_CODES = {
  SEOUL: 1,
  INCHEON: 2,
  GYEONGGI: 31,
  GANGWON: 32,
  CHUNGBUK: 33,
  CHUNGNAM: 34,
  GYEONGBUK: 35,
  GYEONGNAM: 36,
  JEONBUK: 37,
  JEONNAM: 38,
  JEJU: 39,
} as const

