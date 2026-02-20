"use client"

import { useEffect, useState } from "react"
import { Button } from "@lovetrip/ui/components/button"
import { Calendar, MapPin, Heart, Menu, Plane, Search, Bell } from "lucide-react"
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
  initialNickname?: string | null
  gamificationData?: {
    level: number
    points: number
  }
}

export function HeaderClient({
  initialUser,
  initialNickname,
  gamificationData,
}: HeaderClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    // Auth 상태 변경 감지 - 서버 컴포넌트를 새로고침하여 데이터 갱신
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(event => {
      // 로그인/로그아웃 이벤트 시 서버 컴포넌트 업데이트를 위한 새로고침
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
        router.refresh()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  // 게이미피케이션 데이터가 없으면 기본값 사용
  const displayGamificationData = gamificationData || {
    level: 1,
    points: 0,
  }

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <InteractiveLogo />
          {/* 중앙 검색 바 (데스크톱) */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <label htmlFor="header-search" className="sr-only">
                목적지 검색
              </label>
              <input
                id="header-search"
                type="search"
                placeholder="다음 목적지는 어디인가요?"
                className="w-full px-4 py-2 pl-10 pr-4 rounded-full border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 aria-[invalid=true]:border-destructive"
                aria-label="목적지 검색"
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
                aria-hidden="true"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 게이미피케이션 미리보기 */}
            {initialUser && gamificationData && (
              <div className="hidden lg:flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs sm:text-sm font-bold text-white">
                    {gamificationData.level}
                  </div>
                  <div className="text-[10px] sm:text-xs">
                    <div className="font-semibold">Lv.{gamificationData.level}</div>
                    <div className="text-muted-foreground">
                      {gamificationData.points.toLocaleString()}P
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* 알림 아이콘 */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex h-9 w-9 p-0"
              aria-label="알림"
            >
              <Bell className="h-4 w-4" />
            </Button>

            {/* 사용자 정보 */}
            {initialUser ? (
              <Link href="/profile" className="hidden sm:block">
                <Button
                  variant="default"
                  size="sm"
                  className="text-xs sm:text-sm px-3 sm:px-4 h-9 rounded-full bg-primary hover:bg-primary/90"
                >
                  <div className="w-5 h-5 rounded-full bg-primary-foreground/20 mr-2 flex items-center justify-center text-xs font-semibold">
                    {initialNickname?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="hidden md:inline">{initialNickname || "사용자"}</span>
                </Button>
              </Link>
            ) : (
              <Link href="/login" className="hidden sm:block">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm px-3 sm:px-4 h-9 rounded-full"
                >
                  로그인
                </Button>
              </Link>
            )}
            {/* 데스크톱 네비게이션 링크 */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                href="/date"
                className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  pathname === "/date" && searchParams?.get("type") !== "travel"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                탐색
              </Link>
              {initialUser && (
                <>
                  <Link
                    href="/my-trips"
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                      pathname === "/my-trips"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    내 일정
                  </Link>
                  <Link
                    href="/favorites"
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                      pathname === "/favorites"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    즐겨찾기
                  </Link>
                </>
              )}
            </nav>

            {/* 모바일 메뉴 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden h-9 w-9 p-0">
                  <Menu className="h-5 w-5" />
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
                {initialUser && (
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
                      className="text-destructive bg-destructive/10 hover:bg-destructive/20 focus:bg-destructive/20 cursor-pointer"
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden h-8 w-8 sm:h-9 sm:w-9 p-0 touch-manipulation"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">메뉴 열기</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px] p-4 sm:p-6">
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
                  {initialUser && (
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
                  {initialUser && (
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
                  {initialUser && (
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
                  {initialUser && (
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
                {initialUser && (
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
                      className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
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
