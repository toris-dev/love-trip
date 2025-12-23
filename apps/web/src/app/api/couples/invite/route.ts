import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"

/**
 * 고유한 초대 토큰 생성
 */
export function generateInviteToken(): string {
  if (typeof window === "undefined") {
    // Server-side
    const { randomBytes } = require("crypto")
    return randomBytes(32).toString("hex")
  }
  // Client-side (should not happen)
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
}

/**
 * POST /api/couples/invite
 * 커플 초대 링크 생성
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

    // 이미 커플로 연결되어 있는지 확인
    const { data: existingCouple } = await supabase
      .from("couples")
      .select("*")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .eq("status", "accepted")
      .single()

    if (existingCouple) {
      return NextResponse.json(
        { error: "이미 커플로 연결되어 있습니다" },
        { status: 400 }
      )
    }

    // 기존 pending 요청이 있는지 확인
    const { data: pendingRequest } = await supabase
      .from("couples")
      .select("*")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .eq("status", "pending")
      .single()

    if (pendingRequest) {
      return NextResponse.json(
        { error: "이미 보낸 요청이 있습니다. 먼저 기존 요청을 취소해주세요." },
        { status: 400 }
      )
    }

    // 고유한 초대 토큰 생성
    const inviteToken = generateInviteToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7일 후 만료

    // 초대 정보 저장 (couples 테이블에 임시로 저장하거나 별도 테이블 사용)
    // 여기서는 간단하게 couples 테이블의 status를 "invite_pending"으로 사용
    // 실제로는 couple_invites 테이블을 만드는 것이 좋지만, 
    // 현재 스키마를 변경하지 않고 구현하기 위해 couples 테이블 활용
    const { data: invite, error: inviteError } = await supabase
      .from("couples")
      .insert({
        user1_id: user.id,
        user2_id: user.id, // 임시로 자기 자신을 넣고, 수락 시 업데이트
        status: `invite_pending:${inviteToken}`,
      })
      .select()
      .single()

    if (inviteError || !invite) {
      console.error("Error creating invite:", inviteError)
      return NextResponse.json(
        { error: "초대 링크 생성에 실패했습니다" },
        { status: 500 }
      )
    }

    // 초대 링크 생성
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const inviteLink = `${baseUrl}/couple/accept?token=${inviteToken}`

    return NextResponse.json({
      inviteToken,
      inviteLink,
      expiresAt: expiresAt.toISOString(),
    })
  } catch (error) {
    console.error("Error in POST /api/couples/invite:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "초대 링크 생성 중 오류가 발생했습니다",
      },
      { status: 500 }
    )
  }
}
