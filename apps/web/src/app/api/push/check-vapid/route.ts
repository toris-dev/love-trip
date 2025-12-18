import { NextResponse } from "next/server"

// Edge Runtime - 간단한 체크만 수행하므로 Edge에서 실행 가능
export const runtime = "edge"

export async function GET() {
  return NextResponse.json({
    privateKey: !!process.env.VAPID_PRIVATE_KEY,
    subject: !!process.env.VAPID_SUBJECT,
  })
}
