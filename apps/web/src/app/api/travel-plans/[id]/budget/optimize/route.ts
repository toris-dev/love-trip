import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"
import { optimizeBudget } from "@lovetrip/expense/services"

/**
 * GET /api/travel-plans/[id]/budget/optimize
 * 예산 최적화 제안 조회
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

    // 여행 계획 소유권 확인
    const { data: plan, error: planError } = await supabase
      .from("travel_plans")
      .select("id, user_id")
      .eq("id", travelPlanId)
      .eq("user_id", user.id)
      .single()

    if (planError || !plan) {
      return NextResponse.json({ error: "여행 계획을 찾을 수 없습니다" }, { status: 404 })
    }

    // 쿼리 파라미터에서 목표 예산 확인
    const { searchParams } = new URL(request.url)
    const targetBudgetParam = searchParams.get("targetBudget")
    const targetBudget = targetBudgetParam ? Number(targetBudgetParam) : undefined

    if (targetBudget !== undefined && (isNaN(targetBudget) || targetBudget < 0)) {
      return NextResponse.json({ error: "목표 예산은 0 이상의 숫자여야 합니다" }, { status: 400 })
    }

    // 예산 최적화 제안 생성
    const optimization = await optimizeBudget(travelPlanId, {
      targetBudget,
    })

    return NextResponse.json({ optimization })
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
