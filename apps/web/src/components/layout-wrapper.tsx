"use client"

import { WebGLBackground } from "@/components/webgl-background"
import { PushNotificationBanner } from "@/components/push-notification-banner"
import { PWAInstall } from "@/components/pwa-install"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background relative">
      <WebGLBackground />
      {children}
      <PushNotificationBanner />
      <PWAInstall />
    </div>
  )
}

