"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@lovetrip/ui/components/card"
import { Button } from "@lovetrip/ui/components/button"
import { Badge } from "@lovetrip/ui/components/badge"
import { Crown, Check, X } from "lucide-react"
import { toast } from "sonner"
import type { Subscription } from "@lovetrip/subscription/types"

interface SubscriptionStatusProps {
  userId: string
}

export function SubscriptionStatus({ userId }: SubscriptionStatusProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/subscription")

        if (!response.ok) {
          throw new Error("구독 정보를 불러오는데 실패했습니다")
        }

        const { subscription: sub } = await response.json()
        setSubscription(sub)
      } catch (error) {
        console.error("Error loading subscription:", error)
        toast.error("구독 정보를 불러오는데 실패했습니다")
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      loadSubscription()
    }
  }, [userId])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">로딩 중...</CardContent>
      </Card>
    )
  }

  const isPremium = subscription?.tier === "premium" && subscription?.status === "active"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className={`h-5 w-5 ${isPremium ? "text-yellow-500" : "text-muted-foreground"}`} />
          구독 상태
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">구독 플랜</span>
            <Badge variant={isPremium ? "default" : "secondary"}>
              {subscription?.tier === "premium" ? "프리미엄" : "무료"}
            </Badge>
          </div>
          {subscription?.end_date && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">만료일</span>
              <span className="text-sm">
                {new Date(subscription.end_date).toLocaleDateString("ko-KR")}
              </span>
            </div>
          )}
          {!isPremium && (
            <Button className="w-full" variant="default">
              프리미엄으로 업그레이드
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
