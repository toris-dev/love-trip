"use client"

import { User, Trophy, Star } from "lucide-react"
import { Badge } from "@lovetrip/ui/components/badge"

interface ProfileHeaderProps {
  level?: number
  badgeCount?: number
}

export function ProfileHeader({ level, badgeCount }: ProfileHeaderProps) {
  return (
    <section className="relative py-12 md:py-16 bg-gradient-to-br from-primary/10 via-background to-accent/10 overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
            <div className="relative p-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/30">
              <User className="h-8 w-8 md:h-12 md:w-12 text-primary" />
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
            프로필
          </h1>
            {level !== undefined && (
              <Badge variant="secondary" className="text-lg px-3 py-1">
                <Trophy className="h-4 w-4 mr-1" />
                Lv.{level}
              </Badge>
            )}
          </div>

          <p className="text-base md:text-lg text-muted-foreground mb-4">
            프로필 정보를 관리하고 여행 통계를 확인하세요
          </p>

          {badgeCount !== undefined && badgeCount > 0 && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span>{badgeCount}개의 배지를 획득했습니다</span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

