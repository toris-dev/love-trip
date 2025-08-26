"use client"

import { useEffect, useRef, useState } from "react"

declare global {
  interface Window {
    naver: any
  }
}

type Place = {
  id: string
  name: string
  lat: number
  lng: number
  type: "CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC"
  rating: number
  priceLevel: number
  description: string
  image: string
}

interface NaverMapViewProps {
  places?: Place[]
  path?: { lat: number; lng: number }[]
  onPlaceClick?: (place: Place) => void
}

export default function NaverMapView({ places = [], path = [], onPlaceClick }: NaverMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapObj = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const polylineRef = useRef<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log("[v0] NaverMapView: Initializing map with places:", places.length)

    const CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID
    if (!CLIENT_ID) {
      setError("Naver Map Client ID가 설정되지 않았습니다.")
      setIsLoading(false)
      return
    }

    const scriptId = "naver-map-sdk"
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script")
      script.id = scriptId
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${CLIENT_ID}`
      script.async = true
      script.defer = true
      script.onload = initMap
      script.onerror = () => {
        setError("Naver Map SDK 로딩에 실패했습니다.")
        setIsLoading(false)
      }
      document.head.appendChild(script)
    } else {
      initMap()
    }

    function initMap() {
      console.log("[v0] NaverMapView: SDK loaded, creating map")
      if (!mapRef.current || !window.naver) {
        setError("지도를 초기화할 수 없습니다.")
        setIsLoading(false)
        return
      }

      try {
        mapObj.current = new window.naver.maps.Map(mapRef.current, {
          center: new window.naver.maps.LatLng(37.5665, 126.978),
          zoom: 11,
          zoomControl: true,
          mapDataControl: false,
          scaleControl: true,
          logoControl: true,
          mapTypeControl: false,
        })

        console.log("[v0] NaverMapView: Map created successfully")
        setIsLoading(false)
        renderOverlays()
      } catch (err) {
        console.error("[v0] NaverMapView: Error creating map:", err)
        setError("지도 생성 중 오류가 발생했습니다.")
        setIsLoading(false)
      }
    }

    return () => {
      console.log("[v0] NaverMapView: Cleaning up map")
      markersRef.current.forEach((marker) => {
        if (marker && marker.setMap) marker.setMap(null)
      })
      if (polylineRef.current && polylineRef.current.setMap) {
        polylineRef.current.setMap(null)
      }
      markersRef.current = []
      polylineRef.current = null
    }
  }, [])

  useEffect(() => {
    if (mapObj.current && !isLoading) {
      console.log("[v0] NaverMapView: Updating overlays")
      renderOverlays()
    }
  }, [places, path, isLoading])

  function renderOverlays() {
    if (!window.naver || !mapObj.current) return

    const naver = window.naver
    console.log("[v0] NaverMapView: Rendering overlays for", places.length, "places")

    markersRef.current.forEach((marker) => {
      try {
        if (marker && marker.setMap) marker.setMap(null)
      } catch (err) {
        console.error("[v0] NaverMapView: Error removing marker:", err)
      }
    })
    markersRef.current = []

    markersRef.current = places
      .map((place, index) => {
        try {
          const marker = new naver.maps.Marker({
            position: new naver.maps.LatLng(place.lat, place.lng),
            map: mapObj.current,
            title: place.name,
            icon: {
              content: `<div style="
              background: #10b981; 
              color: white; 
              padding: 4px 8px; 
              border-radius: 12px; 
              font-size: 12px; 
              font-weight: bold;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              border: 2px solid white;
            ">${index + 1}</div>`,
              anchor: new naver.maps.Point(15, 15),
            },
          })

          const infoContent = `
          <div style="padding: 12px; max-width: 200px; font-family: system-ui;">
            <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${place.name}</h4>
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">${place.description}</p>
            <div style="display: flex; align-items: center; gap: 8px; font-size: 12px;">
              <span style="color: #f59e0b;">★ ${place.rating}</span>
              <span style="color: #10b981;">${"$".repeat(place.priceLevel || 1)}</span>
            </div>
          </div>
        `

          const infoWindow = new naver.maps.InfoWindow({
            content: infoContent,
            backgroundColor: "white",
            borderColor: "#e5e7eb",
            borderWidth: 1,
            anchorSize: new naver.maps.Size(10, 10),
          })

          naver.maps.Event.addListener(marker, "click", () => {
            console.log("[v0] NaverMapView: Place clicked:", place.name)
            infoWindow.open(mapObj.current, marker)
            if (onPlaceClick) {
              onPlaceClick(place)
            }
          })

          return marker
        } catch (err) {
          console.error("[v0] NaverMapView: Error creating marker for", place.name, err)
          return null
        }
      })
      .filter(Boolean)

    if (polylineRef.current && polylineRef.current.setMap) {
      polylineRef.current.setMap(null)
      polylineRef.current = null
    }

    if (path.length > 1) {
      try {
        polylineRef.current = new naver.maps.Polyline({
          map: mapObj.current,
          path: path.map((pt) => new naver.maps.LatLng(pt.lat, pt.lng)),
          strokeWeight: 4,
          strokeOpacity: 0.8,
          strokeColor: "#10b981",
          strokeStyle: "solid",
        })

        const bounds = new naver.maps.LatLngBounds()
        path.forEach((pt) => bounds.extend(new naver.maps.LatLng(pt.lat, pt.lng)))
        places.forEach((place) => bounds.extend(new naver.maps.LatLng(place.lat, place.lng)))

        mapObj.current.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 })
        console.log("[v0] NaverMapView: Map bounds fitted to show all content")
      } catch (err) {
        console.error("[v0] NaverMapView: Error creating polyline:", err)
      }
    }
  }

  if (error) {
    return (
      <div className="w-full h-[70vh] rounded-2xl bg-muted flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">지도 로딩 오류</p>
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-[70vh] rounded-2xl overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">지도를 불러오는 중...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  )
}
