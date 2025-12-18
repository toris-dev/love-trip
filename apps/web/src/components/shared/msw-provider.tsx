"use client"

import { useEffect, useState } from "react"

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(false)

  useEffect(() => {
    // .env 변수로 MSW 활성화 여부 확인
    // NEXT_PUBLIC_ENABLE_MSW 환경 변수 값 확인
    const mswEnvValue = process.env.NEXT_PUBLIC_ENABLE_MSW

    // 디버깅을 위한 로그
    console.log("[MSW] 환경 변수 확인:", {
      NEXT_PUBLIC_ENABLE_MSW: mswEnvValue,
      typeof: typeof mswEnvValue,
    })

    // MSW 활성화 여부 결정:
    // NEXT_PUBLIC_ENABLE_MSW가 명시적으로 "true"일 때만 활성화
    const enableMSW = mswEnvValue === "true"

    console.log("[MSW] MSW 활성화 여부:", enableMSW)

    async function handleMSW() {
      if (enableMSW) {
        try {
          const { worker } = await import("@/mocks/browser")
          await worker.start({
            onUnhandledRequest: "bypass", // 처리되지 않은 요청은 실제 서버로 전달
            serviceWorker: {
              url: "/mockServiceWorker.js",
            },
          })
          console.log("[MSW] ✅ Mock Service Worker가 활성화되었습니다.")
          setMswReady(true)
        } catch (error) {
          console.error("[MSW] ❌ 초기화 실패:", error)
          setMswReady(true) // 에러가 나도 앱은 계속 실행
        }
      } else {
        // MSW 비활성화 시 기존 Service Worker 해제
        try {
          if ("serviceWorker" in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations()
            for (const registration of registrations) {
              // mockServiceWorker.js만 해제
              if (registration.scope.includes("/mockServiceWorker")) {
                await registration.unregister()
                console.log("[MSW] 🛑 기존 Mock Service Worker를 해제했습니다.")
              }
            }
          }
        } catch (error) {
          console.warn("[MSW] Service Worker 해제 중 오류:", error)
        }
        console.log("[MSW] ⏸️ Mock Service Worker가 비활성화되어 있습니다. (실제 API 사용)")
        setMswReady(true)
      }
    }

    handleMSW()
  }, [])

  // MSW가 준비될 때까지 로딩 표시
  if (!mswReady) {
    return null // 또는 로딩 스피너
  }

  return <>{children}</>
}
