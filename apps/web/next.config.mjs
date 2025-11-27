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
  transpilePackages: ["@love-trip/shared", "@lovetrip/ui"],
  typescript: {
    // node_modules의 타입 에러는 무시 (skipLibCheck가 작동하지 않는 경우)
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
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
        source: "/manifest.json",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ]
  },
}

export default nextConfig
