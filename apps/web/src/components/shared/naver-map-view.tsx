"use client"

import * as React from "react"
import { useMemo } from "react"
import {
  NavermapsProvider,
  Container,
  NaverMap,
  Marker,
  Polyline,
  useNavermaps,
} from "react-naver-maps"

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
  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID
  const center = useMemo(() => {
    if (places.length > 0) {
      return { lat: places[0].lat, lng: places[0].lng }
    }
    return { lat: 37.5665, lng: 126.978 }
  }, [places])

  if (!clientId) {
    return (
      <div className="w-full h-[70vh] rounded-2xl bg-muted flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">지도 로딩 오류</p>
          <p className="text-sm text-red-500">Naver Map Client ID가 설정되지 않았습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden" data-testid="naver-map">
      <NavermapsProvider ncpKeyId={clientId} submodules={["geocoder"]}>
        <Container style={{ width: "100%", height: "100%" }}>
          <MapContent center={center} places={places} path={path} onPlaceClick={onPlaceClick} />
        </Container>
      </NavermapsProvider>
    </div>
  )
}

function MapContent({
  center,
  places,
  path,
  onPlaceClick,
}: {
  center: { lat: number; lng: number }
  places: Place[]
  path: { lat: number; lng: number }[]
  onPlaceClick?: (place: Place) => void
}) {
  const navermaps = useNavermaps()
  const mapRef = React.useRef<{
    fitBounds?: (bounds: unknown, options?: { padding?: number }) => void
  } | null>(null)
  const [zoomLevel, setZoomLevel] = React.useState<number>(11)

  // 마커 번호를 표시할 최소 줌 레벨 (14 이상일 때만 표시)
  const MIN_ZOOM_FOR_NUMBERS = 14

  // 전역 클릭 핸들러 설정 (Hook은 항상 같은 순서로 호출되어야 함)
  React.useEffect(() => {
    if (!navermaps) return
    ;(window as Window & { naverMarkerClick?: (id: string) => void }).naverMarkerClick = (
      id: string
    ) => {
      const clickedPlace = places.find(p => p.id === id)
      if (clickedPlace) {
        onPlaceClick?.(clickedPlace)
      }
    }

    return () => {
      delete (window as Window & { naverMarkerClick?: (id: string) => void }).naverMarkerClick
    }
  }, [navermaps, places, onPlaceClick])

  // 지도 범위 자동 조정 (지도가 로드된 후)
  React.useEffect(() => {
    if (!navermaps || places.length === 0) return

    // 지도가 완전히 로드될 때까지 약간의 지연 후 bounds 조정
    const timer = setTimeout(() => {
      try {
        // react-naver-maps에서 지도 인스턴스 접근 시도
        if (mapRef.current) {
          const bounds = new navermaps.LatLngBounds()
          places.forEach(place => {
            bounds.extend(new navermaps.LatLng(place.lat, place.lng))
          })

          if (typeof mapRef.current.fitBounds === "function") {
            mapRef.current.fitBounds(bounds, { padding: 50 })
          }
        } else if (
          typeof window !== "undefined" &&
          (
            window as Window & {
              naver?: {
                maps?: {
                  getMapInstance?: () => {
                    fitBounds?: (bounds: unknown, options?: { padding?: number }) => void
                  }
                }
              }
            }
          ).naver?.maps
        ) {
          // 전역 naver 객체를 통한 접근 시도
          const mapElements = document.querySelectorAll("[data-naver-map]")
          if (mapElements.length > 0) {
            const bounds = new navermaps.LatLngBounds()
            places.forEach(place => {
              bounds.extend(new navermaps.LatLng(place.lat, place.lng))
            })
            // 지도 인스턴스를 찾아서 fitBounds 호출
            const mapInstance = (
              window as Window & {
                naver?: {
                  maps?: {
                    getMapInstance?: () => {
                      fitBounds?: (bounds: unknown, options?: { padding?: number }) => void
                    }
                  }
                }
              }
            ).naver?.maps?.getMapInstance?.()
            if (mapInstance && typeof mapInstance.fitBounds === "function") {
              mapInstance.fitBounds(bounds, { padding: 50 })
            }
          }
        }
      } catch (error) {
        // bounds 조정 실패해도 지도는 정상 작동
        console.warn("Failed to adjust map bounds:", error)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [navermaps, places])

  // 지도 줌 레벨 변경 감지
  React.useEffect(() => {
    if (!navermaps) return

    type MapInstance = {
      getZoom?: () => number
      addListener?: (event: string, handler: () => void) => (() => void) | void
      removeListener?: (listener: (() => void) | void) => void
    }

    let mapInstance: MapInstance | null = null
    let zoomListener: (() => void) | void | null = null

    const setupZoomListener = () => {
      try {
        // 지도 인스턴스 찾기
        const mapElements = document.querySelectorAll("[data-naver-map]")
        if (mapElements.length > 0 && typeof window !== "undefined") {
          // 전역 naver 객체를 통한 접근
          const naverWindow = window as Window & {
            naver?: {
              maps?: {
                getMapInstance?: () => MapInstance
              }
            }
          }

          mapInstance = naverWindow.naver?.maps?.getMapInstance?.() || null

          if (mapInstance) {
            // 초기 줌 레벨 설정
            if (typeof mapInstance.getZoom === "function") {
              const currentZoom = mapInstance.getZoom()
              setZoomLevel(currentZoom)
            }

            // 줌 변경 이벤트 리스너 등록
            if (typeof mapInstance.addListener === "function") {
              zoomListener = mapInstance.addListener("zoom_changed", () => {
                if (mapInstance && typeof mapInstance.getZoom === "function") {
                  const zoom = mapInstance.getZoom()
                  setZoomLevel(zoom)
                }
              })
            }
          }
        }
      } catch (error) {
        console.warn("Failed to setup zoom listener:", error)
      }
    }

    // 지도가 로드될 때까지 대기
    const timer = setTimeout(setupZoomListener, 1000)

    return () => {
      clearTimeout(timer)
      // 이벤트 리스너 제거
      if (mapInstance && zoomListener && typeof mapInstance.removeListener === "function") {
        try {
          mapInstance.removeListener(zoomListener)
        } catch {
          // 무시
        }
      }
    }
  }, [navermaps])

  const showNumbers = zoomLevel >= MIN_ZOOM_FOR_NUMBERS

  return (
    <NaverMap
      ref={mapRef}
      defaultCenter={center}
      defaultZoom={11}
      mapTypeControl={false}
      logoControl={true}
      scaleControl={true}
      zoomControl={true}
    >
      {places.map((place, index) => {
        // 커스텀 마커를 위한 HTML 오버레이
        // 줌 레벨에 따라 번호 표시 여부 결정
        const markerContent = `
          <div style="
            position: relative;
            width: ${showNumbers ? "44px" : "32px"};
            height: ${showNumbers ? "44px" : "32px"};
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: ${showNumbers ? "18px" : "0px"};
            color: white;
            cursor: pointer;
            transition: all 0.2s;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            opacity: ${showNumbers ? "1" : "0.8"};
          " 
          onmouseover="this.style.transform='scale(1.15)'; this.style.boxShadow='0 6px 16px rgba(0,0,0,0.35)'" 
          onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.25)'"
          onclick="window.naverMarkerClick && window.naverMarkerClick('${place.id}')">
            ${showNumbers ? index + 1 : ""}
          </div>
        `

        return (
          <Marker
            key={`${place.id}-${showNumbers ? "with-number" : "no-number"}`}
            position={{ lat: place.lat, lng: place.lng }}
            title={`${index + 1}. ${place.name}`}
            onClick={() => onPlaceClick?.(place)}
            icon={{
              content: markerContent,
              anchor: new navermaps.Point(showNumbers ? 22 : 16, showNumbers ? 22 : 16),
            }}
            zIndex={1000 + index}
          />
        )
      })}

      {path.length > 1 ? (
        <Polyline
          path={path.map(p => ({ lat: p.lat, lng: p.lng }))}
          strokeColor="#667eea"
          strokeOpacity={0.6}
          strokeStyle="solid"
          strokeWeight={3}
          zIndex={500}
        />
      ) : null}
    </NaverMap>
  )
}
