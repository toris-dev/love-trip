"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@lovetrip/ui/components/card"
import { Button } from "@lovetrip/ui/components/button"
import { Heart } from "lucide-react"

export function CoupleRequired() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            커플 연결이 필요합니다
          </CardTitle>
          <CardDescription>캘린더를 사용하려면 먼저 커플과 연결해주세요</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => (window.location.href = "/profile")}>프로필로 이동</Button>
        </CardContent>
      </Card>
    </div>
  )
}

