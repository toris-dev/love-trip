"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Bell, BellOff } from "lucide-react"
import { usePushNotifications } from "@/hooks/use-push-notifications"

export function PushNotificationSettings() {
  const { isSupported, isSubscribed, isLoading, permission, subscribe, unsubscribe, requestPermission } =
    usePushNotifications()

  const [isToggling, setIsToggling] = useState(false)

  const handleToggle = async () => {
    setIsToggling(true)

    try {
      if (isSubscribed) {
        await unsubscribe()
      } else {
        if (permission === "denied") {
          alert("알림 권한이 차단되었습니다. 브라우저 설정에서 알림을 허용해주세요.")
          return
        }

        const success = await subscribe()
        if (!success) {
          alert("알림 구독에 실패했습니다. 다시 시도해주세요.")
        }
      }
    } catch (error) {
      console.error("[v0] Error toggling push notifications:", error)
      alert("알림 설정 중 오류가 발생했습니다.")
    } finally {
      setIsToggling(false)
    }
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            푸시 알림
          </CardTitle>
          <CardDescription>이 브라우저는 푸시 알림을 지원하지 않습니다.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          푸시 알림
        </CardTitle>
        <CardDescription>여행 계획 업데이트와 중요한 알림을 받아보세요.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">알림 받기</p>
            <p className="text-xs text-muted-foreground">
              {permission === "granted"
                ? "알림이 허용되었습니다"
                : permission === "denied"
                  ? "알림이 차단되었습니다"
                  : "알림 권한을 요청해주세요"}
            </p>
          </div>
          <Switch
            checked={isSubscribed}
            onCheckedChange={handleToggle}
            disabled={isLoading || isToggling || permission === "denied"}
          />
        </div>

        {permission === "default" && (
          <Button onClick={requestPermission} variant="outline" size="sm" disabled={isLoading}>
            알림 권한 요청
          </Button>
        )}

        {permission === "denied" && (
          <p className="text-xs text-destructive">브라우저 설정에서 알림을 허용한 후 페이지를 새로고침해주세요.</p>
        )}
      </CardContent>
    </Card>
  )
}
