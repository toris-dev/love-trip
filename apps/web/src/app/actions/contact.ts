"use server"

import { createClient } from "@lovetrip/api/supabase/server"

export interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

export interface ContactResult {
  success: boolean
  message: string
}

export async function submitContact(formData: FormData): Promise<ContactResult> {
  try {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const subject = formData.get("subject") as string
    const message = formData.get("message") as string

    // 입력 검증
    if (!name || !email || !subject || !message) {
      return {
        success: false,
        message: "모든 필드를 입력해주세요.",
      }
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return {
        success: false,
        message: "올바른 이메일 형식을 입력해주세요.",
      }
    }

    const supabase = await createClient()

    // contact_messages 테이블에 저장 (테이블이 없다면 생성 필요)
    const { error } = await supabase.from("contact_messages").insert({
      name,
      email,
      subject,
      message,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Contact form submission error:", error)
      // 테이블이 없을 경우에도 성공으로 처리 (개발 환경)
      if (process.env.NODE_ENV === "development") {
        console.log("Contact message (dev mode):", { name, email, subject, message })
        return {
          success: true,
          message: "문의가 성공적으로 전송되었습니다!",
        }
      }
      return {
        success: false,
        message: "문의 전송에 실패했습니다. 잠시 후 다시 시도해주세요.",
      }
    }

    return {
      success: true,
      message: "문의가 성공적으로 전송되었습니다!",
    }
  } catch (error) {
    console.error("Contact form error:", error)
    return {
      success: false,
      message: "문의 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
    }
  }
}

