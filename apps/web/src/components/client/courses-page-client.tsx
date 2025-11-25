"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CourseCardSkeleton } from "@/components/ui/course-card-skeleton"
import {
  Search,
  MapPin,
  Star,
  Clock,
  Users,
  Heart,
  Filter,
  ChevronRight,
  Calendar,
  Wallet,
  Sparkles,
  Plane,
  Coffee,
  Camera,
  Utensils,
  AlertCircle,
  RefreshCw,
  X,
} from "lucide-react"
import {
  getCoupleRecommendations,
  getThemeRecommendations,
} from "@/lib/services/recommendation-service"
import { travelService } from "@/lib/services/travel-service.client"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import dynamic from "next/dynamic"

const NaverMapView = dynamic(() => import("@/components/naver-map-view"), { ssr: false })

type Place = {
  id: string
  name: string
  description: string
  lat: number
  lng: number
  type: "CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC"
  rating: number
  price_level: number
  image_url?: string
  address?: string
  phone?: string
  website?: string
}

type CourseType = "travel" | "date"

export function CoursesPageClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<CourseType>("travel")
  const [travelCourses, setTravelCourses] = useState<any[]>([])
  const [dateCourses, setDateCourses] = useState<any[]>([])
  const [filteredTravelCourses, setFilteredTravelCourses] = useState<any[]>([])
  const [filteredDateCourses, setFilteredDateCourses] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlace, setSelectedPlace] = useState<any | null>(null)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const [selectedCourse, setSelectedCourse] = useState<{
    id: string
    title: string
    region: string
    places: any[]
  } | null>(null)

  // URL query parameter에서 tab 확인
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab === "date") {
      setActiveTab("date")
    } else if (tab === "travel" || !tab) {
      // tab이 travel이거나 없으면 travel 탭 활성화
      setActiveTab("travel")
    }
  }, [searchParams])

  const filters = {
    travel: [
      { id: "all", label: "전체", icon: MapPin },
      { id: "VIEW", label: "전망", icon: Camera },
      { id: "MUSEUM", label: "박물관", icon: Sparkles },
    ],
    date: [
      { id: "all", label: "전체", icon: Heart },
      { id: "CAFE", label: "카페", icon: Coffee },
      { id: "FOOD", label: "맛집", icon: Utensils },
      { id: "VIEW", label: "전망", icon: Camera },
    ],
  }

  // 주소에서 지역명 추출
  const extractRegion = (address: string | undefined): string => {
    if (!address) return "지역 정보 없음"

    // 주소에서 지역명 추출 (예: "서울특별시 강남구" -> "서울", "제주특별자치도 서귀포시" -> "제주도")
    const match = address.match(
      /^(서울특별시|부산광역시|대구광역시|인천광역시|광주광역시|대전광역시|울산광역시|세종특별자치시|경기도|강원특별자치도|충청북도|충청남도|전북특별자치도|전라북도|전라남도|경상북도|경상남도|제주특별자치도)/
    )
    if (match) {
      const region = match[1]
      // 지역명 간소화
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

    // 시/도 단위가 없으면 첫 번째 단어 사용
    const firstWord = address.split(" ")[0]
    return firstWord || "지역 정보 없음"
  }

  // 데이트 코스를 코스 제목별로 그룹화
  const groupDateCoursesByTitle = (courses: any[]) => {
    const grouped: { [key: string]: any[] } = {}
    courses.forEach(place => {
      // course_title이 있으면 사용, 없으면 지역명 사용
      const courseTitle = place.course_title || extractRegion(place.address) || "기타"
      if (!grouped[courseTitle]) {
        grouped[courseTitle] = []
      }
      grouped[courseTitle].push(place)
    })
    return grouped
  }

  // 여행 코스를 지역별로 그룹화
  const groupTravelCoursesByRegion = (courses: any[]) => {
    const grouped: { [key: string]: any[] } = {}
    courses.forEach(course => {
      const region = extractRegion(course.address)
      if (!grouped[region]) {
        grouped[region] = []
      }
      grouped[region].push(course)
    })
    return grouped
  }

  useEffect(() => {
    loadCourses()
  }, [])

  useEffect(() => {
    filterCourses()
  }, [searchQuery, selectedFilter, travelCourses, dateCourses])

  const loadCourses = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // 여행 코스 로드 - 지역별 코스 요약 정보
      const travelPlaces = await getCoupleRecommendations({
        courseType: "travel",
        preferredTypes: ["VIEW", "MUSEUM"],
        limit: 100, // 충분히 많이 가져와서 지역별로 그룹화
      })

      // 지역별로 그룹화하여 코스 요약 생성
      const travelCoursesByRegion = groupTravelCoursesByRegion(travelPlaces || [])
      const travelCourseSummaries = Object.entries(travelCoursesByRegion).map(
        ([region, places]) => ({
          id: `travel-${region}`,
          title: `${region} 여행 코스`,
          region,
          course_type: "travel" as const,
          description: `${region}의 관광지와 문화시설을 포함한 여행 코스입니다.`,
          image_url: places.find(p => p.image_url)?.image_url || null,
          place_count: places.length,
          places, // 장소 목록도 함께 저장
        })
      )
      setTravelCourses(travelCourseSummaries)
      setFilteredTravelCourses(travelCourseSummaries)

      // 데이트 코스 로드 - 지역별 코스 요약 정보
      const datePlaces = await getCoupleRecommendations({
        courseType: "date",
        preferredTypes: ["CAFE", "FOOD", "VIEW", "MUSEUM"],
        limit: 100, // 충분히 많이 가져와서 지역별로 그룹화
      })

      // 지역별로 그룹화하여 코스 요약 생성
      const dateCoursesByRegion = groupDateCoursesByTitle(datePlaces || [])
      const dateCourseSummaries = Object.entries(dateCoursesByRegion).map(([region, places]) => ({
        id: `date-${region}`,
        title: `${region} 데이트 코스`,
        region,
        course_type: "date" as const,
        description: `${region}의 카페, 맛집, 전망대를 포함한 데이트 코스입니다.`,
        image_url: places.find(p => p.image_url)?.image_url || null,
        place_count: places.length,
        places, // 장소 목록도 함께 저장
      }))
      setDateCourses(dateCourseSummaries)
      setFilteredDateCourses(dateCourseSummaries)
    } catch (error) {
      console.error("Failed to load courses:", error)
      setError(error instanceof Error ? error.message : "코스를 불러오는 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageError = useCallback((placeId: string) => {
    setImageErrors(prev => new Set(prev).add(placeId))
  }, [])

  const handleClearFilters = useCallback(() => {
    setSearchQuery("")
    setSelectedFilter("all")
  }, [])

  const filterCourses = () => {
    const currentCourses = activeTab === "travel" ? travelCourses : dateCourses
    let filtered = [...currentCourses]

    // 검색 필터 (코스 요약 정보 기준)
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        course =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // 타입 필터는 코스 요약에서는 적용하지 않음 (장소 목록에서만 적용)

    if (activeTab === "travel") {
      setFilteredTravelCourses(filtered)
    } else {
      setFilteredDateCourses(filtered)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "CAFE":
        return Coffee
      case "FOOD":
        return Utensils
      case "VIEW":
        return Camera
      case "MUSEUM":
        return Sparkles
      default:
        return MapPin
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "CAFE":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400"
      case "FOOD":
        return "bg-red-500/10 text-red-700 dark:text-red-400"
      case "VIEW":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400"
      case "MUSEUM":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400"
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400"
    }
  }

  const currentCourses = activeTab === "travel" ? filteredTravelCourses : filteredDateCourses
  const currentFilters = filters[activeTab]

  // 코스가 선택되었으면 장소 목록 표시, 아니면 코스 카드 목록 표시
  const showCoursePlaces = selectedCourse !== null

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden">
      {/* 배경 장식 요소 */}
      <div className="fixed inset-0 bg-dot-pattern opacity-30 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

      {/* Hero Section */}
      <section className="relative py-24 md:py-32 bg-gradient-to-br from-primary/10 via-background/95 to-accent/10 border-b border-primary/10">
        {/* 배경 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-grid-pattern-enhanced opacity-20 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* 배지 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md mb-6 shadow-soft"
            >
              <Sparkles className="h-4 w-4 text-primary animate-pulse-glow" />
              <span className="text-sm font-semibold text-primary">AI 기반 맞춤 추천</span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="gradient-text animate-gradient-text block mb-2">커플 여행 코스</span>
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto"
            >
              연인과 함께할 <span className="text-primary font-semibold">특별한 순간</span>을
              만들어보세요.
              <br />
              로맨틱한 데이트 코스부터 여행 코스까지 추천해드립니다.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={value => setActiveTab(value as CourseType)}
          className="w-full mb-8"
        >
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12 bg-background/60 backdrop-blur-xl border border-primary/20 rounded-xl p-1.5 shadow-medium">
            <TabsTrigger
              value="travel"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300 rounded-lg px-6 py-3 font-semibold relative overflow-hidden group"
            >
              <Plane className="h-4 w-4 group-data-[state=active]:animate-float" />
              <span>여행 코스</span>
              {activeTab === "travel" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-lg -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </TabsTrigger>
            <TabsTrigger
              value="date"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300 rounded-lg px-6 py-3 font-semibold relative overflow-hidden group"
            >
              <Heart className="h-4 w-4 group-data-[state=active]:animate-pulse-glow" />
              <span>데이트 코스</span>
              {activeTab === "date" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-lg -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </TabsTrigger>
          </TabsList>

          {/* Search and Filter */}
          <div className="mb-10 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative max-w-2xl mx-auto"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none z-10" />
              <Input
                type="text"
                placeholder="장소나 키워드를 검색해보세요..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                  className="pl-12 pr-12 h-14 text-lg bg-background/90 backdrop-blur-xl border-2 border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-large hover:shadow-xl rounded-xl input-enhanced"
                aria-label="코스 검색"
              />
              {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-lg hover:bg-primary/10 transition-all group"
                  aria-label="검색어 지우기"
                >
                    <X className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </motion.button>
              )}
            </div>
            </motion.div>

            {/* Filter Chips */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              {currentFilters.map(filter => {
                const Icon = filter.icon
                return (
                  <Badge
                    key={filter.id}
                    variant={selectedFilter === filter.id ? "default" : "secondary"}
                    className={`cursor-pointer px-4 py-2 text-sm font-medium transition-all hover:scale-110 active:scale-95 backdrop-blur-sm ${
                      selectedFilter === filter.id
                        ? "bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/20"
                        : "hover:bg-primary/10 bg-background/80 text-foreground border border-primary/20 hover:border-primary/30"
                    }`}
                    onClick={() => setSelectedFilter(filter.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        setSelectedFilter(filter.id)
                      }
                    }}
                    aria-pressed={selectedFilter === filter.id}
                  >
                    <Icon className="h-3 w-3 mr-1.5 inline" aria-hidden="true" />
                    {filter.label}
                  </Badge>
                )
              })}
              {(searchQuery || selectedFilter !== "all") && (
                <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-xs">
                  <X className="h-3 w-3 mr-1" />
                  필터 초기화
                </Button>
              )}
            </div>
          </div>

          {/* Travel Courses Tab */}
          <TabsContent value="travel" className="mt-8">
            {error && (
              <Alert
                variant="destructive"
                className="mb-6 backdrop-blur-md bg-destructive/10 border-destructive/20"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>오류 발생</AlertTitle>
                <AlertDescription className="flex items-center justify-between">
                  <span>{error}</span>
                  <Button variant="outline" size="sm" onClick={loadCourses} className="ml-4">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    다시 시도
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <CourseCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredTravelCourses.length === 0 ? (
              <div className="text-center py-20">
                <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground mb-2">
                  {searchQuery || selectedFilter !== "all"
                    ? "검색 결과가 없습니다."
                    : "코스가 없습니다."}
                </p>
                {(searchQuery || selectedFilter !== "all") && (
                  <Button variant="outline" onClick={handleClearFilters} className="mt-4">
                    필터 초기화
                  </Button>
                )}
              </div>
            ) : showCoursePlaces && selectedCourse && activeTab === "travel" ? (
              // 선택된 코스의 장소 목록과 지도 (3:1 비율)
              <div className="space-y-6">
                {/* 헤더 */}
                  <motion.div
                  initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap items-center gap-4 mb-6 p-4 rounded-xl bg-gradient-to-r from-primary/10 via-background to-accent/10 border border-primary/20 backdrop-blur-md shadow-lg shadow-primary/5"
                >
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedCourse(null)}
                    className="gap-2 hover:bg-primary/20 transition-all duration-300"
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" />
                    코스 목록으로
                  </Button>
                  <div className="flex-1 min-w-[200px]">
                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                      {selectedCourse.title}
                      </h2>
                    <p className="text-sm text-muted-foreground mt-1">{selectedCourse.region}</p>
                  </div>
                      <Badge
                        variant="secondary"
                    className="text-sm px-4 py-2 bg-primary/20 border-primary/30"
                      >
                    <MapPin className="h-3 w-3 mr-1" />
                    {selectedCourse.places?.length || 0}개 장소
                      </Badge>
                </motion.div>

                {/* 메인 컨텐츠: 지도 3, 장소 목록 1 비율 레이아웃 */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* 왼쪽: 네이버 지도 (3/4) */}
                    <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-3 lg:sticky lg:top-24 h-[600px] lg:h-[calc(100vh-200px)] order-2 lg:order-1"
                  >
                    <Card className="h-full overflow-hidden border-primary/20 bg-background/80 backdrop-blur-md relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/5 before:to-accent/5 before:opacity-50 before:pointer-events-none shadow-xl shadow-primary/10">
                      <CardHeader className="relative z-10 border-b border-primary/10 bg-gradient-to-r from-primary/10 to-transparent">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <div className="p-2 rounded-lg bg-primary/20 border border-primary/30 shadow-md shadow-primary/20">
                            <MapPin className="h-4 w-4 text-primary" />
                          </div>
                          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            코스 지도
                          </span>
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                          장소를 클릭하면 상세 정보를 확인할 수 있습니다
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-0 h-[calc(100%-100px)] relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none z-10" />
                        <NaverMapView
                          places={(selectedCourse.places || []).map(place => ({
                            id: place.id,
                            name: place.name,
                            lat: place.lat || 0,
                            lng: place.lng || 0,
                            type: place.type,
                            rating: place.rating || 0,
                            priceLevel: place.price_level || 1,
                            description: place.description || "",
                            image: place.image_url || "",
                          }))}
                          path={(selectedCourse.places || []).map(place => ({
                            lat: place.lat || 0,
                            lng: place.lng || 0,
                          }))}
                          onPlaceClick={place => {
                            const foundPlace = selectedCourse.places?.find(p => p.id === place.id)
                            if (foundPlace) {
                              setSelectedPlace(foundPlace)
                            }
                          }}
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>
            ) : (
              // 코스 요약 카드 목록 표시
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTravelCourses.map((course, index) => (
                            <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.08,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    whileHover={{ y: -8, scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Card
                      className="group cursor-pointer h-full card-hover border-2 border-primary/10 hover:border-primary/30 overflow-hidden glass-card relative"
                                onClick={() => {
                        setSelectedCourse({
                          id: course.id,
                          title: course.title,
                          region: course.region,
                          places: course.places || [],
                        })
                                }}
                    >
                      {/* 호버 시 그라데이션 배경 */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      {/* 네온 테두리 */}
                      <div className="absolute inset-0 rounded-lg ring-2 ring-primary/0 group-hover:ring-primary/30 transition-all duration-500" />
                      <div className="relative h-72 overflow-hidden rounded-t-lg">
                        {course.image_url ? (
                          <div className="relative w-full h-full">
                                    <Image
                              src={course.image_url}
                              alt={course.title}
                                      fill
                              className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                            {/* 그라데이션 오버레이 */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                            {/* 패턴 오버레이 */}
                            <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                          </div>
                                  ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 flex items-center justify-center relative">
                            <div className="absolute inset-0 bg-grid-pattern opacity-20" />
                            <MapPin className="h-20 w-20 text-primary/40 relative z-10" />
                                    </div>
                                  )}

                        {/* 지역 배지 */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.08 + 0.2 }}
                          className="absolute top-4 left-4 z-20"
                        >
                          <Badge className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-primary-foreground border-2 border-white/30 shadow-lg backdrop-blur-xl font-semibold">
                            {course.region}
                                    </Badge>
                        </motion.div>

                        {/* 코스 정보 */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                          <motion.h3
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08 + 0.3 }}
                            className="text-2xl font-bold text-white mb-2 drop-shadow-lg"
                          >
                            {course.title}
                          </motion.h3>
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.08 + 0.4 }}
                            className="text-sm text-white/90 line-clamp-2 leading-relaxed drop-shadow-md"
                                    >
                            {course.description}
                          </motion.p>
                                  </div>

                        {/* 호버 시 추가 효과 */}
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </div>

                      <CardContent className="p-5 relative z-10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 backdrop-blur-sm">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span className="text-sm font-semibold text-foreground">
                              {course.region}
                                      </span>
                                    </div>
                          <Badge
                            variant="secondary"
                            className="text-sm px-4 py-2 bg-primary/10 border-primary/20 font-semibold"
                          >
                            <MapPin className="h-3 w-3 mr-1.5" />
                            {course.place_count || course.places?.length || 0}개 장소
                          </Badge>
                                    </div>
                                </CardContent>
                              </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Date Courses Tab */}
          <TabsContent value="date" className="mt-8">
            {error && (
              <Alert
                variant="destructive"
                className="mb-6 backdrop-blur-md bg-destructive/10 border-destructive/20"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>오류 발생</AlertTitle>
                <AlertDescription className="flex items-center justify-between">
                  <span>{error}</span>
                  <Button variant="outline" size="sm" onClick={loadCourses} className="ml-4">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    다시 시도
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <CourseCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredDateCourses.length === 0 ? (
              <div className="text-center py-20">
                <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground mb-2">
                  {searchQuery || selectedFilter !== "all"
                    ? "검색 결과가 없습니다."
                    : "코스가 없습니다."}
                </p>
                {(searchQuery || selectedFilter !== "all") && (
                  <Button variant="outline" onClick={handleClearFilters} className="mt-4">
                    필터 초기화
                  </Button>
                )}
              </div>
            ) : showCoursePlaces && selectedCourse && activeTab === "date" ? (
              // 선택된 코스의 장소 목록과 지도 (3:1 비율)
              <div className="space-y-6">
                {/* 헤더 */}
                  <motion.div
                  initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap items-center gap-4 mb-6 p-4 rounded-xl bg-gradient-to-r from-primary/10 via-background to-accent/10 border border-primary/20 backdrop-blur-md shadow-lg shadow-primary/5"
                >
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedCourse(null)}
                    className="gap-2 hover:bg-primary/20 transition-all duration-300"
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" />
                    코스 목록으로
                  </Button>
                  <div className="flex-1 min-w-[200px]">
                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                      {selectedCourse.title}
                      </h2>
                    <p className="text-sm text-muted-foreground mt-1">{selectedCourse.region}</p>
                  </div>
                      <Badge
                        variant="secondary"
                    className="text-sm px-4 py-2 bg-primary/20 border-primary/30"
                      >
                    <MapPin className="h-3 w-3 mr-1" />
                    {selectedCourse.places?.length || 0}개 장소
                      </Badge>
                </motion.div>

                {/* 메인 컨텐츠: 지도 3, 장소 목록 1 비율 레이아웃 */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* 왼쪽: 네이버 지도 (3/4) */}
                    <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-3 lg:sticky lg:top-24 h-[600px] lg:h-[calc(100vh-200px)] order-2 lg:order-1"
                  >
                    <Card className="h-full overflow-hidden border-primary/20 bg-background/80 backdrop-blur-md relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/5 before:to-accent/5 before:opacity-50 before:pointer-events-none shadow-xl shadow-primary/10">
                      <CardHeader className="relative z-10 border-b border-primary/10 bg-gradient-to-r from-primary/10 to-transparent">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <div className="p-2 rounded-lg bg-primary/20 border border-primary/30 shadow-md shadow-primary/20">
                            <MapPin className="h-4 w-4 text-primary" />
                          </div>
                          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            코스 지도
                          </span>
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                          장소를 클릭하면 상세 정보를 확인할 수 있습니다
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-0 h-[calc(100%-100px)] relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none z-10" />
                        <NaverMapView
                          places={(selectedCourse.places || []).map(place => ({
                            id: place.id,
                            name: place.name,
                            lat: place.lat || 0,
                            lng: place.lng || 0,
                            type: place.type,
                            rating: place.rating || 0,
                            priceLevel: place.price_level || 1,
                            description: place.description || "",
                            image: place.image_url || "",
                          }))}
                          path={(selectedCourse.places || []).map(place => ({
                            lat: place.lat || 0,
                            lng: place.lng || 0,
                          }))}
                          onPlaceClick={place => {
                            const foundPlace = selectedCourse.places?.find(p => p.id === place.id)
                            if (foundPlace) {
                              setSelectedPlace(foundPlace)
                            }
                          }}
                        />
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* 오른쪽: 장소 목록 (1/4) */}
                  <div className="lg:col-span-1 space-y-4 order-1 lg:order-2">
                    <div className="grid grid-cols-1 gap-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                      {(selectedCourse.places || []).map((place, index) => {
                          const TypeIcon = getTypeIcon(place.type)
                          const hasImageError = imageErrors.has(place.id)
                          return (
                            <motion.div
                              key={place.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                            whileHover={{ scale: 1.02, y: -4 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Card
                              className="group cursor-pointer h-full hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-2 border-primary/10 hover:border-primary/40 overflow-hidden bg-background/90 backdrop-blur-md relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/5 before:to-accent/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 after:absolute after:inset-0 after:ring-2 after:ring-primary/20 after:rounded-lg after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-300"
                                onClick={() => {
                                setSelectedPlace(place)
                                }}
                                role="button"
                                tabIndex={0}
                                onKeyDown={e => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault()
                                  setSelectedPlace(place)
                                  }
                                }}
                                aria-label={`${place.name} 자세히 보기`}
                              >
                              <div className="relative h-32 overflow-hidden">
                                  {place.image_url && !hasImageError ? (
                                    <Image
                                      src={place.image_url}
                                      alt={`${place.name} 이미지`}
                                      fill
                                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                                      onError={() => handleImageError(place.id)}
                                    sizes="(max-width: 768px) 100vw, 25vw"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                      <TypeIcon
                                      className="h-12 w-12 text-primary/50"
                                        aria-hidden="true"
                                      />
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="absolute top-2 right-2 z-10">
                                    <Badge
                                    className={`${getTypeColor(place.type)} backdrop-blur-sm border border-white/20 text-xs px-1.5 py-0.5`}
                                    >
                                    <TypeIcon className="h-2.5 w-2.5 mr-0.5" aria-hidden="true" />
                                      {place.type}
                                    </Badge>
                                  </div>
                                <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
                                    <Star
                                    className="h-3 w-3 fill-yellow-400 text-yellow-400"
                                      aria-hidden="true"
                                    />
                                    <span
                                    className="text-white text-xs font-semibold"
                                      aria-label={`평점 ${place.rating.toFixed(1)}점`}
                                    >
                                      {place.rating.toFixed(1)}
                                    </span>
                                  </div>
                                </div>
                              <CardHeader className="relative z-10 p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-primary/10 border-primary/20 text-primary"
                                    >
                                      {extractRegion(place.address)}
                                    </Badge>
                                  </div>
                                <CardTitle className="group-hover:text-primary transition-colors line-clamp-1 text-sm">
                                    {place.name}
                                  </CardTitle>
                                <CardDescription className="line-clamp-2 min-h-[2rem] text-xs">
                                    {place.description}
                                  </CardDescription>
                                </CardHeader>
                              <CardContent className="relative z-10 p-3 pt-0">
                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                    <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" aria-hidden="true" />
                                      <span
                                        className="line-clamp-1"
                                        title={place.address || undefined}
                                      >
                                      {extractRegion(place.address)}
                                      </span>
                                    </div>
                                    <div
                                      className="flex items-center gap-1"
                                      aria-label={`가격대 ${place.price_level}단계`}
                                    >
                                      {"💰".repeat(Math.max(1, place.price_level || 1))}
                                    </div>
                                  </div>
                                  <Button
                                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 hover:shadow-lg text-xs h-8"
                                    variant="outline"
                                  >
                                    자세히 보기
                                  <ChevronRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                                  </Button>
                                </CardContent>
                              </Card>
                            </motion.div>
                          )
                        })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // 코스 요약 카드 목록 표시
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDateCourses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.08,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className="group cursor-pointer h-full card-hover border-2 border-primary/10 hover:border-primary/30 overflow-hidden glass-card relative"
                      onClick={() => {
                        setSelectedCourse({
                          id: course.id,
                          title: course.title,
                          region: course.region,
                          places: course.places || [],
                        })
                      }}
                    >
                      {/* 호버 시 그라데이션 배경 */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      {/* 네온 테두리 */}
                      <div className="absolute inset-0 rounded-lg ring-2 ring-primary/0 group-hover:ring-primary/30 transition-all duration-500" />

                      <div className="relative h-72 overflow-hidden rounded-t-lg">
                        {course.image_url ? (
                          <div className="relative w-full h-full">
                            <Image
                              src={course.image_url}
                              alt={course.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                            {/* 그라데이션 오버레이 */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                            {/* 패턴 오버레이 */}
                            <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                          </div>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 flex items-center justify-center relative">
                            <div className="absolute inset-0 bg-grid-pattern opacity-20" />
                            <Heart className="h-20 w-20 text-primary/40 relative z-10" />
                          </div>
                        )}

                        {/* 지역 배지 */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.08 + 0.2 }}
                          className="absolute top-4 left-4 z-20"
                        >
                          <Badge className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-primary-foreground border-2 border-white/30 shadow-lg backdrop-blur-xl font-semibold">
                            {course.region}
                          </Badge>
                    </motion.div>

                        {/* 코스 정보 */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                          <motion.h3
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08 + 0.3 }}
                            className="text-2xl font-bold text-white mb-2 drop-shadow-lg"
                          >
                            {course.title}
                          </motion.h3>
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.08 + 0.4 }}
                            className="text-sm text-white/90 line-clamp-2 leading-relaxed drop-shadow-md"
                          >
                            {course.description}
                          </motion.p>
                        </div>

                        {/* 호버 시 추가 효과 */}
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>

                      <CardContent className="p-5 relative z-10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 backdrop-blur-sm">
                            <Heart className="h-4 w-4 text-primary" />
                            <span className="text-sm font-semibold text-foreground">
                              {course.region}
                            </span>
                          </div>
                          <Badge
                            variant="secondary"
                            className="text-sm px-4 py-2 bg-primary/10 border-primary/20 font-semibold"
                          >
                            <Heart className="h-3 w-3 mr-1.5" />
                            {course.place_count || course.places?.length || 0}개 장소
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Place Detail Dialog */}
      <Dialog open={!!selectedPlace} onOpenChange={() => setSelectedPlace(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-primary/20 shadow-2xl">
          {selectedPlace && (
            <>
              <div className="relative h-64 overflow-hidden rounded-lg mb-4 group">
                {selectedPlace.image_url && !imageErrors.has(selectedPlace.id) ? (
                  <Image
                    src={selectedPlace.image_url}
                    alt={`${selectedPlace.name} 이미지`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={() => handleImageError(selectedPlace.id)}
                    sizes="(max-width: 768px) 100vw, 768px"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    {(() => {
                      const Icon = getTypeIcon(selectedPlace.type)
                      return <Icon className="h-24 w-24 text-primary/50" aria-hidden="true" />
                    })()}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-4 right-4 z-10">
                  <Badge
                    className={`${getTypeColor(selectedPlace.type)} backdrop-blur-sm border border-white/20`}
                  >
                    {(() => {
                      const Icon = getTypeIcon(selectedPlace.type)
                      return (
                        <>
                          <Icon className="h-3 w-3 mr-1" aria-hidden="true" />
                          {selectedPlace.type}
                        </>
                      )
                    })()}
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                  <span
                    className="text-white text-lg font-semibold"
                    aria-label={`평점 ${selectedPlace.rating.toFixed(1)}점`}
                  >
                    {selectedPlace.rating.toFixed(1)}
                  </span>
                </div>
              </div>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <DialogTitle className="text-2xl mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {selectedPlace.name}
                    </DialogTitle>
                  </div>
                </div>
              </DialogHeader>
              <DialogDescription className="text-base mb-6 leading-relaxed">
                {selectedPlace.description}
              </DialogDescription>
              <div className="space-y-4 p-4 rounded-lg bg-primary/5 border border-primary/10 backdrop-blur-sm">
                {selectedPlace.address && (
                  <div className="flex items-start gap-3">
                    <MapPin
                      className="h-5 w-5 text-primary mt-0.5 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">주소</div>
                      <span className="text-sm">{selectedPlace.address}</span>
                    </div>
                  </div>
                )}
                {selectedPlace.phone && (
                  <div className="flex items-start gap-3">
                    <Clock
                      className="h-5 w-5 text-primary mt-0.5 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">연락처</div>
                      <span className="text-sm">{selectedPlace.phone}</span>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Wallet
                    className="h-5 w-5 text-primary mt-0.5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">가격대</div>
                    <span className="text-sm">
                      {"💰".repeat(
                        Math.max(1, selectedPlace.price_level || selectedPlace.priceLevel || 1)
                      )}
                    </span>
                  </div>
                </div>
              </div>
              {selectedPlace.website && (
                <Button className="w-full mt-6 group" asChild>
                  <a href={selectedPlace.website} target="_blank" rel="noopener noreferrer">
                    웹사이트 방문하기
                    <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
