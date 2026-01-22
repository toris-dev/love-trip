"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { XPLevel, Achievements } from "@/components/shared/gamification"
import { CoupleConnection } from "@/components/features/profile/couple-connection"
import { useProfile } from "@/components/features/profile/hooks/use-profile"
import { ProfileHeader } from "@/components/features/profile/components/profile-header"
import { ProfileCard } from "@/components/features/profile/components/profile-card"
import { ProfileStats } from "@/components/features/profile/components/profile-stats"
import { SettingsSection } from "@/components/features/profile/components/settings-section"
import { createClient } from "@lovetrip/api/supabase/client"
import { toast } from "sonner"
import { Heart, MapPin, Trophy, Star, Calendar, Plane, Clock } from "lucide-react"
import { Alert, AlertDescription } from "@lovetrip/ui/components/alert"
import { AlertCircle } from "lucide-react"
import { Card, CardContent } from "@lovetrip/ui/components/card"
import { Badge } from "@lovetrip/ui/components/badge"
import { Button } from "@lovetrip/ui/components/button"

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
  initialUserCourses?: Array<{
    id: string
    title: string
    description?: string | null
    course_type: "date" | "travel"
    region: string
    place_count: number
    duration?: string | null
    image_url?: string | null
    created_at: string
  }>
  initialTravelPlans?: Array<{
    id: string
    title: string
    destination: string
    start_date: string
    end_date: string
    total_budget: number
    status: "planning" | "ongoing" | "completed"
    places: number
  }>
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
  initialUserCourses = [],
  initialTravelPlans = [],
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
                  planningTrips={statsData.stats.planningTrips}
                  totalPlans={statsData.stats.totalPlans}
                />

                {/* 내가 등록한 코스 */}
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  <Card
                    className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 cursor-pointer"
                    onClick={() => router.push("/profile/date?type=date")}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="inline-flex items-center justify-center mb-4">
                        <div className="p-3 rounded-full bg-primary/10 dark:bg-primary/20">
                          <Heart className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-primary mb-2">데이트 코스</div>
                      <div className="text-sm text-muted-foreground font-medium">
                        내가 등록한 데이트 코스 보기
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 cursor-pointer"
                    onClick={() => router.push("/profile/date?type=travel")}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="inline-flex items-center justify-center mb-4">
                        <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-950">
                          <Plane className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-blue-600 mb-2">여행 코스</div>
                      <div className="text-sm text-muted-foreground font-medium">
                        내가 등록한 여행 코스 보기
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 내가 만든 코스 목록 */}
                {initialUserCourses.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold">내가 만든 코스</h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/profile/date")}
                      >
                        전체 보기
                      </Button>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {initialUserCourses.slice(0, 6).map(course => (
                        <Card
                          key={course.id}
                          className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 cursor-pointer"
                          onClick={() => router.push(`/profile/date?type=${course.course_type}`)}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-2">
                              {course.course_type === "date" ? (
                                <Heart className="h-4 w-4 text-primary" />
                              ) : (
                                <Plane className="h-4 w-4 text-blue-600" />
                              )}
                              <Badge variant="outline" className="text-xs">
                                {course.course_type === "date" ? "데이트" : "여행"}
                              </Badge>
                            </div>
                            <h3 className="font-semibold text-base mb-1 line-clamp-1">
                              {course.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{course.region}</span>
                              <span>•</span>
                              <span>{course.place_count}개 장소</span>
                            </div>
                            {course.duration && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{course.duration}</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* 여행 계획 목록 */}
                {initialTravelPlans.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold">내 여행 계획</h2>
                      <Button variant="ghost" size="sm" onClick={() => router.push("/my-trips")}>
                        전체 보기
                      </Button>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {initialTravelPlans.slice(0, 6).map(plan => {
                        const statusColors = {
                          planning: "bg-blue-500/10 text-blue-500 border-blue-500/20",
                          ongoing: "bg-green-500/10 text-green-500 border-green-500/20",
                          completed: "bg-muted text-muted-foreground border-border",
                        }
                        const statusLabels = {
                          planning: "계획 중",
                          ongoing: "여행 중",
                          completed: "완료",
                        }
                        return (
                          <Card
                            key={plan.id}
                            className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 cursor-pointer"
                            onClick={() => router.push(`/my-trips/${plan.id}`)}
                          >
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-base flex-1 line-clamp-1">
                                  {plan.title}
                                </h3>
                                <Badge className={statusColors[plan.status]}>
                                  {statusLabels[plan.status]}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                                <MapPin className="h-3.5 w-3.5" />
                                <span className="line-clamp-1">{plan.destination}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>
                                  {new Date(plan.start_date).toLocaleDateString("ko-KR", {
                                    month: "long",
                                    day: "numeric",
                                  })}
                                  {" - "}
                                  {new Date(plan.end_date).toLocaleDateString("ko-KR", {
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <MapPin className="h-3.5 w-3.5" />
                                  <span>{plan.places}개 장소</span>
                                </div>
                                {plan.total_budget > 0 && (
                                  <div className="text-muted-foreground">
                                    {plan.total_budget.toLocaleString()}원
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* 게이미피케이션 섹션 */}
                <div className="grid md:grid-cols-1 gap-6">
                  {/* XP 레벨 */}
                  <div>
                    <XPLevel
                      currentXP={statsData.gamification.currentXP}
                      level={statsData.gamification.level}
                      xpToNextLevel={statsData.gamification.xpToNextLevel}
                      totalXP={statsData.gamification.totalXP}
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
