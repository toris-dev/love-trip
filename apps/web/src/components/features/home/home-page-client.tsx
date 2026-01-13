"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@lovetrip/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@lovetrip/ui/components/card"
import { MapPin, Heart, Calendar, ArrowRight, Plus, Sparkles, Users, Baby, Briefcase } from "lucide-react"
import { TravelPlanWizard } from "./travel-plan-wizard"
import { OnboardingWizard } from "@/components/features/onboarding"

interface HomePageClientProps {
  user: { id: string; email?: string } | null
}

export function HomePageClient({ user }: HomePageClientProps) {
  const router = useRouter()
  const [wizardOpen, setWizardOpen] = useState(false)
  const [onboardingCompleted, setOnboardingCompleted] = useState(false)

  return (
    <>
      {/* 빠른 여행 계획 만들기 CTA */}
      <Card className="mb-6 sm:mb-8 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/20">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-xl font-bold mb-1">빠르게 여행 계획 만들기</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  코스 선택부터 예산 설정까지 한 번에 완료하세요
                </p>
              </div>
            </div>
            <Button
              size="lg"
              onClick={() => {
                if (!user) {
                  router.push("/login")
                  return
                }
                setWizardOpen(true)
              }}
              className="w-full md:w-auto md:min-w-[200px] touch-manipulation"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span className="text-sm sm:text-base">여행 계획 만들기</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 선택 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
        {/* 여행 코스 카드 */}
        <Card
          className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border-2 hover:border-primary/50 touch-manipulation"
          onClick={() => router.push("/travel")}
        >
          <CardHeader className="pb-3 sm:pb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-primary/20 transition-colors">
              <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <CardTitle className="text-xl sm:text-2xl mb-1 sm:mb-2">여행 코스</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              1박 2일 이상의 여행 코스를 찾아보세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary mr-2 flex-shrink-0"></span>
                전국 다양한 지역의 여행 코스
              </div>
              <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary mr-2 flex-shrink-0"></span>
                지도 기반 코스 탐색
              </div>
              <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary mr-2 flex-shrink-0"></span>
                상세 일정 및 예산 관리
              </div>
            </div>
            <Button className="w-full mt-4 sm:mt-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors touch-manipulation h-10 sm:h-11">
              <span className="text-sm sm:text-base">여행 코스 보기</span>
              <ArrowRight className="ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* 데이트 코스 카드 */}
        <Card
          className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border-2 hover:border-accent/50 touch-manipulation"
          onClick={() => router.push("/date")}
        >
          <CardHeader className="pb-3 sm:pb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-accent/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-accent/20 transition-colors">
              <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
            </div>
            <CardTitle className="text-xl sm:text-2xl mb-1 sm:mb-2">데이트 코스</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              당일 데이트 코스로 특별한 하루를 보내세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-accent mr-2 flex-shrink-0"></span>
                가까운 거리의 데이트 코스
              </div>
              <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-accent mr-2 flex-shrink-0"></span>
                로맨틱한 장소 추천
              </div>
              <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-accent mr-2 flex-shrink-0"></span>
                걷기 좋은 코스 구성
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full mt-4 sm:mt-6 group-hover:bg-accent group-hover:text-accent-foreground transition-colors touch-manipulation h-10 sm:h-11"
            >
              <span className="text-sm sm:text-base">데이트 코스 보기</span>
              <ArrowRight className="ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* 캘린더 카드 */}
        <Card
          className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border-2 hover:border-primary/50 touch-manipulation"
          onClick={() => {
            if (user) {
              router.push("/calendar")
            } else {
              router.push("/login")
            }
          }}
        >
          <CardHeader className="pb-3 sm:pb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-primary/20 transition-colors">
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <CardTitle className="text-xl sm:text-2xl mb-1 sm:mb-2">캘린더</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              함께 일정을 관리하고 공유하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary mr-2 flex-shrink-0"></span>
                공유 캘린더 기능
              </div>
              <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary mr-2 flex-shrink-0"></span>
                일정 추가 및 관리
              </div>
              <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary mr-2 flex-shrink-0"></span>
                장소 연동 및 알림
              </div>
            </div>
            <Button className="w-full mt-4 sm:mt-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors touch-manipulation h-10 sm:h-11">
              <span className="text-sm sm:text-base">
                {user ? "캘린더 보기" : "로그인 후 이용"}
              </span>
              <ArrowRight className="ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 타겟별 코스 탐색 섹션 */}
      <div className="mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">
          누구와 함께 가시나요?
        </h2>
        <p className="text-center text-muted-foreground mb-6 sm:mb-8 text-sm sm:text-base">
          다양한 타겟에 맞는 코스를 탐색해보세요
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <Card
            className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.05] border-2 hover:border-pink-500/50 touch-manipulation"
            onClick={() => router.push("/courses?targetAudience=couple")}
          >
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-pink-200 dark:group-hover:bg-pink-900/50 transition-colors">
                <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base mb-1">커플</h3>
              <p className="text-xs text-muted-foreground">로맨틱한 데이트</p>
            </CardContent>
          </Card>

          <Card
            className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.05] border-2 hover:border-blue-500/50 touch-manipulation"
            onClick={() => router.push("/courses?targetAudience=friend")}
          >
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base mb-1">친구</h3>
              <p className="text-xs text-muted-foreground">재미있는 활동</p>
            </CardContent>
          </Card>

          <Card
            className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.05] border-2 hover:border-green-500/50 touch-manipulation"
            onClick={() => router.push("/courses?targetAudience=family")}
          >
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                <Baby className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base mb-1">가족</h3>
              <p className="text-xs text-muted-foreground">아이 동반 가능</p>
            </CardContent>
          </Card>

          <Card
            className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.05] border-2 hover:border-purple-500/50 touch-manipulation"
            onClick={() => router.push("/courses?targetAudience=solo")}
          >
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base mb-1">혼자</h3>
              <p className="text-xs text-muted-foreground">혼자 즐기는 여행</p>
            </CardContent>
          </Card>

          <Card
            className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.05] border-2 hover:border-gray-500/50 touch-manipulation"
            onClick={() => router.push("/courses?targetAudience=business")}
          >
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 dark:bg-gray-900/30 flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-gray-200 dark:group-hover:bg-gray-900/50 transition-colors">
                <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base mb-1">비즈니스</h3>
              <p className="text-xs text-muted-foreground">회의 및 네트워킹</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 여행 계획 마법사 */}
      <TravelPlanWizard user={user} open={wizardOpen} onOpenChange={setWizardOpen} />

      {/* 온보딩 위저드 */}
      {user && !onboardingCompleted && (
        <OnboardingWizard
          onComplete={() => {
            setOnboardingCompleted(true)
          }}
        />
      )}
    </>
  )
}
