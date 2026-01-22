import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"
import { sanitizeError } from "@/lib/security/error-sanitization"

/**
 * DELETE /api/profile/delete
 * 계정 삭제 (Soft Delete)
 * - Supabase Auth에서 사용자 비활성화
 * - profiles 테이블의 is_deleted를 true로 설정
 * - deleted_at에 현재 시간 저장 (90일 후 hard delete 예정)
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    // 1. Supabase Auth에서 사용자 비활성화 (실제 삭제는 하지 않음)
    // Supabase Admin API를 사용하여 사용자를 비활성화해야 하지만,
    // 여기서는 profiles.is_deleted만 설정하고, 실제 Auth 삭제는 Edge Function에서 처리

    // 2. profiles 테이블에 is_deleted와 deleted_at 설정
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        // 추가로 민감한 정보 마스킹 (선택사항)
        display_name: `삭제된 사용자_${user.id.substring(0, 8)}`,
        nickname: null, // 닉네임은 null로 설정하여 검색 불가능하게
        avatar_url: null,
        bio: null,
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Error updating profile for deletion:", updateError)
      const safeError = sanitizeError(updateError)
      return NextResponse.json(
        { error: safeError || "계정 삭제 처리에 실패했습니다" },
        { status: 500 }
      )
    }

    // 3. 관련 데이터도 is_deleted 처리 (필요한 경우)
    // 예: user_courses, travel_plans 등도 is_deleted 필드가 있다면 처리
    // 현재는 profiles만 처리

    // 4. 세션 종료를 위해 로그아웃 처리
    // 클라이언트에서 처리하도록 응답 반환

    return NextResponse.json(
      {
        message: "계정 삭제가 요청되었습니다. 90일 후 영구적으로 삭제됩니다.",
        deletedAt: new Date().toISOString(),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error in DELETE /api/profile/delete:", error)
    const safeError = sanitizeError(error)
    return NextResponse.json(
      { error: safeError },
      { status: 500 }
    )
  }
}
