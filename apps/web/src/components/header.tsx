"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Users, Calendar } from "lucide-react"
import { InteractiveLogo } from "@/components/interactive-logo"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function Header() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [gamificationData, setGamificationData] = useState({
    level: 5,
    points: 12500,
  })

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }

    loadUser()
  }, [])

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
            {user && (
              <Link href="/calendar">
                <Button variant="ghost" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  캘린더
                </Button>
              </Link>
            )}
            {user ? (
              <div className="flex items-center gap-2">
                <Link href="/profile">
                  <Button variant="outline" size="sm">
                    {user.email}
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    const supabase = createClient()
                    await supabase.auth.signOut()
                    setUser(null)
                    router.refresh()
                  }}
                >
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

