import { createBrowserClient } from "@supabase/ssr"

interface SendNotificationParams {
  title: string
  body: string
  url?: string
  userId?: string
  userIds?: string[]
}

export class NotificationService {
  private static instance: NotificationService
  private supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  async sendPushNotification(params: SendNotificationParams): Promise<boolean> {
    try {
      const response = await fetch("/api/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error("[v0] Failed to send push notification:", result.error)
        return false
      }

      console.log("[v0] Push notification sent:", result.message)
      return true
    } catch (error) {
      console.error("[v0] Error sending push notification:", error)
      return false
    }
  }

  async sendToCurrentUser(title: string, body: string, url?: string): Promise<boolean> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()

    if (!user) {
      console.error("[v0] No authenticated user found")
      return false
    }

    return this.sendPushNotification({
      title,
      body,
      url,
      userId: user.id,
    })
  }

  async sendToUsers(userIds: string[], title: string, body: string, url?: string): Promise<boolean> {
    return this.sendPushNotification({
      title,
      body,
      url,
      userIds,
    })
  }

  async sendTravelPlanNotification(planId: string, type: "created" | "updated" | "reminder"): Promise<boolean> {
    const { data: plan } = await this.supabase.from("travel_plans").select("title, user_id").eq("id", planId).single()

    if (!plan) return false

    const messages = {
      created: {
        title: "새로운 여행 계획이 생성되었습니다!",
        body: `"${plan.title}" 계획을 확인해보세요.`,
      },
      updated: {
        title: "여행 계획이 업데이트되었습니다",
        body: `"${plan.title}" 계획에 변경사항이 있습니다.`,
      },
      reminder: {
        title: "여행 일정 알림",
        body: `"${plan.title}" 여행이 곧 시작됩니다!`,
      },
    }

    return this.sendPushNotification({
      ...messages[type],
      url: `/?plan=${planId}`,
      userId: plan.user_id,
    })
  }
}

export const notificationService = NotificationService.getInstance()
