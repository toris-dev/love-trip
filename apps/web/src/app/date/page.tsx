"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  Navigation,
  ChevronRight,
} from "lucide-react"
import { getCoupleRecommendations } from "@/lib/services/recommendation-service"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import dynamic from "next/dynamic"
import type { Database } from "@/lib/types/database"

const NaverMapView = dynamic(() => import("@/components/naver-map-view"), { ssr: false })

type Place = Database["public"]["Tables"]["places"]["Row"]

type DateCourse = {
  id: string
  title: string
  region: string
  description?: string
  image_url?: string | null
  place_count: number
  places: Place[]
  duration: string // "당일 코스"
}

export default function DatePage() {
  const [courses, setCourses] = useState<DateCourse[]>([])
  const [filteredCourses, setFilteredCourses] = useState<DateCourse[]>([])
  const [selectedCourse, setSelectedCourse] = useState<DateCourse | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)

  // 주소에서 지역명 추출
  const extractRegion = (address: string | undefined | null): string => {
    if (!address) return "지역 정보 없음"

    const match = address.match(
      /^(서울특별시|부산광역시|대구광역시|인천광역시|광주광역시|대전광역시|울산광역시|세종특별자치시|경기도|강원특별자치도|충청북도|충청남도|전북특별자치도|전라북도|전라남도|경상북도|경상남도|제주특별자치도)/
    )
    if (match) {
      const region = match[1]
      if (region.includes("서울")) return "서울"
      if (region.includes("제주")) return "제주도"
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
    return firstWord || "지역 정보 없음"
  }

  // 데이트 코스를 지역별로 그룹화하고 당일 코스 생성 (최대 3-4개 장소)
  const groupDateCoursesByRegion = (places: Place[]): DateCourse[] => {
    const grouped: { [key: string]: Place[] } = {}
    places.forEach((place) => {
      const region = extractRegion(place.address)
      if (!grouped[region]) {
        grouped[region] = []
      }
      grouped[region].push(place)
    })

    // 각 지역별로 당일 코스 생성 (2-4개 장소)
    return Object.entries(grouped)
      .filter(([, places]) => places.length >= 2) // 최소 2개 장소로 당일 코스 구성
      .map(([region, places]) => {
        // 당일 코스는 최대 4개 장소까지만 포함
        const coursePlaces = places.slice(0, 4)

        return {
          id: `date-${region}`,
          title: `${region} 데이트 코스`,
          region,
          description: `${region}의 카페, 맛집, 전망대를 포함한 당일 데이트 코스입니다.`,
          image_url: coursePlaces.find((p) => p.image_url)?.image_url || null,
          place_count: coursePlaces.length,
          places: coursePlaces,
          duration: "당일 코스",
        }
      })
  }

  useEffect(() => {
    loadCourses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    filterCourses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, courses])

  const loadCourses = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const datePlaces = await getCoupleRecommendations({
        preferredTypes: ["CAFE", "FOOD", "VIEW"],
        limit: 100,
      })

      const dateCourses = groupDateCoursesByRegion((datePlaces || []) as unknown as Place[])
      setCourses(dateCourses)
      setFilteredCourses(dateCourses)
    } catch (error) {
      console.error("Failed to load courses:", error)
      setError(error instanceof Error ? error.message : "코스를 불러오는 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const filterCourses = () => {
    let filtered = [...courses]

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredCourses(filtered)
  }

  const handleCourseSelect = (course: DateCourse) => {
    setSelectedCourse(course)
    setSelectedPlace(null)
  }

  const handlePlaceClick = (place: Place) => {
    setSelectedPlace(place)
  }

  const getMapPlaces = () => {
    if (selectedCourse) {
      return selectedCourse.places.map((p) => ({
        id: p.id,
        name: p.name,
        lat: p.lat,
        lng: p.lng,
        type: p.type,
        rating: p.rating,
        priceLevel: p.price_level,
        description: p.description || "",
        image: p.image_url || "",
      }))
    }
    return []
  }

  const getMapPath = () => {
    if (selectedCourse) {
      return selectedCourse.places.map((p) => ({ lat: p.lat, lng: p.lng }))
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
    <div className="container mx-auto px-4 py-6 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Heart className="h-8 w-8 text-primary" />
          데이트 코스
        </h1>
        <p className="text-muted-foreground">당일로 즐길 수 있는 데이트 코스를 탐색하고 계획해보세요</p>
      </div>

      {/* 검색 바 */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="지역명으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
                    onPlaceClick={(place) => {
                      const foundPlace = selectedCourse.places.find((p) => p.id === place.id)
                      if (foundPlace) {
                        handlePlaceClick(foundPlace)
                      }
                    }}
                  />
                  {/* 선택된 코스 정보 오버레이 */}
                  <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-sm">
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
                </div>
              ) : (
                <div className="h-full flex items-center justify-center bg-muted/50">
                  <div className="text-center text-muted-foreground">
                    <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">데이트 코스를 선택해주세요</p>
                    <p className="text-sm mt-2">오른쪽 목록에서 코스를 선택하면 지도에 표시됩니다</p>
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
              <CardTitle className="text-lg">데이트 코스 목록</CardTitle>
              <CardDescription>
                {filteredCourses.length}개의 코스
              </CardDescription>
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
                    {filteredCourses.map((course) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedCourse?.id === course.id
                              ? "ring-2 ring-primary shadow-md"
                              : ""
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
                              {course.places.slice(0, 3).map((place) => {
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
                    <span className="text-sm">{selectedPlace.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm">💰</span>
                    <span className="text-sm">{"💰".repeat(selectedPlace.price_level)}</span>
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

