"use client"

import { useState } from "react"
import { Button } from "@lovetrip/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@lovetrip/ui/components/dialog"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@lovetrip/ui/components/card"
import { Badge } from "@lovetrip/ui/components/badge"
import { Crown, Sparkles, Check, X } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

interface PremiumUpgradeBannerProps {
  featureName: string
  featureDescription?: string
  trigger?: React.ReactNode
}

export function PremiumUpgradeBanner({
  featureName,
  featureDescription,
  trigger,
}: PremiumUpgradeBannerProps) {
  const [open, setOpen] = useState(false)

  const premiumFeatures = [
    { name: "테마/기념일/럭셔리 코스", icon: Sparkles },
    { name: "커플 감성 큐레이션 필터", icon: Sparkles },
    { name: "AI 일정 자동 재편성", icon: Sparkles },
    { name: "예산 최적화 대안 코스", icon: Sparkles },
    { name: "기념일 알림 + 예약 리마인더", icon: Sparkles },
    { name: "앨범 무제한 + 히스토리 리포트", icon: Sparkles },
    { name: "프리미엄 배지 + 우선 노출", icon: Crown },
    { name: "고급 필터 + AI 맞춤 추천", icon: Sparkles },
    { name: "Ad-Free", icon: Check },
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full">
            <Crown className="h-4 w-4 mr-2 text-yellow-500" />
            프리미엄으로 업그레이드
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Crown className="h-6 w-6 text-yellow-500" />
            프리미엄 구독으로 업그레이드
          </DialogTitle>
          <DialogDescription>
            {featureDescription || `${featureName} 기능을 사용하려면 프리미엄 구독이 필요합니다.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* 프리미엄 혜택 */}
          <Card className="border-2 border-yellow-500/50 bg-gradient-to-br from-yellow-50/50 to-orange-50/50 dark:from-yellow-950/20 dark:to-orange-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                프리미엄 혜택
              </CardTitle>
              <CardDescription>연인을 위한 완성도 있는 감동 설계를 제공합니다</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {premiumFeatures.map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <motion.div
                      key={feature.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-2 p-2 rounded-lg bg-white/50 dark:bg-black/20"
                    >
                      <Icon className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                      <span className="text-sm">{feature.name}</span>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* 비교표 */}
          <Card>
            <CardHeader>
              <CardTitle>무료 vs 프리미엄</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="font-medium">코스 공개</span>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">기본 보상</Badge>
                    <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                      프리미엄 배지 + 우선 노출
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="font-medium">코스 탐색</span>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">기본 필터링</Badge>
                    <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                      고급 필터 + AI 맞춤 추천
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="font-medium">일정 변경</span>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">알림만</Badge>
                    <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                      AI 자동 재편성
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              asChild
              className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white"
              size="lg"
            >
              <Link href="/profile">
                <Crown className="h-5 w-5 mr-2" />
                프리미엄으로 업그레이드
              </Link>
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1" size="lg">
              나중에
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
