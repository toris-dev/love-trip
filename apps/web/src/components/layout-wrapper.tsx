"use client"

import { Header } from "@/components/header"
import { WebGLBackground } from "@/components/webgl-background"
import { PushNotificationBanner } from "@/components/push-notification-banner"
import { PWAInstall } from "@/components/pwa-install"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background relative">
      <WebGLBackground />
      <Header />
      {children}
      <PushNotificationBanner />
      <PWAInstall />
    </div>
  )
}

