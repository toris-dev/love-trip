import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"
import { validateImageFile, sanitizeFilename } from "@/lib/security/file-validation"
import { sanitizeError } from "@/lib/security/error-sanitization"
import { validateContentType, validateRequestSize } from "@/lib/security/request-validation"

/**
 * POST /api/profile/avatar
 * 프로필 이미지 업로드
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
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
    const requestSizeValidation = validateRequestSize(request, 10 * 1024 * 1024)
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

    // 파일 검증 (보안 강화)
    const validation = validateImageFile(file)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // 기존 프로필 이미지 확인 및 삭제
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .single()

    // 기존 이미지가 있고 Supabase Storage 경로인 경우 삭제
    if (existingProfile?.avatar_url) {
      try {
        // URL에서 경로 추출
        // 예: https://xxx.supabase.co/storage/v1/object/public/avatars/user-id/file.jpg
        // 또는: https://xxx.supabase.co/storage/v1/object/sign/avatars/user-id/file.jpg?token=...
        const url = existingProfile.avatar_url
        const avatarsIndex = url.indexOf("/avatars/")
        if (avatarsIndex !== -1) {
          const pathAfterAvatars = url.substring(avatarsIndex + "/avatars/".length)
          // 쿼리 파라미터 제거
          const filePath = pathAfterAvatars.split("?")[0]
          if (filePath) {
            await supabase.storage.from("avatars").remove([filePath])
          }
        }
      } catch (deleteError) {
        // 삭제 실패는 무시 (로그만 남김)
        console.warn("Failed to delete old avatar:", deleteError)
      }
    }

    // 파일명 생성 (고유한 이름, 보안 강화)
    const sanitizedOriginalName = sanitizeFilename(file.name)
    const fileExt = sanitizedOriginalName.split(".").pop()?.toLowerCase() || "jpg"
    // 확장자 재검증
    if (![".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"].some((ext) => fileExt === ext.replace(".", ""))) {
      return NextResponse.json(
        { error: "허용되지 않은 파일 확장자입니다" },
        { status: 400 }
      )
    }
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Supabase Storage에 업로드
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      console.error("Error uploading avatar:", uploadError)
      // 민감한 정보 제거된 에러 메시지
      const safeError = sanitizeError(uploadError)
      return NextResponse.json(
        { error: safeError || "프로필 이미지 업로드에 실패했습니다" },
        { status: 500 }
      )
    }

    // Public URL 생성
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath)

    // profiles 테이블에 avatar_url 업데이트
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id)

    if (updateError) {
      console.error("Error updating profile:", updateError)
      // 업로드는 성공했지만 DB 업데이트 실패 시 업로드한 파일 삭제
      try {
        await supabase.storage.from("avatars").remove([filePath])
      } catch (cleanupError) {
        console.error("Failed to cleanup uploaded file:", cleanupError)
      }
      const safeError = sanitizeError(updateError)
      return NextResponse.json(
        { error: safeError || "프로필 업데이트에 실패했습니다" },
        { status: 500 }
      )
    }

    return NextResponse.json({ avatarUrl: publicUrl }, { status: 200 })
  } catch (error) {
    console.error("Error in POST /api/profile/avatar:", error)
    const safeError = sanitizeError(error)
    return NextResponse.json(
      { error: safeError },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/profile/avatar
 * 프로필 이미지 삭제
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    // 현재 프로필 이미지 확인
    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .single()

    if (profile?.avatar_url) {
      // Supabase Storage에서 파일 삭제
      try {
        const url = profile.avatar_url
        const avatarsIndex = url.indexOf("/avatars/")
        if (avatarsIndex !== -1) {
          const pathAfterAvatars = url.substring(avatarsIndex + "/avatars/".length)
          // 쿼리 파라미터 제거
          const filePath = pathAfterAvatars.split("?")[0]
          if (filePath) {
            await supabase.storage.from("avatars").remove([filePath])
          }
        }
      } catch (deleteError) {
        console.warn("Failed to delete avatar from storage:", deleteError)
      }
    }

    // profiles 테이블에서 avatar_url 제거
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: null })
      .eq("id", user.id)

    if (updateError) {
      console.error("Error updating profile:", updateError)
      const safeError = sanitizeError(updateError)
      return NextResponse.json(
        { error: safeError || "프로필 업데이트에 실패했습니다" },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: "프로필 이미지가 삭제되었습니다" }, { status: 200 })
  } catch (error) {
    console.error("Error in DELETE /api/profile/avatar:", error)
    const safeError = sanitizeError(error)
    return NextResponse.json(
      { error: safeError },
      { status: 500 }
    )
  }
}
