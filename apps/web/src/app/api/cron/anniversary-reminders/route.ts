import { NextResponse } from "next/server"
import { createServiceClient } from "@lovetrip/api/supabase/server"
import webpush from "web-push"

/**
 * GET /api/cron/anniversary-reminders
 * 기념일 알림 푸시 발송 (cron에서 호출)
 * Header: Authorization: Bearer <CRON_SECRET> 또는 x-cron-secret
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = request.headers.get("x-cron-secret")
  const secret = process.env.CRON_SECRET || process.env.CRON_API_KEY
  if (secret && authHeader !== `Bearer ${secret}` && cronSecret !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createServiceClient()
  const today = new Date()
  const todayMonth = today.getUTCMonth()
  const todayDate = today.getUTCDate()

  const { data: all, error: fetchError } = await supabase
    .from("anniversary_reminders")
    .select("id, user_id, title, event_date, last_notified_at")

  if (fetchError) {
    console.error("[anniversary-reminders] Fetch error:", fetchError)
    return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 })
  }

  const due = (all ?? []).filter(row => {
    const d = new Date(row.event_date + "T12:00:00Z")
    if (d.getUTCMonth() !== todayMonth || d.getUTCDate() !== todayDate) return false
    if (row.last_notified_at) {
      const n = new Date(row.last_notified_at)
      if (
        n.getUTCFullYear() === today.getUTCFullYear() &&
        n.getUTCMonth() === todayMonth &&
        n.getUTCDate() === todayDate
      ) {
        return false
      }
    }
    return true
  })

  if (due.length === 0) {
    return NextResponse.json({ message: "No anniversary reminders due today", sent: 0 })
  }

  if (
    !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
    !process.env.VAPID_PRIVATE_KEY
  ) {
    console.error("[anniversary-reminders] VAPID not configured")
    return NextResponse.json(
      { error: "Push notifications not configured", due: due.length },
      { status: 500 }
    )
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:support@lovetrip.app",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )

  const { data: subscriptions } = await supabase
    .from("push_subscriptions")
    .select("id, user_id, endpoint, p256dh, auth")
    .in(
      "user_id",
      due.map(d => d.user_id)
    )

  type Sub = (typeof subscriptions)[number]
  const userIdToSubs = new Map<string, Sub[]>()
  for (const sub of subscriptions ?? []) {
    const list = userIdToSubs.get(sub.user_id) ?? []
    list.push(sub)
    userIdToSubs.set(sub.user_id, list)
  }

  let sent = 0
  for (const reminder of due) {
    const subs = userIdToSubs.get(reminder.user_id) ?? []
    if (subs.length === 0) continue

    const payload = JSON.stringify({
      title: "기념일 알림",
      body: `오늘은 ${reminder.title}입니다.`,
      icon: "/icon-192.png",
      badge: "/icon-96.png",
      data: { url: "/calendar", timestamp: Date.now() },
    })

    let anySent = false
    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload
        )
        anySent = true
      } catch (err) {
        const e = err as { statusCode?: number }
        if (e.statusCode === 410 || e.statusCode === 404) {
          await supabase.from("push_subscriptions").delete().eq("id", sub.id)
        }
      }
    }
    if (anySent) {
      await supabase
        .from("anniversary_reminders")
        .update({
          last_notified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", reminder.id)
      sent++
    }
  }

  return NextResponse.json({
    message: `Anniversary reminders sent: ${sent}`,
    due: due.length,
    sent,
  })
}
