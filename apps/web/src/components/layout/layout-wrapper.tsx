"use client"

import { useEffect, useState } from "react"
import { PushNotificationBanner } from "@/components/shared/push-notification-banner"
import { PWAInstall } from "@/components/shared/pwa-install"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // 서버와 클라이언트에서 동일하게 렌더링되도록
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      {children}
      {isMounted && (
        <>
          <PushNotificationBanner />
          <PWAInstall />
        </>
      )}
    </div>
  )
}

