const CACHE_NAME = "lovetrip-v1"
const urlsToCache = ["/", "/manifest.json", "/icon-192.png", "/icon-512.png"]

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)))
})

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url)
  
  // CSS 파일과 개발 환경의 정적 파일은 캐싱하지 않음 (Brave 브라우저 호환)
  const isCSS = url.pathname.endsWith('.css')
  const isDevStatic = url.pathname.includes('/_next/static/')
  const isDevMode = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
  
  if (isCSS || (isDevMode && isDevStatic)) {
    // CSS 파일과 개발 환경 정적 파일은 네트워크에서 직접 가져옴
    event.respondWith(fetch(event.request))
    return
  }
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response
      }
      return fetch(event.request)
    }),
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})

self.addEventListener("push", (event) => {
  console.log("[Service Worker] Push event received:", event)

  let notificationData = {
    title: "LOVETRIP",
    body: "새로운 알림이 있습니다.",
    icon: "/icon-192.png",
    badge: "/icon-96.png",
    tag: "lovetrip-notification",
    data: {
      url: "/",
    },
  }

  if (event.data) {
    try {
      const data = event.data.json()
      notificationData = { ...notificationData, ...data }
    } catch (e) {
      console.error("[Service Worker] Error parsing push data:", e)
    }
  }

  const promiseChain = self.registration.showNotification(notificationData.title, {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    data: notificationData.data,
    actions: [
      {
        action: "open",
        title: "열기",
      },
      {
        action: "close",
        title: "닫기",
      },
    ],
  })

  event.waitUntil(promiseChain)
})

self.addEventListener("notificationclick", (event) => {
  console.log("[Service Worker] Notification click received:", event)

  event.notification.close()

  if (event.action === "close") {
    return
  }

  const urlToOpen = event.notification.data?.url || "/"

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // Check if there's already a window/tab open with the target URL
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i]
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus()
          }
        }

        // If not, open a new window/tab
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      }),
  )
})

