import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"
import { toggleCourseSave } from "@lovetrip/planner/services"

/**
 * POST /api/user-courses/[id]/save
 * 코스 저장 토글
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
    const result = await toggleCourseSave(courseId, user.id)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error toggling save:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "저장 처리 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

