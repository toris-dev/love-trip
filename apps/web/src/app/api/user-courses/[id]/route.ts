import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"
import {
  getUserCourseWithPlaces,
  updateCoursePublishStatus,
  deleteUserCourse,
} from "@lovetrip/planner/services"

/**
 * GET /api/user-courses/[id]
 * 코스 상세 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { id } = await params
    const course = await getUserCourseWithPlaces(id, user?.id)

    if (!course) {
      return NextResponse.json({ error: "코스를 찾을 수 없습니다" }, { status: 404 })
    }

    return NextResponse.json({ course })
  } catch (error) {
    console.error("Error fetching course:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "코스를 불러오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/user-courses/[id]
 * 코스 수정 (공개 상태 변경 등)
 */
export async function PUT(
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

    const { id } = await params
    const body = await request.json()
    const { isPublic } = body

    if (typeof isPublic === "boolean") {
      const course = await updateCoursePublishStatus(id, user.id, isPublic)
      return NextResponse.json({ course })
    }

    return NextResponse.json({ error: "잘못된 요청입니다" }, { status: 400 })
  } catch (error) {
    console.error("Error updating course:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "코스 수정 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/user-courses/[id]
 * 코스 삭제
 */
export async function DELETE(
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

    const { id } = await params
    await deleteUserCourse(id, user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting course:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "코스 삭제 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

