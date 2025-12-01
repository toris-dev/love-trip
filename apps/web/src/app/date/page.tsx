"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@lovetrip/ui/components/button"
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
  Heart,
  Camera,
  Coffee,
  Utensils,
  AlertCircle,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { createClient } from "@lovetrip/api/supabase/client"
import { getCoupleRecommendations } from "@lovetrip/recommendation/services"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import dynamic from "next/dynamic"
import type { Database } from "@lovetrip/shared/types/database"

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
  duration: string // "당일 코스"
  total_distance_km?: number | null
  max_distance_km?: number | null
}

export default function DatePage() {
  const [courses, setCourses] = useState<DateCourse[]>([])
  const [filteredCourses, setFilteredCourses] = useState<DateCourse[]>([])
  const [displayedCourses, setDisplayedCourses] = useState<DateCourse[]>([])
  const [selectedCourse, setSelectedCourse] = useState<DateCourse | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [recommendedPlaces, setRecommendedPlaces] = useState<Place[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const observerTarget = useRef<HTMLDivElement>(null)

  // area_code 또는 address에서 지역명 추출
  const extractRegion = (place: Place): string => {
    // area_code를 우선적으로 사용 (더 정확함)
    if (place.area_code) {
      const regionMap: Record<number, string> = {
        1: "서울",
        2: "인천",
        3: "대전",
        4: "대구",
        5: "광주",
        6: "부산",
        7: "울산",
        8: "세종",
        31: "경기",
        32: "강원",
        33: "충북",
        34: "충남",
        35: "경북",
        36: "경남",
        37: "전북",
        38: "전남",
        39: "제주",
      }
      if (regionMap[place.area_code]) {
        return regionMap[place.area_code]
      }
    }

    // area_code가 없으면 address 파싱
    const address = place.address
    if (!address) return "기타"

    const match = address.match(
      /^(서울특별시|부산광역시|대구광역시|인천광역시|광주광역시|대전광역시|울산광역시|세종특별자치시|경기도|강원특별자치도|충청북도|충청남도|전북특별자치도|전라북도|전라남도|경상북도|경상남도|제주특별자치도)/
    )
    if (match) {
      const region = match[1]
      if (region.includes("서울")) return "서울"
      if (region.includes("제주")) return "제주"
      if (region.includes("부산")) return "부산"
      if (region.includes("경주")) return "경주"
      if (region.includes("전주")) return "전주"
      if (region.includes("여수")) return "여수"
      if (region.includes("강릉")) return "강릉"
      if (region.includes("속초")) return "속초"
      if (region.includes("춘천")) return "춘천"
      return region.replace(/특별시|광역시|특별자치시|도|특별자치도/g, "").trim()
    }

    const firstWord = address.split(" ")[0]
    return firstWord || "기타"
  }

  // 데이트 코스를 지역별로 그룹화하고 당일 코스 생성 (최대 3-4개 장소)
  // 각 지역에서 여러 개의 코스를 생성할 수 있도록 개선
  const groupDateCoursesByRegion = useCallback((places: Place[]): DateCourse[] => {
    const grouped: { [key: string]: Place[] } = {}
    places.forEach(place => {
      const region = extractRegion(place)
      if (!grouped[region]) {
        grouped[region] = []
      }
      grouped[region].push(place)
    })

    const courses: DateCourse[] = []

    // 각 지역별로 여러 개의 당일 코스 생성
    Object.entries(grouped).forEach(([region, regionPlaces]) => {
      if (regionPlaces.length < 2) return // 최소 2개 장소 필요

      // 코스당 3-4개 장소로 구성, 지역에 장소가 많으면 여러 코스 생성
      const placesPerCourse = 4
      const maxCoursesPerRegion = Math.min(10, Math.floor(regionPlaces.length / 2)) // 지역당 최대 10개 코스

      for (let i = 0; i < maxCoursesPerRegion; i++) {
        const startIdx = i * placesPerCourse
        const endIdx = Math.min(startIdx + placesPerCourse, regionPlaces.length)
        const coursePlaces = regionPlaces.slice(startIdx, endIdx)

        if (coursePlaces.length < 2) break // 최소 2개 장소 필요

        courses.push({
          id: `date-${region}-${i + 1}`,
          title: `${region} 데이트 코스 ${i + 1 > 1 ? `#${i + 1}` : ""}`.trim(),
          region,
          description: `${region}의 카페, 맛집, 전망대를 포함한 당일 데이트 코스입니다.`,
          image_url: coursePlaces.find(p => p.image_url)?.image_url || null,
          place_count: coursePlaces.length,
          places: coursePlaces,
          duration: "당일 코스",
        })
      }
    })

    return courses
  }, [])

  const loadRecommendedPlaces = useCallback(async () => {
    try {
      // 추천 장소 로드 (여러 개)
      const places = await getCoupleRecommendations({
        preferredTypes: ["CAFE", "FOOD", "VIEW"],
        limit: 50, // 여러 개의 추천 장소
      })
      setRecommendedPlaces((places || []) as unknown as Place[])
    } catch (error) {
      console.error("Failed to load recommended places:", error)
    }
  }, [])

  const loadCourses = useCallback(
    async (pageNum: number = 0, append: boolean = false) => {
      if (append) {
        setIsLoadingMore(true)
      } else {
        setIsLoading(true)
        setPage(0)
      }
      setError(null)
      try {
        // DB에서 데이트 코스 가져오기 (페이지네이션)
        const supabase = createClient()
        const from = pageNum * ITEMS_PER_PAGE
        const to = from + ITEMS_PER_PAGE - 1

        const {
          data: dateCoursesData,
          error: coursesError,
          count,
        } = await supabase
          .from("date_courses")
          .select("*", { count: "exact" })
          .order("region", { ascending: true })
          .order("created_at", { ascending: false })
          .range(from, to)

        if (coursesError) {
          throw coursesError
        }

        // 더 불러올 데이터가 있는지 확인
        const totalCount = count || 0
        setHasMore(to < totalCount - 1)

        if (!dateCoursesData || dateCoursesData.length === 0) {
          if (pageNum === 0) {
            // DB에 코스가 없으면 기존 방식 사용 (fallback)
            console.warn(
              "DB에 데이트 코스가 없습니다. Python 스크립트를 실행하여 코스를 생성하세요."
            )
            const datePlaces = await getCoupleRecommendations({
              preferredTypes: ["CAFE", "FOOD", "VIEW"],
              limit: 1000,
            })
            const dateCourses = groupDateCoursesByRegion((datePlaces || []) as unknown as Place[])
            setCourses(dateCourses)
            setFilteredCourses(dateCourses)
            setDisplayedCourses(dateCourses.slice(0, ITEMS_PER_PAGE))
            setHasMore(dateCourses.length > ITEMS_PER_PAGE)
          }
          return
        }

        // 각 코스의 장소 정보 가져오기
        const coursesWithPlaces = await Promise.all(
          dateCoursesData.map(async course => {
            const { data: placesData, error: placesError } = await supabase
              .from("date_course_places")
              .select("place_id, order_index, distance_from_previous_km, visit_duration_minutes")
              .eq("date_course_id", course.id)
              .order("order_index", { ascending: true })

            if (placesError) {
              const errorInfo = {
                message: placesError?.message || "Unknown error",
                details: placesError?.details || "No details",
                hint: placesError?.hint || "No hint",
                code: placesError?.code || "No code",
                courseId: course.id,
              }
              console.error("장소 정보 가져오기 실패:", JSON.stringify(errorInfo, null, 2))
              return null
            }

            const placeIds = placesData?.map(p => p.place_id) || []
            if (placeIds.length === 0) {
              console.warn(`코스 ${course.id}에 장소가 없습니다.`)
              return null
            }

            const { data: places, error: placesDetailError } = await supabase
              .from("places")
              .select("*")
              .in("id", placeIds)

            if (placesDetailError) {
              const errorInfo = {
                message: placesDetailError?.message || "Unknown error",
                details: placesDetailError?.details || "No details",
                hint: placesDetailError?.hint || "No hint",
                code: placesDetailError?.code || "No code",
                courseId: course.id,
                placeIds: placeIds,
              }
              console.error("장소 상세 정보 가져오기 실패:", JSON.stringify(errorInfo, null, 2))
              return null
            }

            if (!places || places.length === 0) {
              console.warn(`코스 ${course.id}에 장소 상세 정보가 없습니다.`)
              return null
            }

            const sortedPlaces =
              placesData
                ?.map(cp => {
                  const place = places.find(p => p.id === cp.place_id)
                  return place ? { ...place, order_index: cp.order_index } : null
                })
                .filter((p): p is Place & { order_index: number } => p !== null)
                .sort((a, b) => a.order_index - b.order_index) || []

            return {
              id: course.id,
              title: course.title,
              region: course.region,
              description: course.description || "",
              image_url: course.image_url,
              place_count: course.place_count,
              places: sortedPlaces,
              duration: course.duration,
              total_distance_km: course.total_distance_km,
              max_distance_km: course.max_distance_km,
            } as DateCourse
          })
        )

        const validCourses = coursesWithPlaces.filter((c): c is DateCourse => c !== null)

        if (append) {
          setCourses(prev => [...prev, ...validCourses])
          setFilteredCourses(prev => [...prev, ...validCourses])
          setDisplayedCourses(prev => [...prev, ...validCourses])
        } else {
          setCourses(validCourses)
          setFilteredCourses(validCourses)
          setDisplayedCourses(validCourses)
        }
      } catch (error) {
        console.error("Failed to load courses:", error)
        setError(error instanceof Error ? error.message : "코스를 불러오는 중 오류가 발생했습니다.")
      } finally {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    },
    [groupDateCoursesByRegion]
  )

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      loadCourses(nextPage, true)
    }
  }, [page, isLoadingMore, hasMore, loadCourses])

  const filterCourses = useCallback(() => {
    let filtered = [...courses]

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        course =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredCourses(filtered)
    // 검색 시에는 처음부터 다시 표시
    setDisplayedCourses(filtered.slice(0, ITEMS_PER_PAGE))
    setHasMore(filtered.length > ITEMS_PER_PAGE)
    setPage(0)
  }, [courses, searchQuery])

  useEffect(() => {
    loadCourses(0, false)
    loadRecommendedPlaces()
  }, [loadCourses, loadRecommendedPlaces])

  useEffect(() => {
    filterCourses()
  }, [filterCourses])

  // Intersection Observer로 무한 스크롤 구현
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !searchQuery.trim()) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [hasMore, isLoadingMore, searchQuery, loadMore])

  const handleCourseSelect = (course: DateCourse) => {
    setSelectedCourse(course)
    setSelectedPlace(null)
  }

  const handlePlaceClick = (place: Place) => {
    setSelectedPlace(place)
  }

  const getMapPlaces = () => {
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

  return (
    <div className="fixed inset-0 w-full h-full">
      {/* 지도 영역 - 전체 화면 */}
      <div className="absolute inset-0 w-full h-full">
        <div className="w-full h-full relative">
          <NaverMapView
            places={getMapPlaces()}
            path={getMapPath()}
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
          />
          {selectedCourse && (
            <div className="absolute top-20 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-lg p-4 shadow-lg max-w-sm z-40">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    {selectedCourse.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{selectedCourse.duration}</span>
                    <span>•</span>
                    <MapPin className="h-4 w-4" />
                    <span>{selectedCourse.place_count}개 장소</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCourse(null)}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 왼쪽 사이드바 - 반투명 오버레이 */}
      <div className="absolute top-16 left-0 bottom-0 w-full md:w-96 z-50 pointer-events-none">
        <div className="h-full w-full md:w-96 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-r border-black/10 dark:border-white/10 shadow-xl pointer-events-auto overflow-hidden flex flex-col">
          {/* 사이드바 헤더 */}
          <div className="p-4 border-b border-black/10 dark:border-white/10">
            <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              데이트 코스
            </h1>
            <p className="text-sm text-muted-foreground">
              당일로 즐길 수 있는 데이트 코스를 탐색하고 계획해보세요
            </p>
          </div>

          {/* 검색 바 */}
          <div className="p-4 border-b border-black/10 dark:border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="지역명으로 검색..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 border-b border-black/10 dark:border-white/10">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* 코스 목록 */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">로딩 중...</p>
                </div>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>검색 결과가 없습니다</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {(searchQuery.trim() ? filteredCourses : displayedCourses).map(course => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedCourse?.id === course.id ? "ring-2 ring-primary shadow-md" : ""
                        }`}
                        onClick={() => handleCourseSelect(course)}
                      >
                        <CardContent className="p-4">
                          {course.image_url && (
                            <div className="relative w-full h-32 mb-3 rounded-lg overflow-hidden">
                              <Image
                                src={course.image_url}
                                alt={course.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <h3 className="font-semibold mb-1 line-clamp-1 flex items-center gap-2">
                            <Heart className="h-4 w-4 text-primary" />
                            {course.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <Clock className="h-3 w-3" />
                            <span>{course.duration}</span>
                            <span>•</span>
                            <MapPin className="h-3 w-3" />
                            <span>{course.place_count}개 장소</span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {course.description}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <Badge variant="secondary" className="text-xs">
                              {course.region}
                            </Badge>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                          {/* 장소 타입 아이콘 미리보기 */}
                          <div className="mt-2 flex items-center gap-1 flex-wrap">
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
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {/* 무한 스크롤 트리거 */}
                {!searchQuery.trim() && hasMore && (
                  <div ref={observerTarget} className="flex justify-center py-4">
                    {isLoadingMore && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">더 불러오는 중...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 선택된 장소 상세 정보 (모바일 하단, 데스크톱 오른쪽) */}
      {selectedPlace && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-0 left-0 right-0 md:absolute md:bottom-6 md:right-6 md:left-auto md:w-96 z-50"
        >
          <Card className="m-4 lg:m-0 shadow-2xl">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {(() => {
                      const Icon = getTypeIcon(selectedPlace.type)
                      return <Icon className="h-5 w-5 text-primary" />
                    })()}
                    {selectedPlace.name}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {selectedPlace.address || "주소 정보 없음"}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPlace(null)}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {selectedPlace.image_url && (
                <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                  <Image
                    src={selectedPlace.image_url}
                    alt={selectedPlace.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{selectedPlace.type}</Badge>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{(selectedPlace.rating ?? 0).toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm">💰</span>
                    <span className="text-sm">{"💰".repeat(selectedPlace.price_level ?? 0)}</span>
                  </div>
                </div>
                {selectedPlace.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {selectedPlace.description}
                  </p>
                )}
                {selectedPlace.phone && (
                  <p className="text-sm">
                    <span className="font-medium">전화:</span> {selectedPlace.phone}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
