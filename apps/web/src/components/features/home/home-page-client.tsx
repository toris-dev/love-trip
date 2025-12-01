"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@lovetrip/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@lovetrip/ui/components/card"
import { MapPin, Heart, Calendar, ArrowRight, Plus, Sparkles } from "lucide-react"
import { TravelPlanWizard } from "./travel-plan-wizard"

interface HomePageClientProps {
  user: { id: string; email?: string } | null
}

export function HomePageClient({ user }: HomePageClientProps) {
  const router = useRouter()
  const [wizardOpen, setWizardOpen] = useState(false)

  return (
    <>
      {/* 빠른 여행 계획 만들기 CTA */}
      <Card className="mb-8 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">빠르게 여행 계획 만들기</h3>
                <p className="text-sm text-muted-foreground">
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
              className="min-w-[200px]"
            >
              <Plus className="h-5 w-5 mr-2" />
              여행 계획 만들기
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 선택 카드 그리드 */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {/* 여행 코스 카드 */}
        <Card
          className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-primary/50"
          onClick={() => router.push("/travel")}
        >
          <CardHeader className="pb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl mb-2">여행 코스</CardTitle>
            <CardDescription className="text-base">
              1박 2일 이상의 여행 코스를 찾아보세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
                전국 다양한 지역의 여행 코스
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
                지도 기반 코스 탐색
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
                상세 일정 및 예산 관리
              </div>
            </div>
            <Button className="w-full mt-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              여행 코스 보기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* 데이트 코스 카드 */}
        <Card
          className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-accent/50"
          onClick={() => router.push("/date")}
        >
          <CardHeader className="pb-4">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
              <Heart className="h-8 w-8 text-accent" />
            </div>
            <CardTitle className="text-2xl mb-2">데이트 코스</CardTitle>
            <CardDescription className="text-base">
              당일 데이트 코스로 특별한 하루를 보내세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-accent mr-2"></span>
                가까운 거리의 데이트 코스
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-accent mr-2"></span>
                로맨틱한 장소 추천
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-accent mr-2"></span>
                걷기 좋은 코스 구성
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full mt-6 group-hover:bg-accent group-hover:text-accent-foreground transition-colors"
            >
              데이트 코스 보기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* 캘린더 카드 */}
        <Card
          className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-primary/50"
          onClick={() => {
            if (user) {
              router.push("/calendar")
            } else {
              router.push("/login")
            }
          }}
        >
          <CardHeader className="pb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl mb-2">캘린더</CardTitle>
            <CardDescription className="text-base">
              커플과 함께 일정을 관리하고 공유하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
                공유 캘린더 기능
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
                일정 추가 및 관리
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
                장소 연동 및 알림
              </div>
            </div>
            <Button className="w-full mt-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              {user ? "캘린더 보기" : "로그인 후 이용"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 여행 계획 마법사 */}
      <TravelPlanWizard user={user} open={wizardOpen} onOpenChange={setWizardOpen} />
    </>
  )
}

