import { createClient } from "@lovetrip/api/supabase/server"
import { HomePageClient } from "@/components/features/home/home-page-client"
import { HomeHeroSection } from "@/components/features/home/home-hero-section"
import { HomeInfoSection } from "@/components/features/home/home-info-section"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="w-full bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <HomeHeroSection />
          <HomePageClient user={user} />
          <HomeInfoSection />
        </div>
      </section>
    </div>
  )
}
