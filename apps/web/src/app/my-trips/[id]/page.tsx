import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { cache } from "react"
import { createClient } from "@lovetrip/api/supabase/server"
import { getExpenses } from "@lovetrip/expense/services"
import { calculateSettlement } from "@lovetrip/expense/services"
import { isPremiumUser } from "@lovetrip/subscription"
import { TravelPlanDetailClient } from "@/components/features/my-trips/travel-plan-detail-client"
import { TravelPlanDaysSection } from "@/components/features/travel/components/travel-plan-days-section"
import { TripExpenseSection } from "@/components/features/expense/trip-expense-section"
import type { Database } from "@lovetrip/shared/types/database"
import type { ExpenseWithSplits, SettlementSummary } from "@lovetrip/expense/types"

type TravelPlan = Database["public"]["Tables"]["travel_plans"]["Row"]

export const dynamic = "force-dynamic"

// React.cache()로 요청당 중복 호출 방지
const getCachedTravelPlan = cache(getTravelPlan)
const getCachedCoupleInfo = cache(getCoupleInfo)

interface TravelPlanDetailPageProps {
  params: Promise<{ id: string }>
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function generateMetadata({ params }: TravelPlanDetailPageProps): Promise<Metadata> {
  const { id } = await params

  if (!id || !UUID_REGEX.test(id)) {
    return { title: "여행 계획" }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      title: "여행 계획",
    }
  }

  const plan = await getTravelPlan(id, user.id)

  if (!plan) {
    return {
      title: "여행 계획을 찾을 수 없습니다",
    }
  }

  return {
    title: plan.title,
    description: `여행 계획: ${plan.destination} (${plan.start_date} ~ ${plan.end_date})`,
    robots: {
      index: false,
      follow: false,
    },
  }
}

async function getTravelPlan(planId: string, userId: string): Promise<TravelPlan | null> {
  const supabase = await createClient()

  // 먼저 내 여행 계획인지 확인
  const { data: myPlan, error: myPlanError } = await supabase
    .from("travel_plans")
    .select("*")
    .eq("id", planId)
    .eq("user_id", userId)
    .single()

  if (!myPlanError && myPlan) {
    return myPlan
  }

  // 커플이 연결되어 있으면 파트너의 여행 계획도 확인
  const { data: couple } = await supabase
    .from("couples")
    .select("user1_id, user2_id")
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .eq("status", "accepted")
    .single()

  if (couple) {
    const partnerId = couple.user1_id === userId ? couple.user2_id : couple.user1_id

    const { data: partnerPlan, error: partnerPlanError } = await supabase
      .from("travel_plans")
      .select("*")
      .eq("id", planId)
      .eq("user_id", partnerId)
      .single()

    if (!partnerPlanError && partnerPlan) {
      return partnerPlan
    }
  }

  return null
}

async function getCoupleInfo(userId: string) {
  const supabase = await createClient()

  const { data: couple } = await supabase
    .from("couples")
    .select("id, user1_id, user2_id")
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .single()

  if (!couple) {
    return { coupleId: null, partnerId: null }
  }

  const partnerId = couple.user1_id === userId ? couple.user2_id : couple.user1_id

  return { coupleId: couple.id, partnerId }
}

export default async function TravelPlanDetailPage({ params }: TravelPlanDetailPageProps) {
  const { id } = await params

  if (!id || !UUID_REGEX.test(id)) {
    notFound()
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  // 병렬로 데이터 페칭 (여행 계획, 커플 정보, 지출 내역)
  const [plan, coupleInfo, expensesResult] = await Promise.all([
    getCachedTravelPlan(id, user.id),
    getCachedCoupleInfo(user.id),
    getExpenses(id).catch(error => {
      console.error("Failed to load expenses:", error)
      return [] as ExpenseWithSplits[]
    }),
  ])

  if (!plan) {
    notFound()
  }

  // 정산 조회 (커플이 있는 경우에만)
  let settlement: SettlementSummary[] = []
  if (coupleInfo.partnerId) {
    try {
      settlement = await calculateSettlement(id, [user.id, coupleInfo.partnerId])
    } catch (error) {
      console.error("Failed to load settlement:", error)
    }
  }

  const isPremium = await isPremiumUser(user.id)

  return (
    <TravelPlanDetailClient
      plan={plan}
      initialExpenses={expensesResult}
      initialSettlement={settlement}
      userId={user.id}
      partnerId={coupleInfo.partnerId || undefined}
      isPremium={isPremium}
      DaysSection={TravelPlanDaysSection}
      ExpenseSection={TripExpenseSection}
    />
  )
}
