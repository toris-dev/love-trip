import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")

  // OAuth 에러 처리 (사용자가 취소한 경우 등)
  if (error) {
    const errorMessage =
      error === "access_denied"
        ? "로그인이 취소되었습니다"
        : errorDescription || "로그인 중 오류가 발생했습니다"
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorMessage)}`, requestUrl.origin)
    )
  }

  // 정상적인 로그인 처리
  if (code) {
    try {
      const supabase = await createClient()
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        return NextResponse.redirect(
          new URL(
            `/login?error=${encodeURIComponent(exchangeError.message || "로그인 처리 중 오류가 발생했습니다")}`,
            requestUrl.origin
          )
        )
      }

      // 성공적으로 로그인 완료
      return NextResponse.redirect(new URL("/", requestUrl.origin))
    } catch (err) {
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent("로그인 처리 중 오류가 발생했습니다")}`,
          requestUrl.origin
        )
      )
    }
  }

  // code도 error도 없는 경우 로그인 페이지로 리다이렉트
  return NextResponse.redirect(new URL("/login", requestUrl.origin))
}

