import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get("email")
    const id = searchParams.get("id")

    if (!email && !id) {
      return NextResponse.json({ error: "이메일 또는 ID가 필요합니다" }, { status: 400 })
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

    let user

    if (id) {
      // ID로 사용자 찾기
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(id)
      if (userError || !userData) {
        return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 })
      }
      user = userData.user
    } else if (email) {
      // 이메일로 사용자 찾기 (admin API 사용)
      const { data: users, error } = await supabase.auth.admin.listUsers()
      
      if (error) {
        return NextResponse.json({ error: "사용자 조회 실패" }, { status: 500 })
      }

      user = users.users.find((u) => u.email === email)

      if (!user) {
        return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 })
      }
    }

    if (!user) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 })
    }

    return NextResponse.json({ id: user.id, email: user.email })
  } catch (error) {
    console.error("Error finding user:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}

