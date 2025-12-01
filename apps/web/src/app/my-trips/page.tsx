import { Plus } from "lucide-react"
import { Button } from "@lovetrip/ui/components/button"
import Link from "next/link"
import { Footer } from "@/components/layout/footer"
import { MyTripsList } from "@/components/features/my-trips/my-trips-list"

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

const trips: Trip[] = [
  {
    id: "1",
    title: "서울 로맨틱 데이트",
    destination: "서울",
    startDate: "2024-02-14",
    endDate: "2024-02-15",
    budget: 230000,
    status: "completed",
    places: 5,
    score: 95,
  },
  {
    id: "2",
    title: "부산 바다 여행",
    destination: "부산",
    startDate: "2024-03-01",
    endDate: "2024-03-03",
    budget: 350000,
    status: "planning",
    places: 8,
  },
  {
    id: "3",
    title: "제주 힐링 여행",
    destination: "제주",
    startDate: "2024-04-10",
    endDate: "2024-04-13",
    budget: 500000,
    status: "planning",
    places: 12,
  },
  {
    id: "4",
    title: "강릉 커피 투어",
    destination: "강릉",
    startDate: "2024-01-20",
    endDate: "2024-01-21",
    budget: 150000,
    status: "completed",
    places: 6,
    score: 88,
  },
]

// 사용자별 데이터이므로 동적 렌더링
export const dynamic = "force-dynamic"

export default function MyTripsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="relative py-16 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  내 여행
                </h1>
                <p className="text-lg text-muted-foreground">
                  계획한 여행들을 한눈에 확인하고 관리하세요
                </p>
              </div>
              <Button asChild size="lg" className="group">
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
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <MyTripsList trips={trips} />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
