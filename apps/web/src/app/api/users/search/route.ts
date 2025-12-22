import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@lovetrip/shared/types/database"

// Service Role Key를 사용하므로 쿠키가 필요 없음
// Edge Runtime 제거: @supabase/supabase-js가 Edge Runtime에서 제대로 작동하지 않을 수 있음
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const nickname = searchParams.get("nickname")

    if (!nickname || nickname.trim().length === 0) {
      return NextResponse.json({ error: "닉네임이 필요합니다" }, { status: 400 })
    }

    // Service Role Key를 사용하는 클라이언트 생성 (쿠키 불필요)
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 닉네임으로 프로필 찾기
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, display_name, nickname, avatar_url")
      .eq("nickname", nickname.trim())
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 })
    }

    // 사용자 이메일 가져오기 (auth.users에서)
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(profile.id)

    if (userError || !userData) {
      return NextResponse.json({ error: "사용자 정보를 가져올 수 없습니다" }, { status: 500 })
    }

    return NextResponse.json({
      id: profile.id,
      nickname: profile.nickname,
      display_name: profile.display_name,
      email: userData.user.email,
      avatar_url: profile.avatar_url,
    })
  } catch (error) {
    console.error("Error searching user:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
