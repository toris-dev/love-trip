import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"
import { updateExpense } from "@lovetrip/expense/services"
import { validateImageFile, sanitizeFilename, MAX_FILE_SIZE_LARGE } from "@/lib/security/file-validation"
import { sanitizeError } from "@/lib/security/error-sanitization"
import { validateContentType, validateRequestSize } from "@/lib/security/request-validation"

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

    // Content-Type 검증
    const contentTypeValidation = validateContentType(request, ["multipart/form-data"])
    if (!contentTypeValidation.valid) {
      return NextResponse.json(
        { error: contentTypeValidation.error || "잘못된 요청 형식입니다" },
        { status: 400 }
      )
    }

    // 요청 크기 제한 (10MB)
    const requestSizeValidation = validateRequestSize(request, MAX_FILE_SIZE_LARGE)
    if (!requestSizeValidation.valid) {
      return NextResponse.json(
        { error: requestSizeValidation.error },
        { status: 400 }
      )
    }

    // FormData에서 파일 추출
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "파일이 제공되지 않았습니다" }, { status: 400 })
    }

    // 파일 검증 (보안 강화) - 영수증은 10MB까지 허용
    const validation = validateImageFile(file)
    if (!validation.valid) {
      // 영수증은 10MB까지 허용하므로 크기 검증만 재확인
      if (file.size > MAX_FILE_SIZE_LARGE) {
        return NextResponse.json(
          { error: "파일 크기는 10MB 이하여야 합니다" },
          { status: 400 }
        )
      }
      // 다른 검증 실패는 원래 에러 반환
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }
    // 크기 재검증 (10MB까지 허용)
    if (file.size > MAX_FILE_SIZE_LARGE) {
      return NextResponse.json(
        { error: "파일 크기는 10MB 이하여야 합니다" },
        { status: 400 }
      )
    }

    // 파일명 생성 (고유한 이름, 보안 강화)
    const sanitizedOriginalName = sanitizeFilename(file.name)
    const fileExt = sanitizedOriginalName.split(".").pop()?.toLowerCase() || "jpg"
    const fileName = `${user.id}/${travelPlanId}/${expenseId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
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
      const safeError = sanitizeError(uploadError)
      return NextResponse.json(
        { error: safeError || "영수증 업로드에 실패했습니다" },
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
    const safeError = sanitizeError(error)
    return NextResponse.json(
      { error: safeError },
      { status: 500 }
    )
  }
}
