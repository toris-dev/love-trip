"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
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
import { UpcomingDatesSection } from "./upcoming-dates-section"
import { TrendingDestinationsSection } from "./trending-destinations-section"

interface HomePageClientProps {
  user: { id: string; email?: string } | null
  displayName?: string | null
}

export function HomePageClient({ user, displayName }: HomePageClientProps) {
  const router = useRouter()
  const [wizardOpen, setWizardOpen] = useState(false)
  const [onboardingCompleted, setOnboardingCompleted] = useState(false)

  // 인사말 생성
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "좋은 아침"
    if (hour < 18) return "좋은 오후"
    return "좋은 저녁"
  }

  const userName = displayName || user?.email?.split("@")[0] || "게스트"

  return (
    <div className="space-y-16 sm:space-y-20">
      {/* 인사말 영역 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="inline-block mb-4">
          <span className="text-sm sm:text-base font-medium text-primary bg-primary/10 px-4 py-2 rounded-full">
            {getGreeting()}
          </span>
        </div>
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {userName}님, 환영합니다!
        </h2>
        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
          다음 모험을 준비하셨나요?
        </p>
      </motion.div>

      {/* 선택 카드 그리드 - 모던한 스타일 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* 여행 코스 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card
            role="button"
            tabIndex={0}
            aria-label="여행 코스 페이지로 이동"
            className="group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border-2 hover:border-primary/40 bg-gradient-to-br from-background to-primary/5 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 min-h-[320px] flex flex-col overflow-hidden relative"
            onClick={() => router.push("/travel")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                router.push("/travel")
              }
            }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-0" />
            <CardHeader className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6 relative z-10">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" aria-hidden="true">
                <MapPin className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl mb-2 font-bold">여행 코스</CardTitle>
              <CardDescription className="text-base">
                1박 2일 이상의 여행 코스를 찾아보세요
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 sm:px-8 pb-6 sm:pb-8 relative z-10 flex-1 flex flex-col">
              <div className="space-y-3 mb-6 flex-1">
                {[
                  "전국 다양한 지역의 여행 코스",
                  "지도 기반 코스 탐색",
                  "상세 일정 및 예산 관리",
                ].map((text, idx) => (
                  <div key={idx} className="flex items-center text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mr-3 flex-shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
              <Button 
                className="w-full mt-auto group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 h-12 rounded-xl font-semibold"
                aria-label="여행 코스 페이지로 이동"
              >
                <span>여행 코스 보기</span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* 데이트 코스 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card
            role="button"
            tabIndex={0}
            aria-label="데이트 코스 페이지로 이동"
            className="group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border-2 hover:border-accent/40 bg-gradient-to-br from-background to-accent/5 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 min-h-[320px] flex flex-col overflow-hidden relative"
            onClick={() => router.push("/date")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                router.push("/date")
              }
            }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -z-0" />
            <CardHeader className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6 relative z-10">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" aria-hidden="true">
                <Heart className="h-7 w-7 sm:h-8 sm:w-8 text-accent" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl mb-2 font-bold">데이트 코스</CardTitle>
              <CardDescription className="text-base">
                당일 데이트 코스로 특별한 하루를 보내세요
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 sm:px-8 pb-6 sm:pb-8 relative z-10 flex-1 flex flex-col">
              <div className="space-y-3 mb-6 flex-1">
                {[
                  "가까운 거리의 데이트 코스",
                  "로맨틱한 장소 추천",
                  "걷기 좋은 코스 구성",
                ].map((text, idx) => (
                  <div key={idx} className="flex items-center text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mr-3 flex-shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                className="w-full mt-auto group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300 h-12 rounded-xl font-semibold border-2"
                aria-label="데이트 코스 페이지로 이동"
              >
                <span>데이트 코스 보기</span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* 캘린더 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card
            role="button"
            tabIndex={0}
            aria-label={user ? "캘린더 페이지로 이동" : "로그인 페이지로 이동"}
            className="group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border-2 hover:border-primary/40 bg-gradient-to-br from-background to-primary/5 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 min-h-[320px] flex flex-col overflow-hidden relative"
            onClick={() => {
              if (user) {
                router.push("/calendar")
              } else {
                router.push("/login")
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                if (user) {
                  router.push("/calendar")
                } else {
                  router.push("/login")
                }
              }
            }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-0" />
            <CardHeader className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6 relative z-10">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" aria-hidden="true">
                <Calendar className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl mb-2 font-bold">캘린더</CardTitle>
              <CardDescription className="text-base">
                함께 일정을 관리하고 공유하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 sm:px-8 pb-6 sm:pb-8 relative z-10 flex-1 flex flex-col">
              <div className="space-y-3 mb-6 flex-1">
                {[
                  "공유 캘린더 기능",
                  "일정 추가 및 관리",
                  "장소 연동 및 알림",
                ].map((text, idx) => (
                  <div key={idx} className="flex items-center text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mr-3 flex-shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
              <Button 
                className="w-full mt-auto group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 h-12 rounded-xl font-semibold"
                aria-label={user ? "캘린더 페이지로 이동" : "로그인 페이지로 이동"}
              >
                <span>{user ? "캘린더 보기" : "로그인 후 이용"}</span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* 섹션 구분선 */}
      <div className="my-16 sm:my-20 md:my-24">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Upcoming Dates 섹션 */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <UpcomingDatesSection
          dates={[]} // TODO: 실제 데이터 연결
          onViewAll={() => router.push("/calendar")}
        />
      </motion.div>

      {/* 섹션 구분선 */}
      <div className="my-16 sm:my-20 md:my-24">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Trending Destinations 섹션 */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <TrendingDestinationsSection
          destinations={[]} // TODO: 실제 데이터 연결
          onSeeMore={() => router.push("/courses")}
        />
      </motion.div>


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
    </div>
  )
}
