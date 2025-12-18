"use client"

import { useState, useEffect } from "react"
import { Button } from "@lovetrip/ui/components/button"
import { Download, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
  prompt(): Promise<void>
}

const PWA_INSTALL_DISMISSED_KEY = "pwa_install_dismissed"
const ONE_DAY_MS = 24 * 60 * 60 * 1000

export function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  // 오늘 보지 않기 확인 함수
  const shouldShowPrompt = (): boolean => {
    const dismissedData = localStorage.getItem(PWA_INSTALL_DISMISSED_KEY)
    if (dismissedData) {
      try {
      const { timestamp } = JSON.parse(dismissedData)
      const now = Date.now()
      // 하루가 지나지 않았으면 표시하지 않음
      if (now - timestamp < ONE_DAY_MS) {
          return false
        }
      } catch (e) {
        // 파싱 에러가 있으면 로컬 스토리지 클리어
        localStorage.removeItem(PWA_INSTALL_DISMISSED_KEY)
      }
    }
    return true
  }

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      
      // 오늘 보지 않기 확인
      if (!shouldShowPrompt()) {
        return
      }
      
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
  }

  const handleDismissToday = () => {
    // 하루동안 보지 않기
    localStorage.setItem(
      PWA_INSTALL_DISMISSED_KEY,
      JSON.stringify({ timestamp: Date.now() })
    )
    setShowInstallPrompt(false)
  }

  if (!showInstallPrompt) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-4 left-4 right-4 bg-card border border-border rounded-lg shadow-lg p-4 z-50 md:left-auto md:right-4 md:max-w-sm backdrop-blur-sm"
        data-banner="pwa"
      >
      <div className="flex items-start justify-between">
        <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">앱 설치</h3>
            <p className="text-sm text-muted-foreground mb-3">
              LOVETRIP을 홈 화면에 추가하여 더 빠르게 이용하세요!
            </p>
            <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button onClick={handleInstall} size="sm" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              설치
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
