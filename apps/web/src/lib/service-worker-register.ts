"use client"

export function registerServiceWorker() {
  if (typeof window === "undefined") return

  // 개발 환경에서는 Service Worker를 등록하지 않음
  const isDevelopment =
    process.env.NODE_ENV === "development" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"

  if (isDevelopment) {
    // 개발 환경에서는 기존 Service Worker 해제
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.unregister()
          console.log("[Service Worker] Development mode: Service Worker unregistered")
        })
      })
    }
    return
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then(registration => {
          console.log("[Service Worker] Registration successful:", registration.scope)

          // 서비스 워커 업데이트 확인
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  console.log("[Service Worker] New service worker available")
                }
              })
            }
          })
        })
        .catch(error => {
          console.error("[Service Worker] Registration failed:", error)
        })
    })

    // 서비스 워커 업데이트 확인
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      console.log("[Service Worker] Controller changed")
      window.location.reload()
    })
  }
}
