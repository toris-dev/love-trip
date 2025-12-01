import { createClient } from "@lovetrip/api/supabase/server"
import { NextResponse } from "next/server"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")
  const type = requestUrl.searchParams.get("type") // 이메일 확인인지 OAuth인지 구분

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

  // 정상적인 로그인/이메일 확인 처리
  if (code) {
    try {
    const supabase = await createClient()
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error("Error exchanging code for session:", exchangeError)
        return NextResponse.redirect(
          new URL(
            `/login?error=${encodeURIComponent(exchangeError.message || "인증 처리 중 오류가 발생했습니다")}`,
            requestUrl.origin
          )
        )
      }

      // 이메일 확인인 경우
      if (type === "signup" || type === "email_change") {
        // 사용자 정보 확인
        if (data.user) {
          // 이메일 확인 완료 메시지와 함께 홈으로 리다이렉트
          const redirectUrl = new URL(
            `/?message=${encodeURIComponent("이메일 확인이 완료되었습니다!")}`,
            requestUrl.origin
          )
          const response = NextResponse.redirect(redirectUrl)
          // 쿠키를 명시적으로 설정하여 세션 동기화
          return response
        }
      }

      // OAuth 로그인 또는 일반 로그인 성공
      const redirectUrl = new URL("/", requestUrl.origin)
      const response = NextResponse.redirect(redirectUrl)
      return response
    } catch (err) {
      console.error("Unexpected error in auth callback:", err)
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent("인증 처리 중 예기치 않은 오류가 발생했습니다")}`,
          requestUrl.origin
        )
      )
    }
  }

  // code도 error도 없는 경우 로그인 페이지로 리다이렉트
  return NextResponse.redirect(new URL("/login", requestUrl.origin))
}
