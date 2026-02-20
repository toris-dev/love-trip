import type { Metadata } from "next"
import { buildPageMetadata } from "@/lib/seo"

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "커플 초대 수락",
    description: "파트너의 커플 연결 초대를 수락하세요.",
    path: "/couple/accept",
    canonical: "/couple/accept",
    noindex: true,
  }),
}

export default function CoupleAcceptLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
