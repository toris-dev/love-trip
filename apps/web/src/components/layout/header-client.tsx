"use client"

import { useEffect, useState } from "react"
import { Button } from "@lovetrip/ui/components/button"
import { Calendar, MapPin, Heart, Menu, Plane } from "lucide-react"
import { InteractiveLogo } from "@/components/shared/interactive-logo"
import { createClient } from "@lovetrip/api/supabase/client"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import type { User } from "@supabase/supabase-js"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@lovetrip/ui/components/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@lovetrip/ui/components/dropdown-menu"

interface HeaderClientProps {
  initialUser: User | null
  gamificationData?: {
    level: number
    points: number
  }
}

export function HeaderClient({ initialUser, gamificationData }: HeaderClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<User | null>(initialUser)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    // 초기 사용자 설정
    setUser(initialUser)

    // Auth 상태 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const newUser = session?.user ?? null
      setUser(newUser)

      // 로그인/로그아웃 이벤트 시 즉시 업데이트
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
        // 서버 컴포넌트 업데이트를 위한 새로고침
        router.refresh()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [initialUser, router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    router.refresh()
  }

  // 게이미피케이션 데이터가 없으면 기본값 사용
  const displayGamificationData = gamificationData || {
    level: 1,
    points: 0,
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-black/10 dark:border-white/10 shadow-sm">
      <div className="container mx-auto px-2 sm:px-3 md:px-4 py-3">
        <div className="flex items-center justify-between">
          <InteractiveLogo />
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
            {/* 게이미피케이션 미리보기 */}
            {user && gamificationData && (
              <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-white">
                    {gamificationData.level}
                  </div>
                  <div className="text-xs">
                    <div className="font-semibold">Lv.{gamificationData.level}</div>
                    <div className="text-muted-foreground">
                      {gamificationData.points.toLocaleString()}P
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* 사용자 정보 */}
            {user ? (
              <Link href="/profile">
                <Button variant="outline" size="sm">
                  {user.email}
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm">
                  로그인
                </Button>
              </Link>
            )}
            {/* 데스크톱 네비게이션 메뉴 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden md:flex">
                  <Menu className="h-4 w-4 mr-2" />
                  메뉴
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link
                    href="/about"
                    className={`flex items-center w-full ${
                      pathname === "/about" ? "bg-primary/10 text-primary font-semibold" : ""
                    }`}
                  >
                    소개
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/date"
                    className={`flex items-center w-full ${
                      pathname === "/date" ? "bg-primary/10 text-primary font-semibold" : ""
                    }`}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    데이트 코스
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/date?type=travel"
                    className={`flex items-center w-full ${
                      pathname === "/date" && searchParams?.get("type") === "travel"
                        ? "bg-primary/10 text-primary font-semibold"
                        : ""
                    }`}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    여행 코스
                  </Link>
                </DropdownMenuItem>
                {user && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href="/calendar"
                        className={`flex items-center w-full ${
                          pathname === "/calendar" ? "bg-primary/10 text-primary font-semibold" : ""
                        }`}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        캘린더
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/courses"
                        className={`flex items-center w-full ${
                          pathname === "/courses" ? "bg-primary/10 text-primary font-semibold" : ""
                        }`}
                      >
                        <Plane className="h-4 w-4 mr-2" />
                        코스 탐색
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/favorites"
                        className={`flex items-center w-full ${
                          pathname === "/favorites"
                            ? "bg-primary/10 text-primary font-semibold"
                            : ""
                        }`}
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        즐겨찾기
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/profile"
                        className={`flex items-center w-full ${
                          pathname === "/profile" ? "bg-primary/10 text-primary font-semibold" : ""
                        }`}
                      >
                        프로필
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 focus:bg-red-100 dark:focus:bg-red-950/50 cursor-pointer"
                    >
                      로그아웃
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 모바일 메뉴 */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">메뉴 열기</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                <SheetHeader>
                  <SheetTitle className="text-left">메뉴</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2 mt-6">
                  <Link
                    href="/about"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      pathname === "/about"
                        ? "bg-primary/10 text-primary font-semibold"
                        : "hover:bg-accent"
                    }`}
                  >
                    <span>소개</span>
                  </Link>
                  <Link
                    href="/travel"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      pathname === "/travel"
                        ? "bg-primary/10 text-primary font-semibold"
                        : "hover:bg-accent"
                    }`}
                  >
                    <MapPin className="h-5 w-5" />
                    <span>여행 코스</span>
                  </Link>
                  <Link
                    href="/date"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      pathname === "/date"
                        ? "bg-primary/10 text-primary font-semibold"
                        : "hover:bg-accent"
                    }`}
                  >
                    <Heart className="h-5 w-5" />
                    <span>데이트 코스</span>
                  </Link>
                  {user && (
                    <Link
                      href="/calendar"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        pathname === "/calendar"
                          ? "bg-primary/10 text-primary font-semibold"
                          : "hover:bg-accent"
                      }`}
                    >
                      <Calendar className="h-5 w-5" />
                      <span>캘린더</span>
                    </Link>
                  )}
                  {user && (
                    <Link
                      href="/courses"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        pathname === "/courses"
                          ? "bg-primary/10 text-primary font-semibold"
                          : "hover:bg-accent"
                      }`}
                    >
                      <Plane className="h-5 w-5" />
                      <span>코스 탐색</span>
                    </Link>
                  )}
                  {user && (
                    <Link
                      href="/favorites"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        pathname === "/favorites"
                          ? "bg-primary/10 text-primary font-semibold"
                          : "hover:bg-accent"
                      }`}
                    >
                      <Heart className="h-5 w-5" />
                      <span>즐겨찾기</span>
                    </Link>
                  )}
                  {user && (
                    <>
                      <div className="border-t my-2" />
                      <Link
                        href="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          pathname === "/profile"
                            ? "bg-primary/10 text-primary font-semibold"
                            : "hover:bg-accent"
                        }`}
                      >
                        <span>프로필</span>
                      </Link>
                    </>
                  )}
                </nav>
                {user && (
                  <div className="mt-auto pt-6 border-t">
                    <div className="px-4 py-3 mb-3 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="text-xs text-muted-foreground mb-1">레벨</div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-white">
                          {displayGamificationData.level}
                        </div>
                        <div>
                          <div className="font-semibold">Lv.{displayGamificationData.level}</div>
                          <div className="text-xs text-muted-foreground">
                            {displayGamificationData.points.toLocaleString()}P
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white"
                      onClick={() => {
                        handleLogout()
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      로그아웃
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
