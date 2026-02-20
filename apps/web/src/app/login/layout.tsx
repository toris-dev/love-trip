import type { Metadata } from "next"
import { buildPageMetadata } from "@/lib/seo"

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "로그인",
    description: "LOVETRIP에 로그인하여 데이트 코스와 여행 계획을 관리하세요.",
    path: "/login",
    canonical: "/login",
    noindex: true,
  }),
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
