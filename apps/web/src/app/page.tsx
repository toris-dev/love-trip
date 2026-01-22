import type { Metadata } from "next"
import { createClient } from "@lovetrip/api/supabase/server"
import { HomePageClient } from "@/components/features/home/home-page-client"
import { HomeHeroSection } from "@/components/features/home/home-hero-section"
import { HomeInfoSection } from "@/components/features/home/home-info-section"

export const metadata: Metadata = {
  title: "홈",
  description:
    "맞춤형 여행 계획 서비스. 사용자들이 직접 만든 데이트 코스와 여행 코스를 탐색하고, 나만의 코스를 제작하며 예산을 관리해 특별한 추억을 만들어보세요.",
  keywords: [
    "여행",
    "데이트코스",
    "여행계획",
    "UGC데이트코스",
    "데이트",
    "여행예산관리",
    "로맨틱여행",
  ],
  openGraph: {
    title: "LOVETRIP - 여행 계획 서비스",
    description:
      "맞춤형 여행 계획 서비스. 사용자들이 직접 만든 데이트 코스와 여행 코스를 탐색하고 나만의 코스를 제작해 특별한 추억을 만들어보세요.",
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

  // 프로필 display_name 가져오기
  let displayName: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single()
    displayName = profile?.display_name || null
  }

  return (
    <div className="w-full bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background via-accent/5 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.1),transparent_50%)]" />
        <div className="container mx-auto max-w-7xl w-full relative z-10">
          <HomeHeroSection />
        </div>
      </section>

      {/* Main Content Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="container mx-auto max-w-7xl w-full relative z-10">
          <HomePageClient user={user} displayName={displayName} />
        </div>
      </section>

      {/* Info Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background" />
        <div className="container mx-auto max-w-7xl w-full relative z-10">
          <HomeInfoSection />
        </div>
      </section>
    </div>
  )
}
