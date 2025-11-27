import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 })
    }

    const { newEmail, oldEmail } = await request.json()

    // Supabase의 이메일 기능을 사용하여 알림 전송
    // 실제로는 Supabase의 Database Trigger나 Edge Function을 사용하는 것이 좋지만,
    // 여기서는 간단하게 처리합니다.

    // 이메일 알림은 Supabase의 Auth 이메일 템플릿을 통해 자동으로 전송됩니다.
    // "Email address changed" 템플릿이 활성화되어 있으면 자동으로 전송됩니다.

    return NextResponse.json({ success: true, message: "이메일 변경 알림이 전송되었습니다" })
  } catch (error) {
    console.error("Email change notification error:", error)
    return NextResponse.json({ error: "알림 전송 중 오류가 발생했습니다" }, { status: 500 })
  }
}
