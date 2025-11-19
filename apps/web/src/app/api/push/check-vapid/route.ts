import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    privateKey: !!process.env.VAPID_PRIVATE_KEY,
    subject: !!process.env.VAPID_SUBJECT,
  })
}
