"use client"

import { Heart, MapPin, Calendar, Users } from "lucide-react"

export function OnboardingStep1() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">LOVETRIP에 오신 것을 환영합니다!</h2>
        <p className="text-muted-foreground">맞춤형 여행 계획 서비스를 시작해보세요</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start gap-3 p-4 rounded-lg border">
          <MapPin className="h-5 w-5 text-primary mt-1" />
          <div>
            <h3 className="font-semibold mb-1">UGC 데이트 코스 탐색</h3>
            <p className="text-sm text-muted-foreground">
              다른 사용자들이 만든 데이트/여행 코스를 탐색하고 나만의 코스를 제작하세요
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-lg border">
          <Calendar className="h-5 w-5 text-primary mt-1" />
          <div>
            <h3 className="font-semibold mb-1">커플 캘린더</h3>
            <p className="text-sm text-muted-foreground">
              연인과 일정을 공유하고 함께 여행을 계획하세요
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-lg border">
          <Heart className="h-5 w-5 text-primary mt-1" />
          <div>
            <h3 className="font-semibold mb-1">예산 관리</h3>
            <p className="text-sm text-muted-foreground">
              여행 예산을 계획하고 지출을 기록하며 1/N 정산을 해보세요
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-lg border">
          <Users className="h-5 w-5 text-primary mt-1" />
          <div>
            <h3 className="font-semibold mb-1">커뮤니티</h3>
            <p className="text-sm text-muted-foreground">
              다른 사용자들의 여행 코스를 탐색하고 나만의 코스를 공유하세요
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
