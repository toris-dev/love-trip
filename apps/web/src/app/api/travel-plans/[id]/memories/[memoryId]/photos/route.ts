import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"
import { updateTravelMemory } from "@lovetrip/planner/services/travel-memory-service"
import { validateImageFile, sanitizeFilename, MAX_FILE_SIZE_LARGE } from "@/lib/security/file-validation"
import { sanitizeError } from "@/lib/security/error-sanitization"
import { validateContentType, validateRequestSize } from "@/lib/security/request-validation"

/**
 * POST /api/travel-plans/[id]/memories/[memoryId]/photos
 * 추억에 사진 업로드
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memoryId: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const { id: travelPlanId, memoryId } = await params

    // 권한 확인
    const { data: memory } = await supabase
      .from("travel_memories")
      .select("user_id, photo_urls")
      .eq("id", memoryId)
      .single()

    if (!memory || memory.user_id !== user.id) {
      return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 })
    }

    // Content-Type 검증
    const contentTypeValidation = validateContentType(request, ["multipart/form-data"])
    if (!contentTypeValidation.valid) {
      return NextResponse.json(
        { error: contentTypeValidation.error || "잘못된 요청 형식입니다" },
        { status: 400 }
      )
    }

    // 요청 크기 제한 (10개 파일 * 10MB = 100MB)
    const requestSizeValidation = validateRequestSize(request, 100 * 1024 * 1024)
    if (!requestSizeValidation.valid) {
      return NextResponse.json(
        { error: requestSizeValidation.error },
        { status: 400 }
      )
    }

    // FormData에서 파일들 추출
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "파일이 제공되지 않았습니다" }, { status: 400 })
    }

    // 최대 업로드 파일 수 제한 (보안)
    const maxFiles = 10
    if (files.length > maxFiles) {
      return NextResponse.json(
        { error: `한 번에 최대 ${maxFiles}개의 파일만 업로드할 수 있습니다` },
        { status: 400 }
      )
    }

    // 파일 타입 및 크기 검증 (보안 강화)
    for (const file of files) {
      // 기본 검증 (5MB 제한)
      const validation = validateImageFile(file)
      if (!validation.valid) {
        // 메모리 사진은 10MB까지 허용하므로 크기 검증만 재확인
        if (file.size > MAX_FILE_SIZE_LARGE) {
          return NextResponse.json(
            { error: "파일 크기는 10MB를 초과할 수 없습니다" },
            { status: 400 }
          )
        }
        // 다른 검증 실패는 원래 에러 반환
        return NextResponse.json({ error: validation.error }, { status: 400 })
      }
      // 크기 재검증 (10MB까지 허용)
      if (file.size > MAX_FILE_SIZE_LARGE) {
        return NextResponse.json(
          { error: "파일 크기는 10MB를 초과할 수 없습니다" },
          { status: 400 }
        )
      }
    }

    // Supabase Storage에 업로드
    const uploadedUrls: string[] = []
    const existingUrls = (memory.photo_urls || []) as string[]

    for (const file of files) {
      // 파일명 생성 (고유한 이름, 보안 강화)
      const sanitizedOriginalName = sanitizeFilename(file.name)
      const fileExt = sanitizedOriginalName.split(".").pop()?.toLowerCase() || "jpg"
      const fileName = `${user.id}/${travelPlanId}/${memoryId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `memories/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("memories")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) {
        console.error("Error uploading photo:", uploadError)
        // 일부 실패해도 성공한 것들은 저장 (에러는 로그만)
        continue
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("memories").getPublicUrl(filePath)
      uploadedUrls.push(publicUrl)
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json({ error: "사진 업로드에 실패했습니다" }, { status: 500 })
    }

    // 추억에 사진 URL 추가
    const updatedMemory = await updateTravelMemory(memoryId, user.id, {
      photo_urls: [...existingUrls, ...uploadedUrls],
      updated_at: new Date().toISOString(),
    })

    return NextResponse.json(
      { memory: updatedMemory, uploadedUrls },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error in POST /api/travel-plans/[id]/memories/[memoryId]/photos:", error)
    const safeError = sanitizeError(error)
    return NextResponse.json(
      { error: safeError },
      { status: 500 }
    )
  }
}
