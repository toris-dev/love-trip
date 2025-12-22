import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createClient } from "@lovetrip/api/supabase/server"
import { getExpenses } from "@lovetrip/expense/services"
import { calculateSettlement } from "@lovetrip/expense/services"
import { TravelPlanDetailClient } from "@/components/features/my-trips/travel-plan-detail-client"
import type { Database } from "@lovetrip/shared/types/database"
import type { ExpenseWithSplits, SettlementSummary } from "@lovetrip/expense/types"

type TravelPlan = Database["public"]["Tables"]["travel_plans"]["Row"]

export const dynamic = "force-dynamic"

interface TravelPlanDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: TravelPlanDetailPageProps): Promise<Metadata> {
  const { id } = await params
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

  const { data: plan, error } = await supabase
    .from("travel_plans")
    .select("*")
    .eq("id", planId)
    .eq("user_id", userId)
    .single()

  if (error || !plan) {
    return null
  }

  return plan
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
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  // 여행 계획 조회
  const plan = await getTravelPlan(id, user.id)

  if (!plan) {
    notFound()
  }

  // 지출 내역 조회
  let expenses: ExpenseWithSplits[] = []
  try {
    expenses = await getExpenses(id)
  } catch (error) {
    console.error("Failed to load expenses:", error)
  }

  // 커플 정보 및 정산 조회
  const { partnerId } = await getCoupleInfo(user.id)
  let settlement: SettlementSummary[] = []
  if (partnerId) {
    try {
      settlement = await calculateSettlement(id, [user.id, partnerId])
    } catch (error) {
      console.error("Failed to load settlement:", error)
    }
  }

  return (
    <TravelPlanDetailClient
      plan={plan}
      initialExpenses={expenses}
      initialSettlement={settlement}
      userId={user.id}
      partnerId={partnerId || undefined}
    />
  )
}
