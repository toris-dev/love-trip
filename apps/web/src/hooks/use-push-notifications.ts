"use client"

import { useState, useEffect, useCallback } from "react"
import { createBrowserClient } from "@supabase/ssr"

interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

interface UsePushNotificationsReturn {
  isSupported: boolean
  isSubscribed: boolean
  isLoading: boolean
  permission: NotificationPermission
  subscribe: () => Promise<boolean>
  unsubscribe: () => Promise<boolean>
  requestPermission: () => Promise<NotificationPermission>
}

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

export function usePushNotifications(): UsePushNotificationsReturn {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [permission, setPermission] = useState<NotificationPermission>("default")

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    const checkSupport = async () => {
      if (typeof window === "undefined") {
        setIsLoading(false)
        return
      }

      const supported = "serviceWorker" in navigator && "PushManager" in window
      console.log("[Push Notifications] Support check:", {
        serviceWorker: "serviceWorker" in navigator,
        PushManager: "PushManager" in window,
        supported,
        permission: Notification.permission,
      })
      setIsSupported(supported)
      setPermission(Notification.permission)

      if (supported) {
        try {
          // 서비스 워커 등록 확인
          let registration = await navigator.serviceWorker.getRegistration()
          
          // 서비스 워커가 없으면 등록 시도
          if (!registration) {
            try {
              registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" })
              console.log("[Push Notifications] Service worker registered")
            } catch (regError) {
              console.error("[Push Notifications] Service worker registration failed:", regError)
              setIsLoading(false)
              return
            }
          }

          // 서비스 워커가 활성화될 때까지 기다림 (타임아웃 5초)
          const readyPromise = navigator.serviceWorker.ready
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Service worker ready timeout")), 5000)
          )
          
          try {
            await Promise.race([readyPromise, timeoutPromise])
            const finalRegistration = await navigator.serviceWorker.getRegistration()
            if (finalRegistration) {
              const subscription = await finalRegistration.pushManager.getSubscription()
          setIsSubscribed(!!subscription)
            }
          } catch (error) {
            console.warn("[Push Notifications] Service worker not ready yet:", error)
            // 서비스 워커가 준비되지 않아도 계속 진행
          }
        } catch (error) {
          console.error("[Push Notifications] Error checking push subscription:", error)
        }
      }

      setIsLoading(false)
    }

    checkSupport()
  }, [])

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) return "denied"

    const result = await Notification.requestPermission()
    setPermission(result)
    return result
  }, [isSupported])

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported || permission !== "granted") {
      const newPermission = await requestPermission()
      if (newPermission !== "granted") return false
    }

    if (!VAPID_PUBLIC_KEY) {
      console.error("[v0] VAPID public key not configured")
      return false
    }

    setIsLoading(true)

    try {
      // 서비스 워커가 활성화될 때까지 기다림 (이미 layout에서 등록됨)
      const registration = await navigator.serviceWorker.ready

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as any,
      })

      const subscriptionData = subscription.toJSON() as PushSubscription

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { error } = await supabase.from("push_subscriptions").upsert({
          user_id: user.id,
          endpoint: subscriptionData.endpoint,
          p256dh: subscriptionData.keys.p256dh,
          auth: subscriptionData.keys.auth,
        })

        if (error) {
          console.error("[v0] Error saving push subscription:", error)
          return false
        }
      }

      setIsSubscribed(true)
      return true
    } catch (error) {
      console.error("[v0] Error subscribing to push notifications:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isSupported, permission, requestPermission, supabase])

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false

    setIsLoading(true)

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()

        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("user_id", user.id)
            .eq("endpoint", subscription.endpoint)
        }
      }

      setIsSubscribed(false)
      return true
    } catch (error) {
      console.error("[v0] Error unsubscribing from push notifications:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isSupported, supabase])

  return {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
    requestPermission,
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
