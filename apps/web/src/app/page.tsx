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

interface HomePageProps {
  searchParams: Promise<{ openWizard?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams
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
    <div className="w-full bg-background text-foreground">
      {/* Hero: 한 화면, 그라데이션 + 포커스 라디얼 하나로 정리 */}
      <section
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 overflow-hidden"
        aria-label="메인 비주얼"
      >
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-accent/5"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,hsl(var(--primary)/0.12),transparent_60%)]"
          aria-hidden
        />
        <div className="container mx-auto max-w-7xl w-full relative z-10">
          <HomeHeroSection />
        </div>
      </section>

      {/* Main: 단일 그라데이션, 시각적 노이즈 최소화 */}
      <section
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 py-20"
        aria-label="서비스 선택"
      >
        <div
          className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background"
          aria-hidden
        />
        <div className="container mx-auto max-w-7xl w-full relative z-10">
          <HomePageClient
            user={user}
            displayName={displayName}
            initialOpenWizard={params?.openWizard === "1"}
          />
        </div>
      </section>

      {/* Info: 메인과 톤 맞춤 */}
      <section
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 py-20"
        aria-label="서비스 안내"
      >
        <div
          className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background"
          aria-hidden
        />
        <div className="container mx-auto max-w-7xl w-full relative z-10">
          <HomeInfoSection />
        </div>
      </section>
    </div>
  )
}
