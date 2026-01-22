import { createClient } from "@lovetrip/api/supabase/client"

interface SendNotificationParams {
  title: string
  body: string
  url?: string
  userId?: string
  userIds?: string[]
}

export class NotificationService {
  private static instance: NotificationService

  private getSupabase() {
    return createClient()
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  async sendPushNotification(params: SendNotificationParams): Promise<boolean> {
    try {
      const supabase = this.getSupabase()

      // 단일 사용자에게 보내는 경우 알림 설정 확인
      if (params.userId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("notifications_enabled")
          .eq("id", params.userId)
          .single()

        // 알림이 비활성화되어 있으면 전송하지 않음
        if (profile?.notifications_enabled === false) {
          console.log("[Notification] User has notifications disabled, skipping notification")
          return false
        }
      }

      // 여러 사용자에게 보내는 경우 각 사용자의 알림 설정 확인
      if (params.userIds && params.userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, notifications_enabled")
          .in("id", params.userIds)

        // 알림이 활성화된 사용자만 필터링
        const enabledUserIds = profiles
          ?.filter((p) => p.notifications_enabled !== false)
          .map((p) => p.id) || []

        if (enabledUserIds.length === 0) {
          console.log("[Notification] No users with notifications enabled")
          return false
        }

        // 활성화된 사용자에게만 알림 전송
        params.userIds = enabledUserIds
      }

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
    const supabase = this.getSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()

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

  async sendToUsers(
    userIds: string[],
    title: string,
    body: string,
    url?: string
  ): Promise<boolean> {
    return this.sendPushNotification({
      title,
      body,
      url,
      userIds,
    })
  }

  async sendTravelPlanNotification(
    planId: string,
    type: "created" | "updated" | "reminder"
  ): Promise<boolean> {
    const supabase = this.getSupabase()
    const { data: plan } = await supabase
      .from("travel_plans")
      .select("title, user_id")
      .eq("id", planId)
      .single()

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
