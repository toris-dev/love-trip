"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Heart } from "lucide-react"
import { InteractiveLogo } from "@/components/interactive-logo"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { User } from "@supabase/supabase-js"

interface HeaderClientProps {
  initialUser: User | null
  gamificationData?: {
    level: number
    points: number
  }
}

export function HeaderClient({ initialUser, gamificationData }: HeaderClientProps) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(initialUser)

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

  const defaultGamificationData = gamificationData ?? {
    level: 5,
    points: 12500,
  }

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <InteractiveLogo />
          <div className="flex items-center space-x-4">
            {/* 게이미피케이션 미리보기 */}
            {user && (
              <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-white">
                    {defaultGamificationData.level}
                  </div>
                  <div className="text-xs">
                    <div className="font-semibold">Lv.{defaultGamificationData.level}</div>
                    <div className="text-muted-foreground">
                      {defaultGamificationData.points.toLocaleString()}P
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* 네비게이션 메뉴 */}
            <nav className="hidden md:flex items-center gap-2">
              <Link href="/travel">
                <Button variant="ghost" size="sm">
                  <MapPin className="h-4 w-4 mr-2" />
                  여행 코스
                </Button>
              </Link>
              <Link href="/date">
                <Button variant="ghost" size="sm">
                  <Heart className="h-4 w-4 mr-2" />
                  데이트 코스
                </Button>
              </Link>
              {user && (
                <Link href="/calendar">
                  <Button variant="ghost" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    캘린더
                  </Button>
                </Link>
              )}
            </nav>
            {user ? (
              <div className="flex items-center gap-2">
                <Link href="/profile">
                  <Button variant="outline" size="sm">
                    {user.email}
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  로그아웃
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm">
                  로그인
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
