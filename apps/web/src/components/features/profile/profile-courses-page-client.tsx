"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@lovetrip/ui/components/button"
import { ArrowLeft, X, Heart, Plane } from "lucide-react"
import { toast } from "sonner"
import {
  Card,
  CardContent,
} from "@lovetrip/ui/components/card"
import { Input } from "@lovetrip/ui/components/input"
import { Badge } from "@lovetrip/ui/components/badge"
import { Alert, AlertDescription } from "@lovetrip/ui/components/alert"
import { Switch } from "@lovetrip/ui/components/switch"
import { Label } from "@lovetrip/ui/components/label"
import {
  Search,
  MapPin,
  Clock,
  AlertCircle,
  ChevronRight,
  Loader2,
  Coffee,
  Utensils,
  Camera,
} from "lucide-react"
import { createClient } from "@lovetrip/api/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import dynamic from "next/dynamic"
import type { Database } from "@lovetrip/shared/types/database"
import {
  TravelSidebar,
  CourseInfoOverlay,
  type Place as TravelPlace,
  type TravelCourse,
} from "@lovetrip/planner/components/travel"

const NaverMapView = dynamic(() => import("@/components/shared/naver-map-view"), { ssr: false })

const ITEMS_PER_PAGE = 10

import type { Place } from "@lovetrip/shared/types/course"

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
  is_public?: boolean
}

interface ProfileCoursesPageClientProps {
  initialDateCourses: DateCourse[]
  initialDateHasMore: boolean
  initialDateTotalCount: number
  initialTravelCourses: TravelCourse[]
  initialTravelHasMore: boolean
  initialTravelTotalCount: number
  initialCourseType: "date" | "travel"
  user: { id: string; email?: string } | null
}

export function ProfileCoursesPageClient({
  initialDateCourses,
  initialDateHasMore,
  initialDateTotalCount,
  initialTravelCourses,
  initialTravelHasMore,
  initialTravelTotalCount,
  initialCourseType,
  user: initialUser,
}: ProfileCoursesPageClientProps) {
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [user, setUser] = useState<{ id: string; email?: string } | null>(initialUser)
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

  const handleCourseTypeChange = (type: "date" | "travel") => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("type", type)
    router.push(`/profile/date?${params.toString()}`, { scroll: false })
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

    return []
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
            showSearch={false}
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

      {/* 뒤로가기 버튼 */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.push("/profile")}
        className="absolute top-4 left-4 z-50 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-lg"
        aria-label="프로필로 돌아가기"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

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
        <div className="h-full w-full bg-background border-r border-border shadow-xl pointer-events-auto flex flex-col relative overflow-hidden">
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
          {courseType === "date" ? (
            <>
              <div className="p-6 border-b border-border bg-card">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Heart className="h-6 w-6 text-primary fill-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">내 데이트 코스</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                      내가 등록한 데이트 코스
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
                        등록한 코스가 없습니다
                      </p>
                      <p className="text-sm text-muted-foreground">
                        코스를 등록하면 여기에 표시됩니다
                      </p>
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
                                    <div className="flex items-center gap-2">
                                      <Badge variant="secondary" className="text-xs">
                                        {course.region}
                                      </Badge>
                                      <Badge
                                        variant={course.is_public ? "default" : "outline"}
                                        className="text-xs"
                                      >
                                        {course.is_public ? "공개" : "비공개"}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-1 text-primary">
                                      <ChevronRight className="h-5 w-5" />
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center gap-2">
                                      <Label htmlFor={`public-${course.id}`} className="text-xs">
                                        공개 설정
                                      </Label>
                                      <Switch
                                        id={`public-${course.id}`}
                                        checked={course.is_public || false}
                                        onCheckedChange={async checked => {
                                          try {
                                            const response = await fetch(
                                              `/api/user-courses/${course.id}`,
                                              {
                                                method: "PUT",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({ isPublic: checked }),
                                              }
                                            )

                                            if (!response.ok) {
                                              throw new Error("공개 상태 변경에 실패했습니다")
                                            }

                                            // 상태 업데이트
                                            setDateCourses(
                                              dateCourses.map(c =>
                                                c.id === course.id ? { ...c, is_public: checked } : c
                                              )
                                            )
                                            setFilteredDateCourses(
                                              filteredDateCourses.map(c =>
                                                c.id === course.id
                                                  ? { ...c, is_public: checked }
                                                  : c
                                              )
                                            )
                                            setDisplayedDateCourses(
                                              displayedDateCourses.map(c =>
                                                c.id === course.id
                                                  ? { ...c, is_public: checked }
                                                  : c
                                              )
                                            )

                                            if (selectedDateCourse?.id === course.id) {
                                              setSelectedDateCourse({
                                                ...selectedDateCourse,
                                                is_public: checked,
                                              })
                                            }

                                            toast.success(
                                              checked ? "코스가 공개되었습니다!" : "코스가 비공개되었습니다!"
                                            )
                                          } catch (error) {
                                            toast.error(
                                              error instanceof Error
                                                ? error.message
                                                : "공개 상태 변경에 실패했습니다"
                                            )
                                          }
                                        }}
                                      />
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
        </div>
      </motion.div>
    </div>
  )
}

