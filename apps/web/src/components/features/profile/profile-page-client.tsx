"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { XPLevel, Achievements, PointsStats } from "@/components/shared/gamification"
import { CoupleConnection } from "@/components/features/profile/couple-connection"
import { useProfile } from "@/components/features/profile/hooks/use-profile"
import { ProfileHeader } from "@/components/features/profile/components/profile-header"
import { ProfileCard } from "@/components/features/profile/components/profile-card"
import { ProfileStats } from "@/components/features/profile/components/profile-stats"
import { SettingsSection } from "@/components/features/profile/components/settings-section"
import { AnniversaryRemindersSection } from "@/components/features/profile/anniversary-reminders-section"
import { createClient } from "@lovetrip/api/supabase/client"
import { toast } from "sonner"
import { Heart, MapPin, Trophy, Star, Calendar } from "lucide-react"
import { Alert, AlertDescription } from "@lovetrip/ui/components/alert"
import { AlertCircle } from "lucide-react"

interface ProfileStatsData {
  gamification: {
    level: number
    currentXP: number
    xpToNextLevel: number
    totalXP: number
    points: number
    streak: number
  }
  stats: {
    totalPlans: number
    completedTrips: number
    planningTrips: number
    visitedPlaces: number
    badgeCount: number
  }
  achievements: any[]
}

interface ProfilePageClientProps {
  initialStats: ProfileStatsData | null
  initialProfile: {
    name: string
    email: string
    nickname: string
    bio: string
    joinDate: string
    avatar: string
  }
}

// 기본 업적 정의
const defaultAchievements = [
  {
    id: "first_trip",
    name: "첫 여행",
    description: "첫 번째 여행 계획을 완성하세요",
    icon: Heart,
    rarity: "common" as const,
  },
  {
    id: "explorer",
    name: "탐험가",
    description: "10개의 장소를 방문하세요",
    icon: MapPin,
    rarity: "rare" as const,
  },
  {
    id: "travel_master",
    name: "여행 마스터",
    description: "10개의 여행을 완료하세요",
    icon: Trophy,
    rarity: "epic" as const,
  },
  {
    id: "streak_7",
    name: "연속 기록",
    description: "7일 연속으로 로그인하세요",
    icon: Calendar,
    rarity: "rare" as const,
  },
  {
    id: "level_10",
    name: "레벨 10 달성",
    description: "레벨 10에 도달하세요",
    icon: Star,
    rarity: "legendary" as const,
  },
]

// 업적별 최대 진행도 반환
function getMaxProgress(achievementId: string): number {
  const maxProgressMap: Record<string, number> = {
    first_trip: 1,
    explorer: 10,
    travel_master: 10,
    streak_7: 7,
    level_10: 10,
  }
  return maxProgressMap[achievementId] || 1
}

export function ProfilePageClient({
  initialStats,
  initialProfile: initialProfileData,
}: ProfilePageClientProps) {
  const router = useRouter()
  const { profile, setProfile, isEditing, setIsEditing, handleSave } = useProfile()
  const [statsData, setStatsData] = useState<ProfileStatsData | null>(initialStats)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 초기 프로필 데이터 설정
  useEffect(() => {
    if (initialProfileData) {
      setProfile(prev => ({
        ...prev,
        ...initialProfileData,
      }))
    }
  }, [initialProfileData, setProfile])

  // 통계 데이터 새로고침 (필요시)
  const refetchStats = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/profile/stats")
      if (!response.ok) {
        throw new Error("통계를 불러오는 중 오류가 발생했습니다")
      }
      const result = await response.json()
      setStatsData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다")
      console.error("Failed to load profile stats:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success("로그아웃되었습니다")
    router.push("/")
    router.refresh()
  }

  // 업적 데이터 변환 (DB 데이터와 기본 정의 결합)
  const achievements = defaultAchievements.map(achievement => {
    const dbAchievement = statsData?.achievements?.find(
      (a: any) => a.achievement_id === achievement.id
    )
    return {
      ...achievement,
      unlocked: dbAchievement?.completed || false,
      progress: dbAchievement?.progress || 0,
      maxProgress: getMaxProgress(achievement.id),
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <ProfileHeader
        level={statsData?.gamification.level}
        badgeCount={statsData?.stats.badgeCount}
      />

      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* 프로필 카드 */}
            <ProfileCard
              profile={profile}
              isEditing={isEditing}
              onProfileChange={setProfile}
              onEdit={() => setIsEditing(true)}
              onCancel={() => setIsEditing(false)}
              onSave={handleSave}
            />

            {isLoading ? (
              <div className="grid md:grid-cols-4 gap-4 mb-8">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : statsData ? (
              <>
                {/* 통계 카드 */}
                <ProfileStats
                  completedTrips={statsData.stats.completedTrips}
                  planningTrips={statsData.stats.planningTrips}
                  visitedPlaces={statsData.stats.visitedPlaces}
                  totalPlans={statsData.stats.totalPlans}
                />

                {/* 게이미피케이션 섹션 */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* XP 레벨 */}
                  <div>
                    <XPLevel
                      currentXP={statsData.gamification.currentXP}
                      level={statsData.gamification.level}
                      xpToNextLevel={statsData.gamification.xpToNextLevel}
                      totalXP={statsData.gamification.totalXP}
                    />
                  </div>

                  {/* 포인트 통계 */}
                  <div>
                    <PointsStats
                      points={statsData.gamification.points}
                      streak={statsData.gamification.streak}
                      completedTrips={statsData.stats.completedTrips}
                      visitedPlaces={statsData.stats.visitedPlaces}
                    />
                  </div>
                </div>

                {/* 업적 */}
                <div>
                  <Achievements achievements={achievements} />
                </div>
              </>
            ) : null}

            {/* 커플 연결 */}
            <div>
              <CoupleConnection />
            </div>

            {/* 기념일 알림 (프리미엄 기능) */}
            <div>
              <AnniversaryRemindersSection />
            </div>

            {/* Settings */}
            <SettingsSection
              profile={profile}
              onProfileChange={setProfile}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </section>
    </div>
  )
}

