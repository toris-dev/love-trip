"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@lovetrip/ui/components/button"
import { Input } from "@lovetrip/ui/components/input"
import { Label } from "@lovetrip/ui/components/label"
import { Card, CardContent, CardHeader, CardTitle } from "@lovetrip/ui/components/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@lovetrip/ui/components/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@lovetrip/ui/components/tabs"
import { LocationInput } from "@/components/shared/location-input"
import { TripDateRangeCalendar } from "./trip-date-range-calendar"
import { ArrowLeft, MapPin, Trash2, FileText, Loader2, ChevronUp, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import dynamic from "next/dynamic"

const NaverMapView = dynamic(() => import("@/components/shared/naver-map-view"), { ssr: false })

type PlaceType = "CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC"

interface PlaceItem {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  type: PlaceType
  day_number: number
  order_index: number
}

interface BlogItem {
  title: string
  link: string
  description: string
  bloggername: string
  bloggerlink: string
  postdate: string
  image?: string
}

interface TravelPlanCreatePageClientProps {
  user: { id: string; email?: string }
}

export function TravelPlanCreatePageClient({ user }: TravelPlanCreatePageClientProps) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [destination, setDestination] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [places, setPlaces] = useState<PlaceItem[]>([])
  const [totalBudget, setTotalBudget] = useState<number | "">("")
  const [rightTab, setRightTab] = useState<"map" | "reviews">("map")
  const [selectedPlaceForReviews, setSelectedPlaceForReviews] = useState<PlaceItem | null>(null)
  const [placeDetails, setPlaceDetails] = useState<{ place: unknown; blogs: BlogItem[] } | null>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [locationSearchValue, setLocationSearchValue] = useState("")
  const [addPlaceDay, setAddPlaceDay] = useState<number>(1)

  const totalDays = (() => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (end < start) return 0
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  })()

  const canAddPlaces = totalDays > 0

  useEffect(() => {
    if (totalDays > 0 && addPlaceDay > totalDays) {
      setAddPlaceDay(totalDays)
    }
  }, [totalDays, addPlaceDay])

  const handleAddPlace = useCallback(
    (location: { address: string; lat: number; lng: number; name?: string }) => {
      if (places.some(p => p.lat === location.lat && p.lng === location.lng)) {
        toast.error("이미 추가된 장소입니다")
        return
      }
      const placesInDay = places.filter(p => p.day_number === addPlaceDay)
      const order_index = placesInDay.length
      const newPlace: PlaceItem = {
        id: crypto.randomUUID(),
        name: location.name || location.address,
        address: location.address,
        lat: location.lat,
        lng: location.lng,
        type: "ETC",
        day_number: addPlaceDay,
        order_index,
      }
      setPlaces(prev => [...prev, newPlace].sort((a, b) => a.day_number - b.day_number || a.order_index - b.order_index))
      setLocationSearchValue("")
      toast.success(`${addPlaceDay}일차 ${order_index + 1}번으로 추가되었습니다`)
    },
    [places, addPlaceDay]
  )

  const handleRemovePlace = useCallback((placeId: string) => {
    setPlaces(prev => prev.filter(p => p.id !== placeId))
    setSelectedPlaceForReviews(prev => (prev?.id === placeId ? null : prev))
    if (placeDetails && selectedPlaceForReviews?.id === placeId) {
      setPlaceDetails(null)
    }
  }, [placeDetails, selectedPlaceForReviews?.id])

  const handleShowReviews = useCallback(async (place: PlaceItem) => {
    setSelectedPlaceForReviews(place)
    setRightTab("reviews")
    setIsLoadingDetails(true)
    setPlaceDetails(null)
    try {
      const res = await fetch(
        `/api/places/details?query=${encodeURIComponent(place.name)}`
      )
      if (!res.ok) throw new Error("리뷰를 불러올 수 없습니다")
      const data = await res.json()
      setPlaceDetails({ place: data.place, blogs: data.blogs || [] })
    } catch {
      toast.error("리뷰를 불러오는데 실패했습니다")
      setPlaceDetails({ place: null, blogs: [] })
    } finally {
      setIsLoadingDetails(false)
    }
  }, [])

  const mapPlaces = places.map(p => ({
    id: p.id,
    name: p.name,
    lat: p.lat,
    lng: p.lng,
    type: p.type,
    rating: 0,
    priceLevel: 0,
    description: "",
    image: "",
  }))

  const updatePlaceDay = useCallback((placeId: string, newDay: number) => {
    setPlaces(prev => {
      const place = prev.find(p => p.id === placeId)
      if (!place || place.day_number === newDay) return prev
      const othersInNewDay = prev.filter(p => p.id !== placeId && p.day_number === newDay)
      const newOrderIndex = othersInNewDay.length
      return prev
        .map(p =>
          p.id === placeId
            ? { ...p, day_number: newDay, order_index: newOrderIndex }
            : p
        )
        .sort((a, b) => a.day_number - b.day_number || a.order_index - b.order_index)
    })
  }, [])

  const reorderPlaceInDay = useCallback((placeId: string, direction: "up" | "down") => {
    setPlaces(prev => {
      const idx = prev.findIndex(p => p.id === placeId)
      if (idx < 0) return prev
      const place = prev[idx]
      const inSameDay = prev
        .map((p, i) => ({ p, i }))
        .filter(({ p }) => p.day_number === place.day_number)
        .sort((a, b) => a.p.order_index - b.p.order_index)
      const pos = inSameDay.findIndex(({ p }) => p.id === placeId)
      if (pos < 0) return prev
      const swapIdx = direction === "up" ? pos - 1 : pos + 1
      if (swapIdx < 0 || swapIdx >= inSameDay.length) return prev
      const swapPlace = inSameDay[swapIdx].p
      return prev.map(p => {
        if (p.id === placeId) return { ...p, order_index: swapPlace.order_index }
        if (p.id === swapPlace.id) return { ...p, order_index: place.order_index }
        return p
      }).sort((a, b) => a.day_number - b.day_number || a.order_index - b.order_index)
    })
  }, [])

  const placesByDay = (() => {
    const map = new Map<number, PlaceItem[]>()
    const sorted = [...places].sort((a, b) => a.day_number - b.day_number || a.order_index - b.order_index)
    sorted.forEach(p => {
      const list = map.get(p.day_number) ?? []
      list.push(p)
      map.set(p.day_number, list)
    })
    return Array.from(map.entries()).sort(([a], [b]) => a - b)
  })()

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("제목을 입력해주세요")
      return
    }
    if (!destination.trim()) {
      toast.error("목적지를 입력해주세요")
      return
    }
    if (!startDate || !endDate) {
      toast.error("여행 기간을 입력해주세요")
      return
    }
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (end < start) {
      toast.error("종료일은 시작일 이후여야 합니다")
      return
    }
    if (places.length === 0) {
      toast.error("최소 1개 이상의 장소를 추가해주세요")
      return
    }

    setIsSaving(true)
    try {
      const budget = typeof totalBudget === "number" && totalBudget >= 0 ? totalBudget : 0
      const sorted = [...places].sort((a, b) => a.day_number - b.day_number || a.order_index - b.order_index)
      const coursePlaces = sorted.map(p => ({
        place_id: p.id,
        day_number: p.day_number,
        order_index: p.order_index,
      }))

      const budgetItems = [
        { category: "교통비", name: "교통비", planned_amount: Math.floor(budget * 0.2) },
        { category: "숙박비", name: "숙박비", planned_amount: Math.floor(budget * 0.3) },
        { category: "식비", name: "식비", planned_amount: Math.floor(budget * 0.25) },
        { category: "액티비티", name: "액티비티", planned_amount: Math.floor(budget * 0.15) },
        { category: "기타", name: "기타", planned_amount: budget - Math.floor(budget * 0.9) },
      ]

      const res = await fetch("/api/travel-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          destination,
          start_date: startDate,
          end_date: endDate,
          total_budget: budget,
          course_type: startDate === endDate ? "date" : "travel",
          places: coursePlaces,
          budget_items: budgetItems,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "저장에 실패했습니다")
      }

      const { plan } = await res.json()
      toast.success("여행 계획이 저장되었습니다")
      router.push(`/my-trips/${plan.id}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "저장에 실패했습니다")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 md:py-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/my-trips">
            <ArrowLeft className="h-4 w-4 mr-2" />
            내 여행으로
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* 좌측: 여행 계획 입력 폼 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  여행 계획 만들기
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">제목 *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="예: 제주도 2박 3일"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination">목적지 *</Label>
                  <Input
                    id="destination"
                    value={destination}
                    onChange={e => setDestination(e.target.value)}
                    placeholder="예: 제주도"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start">시작일 *</Label>
                    <Input
                      id="start"
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end">종료일 *</Label>
                    <Input
                      id="end"
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
                <TripDateRangeCalendar
                  startDate={startDate}
                  endDate={endDate}
                  onRangeChange={(start, end) => {
                    setStartDate(start)
                    setEndDate(end)
                  }}
                  totalDays={totalDays}
                />
                {(!startDate || !endDate || totalDays === 0) && (
                  <p className="text-sm text-muted-foreground">
                    여행 기간(시작일·종료일)을 먼저 입력하면 장소를 일자별로 추가할 수 있습니다.
                  </p>
                )}
                {canAddPlaces && totalDays > 0 && (
                  <p className="text-sm text-primary font-medium">
                    {totalDays}일간 여행 — 아래에서 일자를 선택한 뒤 장소를 추가하세요.
                  </p>
                )}
                <div className="space-y-2">
                  <Label htmlFor="budget">총 예산 (원, 선택)</Label>
                  <Input
                    id="budget"
                    type="number"
                    min={0}
                    value={totalBudget === "" ? "" : totalBudget}
                    onChange={e =>
                      setTotalBudget(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    placeholder="0"
                  />
                </div>
              </CardContent>
            </Card>

            {canAddPlaces && (
              <Card>
                <CardHeader>
                  <CardTitle>장소 추가</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    일자를 선택한 뒤 장소를 검색해 추가하고, 오른쪽 지도에서 위치를 확인하세요
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <Label htmlFor="add-place-day" className="text-sm shrink-0">
                      추가할 일자:
                    </Label>
                    <Select
                      value={String(addPlaceDay)}
                      onValueChange={v => setAddPlaceDay(Number(v))}
                    >
                      <SelectTrigger id="add-place-day" className="w-24">
                        <SelectValue placeholder="일자" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: totalDays }, (_, i) => i + 1).map(d => (
                          <SelectItem key={d} value={String(d)}>
                            {d}일차
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <LocationInput
                    label=""
                    value={locationSearchValue}
                    onChange={setLocationSearchValue}
                    onLocationSelect={handleAddPlace}
                    placeholder="장소명 또는 주소를 입력하세요"
                  />
                  {places.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium">추가된 장소 ({places.length}개)</p>
                      {placesByDay.map(([day, dayPlaces]) => (
                        <div key={day} className="space-y-2">
                          <p className="text-xs font-semibold text-muted-foreground">
                            {day}일차
                          </p>
                          <ul className="space-y-2">
                            {dayPlaces.map((place, idx) => (
                              <li
                                key={place.id}
                                className="flex items-center gap-2 p-3 border rounded-lg bg-muted/30"
                              >
                                <span className="text-muted-foreground text-sm font-medium w-8 shrink-0">
                                  {idx + 1}.
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{place.name}</p>
                                  {place.address && (
                                    <p className="text-xs text-muted-foreground truncate">
                                      {place.address}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-0.5 shrink-0">
                                  <Select
                                    value={String(place.day_number)}
                                    onValueChange={v => updatePlaceDay(place.id, Number(v))}
                                  >
                                    <SelectTrigger className="h-8 w-16 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Array.from({ length: totalDays }, (_, i) => i + 1).map(d => (
                                        <SelectItem key={d} value={String(d)}>
                                          {d}일
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => reorderPlaceInDay(place.id, "up")}
                                    aria-label="순서 위로"
                                    disabled={idx === 0}
                                  >
                                    <ChevronUp className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => reorderPlaceInDay(place.id, "down")}
                                    aria-label="순서 아래로"
                                    disabled={idx === dayPlaces.length - 1}
                                  >
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleShowReviews(place)}
                                  className="text-xs shrink-0"
                                >
                                  <FileText className="h-4 w-4 mr-1" />
                                  리뷰
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemovePlace(place.id)}
                                  aria-label="삭제"
                                  className="shrink-0"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Button
              size="lg"
              className="w-full"
              onClick={handleSave}
              disabled={
                isSaving ||
                !title.trim() ||
                !destination.trim() ||
                !startDate ||
                !endDate ||
                places.length === 0
              }
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  저장 중...
                </>
              ) : (
                "여행 계획 저장"
              )}
            </Button>
          </div>

          {/* 우측: 지도 / 리뷰 탭 */}
          <div className="lg:sticky lg:top-24 self-start">
            <Card className="overflow-hidden">
              <Tabs value={rightTab} onValueChange={v => setRightTab(v as "map" | "reviews")}>
                <TabsList className="w-full grid grid-cols-2 rounded-none border-b bg-muted/30">
                  <TabsTrigger value="map" className="rounded-none">
                    지도
                  </TabsTrigger>
                  <TabsTrigger value="reviews" className="rounded-none">
                    리뷰
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="map" className="m-0 p-0">
                  <div className="relative h-[50vh] min-h-[320px] w-full">
                    <NaverMapView places={mapPlaces} />
                    {places.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-2xl pointer-events-none">
                        <p className="text-sm text-muted-foreground">
                          장소를 추가하면 지도에 표시됩니다
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="reviews" className="m-0 p-4">
                  <div className="min-h-[50vh]">
                    {isLoadingDetails && (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    )}
                    {!isLoadingDetails && !placeDetails && (
                      <p className="text-sm text-muted-foreground text-center py-12">
                        장소를 선택한 뒤 &quot;리뷰 보기&quot;를 누르면 관련 블로그 후기가 여기에
                        표시됩니다
                      </p>
                    )}
                    {!isLoadingDetails && placeDetails && (
                      <>
                        {selectedPlaceForReviews && (
                          <p className="text-sm font-medium mb-4">
                            &quot;{selectedPlaceForReviews.name}&quot; 관련 후기
                          </p>
                        )}
                        {placeDetails.blogs && placeDetails.blogs.length > 0 ? (
                          <div className="space-y-3">
                            <h4 className="text-sm font-semibold">관련 블로그 포스트</h4>
                            {placeDetails.blogs.map((blog, index) => (
                              <a
                                key={index}
                                href={blog.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block border border-border rounded-lg p-3 hover:border-primary/50 hover:bg-muted/30 transition-all"
                              >
                                <div className="flex gap-3">
                                  {blog.image && (
                                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden border">
                                      <Image
                                        src={blog.image}
                                        alt={blog.title}
                                        fill
                                        className="object-cover"
                                        onError={e => {
                                          e.currentTarget.parentElement!.style.display = "none"
                                        }}
                                      />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-semibold text-sm mb-1 line-clamp-2">
                                      {blog.title}
                                    </h5>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                                      {blog.description}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <span className="truncate">{blog.bloggername}</span>
                                      {blog.postdate && (
                                        <span>
                                          {`${blog.postdate.slice(0, 4)}.${blog.postdate.slice(4, 6)}.${blog.postdate.slice(6, 8)}`}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </a>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            이 장소에 대한 블로그 후기가 없습니다
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
