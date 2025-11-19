import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const nickname = searchParams.get("nickname")

    if (!nickname || nickname.trim().length === 0) {
      return NextResponse.json({ error: "닉네임이 필요합니다" }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
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

