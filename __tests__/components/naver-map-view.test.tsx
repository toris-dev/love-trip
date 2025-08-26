import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import NaverMapView from "@/components/naver-map-view"

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
} as any

// Mock script loading
Object.defineProperty(document, "createElement", {
  value: vi.fn((tagName) => {
    if (tagName === "script") {
      const script = {
        src: "",
        onload: null,
        onerror: null,
      }
      // Simulate successful script loading
      setTimeout(() => {
        if (script.onload) script.onload({} as Event)
      }, 100)
      return script
    }
    return document.createElement(tagName)
  }),
})

const mockPlaces = [
  {
    id: "1",
    name: "서울타워",
    latitude: 37.5512,
    longitude: 126.9882,
    category: "attraction",
    rating: 4.5,
    description: "서울의 랜드마크",
  },
  {
    id: "2",
    name: "명동",
    latitude: 37.5636,
    longitude: 126.9834,
    category: "shopping",
    rating: 4.2,
    description: "쇼핑의 메카",
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

  it("should show loading state initially", () => {
    render(<NaverMapView places={mockPlaces} />)
    expect(screen.getByText("지도를 불러오는 중...")).toBeInTheDocument()
  })

  it("should initialize map after script loads", async () => {
    render(<NaverMapView places={mockPlaces} />)

    await waitFor(
      () => {
        expect(global.naver.maps.Map).toHaveBeenCalled()
      },
      { timeout: 2000 },
    )
  })

  it("should create markers for places", async () => {
    render(<NaverMapView places={mockPlaces} />)

    await waitFor(
      () => {
        expect(global.naver.maps.Marker).toHaveBeenCalledTimes(mockPlaces.length)
      },
      { timeout: 2000 },
    )
  })

  it("should handle place selection", async () => {
    const onPlaceSelect = vi.fn()
    render(<NaverMapView places={mockPlaces} onPlaceSelect={onPlaceSelect} />)

    await waitFor(() => {
      expect(global.naver.maps.Map).toHaveBeenCalled()
    })

    // Simulate marker click
    const markerClickHandler = mockMarker.addListener.mock.calls.find((call) => call[0] === "click")?.[1]

    if (markerClickHandler) {
      markerClickHandler()
      expect(onPlaceSelect).toHaveBeenCalled()
    }
  })

  it("should handle map center change", async () => {
    const onCenterChange = vi.fn()
    render(<NaverMapView places={mockPlaces} onCenterChange={onCenterChange} />)

    await waitFor(() => {
      expect(global.naver.maps.Map).toHaveBeenCalled()
    })

    // Simulate map center change
    const centerChangeHandler = mockMap.addListener.mock.calls.find((call) => call[0] === "center_changed")?.[1]

    if (centerChangeHandler) {
      centerChangeHandler()
      expect(onCenterChange).toHaveBeenCalled()
    }
  })
})
