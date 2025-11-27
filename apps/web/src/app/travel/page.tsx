"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, MapPin, Star, Plane, AlertCircle, Calendar, ChevronRight } from "lucide-react"
import { getCoupleRecommendations } from "@/lib/services/recommendation-service"
import { createClient } from "@/lib/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import dynamic from "next/dynamic"
import type { Database } from "@/lib/types/database"

const NaverMapView = dynamic(() => import("@/components/naver-map-view"), { ssr: false })

type Place = Database["public"]["Tables"]["places"]["Row"] & {
  type: "CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC"
}

type TravelCourse = {
  id: string
  title: string
  region: string
  description?: string
  image_url?: string | null
  place_count: number
  places: Place[]
  duration: string // "1박2일", "2박3일" 등
}

export default function TravelPage() {
  const [courses, setCourses] = useState<TravelCourse[]>([])
  const [filteredCourses, setFilteredCourses] = useState<TravelCourse[]>([])
  const [selectedCourse, setSelectedCourse] = useState<TravelCourse | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)

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

  // 여행 코스를 지역별로 그룹화하고 1박2일 이상 코스 생성
  const groupTravelCoursesByRegion = useCallback((places: Place[]): TravelCourse[] => {
    const grouped: { [key: string]: Place[] } = {}
    places.forEach(place => {
      const region = extractRegion(place)
      if (!grouped[region]) {
        grouped[region] = []
      }
      grouped[region].push(place)
    })

    // 각 지역별로 최소 1박2일 코스 생성 (최소 4개 장소 이상)
    return Object.entries(grouped)
      .filter(([, places]) => places.length >= 4) // 최소 4개 장소로 1박2일 코스 구성
      .map(([region, places]) => {
        const placeCount = places.length
        // 장소 개수에 따라 일정 결정 (4-6개: 1박2일, 7-10개: 2박3일, 11개 이상: 3박4일)
        let duration = "1박2일"
        if (placeCount >= 11) {
          duration = "3박4일"
        } else if (placeCount >= 7) {
          duration = "2박3일"
        }

        return {
          id: `travel-${region}`,
          title: `${region} 여행 코스`,
          region,
          description: `${region}의 관광지와 문화시설을 포함한 ${duration} 여행 코스입니다.`,
          image_url: places.find(p => p.image_url)?.image_url || null,
          place_count: placeCount,
          places,
          duration,
        }
      })
  }, [])

  const loadCourses = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // DB의 travel_courses 테이블에서 직접 가져오기
      const supabase = createClient()
      const { data: coursesData, error: coursesError } = await supabase
        .from("travel_courses")
        .select(
          `
          *,
          travel_course_places (
            order_index,
            day_number,
            distance_from_previous_km,
            visit_duration_minutes,
            places (*)
          )
        `
        )
        .order("region")

      if (coursesError) {
        console.error("Failed to load travel courses:", coursesError)
        // Fallback: 기존 방식 사용
        const travelPlaces = await getCoupleRecommendations({
          preferredTypes: ["VIEW", "MUSEUM"],
          limit: 500,
        })
        const travelCourses = groupTravelCoursesByRegion((travelPlaces || []) as unknown as Place[])
        setCourses(travelCourses)
        setFilteredCourses(travelCourses)
        return
      }

      // DB 데이터를 TravelCourse 형식으로 변환
      type CourseWithPlaces = Database["public"]["Tables"]["travel_courses"]["Row"] & {
        travel_course_places: Array<{
          day_number: number
          order_index: number
          places: Place | null
        }>
      }

      const travelCourses: TravelCourse[] = ((coursesData as CourseWithPlaces[]) || [])
        .filter(course => course.place_count > 0) // 장소가 있는 코스만
        .map(course => {
          // travel_course_places를 day_number와 order_index 순으로 정렬
          const sortedPlaces = (course.travel_course_places || [])
            .sort((a, b) => {
              if (a.day_number !== b.day_number) {
                return a.day_number - b.day_number
              }
              return a.order_index - b.order_index
            })
            .map(tcp => tcp.places)
            .filter((p): p is Place => p !== null)

          return {
            id: course.id,
            title: course.title,
            region: course.region,
            description: course.description || undefined,
            image_url: course.image_url,
            place_count: course.place_count,
            places: sortedPlaces,
            duration: course.duration,
          }
        })

      setCourses(travelCourses)
      setFilteredCourses(travelCourses)
    } catch (error) {
      console.error("Failed to load courses:", error)
      setError(error instanceof Error ? error.message : "코스를 불러오는 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }, [groupTravelCoursesByRegion])

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
  }, [courses, searchQuery])

  useEffect(() => {
    loadCourses()
  }, [loadCourses])

  useEffect(() => {
    filterCourses()
  }, [filterCourses])

  const handleCourseSelect = (course: TravelCourse) => {
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
    return []
  }

  const getMapPath = () => {
    if (selectedCourse) {
      return selectedCourse.places.map(p => ({ lat: p.lat, lng: p.lng }))
    }
    return []
  }

  return (
    <div className="container mx-auto px-4 py-6 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Plane className="h-8 w-8 text-primary" />
          여행 코스
        </h1>
        <p className="text-muted-foreground">1박2일 이상의 여행 코스를 탐색하고 계획해보세요</p>
      </div>

      {/* 검색 바 */}
      <div className="mb-6">
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
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 메인 레이아웃: 지도 75% + 코스 목록 25% */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 지도 영역 - 75% (lg:col-span-3) */}
        <div className="lg:col-span-3 order-2 lg:order-1">
          <Card className="h-[calc(100vh-200px)] lg:h-[calc(100vh-150px)]">
            <CardContent className="p-0 h-full">
              {selectedCourse ? (
                <div className="h-full relative">
                  <NaverMapView
                    places={getMapPlaces()}
                    path={getMapPath()}
                    onPlaceClick={place => {
                      const foundPlace = selectedCourse.places.find(p => p.id === place.id)
                      if (foundPlace) {
                        handlePlaceClick(foundPlace)
                      }
                    }}
                  />
                  {/* 선택된 코스 정보 오버레이 */}
                  <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-lg mb-1">{selectedCourse.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
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
                </div>
              ) : (
                <div className="h-full flex items-center justify-center bg-muted/50">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">여행 코스를 선택해주세요</p>
                    <p className="text-sm mt-2">
                      오른쪽 목록에서 코스를 선택하면 지도에 표시됩니다
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 코스 목록 영역 - 25% (lg:col-span-1) */}
        <div className="lg:col-span-1 order-1 lg:order-2">
          <Card className="h-[calc(100vh-200px)] lg:h-[calc(100vh-150px)] overflow-hidden flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="text-lg">여행 코스 목록</CardTitle>
              <CardDescription>{filteredCourses.length}개의 코스</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4">
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
                    {filteredCourses.map(course => (
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
                            <h3 className="font-semibold mb-1 line-clamp-1">{course.title}</h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                              <Calendar className="h-3 w-3" />
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
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 선택된 장소 상세 정보 (모바일 하단, 데스크톱 사이드) */}
      {selectedPlace && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-0 left-0 right-0 lg:absolute lg:bottom-6 lg:right-6 lg:left-auto lg:w-96 z-50"
        >
          <Card className="m-4 lg:m-0 shadow-2xl">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{selectedPlace.name}</CardTitle>
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
