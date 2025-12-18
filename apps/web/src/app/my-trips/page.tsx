import { Plus } from "lucide-react"
import { Button } from "@lovetrip/ui/components/button"
import Link from "next/link"
import { MyTripsList } from "@/components/features/my-trips/my-trips-list"
import { MyTripsClient } from "@/components/features/my-trips/my-trips-client"
import { createClient } from "@lovetrip/api/supabase/server"
import type { Database } from "@lovetrip/shared/types/database"

type TravelPlan = Database["public"]["Tables"]["travel_plans"]["Row"]

type Trip = {
  id: string
  title: string
  destination: string
  startDate: string
  endDate: string
  budget: number
  status: "planning" | "ongoing" | "completed"
  places: number
  score?: number
}

// 사용자별 데이터이므로 동적 렌더링
export const dynamic = "force-dynamic"

async function getTravelPlans(): Promise<Trip[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  // travel_plans 조회
  const { data: plans, error } = await supabase
    .from("travel_plans")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching travel plans:", error)
    return []
  }

  if (!plans) {
    return []
  }

  // 각 여행 계획의 장소 개수 조회
  const plansWithPlaces = await Promise.all(
    plans.map(async plan => {
      // travel_days와 travel_day_places를 통해 장소 개수 조회
      const { data: days, error: daysError } = await supabase
        .from("travel_days")
        .select("id")
        .eq("travel_plan_id", plan.id)

      let places = 0
      if (!daysError && days && days.length > 0) {
        const dayIds = days.map(d => d.id)
        const { count, error: placesError } = await supabase
          .from("travel_day_places")
          .select("*", { count: "exact", head: true })
          .in("travel_day_id", dayIds)

        places = placesError ? 0 : count || 0
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const startDate = new Date(plan.start_date)
      const endDate = new Date(plan.end_date)
      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(0, 0, 0, 0)

      let status: "planning" | "ongoing" | "completed" = "planning"
      if (endDate < today) {
        status = "completed"
      } else if (startDate <= today && today <= endDate) {
        status = "ongoing"
      }

      return {
        id: plan.id,
        title: plan.title,
        destination: plan.destination,
        startDate: plan.start_date,
        endDate: plan.end_date,
        budget: plan.total_budget || 0,
        status,
        places,
      }
    })
  )

  return plansWithPlaces
}

export default async function MyTripsPage() {
  const trips = await getTravelPlans()
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="relative py-12 md:py-16 bg-gradient-to-br from-primary/10 via-background to-accent/10 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  내 여행
                </h1>
                <p className="text-base md:text-lg text-muted-foreground">
                  계획한 여행들을 한눈에 확인하고 관리하세요
                </p>
              </div>
              <Button asChild size="lg" className="group shrink-0">
                <Link href="/">
                  <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" />새
                  여행 만들기
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <MyTripsClient />
            <MyTripsList trips={trips} />
          </div>
        </div>
      </section>
    </div>
  )
}
