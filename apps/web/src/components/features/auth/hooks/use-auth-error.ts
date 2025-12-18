"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

export function useAuthError() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const error = searchParams.get("error")
    if (error) {
      toast.error(decodeURIComponent(error))
      // 에러 메시지를 표시한 후 URL에서 제거
      router.replace("/login")
    }
  }, [searchParams, router])
}

