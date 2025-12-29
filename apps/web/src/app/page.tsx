import type { Metadata } from "next"
import { createClient } from "@lovetrip/api/supabase/server"
import { HomePageClient } from "@/components/features/home/home-page-client"
import { HomeHeroSection } from "@/components/features/home/home-hero-section"
import { HomeInfoSection } from "@/components/features/home/home-info-section"

export const metadata: Metadata = {
  title: "홈",
  description:
    "커플을 위한 맞춤형 여행 계획 서비스. 사용자들이 직접 만든 데이트 코스와 여행 코스를 탐색하고, 나만의 코스를 제작하며 예산을 관리해 특별한 추억을 만들어보세요.",
  keywords: [
    "커플여행",
    "데이트코스",
    "여행계획",
    "UGC데이트코스",
    "커플데이트",
    "여행예산관리",
    "로맨틱여행",
  ],
  openGraph: {
    title: "LOVETRIP - 커플 여행 계획 서비스",
    description:
      "커플을 위한 맞춤형 여행 계획 서비스. 사용자들이 직접 만든 데이트 코스와 여행 코스를 탐색하고 나만의 코스를 제작해 특별한 추억을 만들어보세요.",
    url: "https://love2trip.vercel.app",
    type: "website",
  },
  alternates: {
    canonical: "/",
  },
}

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="w-full bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <section className="relative py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <HomeHeroSection />
          <HomePageClient user={user} />
          <HomeInfoSection />
        </div>
      </section>
    </div>
  )
}
