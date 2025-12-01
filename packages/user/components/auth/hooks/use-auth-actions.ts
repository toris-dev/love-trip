"use client"

import { useState } from "react"
import { createClient } from "@lovetrip/api/supabase/client"
import { toast } from "sonner"
import type { AuthFormData } from "../types"

export function useAuthActions() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignUp = async (formData: AuthFormData) => {
    if (formData.password !== formData.confirmPassword) {
      toast.error("비밀번호가 일치하지 않습니다")
      return { success: false }
    }

    if (formData.password.length < 6) {
      toast.error("비밀번호는 최소 6자 이상이어야 합니다")
      return { success: false }
    }

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        toast.error(error.message)
        setIsLoading(false)
        return { success: false }
      }

      if (data.user) {
        toast.success("회원가입이 완료되었습니다! 이메일을 확인해주세요.")
        setIsLoading(false)
        return { success: true }
      }

      setIsLoading(false)
      return { success: false }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "오류가 발생했습니다")
      setIsLoading(false)
      return { success: false }
    }
  }

  const handleSignIn = async (formData: AuthFormData) => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        toast.error(error.message)
        setIsLoading(false)
        return { success: false }
      }

      if (data.user) {
        toast.success("로그인 성공!")
        setIsLoading(false)
        return { success: true }
      }

      setIsLoading(false)
      return { success: false }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "오류가 발생했습니다")
      setIsLoading(false)
      return { success: false }
    }
  }

  return {
    isLoading,
    handleSignUp,
    handleSignIn,
  }
}

