import { describe, it, expect, beforeEach, vi } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { usePushNotifications } from "@/hooks/use-push-notifications"

// Mock service worker and push manager
const mockPushManager = {
  getSubscription: vi.fn(),
  subscribe: vi.fn(),
}

const mockServiceWorker = {
  ready: Promise.resolve({
    pushManager: mockPushManager,
  }),
}

const mockNotification = {
  requestPermission: vi.fn(),
}

Object.defineProperty(global, "navigator", {
  value: {
    serviceWorker: mockServiceWorker,
  },
  writable: true,
})

Object.defineProperty(global, "Notification", {
  value: mockNotification,
  writable: true,
})

Object.defineProperty(global, "window", {
  value: {
    atob: vi.fn((str: string) => str),
  },
  writable: true,
})

describe("usePushNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNotification.requestPermission.mockResolvedValue("granted")
  })

  it("should detect push notification support", async () => {
    const { result } = renderHook(() => usePushNotifications())

    expect(result.current.isSupported).toBe(true)
  })

  it("should request permission successfully", async () => {
    const { result } = renderHook(() => usePushNotifications())

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

    mockPushManager.getSubscription = vi.fn().mockResolvedValue(null)
    mockPushManager.subscribe = vi.fn().mockResolvedValue(mockSubscription)

    const { result } = renderHook(() => usePushNotifications())

    await act(async () => {
      const success = await result.current.subscribe()
      expect(success).toBe(true)
    })
  })
})
