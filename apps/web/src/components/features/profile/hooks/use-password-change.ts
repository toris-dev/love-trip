"use client"

import { useState } from "react"
import { createClient } from "@lovetrip/api/supabase/client"
import { toast } from "sonner"
import type { PasswordData } from "../types"

export function usePasswordChange(profileEmail: string) {
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswordChange, setShowPasswordChange] = useState(false)

  const handlePasswordChange = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("모든 필드를 입력해주세요")
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("새 비밀번호가 일치하지 않습니다")
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("비밀번호는 최소 6자 이상이어야 합니다")
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()

      // 현재 비밀번호 확인
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profileEmail,
        password: passwordData.currentPassword,
      })

      if (signInError) {
        toast.error("현재 비밀번호가 올바르지 않습니다")
        setIsLoading(false)
        return
      }

      // 비밀번호 변경
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })

      if (updateError) {
        toast.error(updateError.message)
        setIsLoading(false)
        return
      }

      // 비밀번호 변경 알림 전송
      try {
        await fetch("/api/auth/notify-password-change", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      } catch (error) {
        console.error("Failed to send password change notification:", error)
      }

      toast.success("비밀번호가 변경되었습니다. 이메일로 알림이 전송되었습니다.")
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setShowPasswordChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "비밀번호 변경에 실패했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  return {
    passwordData,
    setPasswordData,
    isLoading,
    showPasswordChange,
    setShowPasswordChange,
    handlePasswordChange,
  }
}

