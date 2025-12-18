"use client"

import { useState } from "react"
import { createClient } from "@lovetrip/api/supabase/client"
import { toast } from "sonner"

export function useOAuth() {
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        toast.error(error.message)
        setIsLoading(false)
      }
      // OAuth는 리다이렉트되므로 여기서는 로딩 상태를 유지
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "오류가 발생했습니다")
      setIsLoading(false)
    }
  }

  const handleKakaoSignIn = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "kakao",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        toast.error(error.message)
        setIsLoading(false)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "오류가 발생했습니다")
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    handleGoogleSignIn,
    handleKakaoSignIn,
  }
}

