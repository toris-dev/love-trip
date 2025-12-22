import { NextResponse } from "next/server"

// Edge Runtime 제거: Turbopack에서 모듈 로드 문제 해결
export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json({
    privateKey: !!process.env.VAPID_PRIVATE_KEY,
    subject: !!process.env.VAPID_SUBJECT,
  })
}
