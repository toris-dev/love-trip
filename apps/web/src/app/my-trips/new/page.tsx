import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@lovetrip/api/supabase/server"
import { TravelPlanCreatePageClient } from "@/components/features/my-trips/travel-plan-create-page-client"

export const metadata: Metadata = {
  title: "여행 계획 만들기",
  description: "새 여행 계획을 만들고 장소를 추가해보세요. 지도에서 위치를 확인하고 블로그 후기를 참고할 수 있습니다.",
  robots: {
    index: false,
    follow: false,
  },
}

export default async function NewTravelPlanPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?redirect=/my-trips/new")
  }

  return (
    <TravelPlanCreatePageClient
      user={{ id: user.id, email: user.email }}
    />
  )
}
