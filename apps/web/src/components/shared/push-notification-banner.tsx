"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@lovetrip/ui/components/button"
import { Bell, X, Heart } from "lucide-react"
import { usePushNotifications } from "@/hooks/use-push-notifications"
import { createClient } from "@lovetrip/api/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { useBannerPosition } from "@/hooks/use-banner-position"

const PUSH_NOTIFICATION_DISMISSED_KEY = "push_notification_dismissed"
const PUSH_NOTIFICATION_DISMISSED_EXPIRY = 7 * 24 * 60 * 60 * 1000 // 7일
const ONE_DAY_MS = 24 * 60 * 60 * 1000 // 하루

export function PushNotificationBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const { isSupported, isSubscribed, isLoading, permission, subscribe, requestPermission } =
    usePushNotifications()
  const bottomOffset = useBannerPosition(showBanner, '[data-banner="pwa"]')
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const checkShouldShowBanner = async () => {
      console.log("[Push Banner] Checking conditions:", {
        isLoading,
        isSupported,
        isSubscribed,
        permission,
      })

      // 로딩 중이면 잠시 대기 (최대 10초)
      if (isLoading) {
        const retryCount =
          (timeoutRef.current as unknown as { _retryCount: number })?._retryCount || 0
        if (retryCount < 5) {
          // 2초 후 다시 확인
          const timeout = setTimeout(() => {
            ;(timeout as unknown as { _retryCount: number })._retryCount = retryCount + 1
            checkShouldShowBanner()
          }, 2000)
          timeoutRef.current = timeout
        } else {
          console.log("[Push Banner] Max retries reached, proceeding anyway")
        }
        return
      }

      // 지원하지 않으면 표시하지 않음
      if (!isSupported) {
        console.log(
          "[Push Banner] Not supported - serviceWorker:",
          "serviceWorker" in navigator,
          "PushManager:",
          "PushManager" in window
        )
        return
      }

      // 이미 구독했으면 표시하지 않음
      if (isSubscribed) {
        console.log("[Push Banner] Already subscribed")
        return
      }

      // 권한이 거부된 경우에도 배너 표시 (사용자가 브라우저 설정에서 변경할 수 있도록 안내)
      // 하지만 이미 구독한 경우는 제외
      // 권한이 거부되어도 배너는 표시하되, 다른 메시지를 보여줄 수 있음

      // 사용자 확인
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        console.log("[Push Banner] No user - not logged in")
        return // 로그인하지 않았으면 표시하지 않음
      }
      console.log("[Push Banner] User found:", user.id)
      setUser(user)

      // 로컬 스토리지에서 거부 기록 확인
      const dismissedData = localStorage.getItem(PUSH_NOTIFICATION_DISMISSED_KEY)
      if (dismissedData) {
        try {
          const { timestamp, type } = JSON.parse(dismissedData)
          const now = Date.now()
          const elapsed = now - timestamp

          console.log("[Push Banner] Dismissed data:", { type, elapsed, timestamp, now })

          // "오늘 보지 않기"인 경우 하루 동안 숨김
          if (type === "today" && elapsed < ONE_DAY_MS) {
            const hoursLeft = Math.floor((ONE_DAY_MS - elapsed) / (60 * 60 * 1000))
            console.log("[Push Banner] Dismissed for today, hours left:", hoursLeft)
            return
          }

          // "나중에"인 경우 7일 동안 숨김
          if (type === "later" && elapsed < PUSH_NOTIFICATION_DISMISSED_EXPIRY) {
            const daysLeft = Math.floor(
              (PUSH_NOTIFICATION_DISMISSED_EXPIRY - elapsed) / (24 * 60 * 60 * 1000)
            )
            console.log("[Push Banner] Dismissed for later, days left:", daysLeft)
            return
          }

          console.log("[Push Banner] Dismiss period expired, showing banner")
        } catch (e) {
          console.error("[Push Banner] Error parsing dismissed data:", e)
          // 파싱 에러가 있으면 로컬 스토리지 클리어
          localStorage.removeItem(PUSH_NOTIFICATION_DISMISSED_KEY)
        }
      }

      // 모든 조건을 만족하면 배너 표시
      console.log("[Push Banner] ✅ All conditions met, showing banner")
      setShowBanner(true)
    }

    // 초기 확인
    checkShouldShowBanner()

    // 클린업
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [isSupported, isSubscribed, isLoading, permission])

  const handleAllow = async () => {
    // 권한이 거부된 경우 안내
    if (permission === "denied") {
      toast.error("알림 권한이 거부되었습니다. 브라우저 설정에서 알림 권한을 허용해주세요.", {
        duration: 5000,
      })
      return
    }

    if (permission === "default") {
      const result = await requestPermission()
      if (result === "denied") {
        toast.error("알림 권한이 거부되었습니다. 브라우저 설정에서 알림 권한을 허용해주세요.", {
          duration: 5000,
        })
        return
      }
      if (result !== "granted") {
        toast.error("알림 권한이 필요합니다")
        return
      }
    }

    const success = await subscribe()
    if (success) {
      toast.success("푸시 알림이 활성화되었습니다")
      setShowBanner(false)
    } else {
      toast.error("푸시 알림 활성화에 실패했습니다")
    }
  }

  const handleDismiss = () => {
    // 7일간 다시 표시하지 않도록 저장
    localStorage.setItem(
      PUSH_NOTIFICATION_DISMISSED_KEY,
      JSON.stringify({ timestamp: Date.now(), type: "later" })
    )
    setShowBanner(false)
  }

  const handleDismissToday = () => {
    // 하루동안 보지 않기
    localStorage.setItem(
      PUSH_NOTIFICATION_DISMISSED_KEY,
      JSON.stringify({ timestamp: Date.now(), type: "today" })
    )
    setShowBanner(false)
  }

  if (!showBanner || !user) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed left-4 right-4 bg-card border border-border rounded-lg shadow-lg p-4 z-50 md:left-auto md:right-4 md:max-w-sm backdrop-blur-sm"
        style={{ bottom: `${bottomOffset}px` }}
        data-banner="push"
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
              <Heart className="w-4 h-4 text-primary" />
              푸시 알림 받기
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              {permission === "denied" ? (
                <>알림 권한이 거부되었습니다. 브라우저 설정에서 알림 권한을 허용해주세요. 🔔</>
              ) : (
                <>커플이 일정을 추가하면 즉시 알림을 받아보세요! 💕</>
              )}
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button onClick={handleAllow} size="sm" className="flex-1">
                  <Bell className="w-4 h-4 mr-2" />
                  알림 받기
                </Button>
                <Button onClick={handleDismiss} variant="outline" size="sm">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <Button
                onClick={handleDismissToday}
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground/70 hover:text-muted-foreground hover:bg-transparent border border-border/50 hover:border-border transition-colors"
              >
                오늘 보지 않기
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
