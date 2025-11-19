"use client"

export function registerServiceWorker() {
  if (typeof window === "undefined") return

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
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
        .catch((error) => {
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

