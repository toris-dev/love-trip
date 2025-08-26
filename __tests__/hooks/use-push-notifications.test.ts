import { renderHook, act } from "@testing-library/react"
import { usePushNotifications } from "@/hooks/use-push-notifications"
import jest from "jest" // Declare jest variable

// Mock service worker and push manager
const mockServiceWorker = {
  ready: Promise.resolve({
    pushManager: {
      getSubscription: jest.fn(),
      subscribe: jest.fn(),
    },
  }),
}

const mockNotification = {
  requestPermission: jest.fn(),
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
    atob: jest.fn((str) => str),
  },
  writable: true,
})

describe("usePushNotifications", () => {
  beforeEach(() => {
    jest.clearAllMocks()
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

    mockServiceWorker.ready = Promise.resolve({
      pushManager: {
        getSubscription: jest.fn().mockResolvedValue(null),
        subscribe: jest.fn().mockResolvedValue(mockSubscription),
      },
    })

    const { result } = renderHook(() => usePushNotifications())

    await act(async () => {
      const success = await result.current.subscribe()
      expect(success).toBe(true)
    })
  })
})
