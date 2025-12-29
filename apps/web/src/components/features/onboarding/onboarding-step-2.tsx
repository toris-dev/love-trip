"use client"

import Link from "next/link"
import { Button } from "@lovetrip/ui/components/button"
import { Users, Calendar } from "lucide-react"

export function OnboardingStep2() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">커플과 연결하기</h2>
        <p className="text-muted-foreground">연인과 연결하면 더 많은 기능을 사용할 수 있어요</p>
      </div>

      <div className="space-y-4">
        <div className="p-6 rounded-lg border bg-primary/5">
          <div className="flex items-start gap-4">
            <Users className="h-6 w-6 text-primary mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold mb-2">커플 연결의 장점</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 공유 캘린더로 일정을 함께 관리</li>
                <li>• 여행 계획을 함께 수정하고 공유</li>
                <li>• 지출 기록 및 1/N 정산 자동 계산</li>
                <li>• 기념일 알림 및 추억 저장</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg border">
          <div className="flex items-start gap-4">
            <Calendar className="h-6 w-6 text-primary mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold mb-2">지금 연결하기</h3>
              <p className="text-sm text-muted-foreground mb-4">
                프로필 페이지에서 파트너의 닉네임으로 검색하여 연결할 수 있습니다
              </p>
              <Link href="/profile">
                <Button variant="outline" size="sm">
                  프로필로 이동
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          나중에 프로필에서도 연결할 수 있습니다
        </p>
      </div>
    </div>
  )
}
