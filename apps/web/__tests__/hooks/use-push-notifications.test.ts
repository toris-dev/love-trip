import { describe, it, expect, beforeEach, vi } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { usePushNotifications } from "@/hooks/use-push-notifications"

// Mock @supabase/ssr
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(() =>
      Promise.resolve({
        data: { user: { id: "user-1" } },
      })
    ),
  },
  from: vi.fn(() => ({
    upsert: vi.fn(() =>
      Promise.resolve({
        data: null,
        error: null,
      })
    ),
    delete: vi.fn(() => ({
      eq: vi.fn(() =>
        Promise.resolve({
          data: null,
          error: null,
        })
      ),
    })),
  })),
}

vi.mock("@supabase/ssr", () => ({
  createBrowserClient: vi.fn(() => mockSupabaseClient),
}))

// Mock service worker and push manager
const mockPushManager = {
  getSubscription: vi.fn(),
  subscribe: vi.fn(),
}

const mockServiceWorkerRegistration = {
  pushManager: mockPushManager,
  getRegistration: vi.fn(),
}

const mockServiceWorker = {
  ready: Promise.resolve(mockServiceWorkerRegistration),
  register: vi.fn(() => Promise.resolve(mockServiceWorkerRegistration)),
  getRegistration: vi.fn(() => Promise.resolve(mockServiceWorkerRegistration)),
}

const mockNotification = {
  requestPermission: vi.fn(),
  permission: "default" as NotificationPermission,
}

// Mock PushManager class
class MockPushManager {
  static supportedContentEncodings: string[] = []
  getSubscription = mockPushManager.getSubscription
  subscribe = mockPushManager.subscribe
}

// Mock navigator with serviceWorker
Object.defineProperty(global, "navigator", {
  value: {
    serviceWorker: mockServiceWorker,
  },
  writable: true,
  configurable: true,
})

// Mock window with PushManager and atob
// atob는 base64 디코딩을 수행해야 함
const mockAtob = vi.fn((str: string) => {
  // base64 디코딩 mock
  // urlBase64ToUint8Array는 base64 문자열을 Uint8Array로 변환
  // 실제로는 복잡하지만, 테스트에서는 간단하게 처리
  // VAPID public key는 base64 URL-safe 인코딩된 문자열
  // 테스트에서는 실제 디코딩 대신 적절한 길이의 문자열 반환
  // Uint8Array 생성 시 사용될 바이너리 문자열 반환
  const padding = "=".repeat((4 - (str.length % 4)) % 4)
  const base64 = (str + padding).replace(/-/g, "+").replace(/_/g, "/")
  // base64 디코딩 시 대략 3/4 길이의 바이너리 문자열이 됨
  // 최소 1바이트는 반환해야 함
  const decodedLength = Math.max(1, Math.floor(base64.length * 0.75))
  // 바이너리 문자열 시뮬레이션 (실제로는 base64 디코딩 결과)
  // 빈 배열이면 에러가 발생하므로 최소 1바이트는 반환
  if (decodedLength === 0) {
    return String.fromCharCode(0)
  }
  return String.fromCharCode(
    ...Array(decodedLength)
      .fill(0)
      .map((_, i) => i % 256)
  )
})

Object.defineProperty(global, "window", {
  value: {
    ...global.window,
    PushManager: MockPushManager,
    atob: mockAtob,
  },
  writable: true,
  configurable: true,
})

// Mock Notification
Object.defineProperty(global, "Notification", {
  value: mockNotification,
  writable: true,
  configurable: true,
})

// 환경 변수는 vi.stubEnv으로 이미 설정됨

describe("usePushNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNotification.requestPermission.mockResolvedValue("granted")
    mockNotification.permission = "granted"
    mockPushManager.getSubscription.mockResolvedValue(null)
    mockPushManager.subscribe.mockResolvedValue({
      toJSON: () => ({
        endpoint: "test-endpoint",
        keys: {
          p256dh: "test-p256dh",
          auth: "test-auth",
        },
      }),
    })
    mockServiceWorker.getRegistration.mockResolvedValue(mockServiceWorkerRegistration)
  })

  it("should detect push notification support", async () => {
    const { result } = renderHook(() => usePushNotifications())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    expect(result.current.isSupported).toBe(true)
  })

  it("should request permission successfully", async () => {
    const { result } = renderHook(() => usePushNotifications())

    // 초기 로딩 완료 대기
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    await act(async () => {
      const permission = await result.current.requestPermission()
      expect(permission).toBe("granted")
    })
  })

  it("should handle subscription process", async () => {
    const mockSubscription = {
      toJSON: () => ({
        endpoint: "test-endpoint",
        keys: {
          p256dh: "test-p256dh",
          auth: "test-auth",
        },
      }),
    }

    // Setup mocks - 모든 비동기 작업이 Promise를 반환하도록
    mockPushManager.getSubscription.mockResolvedValue(null)
    mockPushManager.subscribe.mockResolvedValue(mockSubscription)
    mockServiceWorker.getRegistration.mockResolvedValue(mockServiceWorkerRegistration)

    // supabase mock도 Promise를 반환하도록 설정
    // beforeEach에서 이미 설정했지만, 여기서 다시 설정하여 확실히 함
    const mockUpsert = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    })
    const mockFrom = vi.fn(() => ({
      upsert: mockUpsert,
    }))
    mockSupabaseClient.from = mockFrom as any
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
    })

    // subscribe 호출 전에 mock 초기화
    mockUpsert.mockClear()
    mockSupabaseClient.auth.getUser.mockClear()

    const { result } = renderHook(() => usePushNotifications())

    // Wait for initial load and support check
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 300))
    })

    // Ensure isSupported is true and permission is granted
    expect(result.current.isSupported).toBe(true)
    expect(result.current.permission).toBe("granted")

    // Now try to subscribe
    await act(async () => {
      // VAPID key 확인 - hook에서 사용하는 변수명 확인
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      expect(vapidKey).toBeDefined()
      expect(vapidKey).toBeTruthy()

      // subscribe 호출 전에 모든 mock이 준비되었는지 확인
      expect(mockPushManager.subscribe).toBeDefined()
      expect(mockSupabaseClient.auth.getUser).toBeDefined()

      const success = await result.current.subscribe()

      // VAPID key가 설정되어 있으면 subscribe가 호출되어야 함
      // 하지만 VAPID key가 없으면 early return하므로 호출되지 않을 수 있음
      if (vapidKey) {
        // 실제 동작 확인: subscribe가 호출되었는지
        expect(mockPushManager.subscribe).toHaveBeenCalled()

        // user가 있으면 getUser와 upsert가 호출되어야 함
        expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled()
        expect(mockFrom).toHaveBeenCalledWith("push_subscriptions")
        expect(mockUpsert).toHaveBeenCalled()

        // 모든 mock이 성공적으로 호출되었으므로 subscribe는 true를 반환해야 함
        // atob mock이 호출되었는지 확인
        expect(mockAtob).toHaveBeenCalled()
        expect(success).toBe(true)
      } else {
        // VAPID key가 없으면 false를 반환
        expect(success).toBe(false)
      }
    })
  })
})
