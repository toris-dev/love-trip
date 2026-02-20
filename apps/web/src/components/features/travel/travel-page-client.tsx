"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import dynamic from "next/dynamic"
import { createClient } from "@lovetrip/api/supabase/client"
import {
  useTravelCourses,
  useRecommendedPlaces,
  TravelSidebar,
  PlaceDetailCard,
  CourseInfoOverlay,
  type Place,
  type TravelCourse,
} from "@lovetrip/planner/components/travel"
import type { TargetAudience } from "@lovetrip/shared/types/course"
import { Button } from "@lovetrip/ui/components/button"
import { Plus, ArrowLeft, Save, GripVertical, X, MapPin, Plane } from "lucide-react"
import { LocationInput } from "@/components/shared/location-input"
import { Label } from "@lovetrip/ui/components/label"
import { Card, CardContent, CardHeader, CardTitle } from "@lovetrip/ui/components/card"
import { Input } from "@lovetrip/ui/components/input"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const NaverMapViewDynamic = dynamic(() => import("@/components/shared/naver-map-view"), {
  ssr: false,
})

const ITEMS_PER_PAGE = 10

interface TravelPageClientProps {
  initialCourses: TravelCourse[]
  initialHasMore: boolean
  initialTotalCount: number
  user: { id: string; email?: string } | null
}

export function TravelPageClient({
  initialCourses,
  initialHasMore,
  initialTotalCount,
  user: initialUser,
}: TravelPageClientProps) {
  const router = useRouter()
  const [selectedCourse, setSelectedCourse] = useState<TravelCourse | null>(null)
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sidebarMode, setSidebarMode] = useState<"browse" | "create">("browse")
  const [user, setUser] = useState<{ id: string; email?: string } | null>(initialUser)

  // 코스 생성 관련 상태
  const [creatingCourses, setCreatingCourses] = useState<
    Array<{
      id: string
      title: string
      description: string
      target_audience: TargetAudience
      places: Array<{
        id: string
        name: string
        address: string
        lat: number
        lng: number
        type: "CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC"
      }>
    }>
  >([])
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  // 검색된 장소를 임시로 저장 (지도에 표시용)
  const [searchedPlace, setSearchedPlace] = useState<{
    id: string
    name: string
    lat: number
    lng: number
    type: "CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC"
    rating: number
    priceLevel: number
    description: string
    image: string
  } | null>(null)

  // 초기 데이터로 상태 초기화
  const [courses, setCourses] = useState<TravelCourse[]>(initialCourses)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { recommendedPlaces } = useRecommendedPlaces()

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUser({ id: user.id, email: user.email })
      }
    }
    if (!user) {
      loadUser()
    }
  }, [user])

  const handleCourseSelect = (course: TravelCourse) => {
    setSelectedCourse(course)
    setSelectedPlace(null)
  }

  const handlePlaceClick = (place: Place) => {
    setSelectedPlace(place)
  }

  const getMapPlaces = () => {
    // 코스 만들기 모드일 때
    if (sidebarMode === "create" && selectedCourseId) {
      const selectedCourse = creatingCourses.find(c => c.id === selectedCourseId)
      const places: Array<{
        id: string
        name: string
        lat: number
        lng: number
        type: "CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC"
        rating: number
        priceLevel: number
        description: string
        image: string
      }> = []

      // 추가된 장소들
      if (selectedCourse) {
        places.push(
          ...selectedCourse.places.map(p => ({
            id: p.id,
            name: p.name,
            lat: p.lat,
            lng: p.lng,
            type: p.type,
            rating: 0,
            priceLevel: 0,
            description: p.address,
            image: "",
          }))
        )
      }

      // 검색된 장소 (아직 추가되지 않은)
      if (searchedPlace) {
        places.push(searchedPlace)
      }

      return places
    }

    if (selectedCourse) {
      return selectedCourse.places.map(p => ({
        id: p.id,
        name: p.name,
        lat: p.lat,
        lng: p.lng,
        type: p.type as "CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC",
        rating: p.rating ?? 0,
        priceLevel: p.price_level ?? 0,
        description: p.description || "",
        image: p.image_url || "",
      }))
    }
    // 코스가 선택되지 않았을 때 추천 장소 표시
    return recommendedPlaces.slice(0, 30).map(p => ({
      id: p.id,
      name: p.name,
      lat: p.lat,
      lng: p.lng,
      type: p.type as "CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC",
      rating: p.rating ?? 0,
      priceLevel: p.price_level ?? 0,
      description: p.description || "",
      image: p.image_url || "",
    }))
  }

  const getMapPath = () => {
    if (selectedCourse) {
      return selectedCourse.places.map(p => ({ lat: p.lat, lng: p.lng }))
    }
    return []
  }

  // 페이지 스크롤 비활성화
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 지도 영역 - 전체 화면 */}
      <div className="absolute inset-0 w-full h-full">
        <div className="w-full h-full relative">
          <NaverMapViewDynamic
            places={getMapPlaces()}
            path={getMapPath()}
            showSearch={sidebarMode === "create" && selectedCourseId !== null}
            onPlaceClick={place => {
              if (selectedCourse) {
                const foundPlace = selectedCourse.places.find(p => p.id === place.id)
                if (foundPlace) {
                  handlePlaceClick(foundPlace)
                }
              } else {
                const foundPlace = recommendedPlaces.find(p => p.id === place.id)
                if (foundPlace) {
                  handlePlaceClick(foundPlace)
                }
              }
            }}
            onSearchResult={location => {
              if (sidebarMode === "create" && selectedCourseId) {
                // 검색된 장소를 지도에 표시
                setSearchedPlace({
                  id: `search-${Date.now()}`,
                  name: location.name || location.address,
                  lat: location.lat,
                  lng: location.lng,
                  type: "ETC" as const,
                  rating: 0,
                  priceLevel: 0,
                  description: location.address,
                  image: "",
                })

                // 코스에 장소 추가
                const newPlace = {
                  id: `place-${Date.now()}-${Math.random()}`,
                  name: location.name || location.address,
                  address: location.address,
                  lat: location.lat,
                  lng: location.lng,
                  type: "ETC" as const,
                }
                setCreatingCourses(
                  creatingCourses.map(c =>
                    c.id === selectedCourseId ? { ...c, places: [...c.places, newPlace] } : c
                  )
                )
                // 장소가 추가되면 검색된 장소 표시 제거 (이미 추가된 장소로 표시됨)
                setTimeout(() => setSearchedPlace(null), 100)
                toast.success("장소가 추가되었습니다")
              }
            }}
          />
          <CourseInfoOverlay course={selectedCourse} onClose={() => setSelectedCourse(null)} />
        </div>
      </div>

      {/* 코스 만들기 버튼 - 우측 상단 */}
      <div className="absolute top-[88px] right-6 z-10">
        <Button
          onClick={() => setSidebarMode("create")}
          size="lg"
          className="shadow-2xl shadow-primary/30 bg-primary hover:bg-primary/90 text-white border-0 rounded-2xl px-6 py-6 h-auto font-semibold text-base transition-all duration-300 hover:scale-105 hover:shadow-primary/40"
        >
          <Plus className="h-5 w-5 mr-2" />
          코스 만들기
        </Button>
      </div>

      {/* 왼쪽 사이드바 */}
      <div className="absolute left-0 top-[64px] w-full md:w-96 h-[calc(100vh-64px)] z-40 pointer-events-none">
        {sidebarMode === "browse" ? (
          <TravelSidebar
            courses={courses}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCourse={selectedCourse}
            onCourseSelect={handleCourseSelect}
            isLoading={isLoading}
            error={error}
          />
        ) : (
          <div className="h-full w-full bg-background border-r border-border shadow-xl pointer-events-auto flex flex-col">
            {/* 코스 생성 모드 */}
            <div className="p-6 border-b border-border bg-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Plane className="h-6 w-6 text-primary" />
                  </div>
                  <h1 className="text-2xl font-bold text-foreground">코스 만들기</h1>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSidebarMode("browse")
                    setSelectedCourseId(null)
                    setSearchedPlace(null)
                  }}
                  className="text-primary hover:text-primary hover:bg-primary/10 dark:text-primary dark:hover:bg-primary/20 rounded-xl"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  목록으로
                </Button>
              </div>
              <p className="text-sm text-primary/70 dark:text-primary/70 ml-14">
                여러 여행 코스를 만들고 장소를 추가해보세요
              </p>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 relative">
              <div className="p-4 space-y-4 pb-16">
                {selectedCourseId === null ? (
                  <>
                    <Button
                      onClick={() => {
                        const newCourse =                         {
                          id: `course-${Date.now()}`,
                          title: "",
                          description: "",
                          target_audience: "couple",
                          places: [],
                        }
                        setCreatingCourses([...creatingCourses, newCourse])
                        setSelectedCourseId(newCourse.id)
                      }}
                      className="w-full bg-primary hover:bg-primary/90 text-white border-0 rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.02] font-semibold"
                      size="lg"
                    >
                      <Plus className="h-5 w-5 mr-2" />새 코스 만들기
                    </Button>

                    {creatingCourses.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="relative mx-auto mb-6 w-24 h-24">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/20 dark:from-primary/30/30 dark:to-primary/30/30 rounded-full blur-xl opacity-50 animate-pulse" />
                          <div className="relative bg-gradient-to-br from-primary/10 to-primary/10 dark:from-primary/20 dark:to-primary/20 rounded-full p-6 border-2 border-primary/20 dark:border-primary/40">
                            <Plane className="h-12 w-12 text-primary dark:text-primary mx-auto" />
                          </div>
                        </div>
                        <p className="text-lg font-semibold text-foreground mb-2">
                          아직 만든 코스가 없습니다
                        </p>
                        <p className="text-sm text-primary/70 dark:text-primary/70 mb-4">
                          새 코스 만들기 버튼을 눌러 시작하세요
                        </p>
                        <div className="flex items-center justify-center gap-2 text-xs text-primary/60 dark:text-primary/60">
                          <Plane className="h-3 w-3 text-primary" />
                          <span>로맨틱한 여행 코스를 만들어보세요</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {creatingCourses.map(course => (
                          <Card
                            key={course.id}
                            className="cursor-pointer hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300 border-2 border-primary/10 hover:border-primary/20 bg-card/80 rounded-2xl overflow-hidden"
                            onClick={() => setSelectedCourseId(course.id)}
                          >
                            <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-primary/10 dark:from-primary/20 dark:to-primary/20">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-lg mb-2 flex items-center gap-2 text-foreground">
                                    <div className="p-1.5 rounded-lg bg-primary">
                                      <Plane className="h-4 w-4 text-white" />
                                    </div>
                                    {course.title || "제목 없음"}
                                  </CardTitle>
                                  {course.description && (
                                    <p className="text-sm text-primary/70 dark:text-primary/70 line-clamp-2 ml-7">
                                      {course.description}
                                    </p>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={e => {
                                    e.stopPropagation()
                                    setCreatingCourses(
                                      creatingCourses.filter(c => c.id !== course.id)
                                    )
                                    if (selectedCourseId === course.id) {
                                      setSelectedCourseId(null)
                                    }
                                  }}
                                  className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/30/30 text-primary dark:text-primary"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-3">
                              <div className="flex items-center gap-2 text-sm text-primary/80 dark:text-primary/80">
                                <MapPin className="h-4 w-4" />
                                <span className="font-medium">{course.places.length}개 장소</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  (() => {
                    const selectedCourse = creatingCourses.find(c => c.id === selectedCourseId)
                    if (!selectedCourse) return null

                    return (
                      <div className="space-y-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCourseId(null)
                            setSearchedPlace(null)
                          }}
                          className="text-primary hover:text-primary hover:bg-primary/10 dark:text-primary dark:hover:bg-primary/20 rounded-xl mb-2"
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          목록으로
                        </Button>

                        {/* 코스 정보 입력 */}
                        <Card className="border border-border">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Plane className="h-4 w-4 text-primary" />
                              </div>
                              코스 정보
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="course-title" className="font-semibold">
                                코스 제목 *
                              </Label>
                              <Input
                                id="course-title"
                                value={selectedCourse.title}
                                onChange={e => {
                                  setCreatingCourses(
                                    creatingCourses.map(c =>
                                      c.id === selectedCourseId
                                        ? { ...c, title: e.target.value }
                                        : c
                                    )
                                  )
                                }}
                                placeholder="예: 제주도 2박 3일 여행"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="course-description" className="font-semibold">
                                코스 설명
                              </Label>
                              <Input
                                id="course-description"
                                value={selectedCourse.description}
                                onChange={e => {
                                  setCreatingCourses(
                                    creatingCourses.map(c =>
                                      c.id === selectedCourseId
                                        ? { ...c, description: e.target.value }
                                        : c
                                    )
                                  )
                                }}
                                placeholder="코스에 대한 간단한 설명을 입력하세요"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="target-audience" className="font-semibold">
                                타겟 오디언스
                              </Label>
                              <select
                                id="target-audience"
                                value={selectedCourse.target_audience}
                                onChange={e => {
                                  setCreatingCourses(
                                    creatingCourses.map(c =>
                                      c.id === selectedCourseId
                                        ? { ...c, target_audience: e.target.value as TargetAudience }
                                        : c
                                    )
                                  )
                                }}
                                className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                              >
                                <option value="couple">커플</option>
                                <option value="friend">친구</option>
                                <option value="family">가족</option>
                                <option value="solo">혼자</option>
                                <option value="business">비즈니스</option>
                              </select>
                            </div>
                          </CardContent>
                        </Card>

                        {/* 장소 검색 및 추가 */}
                        <Card className="border border-border">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <MapPin className="h-4 w-4 text-primary" />
                              </div>
                              장소 추가
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-5">
                            <LocationInput
                              label=""
                              value=""
                              onChange={() => {}}
                              showPreview={true}
                              onLocationSelect={location => {
                                // 검색된 장소를 지도에 표시
                                setSearchedPlace({
                                  id: `search-${Date.now()}`,
                                  name: location.name || location.address,
                                  lat: location.lat,
                                  lng: location.lng,
                                  type: "ETC" as const,
                                  rating: 0,
                                  priceLevel: 0,
                                  description: location.address,
                                  image: "",
                                })

                                // 코스에 장소 추가
                                const newPlace = {
                                  id: `place-${Date.now()}-${Math.random()}`,
                                  name: location.name || location.address,
                                  address: location.address,
                                  lat: location.lat,
                                  lng: location.lng,
                                  type: "ETC" as const,
                                }
                                setCreatingCourses(
                                  creatingCourses.map(c =>
                                    c.id === selectedCourseId
                                      ? { ...c, places: [...c.places, newPlace] }
                                      : c
                                  )
                                )
                                // 장소가 추가되면 검색된 장소 표시 제거 (이미 추가된 장소로 표시됨)
                                setTimeout(() => setSearchedPlace(null), 100)
                                toast.success("장소가 추가되었습니다")
                              }}
                              placeholder="장소명 또는 주소를 입력하세요"
                            />
                          </CardContent>
                        </Card>

                        {/* 추가된 장소 목록 */}
                        {selectedCourse.places.length > 0 && (
                          <Card className="border border-border">
                            <CardHeader>
                              <CardTitle className="text-lg flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <MapPin className="h-4 w-4 text-primary" />
                                </div>
                                추가된 장소 ({selectedCourse.places.length}개)
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {selectedCourse.places.map((place, index) => {
                                  const placeWithOrder = place as TravelPlace & {
                                    order_index?: number
                                  }
                                  const placeNumber =
                                    placeWithOrder.order_index !== undefined
                                      ? placeWithOrder.order_index + 1
                                      : index + 1
                                  return (
                                    <div
                                      key={place.id}
                                      className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                      <div className="flex items-center gap-2">
                                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-semibold w-6 text-center p-1 rounded bg-primary text-primary-foreground">
                                          {placeNumber}
                                        </span>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate text-foreground">
                                          {place.name}
                                        </p>
                                        {place.address && (
                                          <p className="text-xs text-muted-foreground truncate mt-1">
                                            {place.address}
                                          </p>
                                        )}
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setCreatingCourses(
                                            creatingCourses.map(c =>
                                              c.id === selectedCourseId
                                                ? {
                                                    ...c,
                                                    places: c.places.filter(p => p.id !== place.id),
                                                  }
                                                : c
                                            )
                                          )
                                          toast.success("장소가 제거되었습니다")
                                        }}
                                        className="flex-shrink-0 h-8 w-8 p-0"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )
                                })}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* 저장 버튼 */}
                        <div className="flex gap-3 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => setSelectedCourseId(null)}
                            className="flex-1 h-12"
                          >
                            취소
                          </Button>
                          <Button
                            onClick={async () => {
                              if (!user) {
                                toast.error("로그인이 필요합니다")
                                return
                              }

                              if (!selectedCourse.title.trim()) {
                                toast.error("코스 제목을 입력해주세요")
                                return
                              }

                              if (selectedCourse.places.length === 0) {
                                toast.error("최소 1개 이상의 장소를 추가해주세요")
                                return
                              }

                              setIsSaving(true)
                              try {
                                const firstPlace = selectedCourse.places[0]
                                let destination = "기타"
                                if (firstPlace?.address) {
                                  const match = firstPlace.address.match(
                                    /(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)/
                                  )
                                  destination = match ? match[1] : "기타"
                                }

                                // 여행 코스는 2박 3일로 기본 설정
                                const today = new Date()
                                const endDate = new Date(today)
                                endDate.setDate(today.getDate() + 2)

                                // user_courses API 사용
                                const response = await fetch("/api/user-courses/create", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    title: selectedCourse.title,
                                    description: selectedCourse.description,
                                    course_type: "travel",
                                    region: destination,
                                    is_public: false,
                                    target_audience: selectedCourse.target_audience,
                                    places: selectedCourse.places.map((p, index) => ({
                                      place_info: {
                                        name: p.name,
                                        lat: p.lat,
                                        lng: p.lng,
                                        address: p.address,
                                        type: p.type,
                                      },
                                      day_number:
                                        Math.floor(
                                          index / Math.ceil(selectedCourse.places.length / 3)
                                        ) + 1,
                                      order_index: index,
                                    })),
                                    duration: "2박3일",
                                  }),
                                })

                                if (!response.ok) {
                                  const errorData = await response.json().catch(() => ({}))
                                  throw new Error(errorData.error || "저장에 실패했습니다")
                                }

                                toast.success("여행 코스가 저장되었습니다!")
                                setCreatingCourses(
                                  creatingCourses.filter(c => c.id !== selectedCourseId)
                                )
                                setSelectedCourseId(null)
                                setSidebarMode("browse")
                                router.refresh()
                              } catch (error) {
                                toast.error(
                                  error instanceof Error ? error.message : "저장에 실패했습니다"
                                )
                              } finally {
                                setIsSaving(false)
                              }
                            }}
                            disabled={
                              isSaving ||
                              !selectedCourse.title.trim() ||
                              selectedCourse.places.length === 0
                            }
                            className="flex-1 bg-primary hover:bg-primary/90 text-white border-0 rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.02] font-semibold h-12 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSaving ? (
                              <>
                                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                저장 중...
                              </>
                            ) : (
                              <>
                                <Save className="h-5 w-5 mr-2" />
                                저장
                              </>
                            )}
                          </Button>
                        </div>
                        {/* 하단 여백 */}
                        <div className="h-4" />
                      </div>
                    )
                  })()
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <PlaceDetailCard place={selectedPlace} onClose={() => setSelectedPlace(null)} />
    </div>
  )
}
