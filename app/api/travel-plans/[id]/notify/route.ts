import { type NextRequest, NextResponse } from "next/server"
import { notificationService } from "@/lib/services/notification-service"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { type } = await request.json()
    const planId = params.id

    if (!planId || !type) {
      return NextResponse.json({ error: "Plan ID and notification type required" }, { status: 400 })
    }

    const success = await notificationService.sendTravelPlanNotification(
      planId,
      type as "created" | "updated" | "reminder",
    )

    if (success) {
      return NextResponse.json({ message: "Notification sent successfully" })
    } else {
      return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
    }
  } catch (error) {
    console.error("[v0] Error sending travel plan notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
