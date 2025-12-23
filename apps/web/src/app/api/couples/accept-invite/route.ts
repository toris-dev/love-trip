import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"

/**
 * POST /api/couples/accept-invite
 * 초대 링크로 커플 연결 수락
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const body = await request.json()
    const { token } = body

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "초대 토큰이 필요합니다" },
        { status: 400 }
      )
    }

    // 초대 토큰으로 pending 요청 찾기
    const { data: inviteCouple, error: inviteError } = await supabase
      .from("couples")
      .select("*")
      .like("status", `invite_pending:${token}`)
      .single()

    if (inviteError || !inviteCouple) {
      return NextResponse.json(
        { error: "유효하지 않거나 만료된 초대 링크입니다" },
        { status: 404 }
      )
    }

    // 자기 자신에게 보낸 초대는 수락할 수 없음
    if (inviteCouple.user1_id === user.id) {
      return NextResponse.json(
        { error: "자신이 보낸 초대 링크는 수락할 수 없습니다" },
        { status: 400 }
      )
    }

    // 이미 커플로 연결되어 있는지 확인
    const { data: existingCouple } = await supabase
      .from("couples")
      .select("*")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .eq("status", "accepted")
      .single()

    if (existingCouple) {
      // 기존 초대 삭제
      await supabase.from("couples").delete().eq("id", inviteCouple.id)
      return NextResponse.json(
        { error: "이미 커플로 연결되어 있습니다" },
        { status: 400 }
      )
    }

    // 커플 연결 업데이트
    const { data: updatedCouple, error: updateError } = await supabase
      .from("couples")
      .update({
        user2_id: user.id,
        status: "accepted",
        updated_at: new Date().toISOString(),
      })
      .eq("id", inviteCouple.id)
      .select()
      .single()

    if (updateError || !updatedCouple) {
      console.error("Error updating couple:", updateError)
      return NextResponse.json(
        { error: "커플 연결에 실패했습니다" },
        { status: 500 }
      )
    }

    // 기본 캘린더 생성
    try {
      const { data: calendar } = await supabase
        .from("shared_calendars")
        .select("id")
        .eq("couple_id", updatedCouple.id)
        .limit(1)

      if (!calendar || calendar.length === 0) {
        await supabase.from("shared_calendars").insert({
          couple_id: updatedCouple.id,
          name: "공동 캘린더",
          color: "#3b82f6",
          created_by: user.id,
        })
      }
    } catch (calendarError) {
      // 캘린더 생성 실패는 로그만 남기고 계속 진행
      console.error("Failed to create default calendar:", calendarError)
    }

    return NextResponse.json({
      success: true,
      couple: updatedCouple,
      message: "커플 연결이 완료되었습니다",
    })
  } catch (error) {
    console.error("Error in POST /api/couples/accept-invite:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "초대 수락 중 오류가 발생했습니다",
      },
      { status: 500 }
    )
  }
}
