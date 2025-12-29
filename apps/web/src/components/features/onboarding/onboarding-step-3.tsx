"use client"

import Link from "next/link"
import { Button } from "@lovetrip/ui/components/button"
import { MapPin, Heart, Plus } from "lucide-react"

export function OnboardingStep3() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">첫 여행 계획 만들기</h2>
        <p className="text-muted-foreground">이제 나만의 여행 계획을 만들어보세요</p>
      </div>

      <div className="space-y-4">
        <div className="p-6 rounded-lg border">
          <div className="flex items-start gap-4">
            <MapPin className="h-6 w-6 text-primary mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold mb-2">코스 탐색</h3>
              <p className="text-sm text-muted-foreground mb-4">
                다른 커플들이 만든 인기 코스를 탐색하고 저장할 수 있습니다
              </p>
              <Link href="/courses">
                <Button variant="outline" size="sm">
                  코스 탐색하기
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg border">
          <div className="flex items-start gap-4">
            <Heart className="h-6 w-6 text-primary mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold mb-2">데이트 코스 만들기</h3>
              <p className="text-sm text-muted-foreground mb-4">
                당일 데이트 코스를 만들고 장소를 추가해보세요
              </p>
              <Link href="/date">
                <Button variant="outline" size="sm">
                  데이트 코스 만들기
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg border bg-primary/5">
          <div className="flex items-start gap-4">
            <Plus className="h-6 w-6 text-primary mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold mb-2">여행 계획 만들기</h3>
              <p className="text-sm text-muted-foreground mb-4">
                며칠간의 여행 계획을 세우고 예산을 관리해보세요
              </p>
              <Link href="/travel">
                <Button size="sm">여행 계획 만들기</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
