import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"
import { toggleCourseLike } from "@lovetrip/planner/services"

/**
 * POST /api/user-courses/[id]/like
 * 코스 좋아요 토글
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const { id: courseId } = await params
    const result = await toggleCourseLike(courseId, user.id)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error toggling like:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "좋아요 처리 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

