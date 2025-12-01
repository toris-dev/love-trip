"use client"

import { useRouter } from "next/navigation"
import { Footer } from "@/components/layout/footer"
import { XPLevel, Achievements, PointsStats } from "@/components/shared/gamification"
import { CoupleConnection } from "@/components/features/profile/couple-connection"
import { useProfile } from "@/components/features/profile/hooks/use-profile"
import { ProfileHeader } from "@/components/features/profile/components/profile-header"
import { ProfileCard } from "@/components/features/profile/components/profile-card"
import { ProfileStats } from "@/components/features/profile/components/profile-stats"
import { SettingsSection } from "@/components/features/profile/components/settings-section"
import { createClient } from "@lovetrip/api/supabase/client"
import { toast } from "sonner"
import type { GamificationData, Achievement } from "@/components/features/profile/types"
import { Heart, MapPin, Trophy, Star, Wallet, Camera, Calendar } from "lucide-react"

// 게이미피케이션 데이터
const gamificationData: GamificationData = {
  level: 5,
  currentXP: 2450,
  xpToNextLevel: 3000,
  totalXP: 12450,
  points: 12500,
  streak: 7,
  completedTrips: 12,
  visitedPlaces: 48,
}

// 업적 데이터
const achievements: Achievement[] = [
  {
    id: "1",
    name: "첫 여행",
    description: "첫 번째 여행 계획을 완성하세요",
    icon: Heart,
    unlocked: true,
    rarity: "common",
  },
  {
    id: "2",
    name: "탐험가",
    description: "10개의 장소를 방문하세요",
    icon: MapPin,
    unlocked: true,
    rarity: "rare",
  },
  {
    id: "3",
    name: "여행 마스터",
    description: "10개의 여행을 완료하세요",
    icon: Trophy,
    unlocked: true,
    rarity: "epic",
  },
  {
    id: "4",
    name: "연속 기록",
    description: "7일 연속으로 로그인하세요",
    icon: Calendar,
    unlocked: true,
    rarity: "rare",
  },
  {
    id: "5",
    name: "사진 작가",
    description: "50개의 사진을 업로드하세요",
    icon: Camera,
    unlocked: false,
    progress: 32,
    maxProgress: 50,
    rarity: "common",
  },
  {
    id: "6",
    name: "예산 관리자",
    description: "예산을 100% 정확하게 지키세요",
    icon: Wallet,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    rarity: "epic",
  },
  {
    id: "7",
    name: "레벨 10 달성",
    description: "레벨 10에 도달하세요",
    icon: Star,
    unlocked: false,
    progress: 5,
    maxProgress: 10,
    rarity: "legendary",
  },
  {
    id: "8",
    name: "100일 연속",
    description: "100일 연속으로 로그인하세요",
    icon: Calendar,
    unlocked: false,
    progress: 7,
    maxProgress: 100,
    rarity: "legendary",
  },
  {
    id: "9",
    name: "모든 지역 탐험",
    description: "서울, 부산, 제주를 모두 방문하세요",
    icon: MapPin,
    unlocked: false,
    progress: 1,
    maxProgress: 3,
    rarity: "epic",
  },
]

export default function ProfilePage() {
  const router = useRouter()
  const { profile, setProfile, isEditing, setIsEditing, handleSave } = useProfile()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success("로그아웃되었습니다")
    router.push("/")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background">
      <ProfileHeader />

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <ProfileCard
              profile={profile}
              isEditing={isEditing}
              onProfileChange={setProfile}
              onEdit={() => setIsEditing(true)}
              onCancel={() => setIsEditing(false)}
              onSave={handleSave}
            />

            {/* 게이미피케이션: XP 레벨 */}
            <div className="mb-8">
              <XPLevel
                currentXP={gamificationData.currentXP}
                level={gamificationData.level}
                xpToNextLevel={gamificationData.xpToNextLevel}
                totalXP={gamificationData.totalXP}
              />
            </div>

            {/* 게이미피케이션: 포인트 통계 */}
            <div className="mb-8">
              <PointsStats
                points={gamificationData.points}
                streak={gamificationData.streak}
                completedTrips={gamificationData.completedTrips}
                visitedPlaces={gamificationData.visitedPlaces}
              />
            </div>

            {/* 게이미피케이션: 업적 */}
            <div className="mb-8">
              <Achievements achievements={achievements} />
            </div>

            {/* 커플 연결 */}
            <div className="mb-8">
              <CoupleConnection />
            </div>

            {/* Stats */}
            <ProfileStats />

            {/* Settings */}
            <SettingsSection profile={profile} onProfileChange={setProfile} onLogout={handleLogout} />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
