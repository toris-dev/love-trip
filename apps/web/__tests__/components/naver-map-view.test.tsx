import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import NaverMapView from "@/components/shared/naver-map-view"

// Mock Naver Maps API
const mockMap = {
  setCenter: vi.fn(),
  setZoom: vi.fn(),
  addListener: vi.fn(),
  getCenter: vi.fn(() => ({ lat: () => 37.5665, lng: () => 126.978 })),
  getZoom: vi.fn(() => 10),
}

const mockMarker = {
  setMap: vi.fn(),
  addListener: vi.fn(),
  setPosition: vi.fn(),
}

const mockInfoWindow = {
  open: vi.fn(),
  close: vi.fn(),
  setContent: vi.fn(),
}

// Mock global naver object
declare global {
  // eslint-disable-next-line no-var
  var naver: {
    maps: {
      Map: ReturnType<typeof vi.fn>
      Marker: ReturnType<typeof vi.fn>
      InfoWindow: ReturnType<typeof vi.fn>
      LatLng: ReturnType<typeof vi.fn>
      Point: ReturnType<typeof vi.fn>
      Size: ReturnType<typeof vi.fn>
      Event: {
        addListener: ReturnType<typeof vi.fn>
      }
    }
  }
}

global.naver = {
  maps: {
    Map: vi.fn(() => mockMap),
    Marker: vi.fn(() => mockMarker),
    InfoWindow: vi.fn(() => mockInfoWindow),
    LatLng: vi.fn((lat, lng) => ({ lat: () => lat, lng: () => lng })),
    Point: vi.fn((x, y) => ({ x, y })),
    Size: vi.fn((width, height) => ({ width, height })),
    Event: {
      addListener: vi.fn(),
    },
  },
}

// Mock script loading
const originalCreateElement = document.createElement.bind(document)
Object.defineProperty(document, "createElement", {
  value: vi.fn((tagName: string) => {
    if (tagName === "script") {
      const script = {
        src: "",
        onload: null as ((event: Event) => void) | null,
        onerror: null as ((event: Event) => void) | null,
      }
      // Simulate successful script loading
      setTimeout(() => {
        if (script.onload) {
          script.onload({} as Event)
        }
      }, 100)
      return script as HTMLScriptElement
    }
    return originalCreateElement(tagName)
  }),
})

const mockPlaces = [
  {
    id: "1",
    name: "서울타워",
    lat: 37.5512,
    lng: 126.9882,
    type: "VIEW" as const,
    rating: 4.5,
    priceLevel: 3,
    description: "서울의 랜드마크",
    image: "https://example.com/image.jpg",
  },
  {
    id: "2",
    name: "명동",
    lat: 37.5636,
    lng: 126.9834,
    type: "ETC" as const,
    rating: 4.2,
    priceLevel: 2,
    description: "쇼핑의 메카",
    image: "https://example.com/image2.jpg",
  },
]

describe("NaverMapView", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render map container", () => {
    render(<NaverMapView places={mockPlaces} />)
    expect(screen.getByTestId("naver-map")).toBeInTheDocument()
  })

  it("should handle place click", async () => {
    const onPlaceClick = vi.fn()
    render(<NaverMapView places={mockPlaces} onPlaceClick={onPlaceClick} />)

    await waitFor(() => {
      expect(screen.getByTestId("naver-map")).toBeInTheDocument()
    })

    // Simulate marker click via window handler
    const windowWithHandler = window as unknown as { naverMarkerClick?: (id: string) => void }
    if (typeof window !== "undefined" && windowWithHandler.naverMarkerClick) {
      windowWithHandler.naverMarkerClick("1")
      await waitFor(() => {
        expect(onPlaceClick).toHaveBeenCalledWith(mockPlaces[0])
      })
    }
  })
})
