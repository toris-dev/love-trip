import { config } from "dotenv"
import { fileURLToPath } from "url"
import { dirname, resolve } from "path"

// ESM에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 루트 프로젝트의 .env.local 파일 로드 (존재하는 경우)
// Next.js는 기본적으로 apps/web/.env.local을 자동으로 로드하므로,
// 루트의 .env.local도 추가로 로드합니다.
try {
  config({ path: resolve(__dirname, "../../.env.local") })
} catch (error) {
  // 파일이 없어도 에러를 발생시키지 않음
  console.warn("Root .env.local not found, using apps/web/.env.local only")
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@love-trip/shared",
    "@lovetrip/ui",
    "@lovetrip/api",
    "@lovetrip/planner",
    "@lovetrip/shared",
    "@lovetrip/gamification",
    "@radix-ui/react-dropdown-menu",
  ],
  // 서버 컴포넌트에서 외부 패키지 의존성을 제대로 해석하도록 설정
  // Next.js 16에서는 serverExternalPackages로 이름이 변경되고 stable feature가 됨
  // Turbopack과 webpack 모두에서 작동
  serverExternalPackages: ["@supabase/ssr", "@supabase/supabase-js"],
  // Turbopack 설정 (Next.js 16에서 top-level 설정)
  turbopack: {
    // 파일시스템 캐싱 활성화 (빌드 성능 개선)
    // experimental이지만 안정적으로 작동
  },
  // Turbopack 파일시스템 캐싱 (성능 개선)
  // turbopackFileSystemCacheForDev는 기본적으로 활성화됨
  // turbopackFileSystemCacheForBuild는 canary 버전에서만 사용 가능
  experimental: {
    // turbopackFileSystemCacheForDev: true, // 기본값이므로 명시 불필요
    // turbopackFileSystemCacheForBuild: true, // canary 버전에서만 사용 가능
  },
  typescript: {
    // node_modules의 타입 에러는 무시 (skipLibCheck가 작동하지 않는 경우)
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 환경 변수를 명시적으로 전달
  env: {
    NEXT_PUBLIC_ENABLE_MSW: process.env.NEXT_PUBLIC_ENABLE_MSW,
    NEXT_PUBLIC_NAVER_CLOUD_API_KEY_ID: process.env.NEXT_PUBLIC_NAVER_CLOUD_API_KEY_ID,
    NEXT_PUBLIC_NAVER_DEV_CLIENT_ID: process.env.NEXT_PUBLIC_NAVER_DEV_CLIENT_ID,
    NEXT_PUBLIC_NAVER_CLOUD_API_KEY: process.env.NEXT_PUBLIC_NAVER_CLOUD_API_KEY,
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
      {
        source: "/manifest",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // CSS 파일 캐시 설정 (개발 환경에서 캐시 완전 비활성화 - Brave 브라우저 호환)
        source: "/:path*.css",
        headers: [
          {
            key: "Cache-Control",
            value:
              process.env.NODE_ENV === "production"
                ? "public, max-age=31536000, immutable"
                : "no-cache, no-store, must-revalidate, max-age=0",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
      },
      {
        // _next/static CSS 파일도 캐시 비활성화 (개발 환경)
        source: "/_next/static/:path*.css",
        headers: [
          {
            key: "Cache-Control",
            value:
              process.env.NODE_ENV === "production"
                ? "public, max-age=31536000, immutable"
                : "no-cache, no-store, must-revalidate, max-age=0",
          },
        ],
      },
    ]
  },
}

export default nextConfig
