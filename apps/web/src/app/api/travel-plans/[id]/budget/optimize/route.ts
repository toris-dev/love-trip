import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"
import { optimizeBudget } from "@lovetrip/expense/services"
import { canUseFeature, PREMIUM_FEATURES } from "@lovetrip/subscription"
import { getAreaRecommendations } from "@lovetrip/recommendation/services"

/** 목적지 문자열을 관광 API 지역 코드로 매핑 (공공데이터포털 기준) */
function destinationToAreaCode(destination: string | null): number | null {
  if (!destination || typeof destination !== "string") return null
  const normalized = destination.trim().replace(/\s+/g, "")
  const mapping: Record<string, number> = {
    서울: 1,
    인천: 2,
    대전: 3,
    대구: 4,
    광주: 5,
    부산: 6,
    울산: 7,
    세종: 8,
    경기: 31,
    강원: 32,
    충북: 33,
    충남: 34,
    경북: 35,
    경남: 36,
    전북: 37,
    전남: 38,
    제주: 39,
  }
  for (const [key, code] of Object.entries(mapping)) {
    if (normalized.includes(key)) return code
  }
  return null
}

/**
 * GET /api/travel-plans/[id]/budget/optimize
 * 예산 최적화 제안 조회. 프리미엄 사용자일 때 예산 맞춤 대안 장소(alternativePlaces) 포함.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const { id: travelPlanId } = await params

    // 여행 계획 소유권 및 목적지 확인
    const { data: plan, error: planError } = await supabase
      .from("travel_plans")
      .select("id, user_id, destination, total_budget, start_date, end_date")
      .eq("id", travelPlanId)
      .eq("user_id", user.id)
      .single()

    if (planError || !plan) {
      return NextResponse.json({ error: "여행 계획을 찾을 수 없습니다" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const targetBudgetParam = searchParams.get("targetBudget")
    const targetBudget = targetBudgetParam ? Number(targetBudgetParam) : undefined

    if (targetBudget !== undefined && (isNaN(targetBudget) || targetBudget < 0)) {
      return NextResponse.json({ error: "목표 예산은 0 이상의 숫자여야 합니다" }, { status: 400 })
    }

    const optimization = await optimizeBudget(travelPlanId, {
      targetBudget,
    })

    let alternativePlaces: Awaited<ReturnType<typeof getAreaRecommendations>> | undefined
    const isPremium = await canUseFeature(user.id, PREMIUM_FEATURES.BUDGET_OPTIMIZATION)
    if (isPremium && (optimization.isOverBudget || targetBudget != null)) {
      const areaCode = destinationToAreaCode(plan.destination)
      const budgetForFilter =
        targetBudget ?? (plan.total_budget != null ? Number(plan.total_budget) : null)
      const maxPriceLevel =
        budgetForFilter != null && budgetForFilter > 0 ? (budgetForFilter < 300000 ? 1 : 2) : 2
      if (areaCode != null) {
        try {
          alternativePlaces = await getAreaRecommendations(areaCode, {
            maxPriceLevel,
            limit: 10,
          })
        } catch {
          alternativePlaces = []
        }
      } else {
        alternativePlaces = []
      }
    }

    return NextResponse.json({
      optimization,
      ...(alternativePlaces != null && { alternativePlaces }),
    })
  } catch (error) {
    console.error("Error in GET /api/travel-plans/[id]/budget/optimize:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "예산 최적화 제안을 생성하는 중 오류가 발생했습니다",
      },
      { status: 500 }
    )
  }
}
