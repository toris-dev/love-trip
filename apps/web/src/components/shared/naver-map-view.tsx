"use client"

import * as React from "react"
import { useMemo, useState, useCallback } from "react"
import {
  NavermapsProvider,
  Container,
  NaverMap,
  Marker,
  Polyline,
  useNavermaps,
} from "react-naver-maps"
import { Input } from "@lovetrip/ui/components/input"
import { Card, CardContent } from "@lovetrip/ui/components/card"
import { Search, X, Loader2, MapPin, ChevronRight } from "lucide-react"

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
  onSearchResult?: (location: { name: string; address: string; lat: number; lng: number }) => void
  showSearch?: boolean
}

export default function NaverMapView({
  places = [],
  path = [],
  onPlaceClick,
  onSearchResult,
}: NaverMapViewProps) {
  // .env.local의 18-19번째 줄 환경 변수 사용
  const clientId = process.env.NEXT_PUBLIC_NAVER_CLOUD_API_KEY_ID

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
          <p className="text-sm text-red-500 mb-2">Naver Map Client ID가 설정되지 않았습니다.</p>
          <p className="text-xs text-muted-foreground">
            .env.local 파일에 NEXT_PUBLIC_NAVER_CLOUD_API_KEY_ID를 설정해주세요.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            (개발 서버 재시작이 필요할 수 있습니다)
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden" data-testid="naver-map">
      <NavermapsProvider ncpKeyId={clientId} submodules={["geocoder"]}>
        <MapContent
          center={center}
          places={places}
          path={path}
          onPlaceClick={onPlaceClick}
          onSearchResult={onSearchResult}
        />
      </NavermapsProvider>
    </div>
  )
}

// 한국 광역자치단체 좌표 범위 정의
const REGION_BOUNDS: Record<
  string,
  {
    center: { lat: number; lng: number }
    zoom: number
    bounds?: { sw: { lat: number; lng: number }; ne: { lat: number; lng: number } }
  }
> = {
  서울: {
    center: { lat: 37.5665, lng: 126.978 },
    zoom: 10,
    bounds: { sw: { lat: 37.413, lng: 126.734 }, ne: { lat: 37.701, lng: 127.183 } },
  },
  부산: {
    center: { lat: 35.1796, lng: 129.0756 },
    zoom: 10,
    bounds: { sw: { lat: 35.052, lng: 128.899 }, ne: { lat: 35.307, lng: 129.252 } },
  },
  대구: {
    center: { lat: 35.8714, lng: 128.6014 },
    zoom: 10,
    bounds: { sw: { lat: 35.727, lng: 128.431 }, ne: { lat: 36.016, lng: 128.772 } },
  },
  인천: {
    center: { lat: 37.4563, lng: 126.7052 },
    zoom: 10,
    bounds: { sw: { lat: 37.378, lng: 126.383 }, ne: { lat: 37.535, lng: 127.027 } },
  },
  광주: {
    center: { lat: 35.1595, lng: 126.8526 },
    zoom: 11,
    bounds: { sw: { lat: 35.105, lng: 126.75 }, ne: { lat: 35.214, lng: 126.955 } },
  },
  대전: {
    center: { lat: 36.3504, lng: 127.3845 },
    zoom: 11,
    bounds: { sw: { lat: 36.224, lng: 127.251 }, ne: { lat: 36.477, lng: 127.518 } },
  },
  울산: {
    center: { lat: 35.5384, lng: 129.3114 },
    zoom: 11,
    bounds: { sw: { lat: 35.412, lng: 129.135 }, ne: { lat: 35.665, lng: 129.488 } },
  },
  세종: {
    center: { lat: 36.48, lng: 127.289 },
    zoom: 11,
    bounds: { sw: { lat: 36.353, lng: 127.156 }, ne: { lat: 36.607, lng: 127.422 } },
  },
  경기: {
    center: { lat: 37.4138, lng: 127.5183 },
    zoom: 9,
    bounds: { sw: { lat: 36.992, lng: 126.734 }, ne: { lat: 38.246, lng: 127.83 } },
  },
  강원: {
    center: { lat: 37.8228, lng: 128.1555 },
    zoom: 8,
    bounds: { sw: { lat: 37.145, lng: 127.184 }, ne: { lat: 38.612, lng: 129.127 } },
  },
  충북: {
    center: { lat: 36.8, lng: 127.7 },
    zoom: 9,
    bounds: { sw: { lat: 36.006, lng: 127.184 }, ne: { lat: 37.594, lng: 128.216 } },
  },
  충남: {
    center: { lat: 36.5184, lng: 126.8 },
    zoom: 9,
    bounds: { sw: { lat: 35.987, lng: 126.067 }, ne: { lat: 37.05, lng: 127.533 } },
  },
  전북: {
    center: { lat: 35.7175, lng: 127.153 },
    zoom: 9,
    bounds: { sw: { lat: 35.186, lng: 126.42 }, ne: { lat: 36.249, lng: 127.886 } },
  },
  전남: {
    center: { lat: 34.8679, lng: 126.991 },
    zoom: 9,
    bounds: { sw: { lat: 33.336, lng: 125.258 }, ne: { lat: 35.399, lng: 127.724 } },
  },
  경북: {
    center: { lat: 36.4919, lng: 128.8889 },
    zoom: 9,
    bounds: { sw: { lat: 35.96, lng: 128.156 }, ne: { lat: 37.023, lng: 129.622 } },
  },
  경남: {
    center: { lat: 35.4606, lng: 128.2132 },
    zoom: 9,
    bounds: { sw: { lat: 34.929, lng: 127.48 }, ne: { lat: 35.992, lng: 128.946 } },
  },
  제주: {
    center: { lat: 33.4996, lng: 126.5312 },
    zoom: 10,
    bounds: { sw: { lat: 33.179, lng: 126.163 }, ne: { lat: 33.82, lng: 126.899 } },
  },
}

// 좌표 기반 지역 판별 함수
function getRegionFromCoordinates(lat: number, lng: number): string | null {
  // 각 지역의 bounds 내에 있는지 확인
  for (const [region, config] of Object.entries(REGION_BOUNDS)) {
    if (config.bounds) {
      const { sw, ne } = config.bounds
      if (lat >= sw.lat && lat <= ne.lat && lng >= sw.lng && lng <= ne.lng) {
        return region
      }
    }
  }

  // bounds가 없거나 매칭되지 않는 경우, 가장 가까운 중심 좌표 찾기
  let minDistance = Infinity
  let closestRegion: string | null = null

  for (const [region, config] of Object.entries(REGION_BOUNDS)) {
    const distance = Math.sqrt(
      Math.pow(lat - config.center.lat, 2) + Math.pow(lng - config.center.lng, 2)
    )
    if (distance < minDistance) {
      minDistance = distance
      closestRegion = region
    }
  }

  return closestRegion
}

function MapContent({
  center,
  places,
  path,
  onPlaceClick,
  onSearchResult,
}: {
  center: { lat: number; lng: number }
  places: Place[]
  path: { lat: number; lng: number }[]
  onPlaceClick?: (place: Place) => void
  onSearchResult?: (location: { name: string; address: string; lat: number; lng: number }) => void
}) {
  const navermaps = useNavermaps()

  // navermaps가 없거나 Point 생성자가 없으면 렌더링하지 않음
  // Point는 클래스 생성자여야 함
  // useNavermaps()는 typeof naver.maps를 반환하므로 navermaps 자체가 naver.maps 타입
  const PointClass = navermaps?.Point
  if (!navermaps || typeof PointClass !== "function") {
    return null
  }

  const mapRef = React.useRef<{
    fitBounds?: (bounds: unknown, options?: { padding?: number }) => void
  } | null>(null)
  const mapInstanceRef = React.useRef<{
    panTo?: (latlng: { lat: number; lng: number }) => void
    setCenter?: (latlng: { lat: number; lng: number }) => void
    setZoom?: (zoom: number) => void
  } | null>(null)
  const [zoomLevel, setZoomLevel] = React.useState<number>(11)
  const [mapCenter, setMapCenter] = React.useState<{ lat: number; lng: number }>(center)
  const [mapZoom, setMapZoom] = React.useState<number>(11)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<
    Array<{ name: string; address: string; lat: number; lng: number }>
  >([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchedLocation, setSearchedLocation] = useState<{
    name: string
    address: string
    lat: number
    lng: number
  } | null>(null)
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null)

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
        // 전역 naver.maps 객체를 통한 접근
        if (typeof window !== "undefined") {
          const naverWindow = window as Window & {
            naver?: {
              maps?: {
                LatLngBounds?: new () => {
                  extend: (latlng: { lat: number; lng: number }) => void
                }
                LatLng?: new (lat: number, lng: number) => { lat: number; lng: number }
                getMapInstance?: () => {
                  fitBounds?: (bounds: unknown, options?: { padding?: number }) => void
                }
              }
            }
          }

          const maps = naverWindow.naver?.maps
          if (!maps || !maps.LatLngBounds || !maps.LatLng) return

          // react-naver-maps에서 지도 인스턴스 접근 시도
          if (mapRef.current) {
            const bounds = new maps.LatLngBounds()
            places.forEach(place => {
              bounds.extend(new maps.LatLng!(place.lat, place.lng))
            })

            if (typeof mapRef.current.fitBounds === "function") {
              mapRef.current.fitBounds(bounds, { padding: 50 })
            }
          } else {
            // 전역 naver 객체를 통한 접근 시도
            const mapElements = document.querySelectorAll("[data-naver-map]")
            if (mapElements.length > 0) {
              const bounds = new maps.LatLngBounds()
              places.forEach(place => {
                bounds.extend(new maps.LatLng!(place.lat, place.lng))
              })
              // 지도 인스턴스를 찾아서 fitBounds 호출
              const mapInstance = maps.getMapInstance?.()
              if (mapInstance && typeof mapInstance.fitBounds === "function") {
                mapInstance.fitBounds(bounds, { padding: 50 })
              }
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

  // 지도 인스턴스 설정 및 줌 레벨 변경 감지
  React.useEffect(() => {
    if (!navermaps) return

    type MapInstance = {
      getZoom?: () => number
      panTo?: (latlng: { lat: number; lng: number }) => void
      setCenter?: (latlng: { lat: number; lng: number }) => void
      setZoom?: (zoom: number) => void
      addListener?: (event: string, handler: (...args: unknown[]) => void) => unknown
      removeListener?: (listener: unknown) => void
    }

    let mapInstance: MapInstance | null = null
    let zoomListener: unknown = null

    const setupMapInstance = () => {
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
            // mapInstanceRef에 지도 인스턴스 저장
            mapInstanceRef.current = {
              panTo: mapInstance.panTo,
              setCenter: mapInstance.setCenter,
              setZoom: mapInstance.setZoom,
            }

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
              }) as unknown

              // 지도 클릭 이벤트 리스너 등록
              const clickListener = mapInstance.addListener("click", (...args: unknown[]) => {
                const e = args[0] as
                  | { coord?: { lat: () => number; lng: () => number } }
                  | undefined
                if (e && e.coord) {
                  const clickedLat = e.coord.lat()
                  const clickedLng = e.coord.lng()

                  // 클릭한 위치의 광역자치단체 판별
                  const region = getRegionFromCoordinates(clickedLat, clickedLng)

                  if (region && REGION_BOUNDS[region]) {
                    const regionConfig = REGION_BOUNDS[region]
                    // 해당 지역의 중심 좌표와 줌 레벨로 포커스
                    setMapCenter(regionConfig.center)
                    setMapZoom(regionConfig.zoom)
                  }
                }
              })

              // cleanup 함수에 클릭 리스너도 제거하도록 저장
              ;(mapInstance as MapInstance & { __clickListener?: unknown }).__clickListener =
                clickListener
            }
          }
        }
      } catch (error) {
        console.warn("Failed to setup map instance:", error)
      }
    }

    // 지도가 로드될 때까지 대기
    const timer = setTimeout(setupMapInstance, 1000)

    return () => {
      clearTimeout(timer)
      // 이벤트 리스너 제거
      if (mapInstance && typeof mapInstance.removeListener === "function") {
        try {
          if (zoomListener) {
            mapInstance.removeListener(zoomListener)
          }
          const clickListener = (mapInstance as MapInstance & { __clickListener?: unknown })
            .__clickListener
          if (clickListener) {
            mapInstance.removeListener(clickListener)
          }
        } catch {
          // 무시
        }
      }
    }
  }, [navermaps])

  // 검색된 위치로 지도 이동 - state를 통한 제어
  React.useEffect(() => {
    if (!searchedLocation) return

    // 지도 중심과 줌 레벨을 state로 업데이트
    setMapCenter({ lat: searchedLocation.lat, lng: searchedLocation.lng })
    setMapZoom(16)
  }, [searchedLocation?.lat, searchedLocation?.lng])

  const showNumbers = zoomLevel >= MIN_ZOOM_FOR_NUMBERS

  // 검색 기능
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/geocode?query=${encodeURIComponent(query)}`)
      const data = await response.json()

      if (response.ok && data.locations && data.locations.length > 0) {
        setSearchResults(data.locations)
        setShowSearchResults(true)
      } else {
        setSearchResults([])
        setShowSearchResults(false)
      }
    } catch (error) {
      console.error("Error searching location:", error)
      setSearchResults([])
      setShowSearchResults(false)
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)

    // 이전 타이머가 있으면 취소
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    if (value.trim().length >= 2) {
      // 디바운스: 300ms 후에 검색 실행
      debounceTimerRef.current = setTimeout(() => {
        handleSearch(value)
      }, 300)
    } else {
      // 검색어가 2자 미만이면 결과 초기화
      setSearchResults([])
      setShowSearchResults(false)
      setIsSearching(false)
    }
  }

  // 컴포넌트 언마운트 시 타이머 정리
  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  const handleSelectSearchResult = (result: {
    name: string
    address: string
    lat: number
    lng: number
  }) => {
    setSearchQuery(result.name || result.address)
    setShowSearchResults(false)
    setSearchedLocation(result)
    onSearchResult?.(result)
  }

  return (
    <>
      {/* 검색 UI - 가운데 상단에 배치 */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[5] w-full max-w-sm px-4 pointer-events-none">
        <div className="space-y-3 pointer-events-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <Input
              value={searchQuery}
              onChange={handleSearchInputChange}
              onFocus={() => {
                if (searchResults.length > 0) {
                  setShowSearchResults(true)
                }
              }}
              placeholder="장소명 또는 주소를 입력하세요"
              className="pl-10 pr-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-2 border-primary/20 focus:border-primary/50"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {isSearching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              {searchQuery && !isSearching && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("")
                    setSearchResults([])
                    setShowSearchResults(false)
                    setSearchedLocation(null)
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* 검색 결과 카드 */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {searchResults.map((result, index) => (
                <Card
                  key={index}
                  className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg"
                  onClick={() => handleSelectSearchResult(result)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-foreground truncate">
                            {result.name || result.address}
                          </div>
                          {result.address && result.name !== result.address && (
                            <div className="text-xs text-muted-foreground mt-1 truncate">
                              {result.address}
                            </div>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Container style={{ width: "100%", height: "100%" }}>
        <NaverMap
          ref={mapRef}
          center={mapCenter}
          zoom={mapZoom}
          mapTypeControl={false}
          logoControl={true}
          scaleControl={true}
          zoomControl={true}
        >
          {places.map((place, index) => {
            // order_index가 있으면 사용, 없으면 index + 1 사용
            const orderNumber =
              (place as Place & { order_index?: number }).order_index !== undefined
                ? (place as Place & { order_index: number }).order_index + 1
                : index + 1

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
          onclick="window.naverMarkerClick && window.naverMarkerClick('${place.id || index}')">
            ${showNumbers ? orderNumber : ""}
          </div>
        `

            // 고유한 key 생성: place.id가 있으면 사용하고, 없으면 index와 좌표를 조합
            const uniqueKey = place.id
              ? `${place.id}-${index}-${showNumbers ? "with-number" : "no-number"}`
              : `place-${index}-${place.lat}-${place.lng}-${showNumbers ? "with-number" : "no-number"}`

            return (
              <Marker
                key={uniqueKey}
                position={{ lat: place.lat, lng: place.lng }}
                title={`${orderNumber}. ${place.name}`}
                onClick={() => onPlaceClick?.(place)}
                icon={{
                  content: markerContent,
                  anchor: new PointClass(showNumbers ? 22 : 16, showNumbers ? 22 : 16),
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

          {/* 검색된 위치 마커 */}
          {searchedLocation && (
            <Marker
              position={{ lat: searchedLocation.lat, lng: searchedLocation.lng }}
              title={searchedLocation.name || searchedLocation.address}
              icon={{
                content: `
                  <div style="
                    position: relative;
                    width: 48px;
                    height: 48px;
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    border-radius: 50%;
                    border: 4px solid white;
                    box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  ">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="white"/>
                    </svg>
                  </div>
                `,
                anchor: new PointClass(24, 24),
              }}
              zIndex={2000}
            />
          )}
        </NaverMap>
      </Container>
    </>
  )
}
