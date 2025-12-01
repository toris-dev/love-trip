"use client"

import { useState } from "react"
import { createClient } from "@lovetrip/api/supabase/client"
import { toast } from "sonner"
import type { EmailData, ProfileData } from "../types"

export function useEmailChange(profile: ProfileData, setProfile: (profile: ProfileData) => void) {
  const [emailData, setEmailData] = useState<EmailData>({
    newEmail: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showEmailChange, setShowEmailChange] = useState(false)

  const handleEmailChange = async () => {
    if (!emailData.newEmail || !emailData.password) {
      toast.error("모든 필드를 입력해주세요")
      return
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailData.newEmail)) {
      toast.error("올바른 이메일 형식을 입력해주세요")
      return
    }

    if (emailData.newEmail === profile.email) {
      toast.error("새 이메일 주소가 현재 이메일과 동일합니다")
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()

      // 현재 비밀번호 확인
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: emailData.password,
      })

      if (signInError) {
        toast.error("비밀번호가 올바르지 않습니다")
        setIsLoading(false)
        return
      }

      // 이메일 변경 (이메일 확인 필요)
      const { error: updateError } = await supabase.auth.updateUser({
        email: emailData.newEmail,
      })

      if (updateError) {
        toast.error(updateError.message)
        setIsLoading(false)
        return
      }

      // 이메일 변경 알림 전송
      try {
        await fetch("/api/auth/notify-email-change", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            newEmail: emailData.newEmail,
            oldEmail: profile.email,
          }),
        })
      } catch (error) {
        console.error("Failed to send email change notification:", error)
      }

      toast.success(
        "이메일 변경 요청이 완료되었습니다. 새 이메일 주소로 확인 메일이 전송되었습니다."
      )
      setEmailData({
        newEmail: "",
        password: "",
      })
      setShowEmailChange(false)

      // 사용자 정보 새로고침
      const {
        data: { user: updatedUser },
      } = await supabase.auth.getUser()
      if (updatedUser) {
        setProfile({
          ...profile,
          email: updatedUser.email || profile.email,
        })
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "이메일 변경에 실패했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  return {
    emailData,
    setEmailData,
    isLoading,
    showEmailChange,
    setShowEmailChange,
    handleEmailChange,
  }
}

