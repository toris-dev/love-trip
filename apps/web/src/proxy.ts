import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { cookies } from "next/headers"

// 인증이 필요한 경로 목록
const protectedRoutes = ["/profile", "/calendar", "/my-trips"]

// 공개 경로 (인증 없이 접근 가능)
const publicRoutes = ["/", "/login", "/about", "/contact", "/terms", "/privacy", "/date", "/travel"]

export async function proxy(request: NextRequest) {
  const requestUrl = request.nextUrl.clone()
  const pathname = requestUrl.pathname

  // 공개 경로는 그대로 통과
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + "/"))) {
    // 로그인 페이지 접근 시 이미 로그인된 사용자는 홈으로 리다이렉트
    if (pathname === "/login") {
      const cookieStore = await cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) =>
                  cookieStore.set(name, value, options)
                )
              } catch {
                // Server Component에서 호출된 경우 무시
              }
            },
          },
        }
      )

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        return NextResponse.redirect(new URL("/", requestUrl.origin))
      }
    }
    return NextResponse.next()
  }

  // 인증이 필요한 경로인지 확인
  const isProtectedRoute = protectedRoutes.some(
    route => pathname === route || pathname.startsWith(route + "/")
  )

  if (isProtectedRoute) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Server Component에서 호출된 경우 무시
            }
          },
        },
      }
    )

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
    if (!user || error) {
      const loginUrl = new URL("/login", requestUrl.origin)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (API routes are handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)",
  ],
}
