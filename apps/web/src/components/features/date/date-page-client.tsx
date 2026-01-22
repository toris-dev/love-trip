"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { Button } from "@lovetrip/ui/components/button"
import { Plus, ArrowLeft, Save, GripVertical, X } from "lucide-react"
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
import type { DateCourse, Place, TargetAudience } from "@lovetrip/shared/types/course"
import { MoodFilter, type MoodType } from "@lovetrip/ui/components/mood-filter"

const NaverMapView = dynamic(() => import("@/components/shared/naver-map-view"), { ssr: false })

const ITEMS_PER_PAGE = 10

interface DatePageClientProps {
  initialCourses: DateCourse[]
  initialHasMore: boolean
  initialTotalCount: number
  user: { id: string; email?: string } | null
}

export function DatePageClient({
  initialCourses,
  initialHasMore,
  initialTotalCount,
  user: initialUser,
}: DatePageClientProps) {
  const [courses, setCourses] = useState<DateCourse[]>(initialCourses)
  const [filteredCourses, setFilteredCourses] = useState<DateCourse[]>(initialCourses)
  const [displayedCourses, setDisplayedCourses] = useState<DateCourse[]>(
    initialCourses.slice(0, ITEMS_PER_PAGE)
  )
  const [selectedCourse, setSelectedCourse] = useState<DateCourse | null>(null)
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [page, setPage] = useState(0)
  const [sidebarMode, setSidebarMode] = useState<"browse" | "create">("browse")
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
  const [recommendedPlaces, setRecommendedPlaces] = useState<Place[]>([])
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
  const [user, setUser] = useState<{ id: string; email?: string } | null>(initialUser)
  const [selectedMoods, setSelectedMoods] = useState<MoodType[]>([])
  const observerTarget = useRef<HTMLDivElement>(null)

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

  const extractRegion = (place: Place): string => {
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

    Object.entries(grouped).forEach(([region, regionPlaces]) => {
      if (regionPlaces.length < 2) return

      const placesPerCourse = 4
      const maxCoursesPerRegion = Math.min(10, Math.floor(regionPlaces.length / 2))

      for (let i = 0; i < maxCoursesPerRegion; i++) {
        const startIdx = i * placesPerCourse
        const endIdx = Math.min(startIdx + placesPerCourse, regionPlaces.length)
        const coursePlaces = regionPlaces.slice(startIdx, endIdx)

        if (coursePlaces.length < 2) break

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
      const places = await getCoupleRecommendations({
        preferredTypes: ["CAFE", "FOOD", "VIEW"],
        limit: 50,
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
        const supabase = createClient()
        const from = pageNum * ITEMS_PER_PAGE
        const to = from + ITEMS_PER_PAGE - 1

        // date_courses와 user_courses를 병렬로 조회
        const [dateCoursesResult, userCoursesResult] = await Promise.all([
          supabase
            .from("date_courses")
            .select("*", { count: "exact" })
            .order("region", { ascending: true })
            .order("created_at", { ascending: false })
            .range(from, to),
          supabase
            .from("user_courses")
            .select("*", { count: "exact" })
            .eq("course_type", "date")
            .eq("is_public", true)
            .eq("status", "published")
            .order("created_at", { ascending: false })
            .range(from, to),
        ])

        if (dateCoursesResult.error) {
          throw dateCoursesResult.error
        }

        const dateCoursesData = dateCoursesResult.data || []
        const userCoursesData = userCoursesResult.data || []
        const totalCount = (dateCoursesResult.count || 0) + (userCoursesResult.count || 0)
        setHasMore(to < totalCount - 1)

        if (dateCoursesData.length === 0 && userCoursesData.length === 0) {
          if (pageNum === 0) {
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

        // date_courses 처리
        const dateCoursesWithPlaces = await Promise.all(
          dateCoursesData.map(async course => {
            // 하이브리드 방식: place_id와 저장된 정보 모두 조회
            const { data: placesData, error: placesError } = await supabase
              .from("date_course_places")
              .select(
                "place_id, place_name, place_lat, place_lng, place_address, place_type, place_rating, place_price_level, place_image_url, place_description, order_index, distance_from_previous_km, visit_duration_minutes"
              )
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

            if (!placesData || placesData.length === 0) {
              console.warn(`코스 ${course.id}에 장소가 없습니다.`)
              return null
            }

            // places 테이블이 삭제되었으므로 저장된 정보만 사용
            const sortedPlaces =
              placesData
                ?.map(cp => {
                  // 저장된 정보가 있는 경우
                  if (cp.place_name && cp.place_lat && cp.place_lng) {
                    const place: Place = {
                      id: `stored-${cp.order_index}`,
                      name: cp.place_name,
                      lat: Number(cp.place_lat),
                      lng: Number(cp.place_lng),
                      type: (cp.place_type as "CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC") || "ETC",
                      rating: cp.place_rating ? Number(cp.place_rating) : null,
                      price_level: cp.place_price_level ? Number(cp.place_price_level) : null,
                      description: cp.place_description || null,
                      image_url: cp.place_image_url || null,
                      address: cp.place_address || null,
                    }
                    return place
                  }

                  return null
                })
                .filter((p): p is Place => p !== null)
                .sort((a, b) => {
                  const aIndex = placesData.findIndex(p => p.place_name === a.name)
                  const bIndex = placesData.findIndex(p => p.place_name === b.name)
                  return (
                    (placesData[aIndex]?.order_index || 0) - (placesData[bIndex]?.order_index || 0)
                  )
                }) || []

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

        // user_courses 처리
        const userCoursesWithPlaces = await Promise.all(
          userCoursesData.map(async course => {
            // 하이브리드 방식: place_id와 저장된 정보 모두 조회
            const { data: placesData, error: placesError } = await supabase
              .from("user_course_places")
              .select(
                "place_id, place_name, place_lat, place_lng, place_address, place_type, place_rating, place_price_level, place_image_url, place_description, order_index, visit_duration_minutes"
              )
              .eq("user_course_id", course.id)
              .order("order_index", { ascending: true })

            if (placesError) {
              console.error("장소 정보 가져오기 실패:", placesError)
              return null
            }

            if (!placesData || placesData.length === 0) {
              console.warn(`코스 ${course.id}에 장소가 없습니다.`)
              return null
            }

            // places 테이블이 삭제되었으므로 저장된 정보만 사용
            const sortedPlaces =
              placesData
                ?.map(cp => {
                  // 저장된 정보가 있는 경우
                  if (cp.place_name && cp.place_lat && cp.place_lng) {
                    const place: Place = {
                      id: `stored-${cp.order_index}`,
                      name: cp.place_name,
                      lat: Number(cp.place_lat),
                      lng: Number(cp.place_lng),
                      type: (cp.place_type as "CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC") || "ETC",
                      rating: cp.place_rating ? Number(cp.place_rating) : null,
                      price_level: cp.place_price_level ? Number(cp.place_price_level) : null,
                      description: cp.place_description || null,
                      image_url: cp.place_image_url || null,
                      address: cp.place_address || null,
                    }
                    return place
                  }

                  return null
                })
                .filter((p): p is Place => p !== null)
                .sort((a, b) => {
                  const aIndex = placesData.findIndex(p => p.place_name === a.name)
                  const bIndex = placesData.findIndex(p => p.place_name === b.name)
                  return (
                    (placesData[aIndex]?.order_index || 0) - (placesData[bIndex]?.order_index || 0)
                  )
                }) || []

            return {
              id: course.id,
              title: course.title,
              region: course.region,
              description: course.description || "",
              image_url: course.image_url,
              place_count: course.place_count || sortedPlaces.length,
              places: sortedPlaces,
              duration: course.duration || "당일 코스",
              total_distance_km: null,
              max_distance_km: null,
            } as DateCourse
          })
        )

        // 두 소스의 코스를 통합 (중복 제거 - ID 기준)
        const courseMap = new Map<string, DateCourse>()

        // date_courses 먼저 추가
        dateCoursesWithPlaces
          .filter((c): c is DateCourse => c !== null)
          .forEach(course => {
            courseMap.set(course.id, course)
          })

        // user_courses 추가 (중복되지 않는 경우만)
        userCoursesWithPlaces
          .filter((c): c is DateCourse => c !== null)
          .forEach(course => {
            if (!courseMap.has(course.id)) {
              courseMap.set(course.id, course)
            }
          })

        const validCourses = Array.from(courseMap.values())
        // 최신순으로 정렬
        validCourses.sort((a, b) => {
          // created_at이 없으면 뒤로
          return 0
        })

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

  // 필터링 로직을 useMemo로 최적화
  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) {
      return courses
    }

    const query = searchQuery.toLowerCase()
    return courses.filter(
      course =>
        course.title.toLowerCase().includes(query) ||
        course.region.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query)
    )
  }, [courses, searchQuery])

  const filterCourses = useCallback(() => {
    if (searchQuery.trim()) {
      // 검색어가 있을 때는 필터링된 결과만 표시
      setFilteredCourses(filteredCourses)
      setDisplayedCourses(filteredCourses.slice(0, ITEMS_PER_PAGE))
      setHasMore(false) // 검색 시 무한스크롤 비활성화
      setPage(0)
    } else {
      // 검색어가 없을 때는 필터링만 하고 displayedCourses는 리셋하지 않음 (무한스크롤 유지)
      setFilteredCourses(courses)
      // displayedCourses는 loadCourses에서 관리하므로 여기서 리셋하지 않음
      // hasMore와 page도 유지
    }
  }, [courses, searchQuery, filteredCourses])

  useEffect(() => {
    loadRecommendedPlaces()
  }, [loadRecommendedPlaces])

  useEffect(() => {
    // 검색어가 변경될 때만 필터링 실행
    if (searchQuery.trim()) {
      filterCourses()
    } else {
      // 검색어가 없을 때는 filteredCourses만 업데이트하고 displayedCourses는 유지
      setFilteredCourses(courses)
    }
  }, [searchQuery, courses, filterCourses])

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

    // 검색 결과만 표시 (자동으로 recommendedPlaces 표시하지 않음)
    if (searchedPlace) {
      return [searchedPlace]
    }

    return []
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

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  return (
    <div className="relative w-full h-screen overflow-hidden">
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
              className="absolute top-[88px] left-6 bg-card border border-border rounded-lg p-4 shadow-lg max-w-sm z-40"
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
                  onClick={() => setSelectedCourse(null)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="absolute top-[88px] right-6 z-10">
        <Button
          onClick={() => setSidebarMode("create")}
          size="lg"
          className="shadow-2xl shadow-primary/30 bg-primary hover:bg-primary/90 text-primary-foreground border-0 rounded-2xl px-6 py-6 h-auto font-semibold text-base transition-all duration-300 hover:scale-105 hover:shadow-primary/40"
        >
          <Plus className="h-5 w-5 mr-2" />
          코스 만들기
        </Button>
      </div>

      <div className="absolute left-0 top-[64px] w-full md:w-96 h-[calc(100vh-64px)] z-40 pointer-events-none">
        <div className="h-full w-full bg-background border-r border-border shadow-xl pointer-events-auto flex flex-col">
          {sidebarMode === "browse" ? (
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

              <div className="p-4 border-b border-border bg-muted/30 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="지역명으로 검색..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 h-11 bg-background"
                  />
                </div>
                {/* 무드 필터 */}
                <MoodFilter
                  selectedMoods={selectedMoods}
                  onMoodChange={setSelectedMoods}
                  className="flex-wrap"
                />
              </div>

              {error && (
                <div className="p-4 border-b border-border">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </div>
              )}

              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="p-4 pb-16">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full min-h-[400px]">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">
                          데이트 코스를 불러오는 중...
                        </p>
                      </div>
                    </div>
                  ) : filteredCourses.length === 0 ? (
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
                        {(searchQuery.trim() ? filteredCourses : displayedCourses).map(course => (
                          <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Card
                              className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50 ${
                                selectedCourse?.id === course.id
                                  ? "ring-2 ring-primary border-primary"
                                  : "border-border hover:border-primary/30"
                              }`}
                              onClick={() => handleCourseSelect(course)}
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
                      {!searchQuery.trim() && hasMore && (
                        <div ref={observerTarget} className="h-4" />
                      )}
                      {isLoadingMore && (
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
            <div className="flex-1 overflow-y-auto min-h-0 relative">
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
                          target_audience: "couple",
                          places: [],
                        },
                        ])
                        setSelectedCourseId(newCourseId)
                      }}
                      className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <Plus className="h-5 w-5 mr-2" />새 코스 만들기
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
                                <Heart className="h-4 w-4 text-primary" />
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
                                placeholder="예: 서울 데이트 코스"
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
                            <div>
                              <Label htmlFor="target-audience" className="text-sm font-semibold mb-2">
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
                                {selectedCourse.places.map((place, index) => {
                                  const placeWithOrder = place as Place & { order_index?: number }
                                  const placeNumber =
                                    placeWithOrder.order_index !== undefined
                                      ? placeWithOrder.order_index + 1
                                      : index + 1
                                  return (
                                    <div
                                      key={place.id}
                                      draggable
                                      onDragStart={e => {
                                        e.dataTransfer.effectAllowed = "move"
                                        e.dataTransfer.setData("text/plain", place.id)
                                        e.currentTarget.classList.add("opacity-50")
                                      }}
                                      onDragEnd={e => {
                                        e.currentTarget.classList.remove("opacity-50")
                                      }}
                                      onDragOver={e => {
                                        e.preventDefault()
                                        e.dataTransfer.dropEffect = "move"
                                        e.currentTarget.classList.add("border-primary")
                                      }}
                                      onDragLeave={e => {
                                        e.currentTarget.classList.remove("border-primary")
                                      }}
                                      onDrop={e => {
                                        e.preventDefault()
                                        e.currentTarget.classList.remove("border-primary")
                                        const draggedPlaceId = e.dataTransfer.getData("text/plain")
                                        if (draggedPlaceId === place.id) return

                                        const draggedIndex = selectedCourse.places.findIndex(
                                          p => p.id === draggedPlaceId
                                        )
                                        const targetIndex = index

                                        if (draggedIndex === -1) return

                                        const newPlaces = [...selectedCourse.places]
                                        const [removed] = newPlaces.splice(draggedIndex, 1)
                                        newPlaces.splice(targetIndex, 0, removed)

                                        setCreatingCourses(
                                          creatingCourses.map(c =>
                                            c.id === selectedCourseId
                                              ? { ...c, places: newPlaces }
                                              : c
                                          )
                                        )
                                      }}
                                      className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-move"
                                    >
                                      <div className="flex items-center gap-2">
                                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
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

                                const today = new Date().toISOString().split("T")[0]

                                // user_courses API 사용
                                const response = await fetch("/api/user-courses/create", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    title: selectedCourse.title,
                                    description: selectedCourse.description,
                                    course_type: "date",
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
                                      day_number: 1,
                                      order_index: index,
                                    })),
                                    duration: "당일 코스",
                                  }),
                                })

                                if (!response.ok) {
                                  const errorData = await response.json().catch(() => ({}))
                                  throw new Error(errorData.error || "저장에 실패했습니다")
                                }

                                toast.success("데이트 코스가 저장되었습니다!")
                                setCreatingCourses(
                                  creatingCourses.filter(c => c.id !== selectedCourseId)
                                )
                                setSelectedCourseId(null)
                                setSidebarMode("browse")
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
      </div>

      {selectedPlace && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPlace(null)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
          {/* 모달 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 md:fixed md:bottom-auto md:left-1/2 md:right-auto md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[600px] md:max-w-[90vw] z-50"
          >
            <Card className="m-4 lg:m-0 shadow-2xl shadow-primary/30 border-2 border-primary/40 dark:border-primary/50 bg-gradient-to-br from-white via-primary/10 to-primary/5 dark:from-gray-900 dark:via-primary/20 dark:to-primary/10 backdrop-blur-xl rounded-2xl overflow-hidden max-h-[85vh] overflow-y-auto">
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
        </>
      )}
    </div>
  )
}
