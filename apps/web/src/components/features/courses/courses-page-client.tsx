"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@lovetrip/ui/components/button"
import { Plus, ArrowLeft, Save, GripVertical, X, Heart, Plane } from "lucide-react"
import { LocationInput } from "@/components/shared/location-input"
import { Label } from "@lovetrip/ui/components/label"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@lovetrip/ui/components/card"
import { Input } from "@lovetrip/ui/components/input"
import { Badge } from "@lovetrip/ui/components/badge"
import { Alert, AlertDescription } from "@lovetrip/ui/components/alert"
import {
  Search,
  MapPin,
  Star,
  Clock,
  Camera,
  Coffee,
  Utensils,
  AlertCircle,
  ChevronRight,
  Loader2,
  Calendar,
} from "lucide-react"
import { createClient } from "@lovetrip/api/supabase/client"
import { getCoupleRecommendations } from "@lovetrip/recommendation/services"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import dynamic from "next/dynamic"
import type { Database } from "@lovetrip/shared/types/database"
import {
  TravelSidebar,
  PlaceDetailCard,
  CourseInfoOverlay,
  type Place as TravelPlace,
  type TravelCourse,
} from "@lovetrip/planner/components/travel"

const NaverMapView = dynamic(() => import("@/components/shared/naver-map-view"), { ssr: false })

const ITEMS_PER_PAGE = 10

type Place = Database["public"]["Tables"]["places"]["Row"] & {
  type: "CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC"
}

type DateCourse = {
  id: string
  title: string
  region: string
  description?: string
  image_url?: string | null
  place_count: number
  places: Place[]
  duration: string
  total_distance_km?: number | null
  max_distance_km?: number | null
}

interface CoursesPageClientProps {
  initialDateCourses: DateCourse[]
  initialDateHasMore: boolean
  initialDateTotalCount: number
  initialTravelCourses: TravelCourse[]
  initialTravelHasMore: boolean
  initialTravelTotalCount: number
  initialCourseType: "date" | "travel"
  user: { id: string; email?: string } | null
}

export function CoursesPageClient({
  initialDateCourses,
  initialDateHasMore,
  initialDateTotalCount,
  initialTravelCourses,
  initialTravelHasMore,
  initialTravelTotalCount,
  initialCourseType,
  user: initialUser,
}: CoursesPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseType = (searchParams.get("type") === "travel" ? "travel" : "date") as "date" | "travel"
  const isMobile = useIsMobile()

  // Date Course 상태
  const [dateCourses, setDateCourses] = useState<DateCourse[]>(initialDateCourses)
  const [filteredDateCourses, setFilteredDateCourses] = useState<DateCourse[]>(initialDateCourses)
  const [displayedDateCourses, setDisplayedDateCourses] = useState<DateCourse[]>(
    initialDateCourses.slice(0, ITEMS_PER_PAGE)
  )
  const [selectedDateCourse, setSelectedDateCourse] = useState<DateCourse | null>(null)
  const [dateSearchQuery, setDateSearchQuery] = useState("")
  const [dateHasMore, setDateHasMore] = useState(initialDateHasMore)
  const [datePage, setDatePage] = useState(0)
  const [dateIsLoading, setDateIsLoading] = useState(false)
  const [dateIsLoadingMore, setDateIsLoadingMore] = useState(false)
  const [dateError, setDateError] = useState<string | null>(null)

  // Travel Course 상태
  const [travelCourses, setTravelCourses] = useState<TravelCourse[]>(initialTravelCourses)
  const [selectedTravelCourse, setSelectedTravelCourse] = useState<TravelCourse | null>(null)
  const [travelSearchQuery, setTravelSearchQuery] = useState("")
  const [travelHasMore, setTravelHasMore] = useState(initialTravelHasMore)
  const [travelIsLoading, setTravelIsLoading] = useState(false)
  const [travelError, setTravelError] = useState<string | null>(null)

  // 공통 상태
  const [selectedPlace, setSelectedPlace] = useState<Place | TravelPlace | null>(null)
  const [sidebarMode, setSidebarMode] = useState<"browse" | "create">("browse")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [user, setUser] = useState<{ id: string; email?: string } | null>(initialUser)
  const [recommendedPlaces, setRecommendedPlaces] = useState<Place[]>([])

  // 코스 생성 관련 상태
  const [creatingCourses, setCreatingCourses] = useState<
    Array<{
      id: string
      title: string
      description: string
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
  const observerTarget = useRef<HTMLDivElement>(null)

  // 쿼리 파라미터 변경 시 코스 선택 초기화
  useEffect(() => {
    setSelectedDateCourse(null)
    setSelectedTravelCourse(null)
    setSelectedPlace(null)
  }, [courseType])

  // 모바일에서 사이드바 자동 열기 (코스 선택 시)
  useEffect(() => {
    if (isMobile && (selectedDateCourse || selectedTravelCourse)) {
      setIsSidebarOpen(false)
    }
  }, [isMobile, selectedDateCourse, selectedTravelCourse])

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

  const loadRecommendedPlaces = useCallback(async () => {
    try {
      const places = await getCoupleRecommendations({
        preferredTypes: courseType === "date" ? ["CAFE", "FOOD", "VIEW"] : ["VIEW", "MUSEUM"],
        limit: 50,
      })
      setRecommendedPlaces((places || []) as unknown as Place[])
    } catch (error) {
      console.error("Failed to load recommended places:", error)
    }
  }, [courseType])

  useEffect(() => {
    loadRecommendedPlaces()
  }, [loadRecommendedPlaces])

  const handleCourseTypeChange = (type: "date" | "travel") => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("type", type)
    router.push(`/date?${params.toString()}`, { scroll: false })
  }

  const handleDateCourseSelect = (course: DateCourse) => {
    setSelectedDateCourse(course)
    setSelectedTravelCourse(null)
    setSelectedPlace(null)
  }

  const handleTravelCourseSelect = (course: TravelCourse) => {
    setSelectedTravelCourse(course)
    setSelectedDateCourse(null)
    setSelectedPlace(null)
  }

  const handlePlaceClick = (place: Place | TravelPlace) => {
    setSelectedPlace(place)
  }

  const getMapPlaces = () => {
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

      if (searchedPlace) {
        places.push(searchedPlace)
      }

      return places
    }

    if (courseType === "date" && selectedDateCourse) {
      return selectedDateCourse.places.map(p => ({
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

    if (courseType === "travel" && selectedTravelCourse) {
      return selectedTravelCourse.places.map(p => ({
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
    if (courseType === "date" && selectedDateCourse) {
      return selectedDateCourse.places.map(p => ({ lat: p.lat, lng: p.lng }))
    }
    if (courseType === "travel" && selectedTravelCourse) {
      return selectedTravelCourse.places.map(p => ({ lat: p.lat, lng: p.lng }))
    }
    return []
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "CAFE":
        return Coffee
      case "FOOD":
        return Utensils
      case "VIEW":
        return Camera
      default:
        return MapPin
    }
  }

  const filterDateCourses = useCallback(() => {
    let filtered = [...dateCourses]

    if (dateSearchQuery.trim()) {
      filtered = filtered.filter(
        course =>
          course.title.toLowerCase().includes(dateSearchQuery.toLowerCase()) ||
          course.region.toLowerCase().includes(dateSearchQuery.toLowerCase()) ||
          course.description?.toLowerCase().includes(dateSearchQuery.toLowerCase())
      )
    }

    setFilteredDateCourses(filtered)
    setDisplayedDateCourses(filtered.slice(0, ITEMS_PER_PAGE))
    setDateHasMore(filtered.length > ITEMS_PER_PAGE)
    setDatePage(0)
  }, [dateCourses, dateSearchQuery])

  useEffect(() => {
    filterDateCourses()
  }, [filterDateCourses])

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  const selectedCourse = courseType === "date" ? selectedDateCourse : selectedTravelCourse
  const currentCourses = courseType === "date" ? filteredDateCourses : travelCourses
  const currentSearchQuery = courseType === "date" ? dateSearchQuery : travelSearchQuery
  const setCurrentSearchQuery = courseType === "date" ? setDateSearchQuery : setTravelSearchQuery
  const currentError = courseType === "date" ? dateError : travelError
  const currentIsLoading = courseType === "date" ? dateIsLoading : travelIsLoading

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        <div className="w-full h-full relative">
          <NaverMapView
            places={getMapPlaces()}
            path={getMapPath()}
            showSearch={sidebarMode === "create" && selectedCourseId !== null}
            onPlaceClick={place => {
              if (courseType === "date" && selectedDateCourse) {
                const foundPlace = selectedDateCourse.places.find(p => p.id === place.id)
                if (foundPlace) {
                  handlePlaceClick(foundPlace)
                }
              } else if (courseType === "travel" && selectedTravelCourse) {
                const foundPlace = selectedTravelCourse.places.find(p => p.id === place.id)
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
                setTimeout(() => setSearchedPlace(null), 100)
                toast.success("장소가 추가되었습니다")
              }
            }}
          />
          {selectedCourse && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-6 left-6 bg-card border border-border rounded-lg p-4 shadow-lg max-w-sm z-40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2 text-foreground">
                    {selectedCourse.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{selectedCourse.duration}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{selectedCourse.place_count}개 장소</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (courseType === "date") {
                      setSelectedDateCourse(null)
                    } else {
                      setSelectedTravelCourse(null)
                    }
                  }}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
          {courseType === "travel" && selectedTravelCourse && (
            <CourseInfoOverlay
              course={selectedTravelCourse}
              onClose={() => setSelectedTravelCourse(null)}
            />
          )}
        </div>
      </div>

      {/* 코스 타입 전환 버튼 - 우측 상단 */}
      <div
        className={`absolute top-4 right-4 z-10 ${
          isMobile
            ? "flex flex-row gap-2 flex-wrap max-w-[calc(100vw-2rem)]"
            : "flex flex-col gap-3"
        }`}
      >
        <Button
          onClick={() => handleCourseTypeChange("date")}
          size={isMobile ? "sm" : "lg"}
          variant={courseType === "date" ? "default" : "outline"}
          className={`shadow-2xl border-0 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 ${
            isMobile
              ? "px-3 py-2.5 text-xs"
              : "px-6 py-6 h-auto text-base"
          } ${
            courseType === "date"
              ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/30 hover:shadow-primary/40"
              : "bg-background hover:bg-muted text-foreground border-2"
          }`}
          aria-label="데이트 코스 보기"
          aria-pressed={courseType === "date"}
        >
          <Heart className={`${isMobile ? "h-4 w-4" : "h-5 w-5"} mr-2`} />
          {isMobile ? "데이트" : "데이트 코스"}
        </Button>
        <Button
          onClick={() => handleCourseTypeChange("travel")}
          size={isMobile ? "sm" : "lg"}
          variant={courseType === "travel" ? "default" : "outline"}
          className={`shadow-2xl border-0 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 ${
            isMobile
              ? "px-3 py-2.5 text-xs"
              : "px-6 py-6 h-auto text-base"
          } ${
            courseType === "travel"
              ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/30 hover:shadow-primary/40"
              : "bg-background hover:bg-muted text-foreground border-2"
          }`}
          aria-label="여행 코스 보기"
          aria-pressed={courseType === "travel"}
        >
          <Plane className={`${isMobile ? "h-4 w-4" : "h-5 w-5"} mr-2`} />
          {isMobile ? "여행" : "여행 코스"}
        </Button>
        <Button
          onClick={() => setSidebarMode("create")}
          size={isMobile ? "sm" : "lg"}
          className={`shadow-2xl shadow-purple-500/30 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-purple-500/40 ${
            isMobile ? "px-3 py-2.5 text-xs" : "px-6 py-6 h-auto text-base"
          }`}
          aria-label="새 코스 만들기"
        >
          <Plus className={`${isMobile ? "h-4 w-4" : "h-5 w-5"} mr-2`} />
          {isMobile ? "만들기" : "코스 만들기"}
        </Button>
      </div>

      {/* 왼쪽 사이드바 */}
      <motion.div
        className="absolute left-0 top-0 w-full md:w-96 h-full z-40 pointer-events-none"
        initial={false}
        animate={{
          x: isMobile && !isSidebarOpen ? "-100%" : 0,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      >
        <div className="h-full w-full bg-background border-r border-border shadow-xl pointer-events-auto flex flex-col relative">
          {/* 모바일에서 사이드바 닫기 버튼 */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(false)}
              className="absolute top-4 right-4 z-50 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-lg"
              aria-label="사이드바 닫기"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {sidebarMode === "browse" ? (
            <>
              {courseType === "date" ? (
                <>
                  <div className="p-6 border-b border-border bg-card">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Heart className="h-6 w-6 text-primary fill-primary" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-foreground">데이트 코스</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                          당일로 즐길 수 있는 로맨틱한 데이트 코스
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-b border-border bg-muted/30">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="지역명으로 검색..."
                        value={dateSearchQuery}
                        onChange={e => setDateSearchQuery(e.target.value)}
                        className="pl-10 pr-4 h-11 bg-background"
                      />
                    </div>
                  </div>

                  {dateError && (
                    <div className="p-4 border-b border-border">
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{dateError}</AlertDescription>
                      </Alert>
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto min-h-0">
                    <div className="p-4 pb-16">
                      {dateIsLoading ? (
                        <div className="flex items-center justify-center h-full min-h-[400px]">
                          <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">
                              데이트 코스를 불러오는 중...
                            </p>
                          </div>
                        </div>
                      ) : displayedDateCourses.length === 0 ? (
                        <div className="text-center py-16">
                          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                            <Heart className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <p className="text-base font-semibold text-foreground mb-1">
                            검색 결과가 없습니다
                          </p>
                          <p className="text-sm text-muted-foreground">다른 키워드로 검색해보세요</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <AnimatePresence>
                            {displayedDateCourses.map(course => (
                              <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Card
                                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50 ${
                                    selectedDateCourse?.id === course.id
                                      ? "ring-2 ring-primary border-primary"
                                      : "border-border hover:border-primary/30"
                                  }`}
                                  onClick={() => handleDateCourseSelect(course)}
                                >
                                  <CardContent className="p-4">
                                    {course.image_url && (
                                      <div className="relative w-full h-36 mb-3 rounded-lg overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10" />
                                        <Image
                                          src={course.image_url}
                                          alt={course.title}
                                          fill
                                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute bottom-2 left-2 right-2 z-20">
                                          <Badge className="bg-background/80 backdrop-blur-sm text-foreground border-0">
                                            {course.region}
                                          </Badge>
                                        </div>
                                      </div>
                                    )}
                                    <div className="space-y-2">
                                      <h3 className="font-semibold text-base line-clamp-1 text-foreground">
                                        {course.title}
                                      </h3>
                                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                          <Clock className="h-3.5 w-3.5" />
                                          <span>{course.duration}</span>
                                        </div>
                                        <span>•</span>
                                        <div className="flex items-center gap-1">
                                          <MapPin className="h-3.5 w-3.5" />
                                          <span>{course.place_count}개 장소</span>
                                        </div>
                                      </div>
                                      {course.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                          {course.description}
                                        </p>
                                      )}
                                      <div className="flex items-center justify-between pt-2 border-t border-border">
                                        <Badge variant="secondary" className="text-xs">
                                          {course.region}
                                        </Badge>
                                        <div className="flex items-center gap-1 text-primary">
                                          <ChevronRight className="h-5 w-5" />
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 flex-wrap pt-2">
                                        {course.places.slice(0, 3).map(place => {
                                          const Icon = getTypeIcon(place.type)
                                          return (
                                            <Badge key={place.id} variant="outline" className="text-xs">
                                              <Icon className="h-3 w-3 mr-1" />
                                              {place.type}
                                            </Badge>
                                          )
                                        })}
                                        {course.places.length > 3 && (
                                          <Badge variant="outline" className="text-xs">
                                            +{course.places.length - 3}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                          {!dateSearchQuery.trim() && dateHasMore && (
                            <div ref={observerTarget} className="h-4" />
                          )}
                          {dateIsLoadingMore && (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <TravelSidebar
                  courses={travelCourses}
                  searchQuery={travelSearchQuery}
                  onSearchChange={setTravelSearchQuery}
                  selectedCourse={selectedTravelCourse}
                  onCourseSelect={handleTravelCourseSelect}
                  isLoading={travelIsLoading}
                  error={travelError}
                />
              )}
            </>
          ) : (
            <div className="flex-1 overflow-y-auto min-h-0 relative">
              {/* 모바일에서 사이드바 닫기 버튼 (코스 만들기 모드) */}
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsSidebarOpen(false)
                    setSidebarMode("browse")
                  }}
                  className="absolute top-4 right-4 z-50 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-lg"
                  aria-label="사이드바 닫기"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <div className="p-4 pb-16">
                <div className="flex items-center gap-3 mb-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSidebarMode("browse")
                      setSelectedCourseId(null)
                      setCreatingCourses([])
                    }}
                    className="h-9 w-9 p-0"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-xl font-bold text-foreground">코스 만들기</h2>
                </div>

                {selectedCourseId === null ? (
                  <div className="space-y-4">
                    <Button
                      onClick={() => {
                        const newCourseId = `new-${Date.now()}`
                        setCreatingCourses([
                          ...creatingCourses,
                          {
                            id: newCourseId,
                            title: "",
                            description: "",
                            places: [],
                          },
                        ])
                        setSelectedCourseId(newCourseId)
                      }}
                      className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      새 코스 만들기
                    </Button>

                    {creatingCourses.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">진행 중인 코스</Label>
                        {creatingCourses.map(course => (
                          <Card
                            key={course.id}
                            className="cursor-pointer hover:border-primary/50 transition-colors"
                            onClick={() => setSelectedCourseId(course.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-semibold text-sm">
                                    {course.title || "제목 없음"}
                                  </h3>
                                  <p className="text-xs text-muted-foreground">
                                    {course.places.length}개 장소
                                  </p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  (() => {
                    const selectedCourse = creatingCourses.find(c => c.id === selectedCourseId)
                    if (!selectedCourse) return null

                    return (
                      <div className="space-y-4">
                        <Card className="border border-border">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                {courseType === "date" ? (
                                  <Heart className="h-4 w-4 text-primary" />
                                ) : (
                                  <Plane className="h-4 w-4 text-primary" />
                                )}
                              </div>
                              코스 정보 입력
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-5 space-y-4">
                            <div>
                              <Label htmlFor="course-title" className="text-sm font-semibold mb-2">
                                코스 제목
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
                                placeholder={
                                  courseType === "date"
                                    ? "예: 서울 데이트 코스"
                                    : "예: 제주도 2박 3일 여행"
                                }
                                className="h-11"
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor="course-description"
                                className="text-sm font-semibold mb-2"
                              >
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
                                className="h-11"
                              />
                            </div>
                          </CardContent>
                        </Card>

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
                                setTimeout(() => setSearchedPlace(null), 100)
                                toast.success("장소가 추가되었습니다")
                              }}
                              placeholder="장소명 또는 주소를 입력하세요"
                            />
                          </CardContent>
                        </Card>

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
                            <CardContent className="pt-5">
                              <div className="space-y-3">
                                {selectedCourse.places.map((place, index) => (
                                  <div
                                    key={place.id}
                                    className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                                  >
                                    <div className="flex items-center gap-2">
                                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm font-semibold w-6 text-center p-1 rounded bg-primary text-primary-foreground">
                                        {index + 1}
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
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

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

                                const today = new Date()
                                const endDate =
                                  courseType === "travel"
                                    ? new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)
                                    : today

                                const response = await fetch("/api/travel-plans", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    title: selectedCourse.title,
                                    destination: destination,
                                    description: selectedCourse.description,
                                    start_date: today.toISOString().split("T")[0],
                                    end_date: endDate.toISOString().split("T")[0],
                                    total_budget: 0,
                                    course_type: courseType,
                                    places: selectedCourse.places.map((p, index) => ({
                                      place_id: p.id,
                                      day_number: courseType === "travel" ? Math.floor(index / Math.ceil(selectedCourse.places.length / 3)) + 1 : 1,
                                      order_index: index,
                                    })),
                                    budget_items: [],
                                  }),
                                })

                                if (!response.ok) {
                                  const errorData = await response.json().catch(() => ({}))
                                  throw new Error(errorData.error || "저장에 실패했습니다")
                                }

                                toast.success(
                                  courseType === "date"
                                    ? "데이트 코스가 저장되었습니다!"
                                    : "여행 코스가 저장되었습니다!"
                                )
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
                            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground border-0 rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.02] font-semibold h-12 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        <div className="h-4" />
                      </div>
                    )
                  })()
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {selectedPlace && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-0 left-0 right-0 md:absolute md:bottom-6 md:right-6 md:left-auto md:w-96 z-50"
        >
          <Card className="m-4 lg:m-0 shadow-2xl shadow-primary/20 border-2 border-primary/30 dark:border-primary/40 bg-gradient-to-br from-white via-primary/10 to-primary/5 dark:from-gray-900 dark:via-primary/20 dark:to-primary/10 backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 border-b border-primary/20 dark:border-primary/30">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl flex items-center gap-3 mb-2 text-gray-900 dark:text-white">
                    {(() => {
                      const Icon = getTypeIcon(selectedPlace.type)
                      return (
                        <div className="p-2 rounded-xl bg-primary shadow-lg">
                          <Icon className="h-5 w-5 text-primary-foreground" />
                        </div>
                      )
                    })()}
                    {selectedPlace.name}
                  </CardTitle>
                  <CardDescription className="mt-1 text-primary/70 dark:text-primary/80 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {selectedPlace.address || "주소 정보 없음"}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPlace(null)}
                  className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 text-primary dark:text-primary"
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              {selectedPlace.image_url && (
                <div className="relative w-full h-56 mb-5 rounded-2xl overflow-hidden shadow-lg group">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10" />
                  <Image
                    src={selectedPlace.image_url}
                    alt={selectedPlace.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge
                    variant="outline"
                    className="border-primary/30 dark:border-primary/40 text-primary dark:text-primary bg-primary/10 dark:bg-primary/20"
                  >
                    {selectedPlace.type}
                  </Badge>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/30">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                      {(selectedPlace.rating ?? 0).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30">
                    <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                      {"💰".repeat(selectedPlace.price_level ?? 0) || "💰"}
                    </span>
                  </div>
                </div>
                {selectedPlace.description && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-4">
                    {selectedPlace.description}
                  </p>
                )}
                {selectedPlace.phone && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/10 dark:bg-primary/20 border border-primary/30 dark:border-primary/40">
                    <span className="text-sm font-semibold text-primary dark:text-primary">
                      전화:
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {selectedPlace.phone}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
      
      {/* 모바일에서 사이드바 열기 버튼 */}
      {isMobile && !isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute bottom-6 left-6 z-50"
        >
          <Button
            onClick={() => setIsSidebarOpen(true)}
            size="lg"
            className="shadow-2xl bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-14 w-14 p-0"
            aria-label="사이드바 열기"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </motion.div>
      )}
    </div>
  )
}

