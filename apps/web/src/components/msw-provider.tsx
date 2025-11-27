"use client"

import { useEffect, useState } from "react"

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(false)

  useEffect(() => {
    // 개발 환경에서만 MSW 활성화
    if (process.env.NODE_ENV === "development") {
      async function initMSW() {
        const { worker } = await import("@/mocks/browser")
        await worker.start({
          onUnhandledRequest: "bypass", // 처리되지 않은 요청은 실제 서버로 전달
        })
        setMswReady(true)
      }
      initMSW()
    } else {
      setMswReady(true)
    }
  }, [])

  // MSW가 준비될 때까지 로딩 표시 (개발 환경에서만)
  if (!mswReady && process.env.NODE_ENV === "development") {
    return null // 또는 로딩 스피너
  }

  return <>{children}</>
}


