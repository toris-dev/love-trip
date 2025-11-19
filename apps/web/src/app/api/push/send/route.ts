import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import webpush from "web-push"

export async function POST(request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      console.error("[v0] VAPID keys not configured")
      return NextResponse.json({ error: "Push notifications not configured" }, { status: 500 })
    }

    // Configure webpush only when keys are present to avoid build-time failures
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || "mailto:support@lovetrip.app",
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY,
    )

    const { title, body, url, userId, userIds } = await request.json()

    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    let query = supabase.from("push_subscriptions").select("*")

    if (userId) {
      query = query.eq("user_id", userId)
    } else if (userIds && Array.isArray(userIds)) {
      query = query.in("user_id", userIds)
    } else {
      return NextResponse.json({ error: "userId or userIds required" }, { status: 400 })
    }

    const { data: subscriptions, error } = await query

    if (error) {
      console.error("[v0] Error fetching push subscriptions:", error)
      return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 })
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ message: "No subscriptions found" }, { status: 200 })
    }

    const pushPromises = subscriptions.map(async (subscription) => {
      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      }

      const payload = JSON.stringify({
        title: title || "LOVETRIP",
        body: body || "새로운 알림이 있습니다.",
        icon: "/icon-192.png",
        badge: "/icon-96.png",
        vibrate: [200, 100, 200],
        actions: [
          {
            action: "open",
            title: "열기",
            icon: "/icon-96.png",
          },
        ],
        data: {
          url: url || "/",
          timestamp: Date.now(),
        },
      })

      try {
        await webpush.sendNotification(pushSubscription, payload)
        console.log("[v0] Push notification sent successfully")
        return { success: true, subscription: subscription.id }
      } catch (error) {
        console.error("[v0] Error sending push notification:", error)

        const webpushError = error as { statusCode?: number; message?: string }
        if (webpushError.statusCode === 410 || webpushError.statusCode === 404) {
          await supabase.from("push_subscriptions").delete().eq("id", subscription.id)
        }

        return { success: false, error: webpushError.message || String(error), subscription: subscription.id }
      }
    })

    const results = await Promise.all(pushPromises)
    const successful = results.filter((r) => r.success).length
    const failed = results.filter((r) => !r.success).length

    return NextResponse.json({
      message: `Push notifications sent: ${successful} successful, ${failed} failed`,
      results,
    })
  } catch (error) {
    console.error("[v0] Error in push notification API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
