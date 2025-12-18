import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"
import { updateExpense } from "@lovetrip/expense/services"

/**
 * POST /api/travel-plans/[id]/expenses/[expenseId]/receipt
 * 영수증 이미지 업로드
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; expenseId: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const { id: travelPlanId, expenseId } = await params

    // 여행 계획 소유권 확인
    const { data: plan, error: planError } = await supabase
      .from("travel_plans")
      .select("id, user_id")
      .eq("id", travelPlanId)
      .eq("user_id", user.id)
      .single()

    if (planError || !plan) {
      return NextResponse.json({ error: "여행 계획을 찾을 수 없습니다" }, { status: 404 })
    }

    // 지출 내역 확인
    const { data: expense, error: expenseError } = await supabase
      .from("expenses")
      .select("id, travel_plan_id")
      .eq("id", expenseId)
      .eq("travel_plan_id", travelPlanId)
      .single()

    if (expenseError || !expense) {
      return NextResponse.json({ error: "지출 내역을 찾을 수 없습니다" }, { status: 404 })
    }

    // FormData에서 파일 추출
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "파일이 제공되지 않았습니다" }, { status: 400 })
    }

    // 파일 타입 검증
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "이미지 파일만 업로드 가능합니다" }, { status: 400 })
    }

    // 파일 크기 제한 (10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: "파일 크기는 10MB 이하여야 합니다" }, { status: 400 })
    }

    // 파일명 생성 (고유한 이름)
    const fileExt = file.name.split(".").pop()
    const fileName = `${user.id}/${travelPlanId}/${expenseId}/${Date.now()}.${fileExt}`
    const filePath = `receipts/${fileName}`

    // Supabase Storage에 업로드
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("receipts")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      console.error("Error uploading receipt:", uploadError)
      return NextResponse.json(
        { error: uploadError.message || "영수증 업로드에 실패했습니다" },
        { status: 500 }
      )
    }

    // Public URL 생성
    const {
      data: { publicUrl },
    } = supabase.storage.from("receipts").getPublicUrl(filePath)

    // 지출 내역에 영수증 URL 업데이트
    const updatedExpense = await updateExpense(expenseId, {
      receipt_url: publicUrl,
    })

    return NextResponse.json({ expense: updatedExpense, receiptUrl: publicUrl }, { status: 200 })
  } catch (error) {
    console.error("Error in POST /api/travel-plans/[id]/expenses/[expenseId]/receipt:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "영수증 업로드 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
