import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"
import { createUserCourseFromTravelPlan } from "@lovetrip/planner/services"
import { grantPublishReward } from "@lovetrip/gamification"

/**
 * POST /api/user-courses/[id]/publish
 * travel_plan을 user_course로 변환하여 공개
 * [id]는 travel_plan_id
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const { id: travelPlanId } = await params
    const body = await request.json()
    const { title, description, isPublic = true } = body

    const course = await createUserCourseFromTravelPlan(travelPlanId, user.id, {
      isPublic,
      title,
      description,
    })

    // 보상 정보 가져오기 (이미 createUserCourseFromTravelPlan에서 지급됨)
    const rewards = await grantPublishReward(user.id, course.id)

    return NextResponse.json({ course, rewards })
  } catch (error) {
    console.error("Error publishing course:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "코스 공개 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
