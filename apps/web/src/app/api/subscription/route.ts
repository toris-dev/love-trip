import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"
import { getUserSubscription, createFreeSubscription } from "@lovetrip/subscription/services"

/**
 * GET /api/subscription
 * 사용자의 구독 상태 조회
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const subscription = await getUserSubscription(user.id)

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error("Error fetching subscription:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "구독 정보를 불러오는 중 오류가 발생했습니다",
      },
      { status: 500 }
    )
  }
}
