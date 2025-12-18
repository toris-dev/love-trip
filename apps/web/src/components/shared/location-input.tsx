"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Input } from "@lovetrip/ui/components/input"
import { Button } from "@lovetrip/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@lovetrip/ui/components/card"
import { MapPin, X, Loader2, Plus, Search, ChevronRight } from "lucide-react"
import dynamic from "next/dynamic"

const NaverMapView = dynamic(() => import("@/components/shared/naver-map-view"), { ssr: false })

interface Location {
  address: string
  lat: number
  lng: number
  name?: string
}

interface LocationInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  onLocationSelect?: (location: Location) => void
  placeholder?: string
  className?: string
  showPreview?: boolean // 위치 정보 미리보기 표시 여부
}

export function LocationInput({
  label,
  value,
  onChange,
  onLocationSelect,
  placeholder = "주소 또는 장소명을 입력하세요",
  className,
  showPreview = false, // 기본값은 false (기존 동작 유지)
}: LocationInputProps) {
  const [searchQuery, setSearchQuery] = useState(value)
  const [searchResults, setSearchResults] = useState<Location[]>([])
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [previewLocation, setPreviewLocation] = useState<Location | null>(null) // 미리보기용 위치
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const previousResultsRef = useRef<Location[]>([]) // 이전 검색 결과를 저장
  const searchQueryBeforePreviewRef = useRef<string>("") // 미리보기 전 검색 쿼리 저장
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    setSearchQuery(value)
  }, [value])

  // 외부 클릭 시 결과 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside as EventListener)
    }
  }, [])

  // 주소 검색 (debounce 적용)
  const searchLocation = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([])
      setShowResults(false)
      setIsSearching(false)
      return
    }

    // 검색 중에도 기존 결과를 유지하기 위해 결과를 먼저 지우지 않음
    setIsSearching(true)
    try {
      const response = await fetch(`/api/geocode?query=${encodeURIComponent(query)}`)
      const data = await response.json()

      if (!response.ok) {
        // 에러가 발생해도 기존 결과는 유지하고 검색 상태만 해제
        setIsSearching(false)
        return
      }

      if (data.locations && data.locations.length > 0) {
        // 새 결과가 나오면 한 번에 업데이트 (기존 결과를 즉시 교체)
        const newResults = data.locations
        previousResultsRef.current = newResults
        setSearchResults(newResults)
        setShowResults(true)
      } else {
        // 결과가 없을 때만 숨김
        setSearchResults([])
        setShowResults(false)
        previousResultsRef.current = []
      }
    } catch (error) {
      console.error("Error searching location:", error)
      // 에러가 발생해도 기존 결과는 유지
    } finally {
      setIsSearching(false)
    }
  }, [])

  // 입력 변경 시 debounce 적용
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      if (searchQuery.trim() && searchQuery.length >= 2) {
        searchLocation(searchQuery)
      } else {
        setSearchResults([])
        setShowResults(false)
      }
    }, 300) // 300ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [searchQuery, searchLocation])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchQuery(newValue)
    onChange(newValue)
    setSelectedLocation(null)
  }

  const handleSelectLocation = (location: Location) => {
    // debounce 타이머 취소
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = undefined
    }

    if (showPreview) {
      // 미리보기 모드: 검색 쿼리를 백업하고 위치 정보만 표시
      searchQueryBeforePreviewRef.current = searchQuery
      setPreviewLocation(location)
      setSearchQuery(location.name || location.address)
      // 검색 결과는 유지 (나중에 복원할 수 있도록)
    } else {
      // 기존 동작: 바로 추가
      setSearchResults([])
      setShowResults(false)
      setSelectedLocation(location)
      setSearchQuery(location.name || location.address)
      onChange(location.address)
      onLocationSelect?.(location)
    }
  }

  const handleAddLocation = () => {
    if (previewLocation) {
      // debounce 타이머 취소
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = undefined
      }

      setSelectedLocation(previewLocation)
      onChange(previewLocation.address)
      onLocationSelect?.(previewLocation)
      setPreviewLocation(null)
      setSearchResults([])
      setShowResults(false)
    }
  }

  const handleClear = () => {
    setSearchQuery("")
    onChange("")
    setSelectedLocation(null)
    setPreviewLocation(null)
    setSearchResults([])
    setShowResults(false)
    inputRef.current?.focus()
  }

  const mapPlaces =
    selectedLocation || previewLocation
      ? [
          {
            id: "selected-location",
            name:
              (selectedLocation || previewLocation)!.name ||
              (selectedLocation || previewLocation)!.address,
            lat: (selectedLocation || previewLocation)!.lat,
            lng: (selectedLocation || previewLocation)!.lng,
            type: "ETC" as const,
            rating: 0,
            priceLevel: 0,
            description: (selectedLocation || previewLocation)!.address,
            image: "",
          },
        ]
      : []

  return (
    <div ref={containerRef} className={`space-y-2 max-w-full overflow-hidden ${className}`}>
      {label && (
        <label className="text-sm font-medium flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          {label}
        </label>
      )}
      <div className="relative max-w-full overflow-hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10 flex-shrink-0" />
          <Input
            ref={inputRef}
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => {
              if (searchResults.length > 0) {
                setShowResults(true)
              }
            }}
            placeholder={placeholder}
            className="pl-10 pr-10 w-full max-w-full"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 w-6 h-6 justify-center">
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground flex-shrink-0" />
            ) : searchQuery ? (
              <button
                type="button"
                onClick={handleClear}
                className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <div className="w-4 h-4" />
            )}
          </div>
        </div>

        {/* 검색 결과 카드 */}
        {!previewLocation &&
          ((showResults && searchResults.length > 0) ||
            (isSearching && previousResultsRef.current.length > 0)) && (
            <div className="mt-3 space-y-2 max-w-full overflow-hidden">
              {(isSearching && searchResults.length === 0
                ? previousResultsRef.current
                : searchResults
              ).map((location, index) => (
                <Card
                  key={index}
                  className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/50 max-w-full overflow-hidden"
                  onClick={() => handleSelectLocation(location)}
                >
                  <CardContent className="p-4 max-w-full overflow-hidden">
                    <div className="flex items-start justify-between gap-3 max-w-full overflow-hidden">
                      <div className="flex items-start gap-3 flex-1 min-w-0 overflow-hidden">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="font-semibold text-sm text-foreground truncate">
                            {location.name || location.address}
                          </div>
                          {location.address && location.name !== location.address && (
                            <div className="text-xs text-muted-foreground mt-1 truncate">
                              {location.address}
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

      {/* 위치 정보 미리보기 카드 */}
      {showPreview && previewLocation && (
        <Card className="mt-2 max-w-full overflow-hidden">
          <CardHeader className="pb-3 max-w-full overflow-hidden">
            <div className="flex items-start justify-between max-w-full overflow-hidden">
              <div className="flex-1 min-w-0 overflow-hidden">
                <CardTitle className="text-base flex items-center gap-2 truncate">
                  <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="truncate">
                    {previewLocation.name || previewLocation.address}
                  </span>
                </CardTitle>
                {previewLocation.address && previewLocation.name !== previewLocation.address && (
                  <p className="text-sm text-muted-foreground mt-1 truncate">
                    {previewLocation.address}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPreviewLocation(null)
                  // 백업된 검색 쿼리로 복원
                  const queryToRestore = searchQueryBeforePreviewRef.current
                  setSearchQuery(queryToRestore)
                  // 이전 검색 결과가 있으면 복원
                  if (previousResultsRef.current.length > 0) {
                    setSearchResults(previousResultsRef.current)
                    setShowResults(true)
                  } else if (queryToRestore.trim().length >= 2) {
                    // 검색 쿼리가 있으면 다시 검색
                    searchLocation(queryToRestore)
                  }
                }}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 max-w-full overflow-hidden">
            <div className="h-48 rounded-lg overflow-hidden border max-w-full">
              <NaverMapView places={mapPlaces} path={[]} />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground max-w-full overflow-hidden">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                위도: {previewLocation.lat.toFixed(6)}, 경도: {previewLocation.lng.toFixed(6)}
              </span>
            </div>
            <Button onClick={handleAddLocation} className="w-full max-w-full" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              장소 추가
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 선택된 위치 지도 표시 (기존 동작) */}
      {!showPreview && selectedLocation && (
        <div className="h-64 rounded-lg overflow-hidden border">
          <NaverMapView places={mapPlaces} path={[]} />
        </div>
      )}
    </div>
  )
}
