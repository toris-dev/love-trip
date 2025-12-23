"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@lovetrip/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@lovetrip/ui/components/card"
import { Input } from "@lovetrip/ui/components/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@lovetrip/ui/components/dialog"
import { GripVertical, Plus, Search, Calendar, MapPin } from "lucide-react"
import { toast } from "sonner"
import { useTravelDayPlaces } from "./hooks/use-travel-day-places"
import { searchPlaces } from "./utils/place-search-utils"
import { PlaceCard } from "./PlaceCard"
import type { Database } from "@lovetrip/shared/types/database"
import type { Place } from "@lovetrip/shared/types/course"
type TravelDay = Database["public"]["Tables"]["travel_days"]["Row"]
type TravelDayPlace = Database["public"]["Tables"]["travel_day_places"]["Row"] & {
  places: Place | null
}

interface TravelDayPlacesProps {
  travelPlanId: string
  travelDay: TravelDay
  onUpdate?: () => void
}

/**
 * API 응답 에러 처리 헬퍼
 */
const handleApiError = (error: unknown, defaultMessage: string): string => {
  if (error instanceof Error) {
    return error.message
  }
  return defaultMessage
}

export function TravelDayPlaces({ travelPlanId, travelDay, onUpdate }: TravelDayPlacesProps) {
  const [places, setPlaces] = useState<TravelDayPlace[]>([])
  const [searchDialogOpen, setSearchDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Place[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const { loadPlaces, addPlace, removePlace, isLoading } = useTravelDayPlaces({
    travelPlanId,
    travelDayId: travelDay.id,
    onUpdate: async () => {
      const loadedPlaces = await loadPlaces()
      setPlaces(loadedPlaces)
      onUpdate?.()
    },
  })

  useEffect(() => {
    const initializePlaces = async () => {
      const loadedPlaces = await loadPlaces()
      setPlaces(loadedPlaces)
    }
    initializePlaces()
  }, [loadPlaces])

  /**
   * 장소 검색 핸들러
   */
  const handleSearch = useCallback(async () => {
    const trimmedQuery = searchQuery.trim()
    if (!trimmedQuery) {
      setSearchResults([])
      return
    }

    try {
      setIsSearching(true)
      const results = await searchPlaces(trimmedQuery)
      setSearchResults(results)
    } catch (error) {
      console.error("Error searching places:", error)
      const message = handleApiError(error, "장소 검색에 실패했습니다")
      toast.error(message)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [searchQuery])

  /**
   * 장소 추가 핸들러
   */
  const handleAddPlace = useCallback(
    async (placeId: string) => {
      const success = await addPlace(placeId)
      if (success) {
        handleCloseSearchDialog(false)
        const loadedPlaces = await loadPlaces()
        setPlaces(loadedPlaces)
      }
    },
    [addPlace, loadPlaces]
  )

  /**
   * 장소 제거 핸들러
   */
  const handleRemovePlace = useCallback(
    async (placeId: string) => {
      const success = await removePlace(placeId)
      if (success) {
        const loadedPlaces = await loadPlaces()
        setPlaces(loadedPlaces)
      }
    },
    [removePlace, loadPlaces]
  )

  // updateOrder는 향후 드래그 앤 드롭 기능에서 사용 예정
  // 현재는 사용하지 않지만 유지

  /**
   * 검색 다이얼로그 열기/닫기 핸들러
   * Radix UI Dialog는 onOpenChange에 true/false를 전달함
   */
  const handleCloseSearchDialog = useCallback((open: boolean) => {
    setSearchDialogOpen(open)
    if (!open) {
      // Dialog가 닫힐 때만 초기화
      setSearchQuery("")
      setSearchResults([])
    }
  }, [])

  /**
   * 검색 입력 핸들러 (Enter 키 지원)
   */
  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSearch()
      }
    },
    [handleSearch]
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {travelDay.day_number}일차 {travelDay.title && `- ${travelDay.title}`}
          </CardTitle>
          <Dialog open={searchDialogOpen} onOpenChange={handleCloseSearchDialog}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                장소 추가
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>장소 검색 및 추가</DialogTitle>
                <DialogDescription>여행 일정에 추가할 장소를 검색하세요</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="장소명, 주소, 설명으로 검색..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                  />
                  <Button onClick={handleSearch} disabled={isSearching}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {isSearching ? (
                    <div className="text-center py-8 text-muted-foreground">검색 중...</div>
                  ) : searchResults.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchQuery ? "검색 결과가 없습니다" : "장소를 검색해주세요"}
                    </div>
                  ) : (
                    searchResults.map(place => (
                      <Card key={place.id} className="cursor-pointer hover:bg-accent">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold">{place.name}</h4>
                              {place.address && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                  <MapPin className="h-3 w-3" />
                                  {place.address}
                                </p>
                              )}
                              {place.description && (
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                  {place.description}
                                </p>
                              )}
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleAddPlace(place.id)}
                              className="ml-4"
                            >
                              추가
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
        ) : places.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            추가된 장소가 없습니다. 장소를 추가해주세요.
          </div>
        ) : (
          <div className="space-y-2">
            {places.map((dayPlace, index) => {
              const place = dayPlace.places
              if (!place) return null

              return (
                <div key={dayPlace.id} className="flex items-start gap-2">
                  <GripVertical className="h-5 w-5 cursor-move text-muted-foreground mt-4" />
                  <PlaceCard
                    place={place}
                    orderIndex={index}
                    visitTime={dayPlace.visit_time}
                    notes={dayPlace.notes}
                    showOrder={true}
                    onRemove={() => handleRemovePlace(dayPlace.id)}
                  />
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
