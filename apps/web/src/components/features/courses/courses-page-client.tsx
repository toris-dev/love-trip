"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@lovetrip/ui/components/button"
import { Plus, ArrowLeft, Save, GripVertical, X, Heart, Plane, Menu } from "lucide-react"
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
import { Switch } from "@lovetrip/ui/components/switch"
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
  Wallet,
} from "lucide-react"
import { formatPriceRange } from "@/lib/format-price"
import { createClient } from "@lovetrip/api/supabase/client"
import { getCoupleRecommendations } from "@lovetrip/recommendation/services"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import dynamic from "next/dynamic"
import { TravelSidebar, type Place as TravelPlace } from "@lovetrip/planner/components/travel"
import type { CourseFilters as CourseFiltersType } from "./course-filters"
import type {
  Place,
  DateCourse,
  TravelCourseWithPlaces,
  TravelCoursePlace,
} from "@lovetrip/shared/types/course"

const NaverMapView = dynamic(() => import("@/components/shared/naver-map-view"), { ssr: false })

const ITEMS_PER_PAGE = 10

interface CoursesPageClientProps {
  initialDateCourses: DateCourse[]
  initialDateHasMore: boolean
  initialDateTotalCount: number
  initialTravelCourses: TravelCourseWithPlaces[]
  initialTravelHasMore: boolean
  initialTravelTotalCount: number
  initialCourseType: "date" | "travel"
  user: { id: string; email?: string } | null
}

export function CoursesPageClient({
  initialDateCourses,
  initialDateHasMore,
  initialDateTotalCount: _initialDateTotalCount,
  initialTravelCourses,
  initialTravelHasMore: _initialTravelHasMore,
  initialTravelTotalCount: _initialTravelTotalCount,
  initialCourseType: _initialCourseType,
  user: initialUser,
}: CoursesPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseType = (searchParams.get("type") === "travel" ? "travel" : "date") as
    | "date"
    | "travel"
  const isMobile = useIsMobile()

  // Date Course 상태
  const [dateCourses, setDateCourses] = useState<DateCourse[]>(initialDateCourses)
  const [, setFilteredDateCourses] = useState<DateCourse[]>(initialDateCourses)
  const [displayedDateCourses, setDisplayedDateCourses] = useState<DateCourse[]>(
    initialDateCourses.slice(0, ITEMS_PER_PAGE)
  )

  const [selectedDateCourse, setSelectedDateCourse] = useState<DateCourse | null>(null)
  const [dateSearchQuery, setDateSearchQuery] = useState("")
  const [dateHasMore, setDateHasMore] = useState(initialDateHasMore)
  const [datePage, setDatePage] = useState(0)
  const [dateIsLoading] = useState(false)
  const [dateIsLoadingMore, setDateIsLoadingMore] = useState(false)
  const [dateError] = useState<string | null>(null)
  const [dateFilters, _setDateFilters] = useState<CourseFiltersType>({})

  // Travel Course 상태
  const [travelCourses, setTravelCourses] = useState<TravelCourseWithPlaces[]>(initialTravelCourses)
  const [selectedTravelCourse, setSelectedTravelCourse] = useState<TravelCourseWithPlaces | null>(
    null
  )
  const [travelSearchQuery, setTravelSearchQuery] = useState("")
  const [travelIsLoading] = useState(false)
  const [travelIsLoadingMore, setTravelIsLoadingMore] = useState(false)
  const [travelHasMore, setTravelHasMore] = useState(_initialTravelHasMore)
  const [travelPage, setTravelPage] = useState(0)
  const [travelError, setTravelError] = useState<string | null>(null)
  const [_travelFilters, _setTravelFilters] = useState<CourseFiltersType>({})

  // 공통 상태
  const [selectedPlace, setSelectedPlace] = useState<Place | TravelPlace | null>(null)
  const [placeDetails, setPlaceDetails] = useState<{
    category?: string
    telephone?: string
    link?: string
    roadAddress?: string
    blogs?: Array<{
      title: string
      link: string
      description: string
      bloggername: string
      bloggerlink: string
      postdate: string
      image?: string
    }>
  } | null>(null)
  const [isLoadingPlaceDetails, setIsLoadingPlaceDetails] = useState(false)
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
      is_public: boolean
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
  const dateScrollContainerRef = useRef<HTMLDivElement>(null)
  const [dateScrollPosition, setDateScrollPosition] = useState<number>(0)

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
    // 현재 스크롤 위치 저장
    if (dateScrollContainerRef.current) {
      setDateScrollPosition(dateScrollContainerRef.current.scrollTop)
    }
    setSelectedDateCourse(course)
    setSelectedTravelCourse(null)
    setSelectedPlace(null)
  }

  const handleTravelCourseSelect = (course: TravelCourseWithPlaces) => {
    setSelectedTravelCourse(course)
    setSelectedDateCourse(null)
    setSelectedPlace(null)
  }

  const loadMoreTravelCourses = useCallback(async () => {
    if (travelIsLoadingMore || !travelHasMore) return

    setTravelIsLoadingMore(true)
    setTravelError(null)

    try {
      const supabase = createClient()
      const nextPage = travelPage + 1
      const from = nextPage * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      const {
        data: coursesData,
        error: coursesError,
        count,
      } = await supabase
        .from("travel_courses")
        .select(
          `
          *,
          travel_course_places (
            order_index,
            day_number,
            distance_from_previous_km,
            visit_duration_minutes,
            place_id,
            place_name,
            place_lat,
            place_lng,
            place_address,
            place_type,
            place_rating,
            place_price_level,
            place_image_url,
            place_description
          )
        `,
          { count: "exact" }
        )
        .order("region")
        .range(from, to)

      if (coursesError) {
        setTravelError(coursesError.message)
        return
      }

      const totalCount = count || 0
      setTravelHasMore(to < totalCount - 1)

      type TravelCourseData = {
        id: string
        title: string
        region: string
        description: string | null
        image_url?: string | null
        place_count: number
        duration?: string | null
        min_price?: number | null
        max_price?: number | null
        travel_course_places: TravelCoursePlace[]
      }

      const newCourses: TravelCourseWithPlaces[] = ((coursesData as TravelCourseData[]) || [])
        .filter(course => course.place_count > 0)
        .map(course => {
          const sortedPlaces = (course.travel_course_places || [])
            .sort((a: TravelCoursePlace, b: TravelCoursePlace) => {
              if (a.day_number !== b.day_number) {
                return (a.day_number || 0) - (b.day_number || 0)
              }
              return a.order_index - b.order_index
            })
            .map((tcp: TravelCoursePlace) => {
              if (!tcp.place_id && tcp.place_name && tcp.place_lat && tcp.place_lng) {
                return {
                  id: `stored-${tcp.order_index}`,
                  name: tcp.place_name,
                  lat: Number(tcp.place_lat),
                  lng: Number(tcp.place_lng),
                  type: (tcp.place_type as "CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC") || "ETC",
                  rating: tcp.place_rating ? Number(tcp.place_rating) : 0,
                  price_level: tcp.place_price_level ? Number(tcp.place_price_level) : 0,
                  description: tcp.place_description || "",
                  image_url: tcp.place_image_url || null,
                  address: tcp.place_address || null,
                }
              }
              return null
            })
            .filter((p): p is TravelPlace => p !== null)

          return {
            id: course.id,
            title: course.title,
            region: course.region,
            description: course.description || undefined,
            image_url: course.image_url,
            place_count: course.place_count,
            places: sortedPlaces,
            duration: course.duration || "",
            min_price: course.min_price ?? null,
            max_price: course.max_price ?? null,
          }
        })

      setTravelCourses(prev => [...prev, ...newCourses])
      setTravelPage(nextPage)
    } catch (error) {
      console.error("Failed to load more travel courses:", error)
      setTravelError(
        error instanceof Error ? error.message : "코스를 불러오는 중 오류가 발생했습니다."
      )
    } finally {
      setTravelIsLoadingMore(false)
    }
  }, [travelPage, travelHasMore, travelIsLoadingMore])

  const handlePlaceClick = async (place: Place | TravelPlace) => {
    setSelectedPlace(place)
    setPlaceDetails(null)
    setIsLoadingPlaceDetails(true)

    try {
      // 네이버 Places API로 장소 상세 정보 가져오기
      const query = `${place.name} ${place.address || ""}`.trim()
      const response = await fetch(`/api/places/details?query=${encodeURIComponent(query)}`)

      if (response.ok) {
        const data = await response.json()
        if (data.error) {
          console.warn("Failed to fetch place details:", data.error)
        } else {
          setPlaceDetails({
            category: data.place?.category || "",
            telephone: data.place?.telephone || "",
            link: data.place?.link || "",
            roadAddress: data.place?.roadAddress || "",
            blogs: data.blogs || [],
          })
        }
      } else {
        console.warn("Failed to fetch place details:", response.status)
      }
    } catch (error) {
      console.error("Failed to fetch place details:", error)
    } finally {
      setIsLoadingPlaceDetails(false)
    }
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

    // 검색했을 때나 코스를 선택했을 때만 표시
    // 기본적으로는 빈 배열 반환
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

  const loadMoreDateCourses = useCallback(async () => {
    if (dateIsLoadingMore || !dateHasMore || dateSearchQuery.trim()) return

    setDateIsLoadingMore(true)
    try {
      const supabase = createClient()
      const nextPage = datePage + 1
      const from = nextPage * ITEMS_PER_PAGE
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
      setDateHasMore(to < totalCount - 1)

      // date_courses 처리
      const dateCoursesWithPlaces = await Promise.all(
        dateCoursesData.map(async course => {
          const { data: placesData } = await supabase
            .from("date_course_places")
            .select(
              "place_id, place_name, place_lat, place_lng, place_address, place_type, place_rating, place_price_level, place_image_url, place_description, order_index, distance_from_previous_km, visit_duration_minutes"
            )
            .eq("date_course_id", course.id)
            .order("order_index", { ascending: true })

          if (!placesData || placesData.length === 0) return null

          const sortedPlaces =
            placesData
              ?.map(cp => {
                if (cp.place_name && cp.place_lat && cp.place_lng) {
                  return {
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
                  } as Place
                }
                return null
              })
              .filter((p): p is Place => p !== null) || []

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
            min_price: course.min_price ?? null,
            max_price: course.max_price ?? null,
          } as DateCourse
        })
      )

      // user_courses 처리
      const userCoursesWithPlaces = await Promise.all(
        userCoursesData.map(async course => {
          const { data: placesData } = await supabase
            .from("user_course_places")
            .select(
              "place_id, place_name, place_lat, place_lng, place_address, place_type, place_rating, place_price_level, place_image_url, place_description, order_index, visit_duration_minutes"
            )
            .eq("user_course_id", course.id)
            .order("order_index", { ascending: true })

          if (!placesData || placesData.length === 0) return null

          const sortedPlaces =
            placesData
              ?.map(cp => {
                if (cp.place_name && cp.place_lat && cp.place_lng) {
                  return {
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
                  } as Place
                }
                return null
              })
              .filter((p): p is Place => p !== null) || []

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
            min_price: course.min_price ?? null,
            max_price: course.max_price ?? null,
          } as DateCourse
        })
      )

      // 두 소스의 코스를 통합
      const courseMap = new Map<string, DateCourse>()
      dateCoursesWithPlaces
        .filter((c): c is DateCourse => c !== null)
        .forEach(course => {
          courseMap.set(course.id, course)
        })
      userCoursesWithPlaces
        .filter((c): c is DateCourse => c !== null)
        .forEach(course => {
          if (!courseMap.has(course.id)) {
            courseMap.set(course.id, course)
          }
        })

      const newCourses = Array.from(courseMap.values())
      setDateCourses(prev => [...prev, ...newCourses])
      setDisplayedDateCourses(prev => [...prev, ...newCourses])
      setDatePage(nextPage)
    } catch (error) {
      console.error("Failed to load more courses:", error)
    } finally {
      setDateIsLoadingMore(false)
    }
  }, [datePage, dateHasMore, dateIsLoadingMore, dateSearchQuery])

  // 필터링 로직을 useMemo로 최적화
  const filteredDateCourses = useMemo(() => {
    if (!dateSearchQuery.trim() && Object.keys(dateFilters).length === 0) {
      return dateCourses
    }

    const query = dateSearchQuery.toLowerCase()
    const hasSearchQuery = query.length > 0

    return dateCourses.filter(course => {
      // 검색어 필터
      if (hasSearchQuery) {
        const matchesSearch =
          course.title.toLowerCase().includes(query) ||
          course.region.toLowerCase().includes(query) ||
          course.description?.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // 추가 필터 적용
      if (
        dateFilters.region &&
        !course.region.toLowerCase().includes(dateFilters.region.toLowerCase())
      ) {
        return false
      }
      if (dateFilters.maxPrice && course.max_price && course.max_price > dateFilters.maxPrice) {
        return false
      }
      if (dateFilters.placeTypes && dateFilters.placeTypes.length > 0) {
        const coursePlaceTypes = course.places.map(p => p.type)
        if (
          !dateFilters.placeTypes.some(type => coursePlaceTypes.includes(type as Place["type"]))
        ) {
          return false
        }
      }
      return true
    })
  }, [dateCourses, dateSearchQuery, dateFilters])

  const filterDateCourses = useCallback(() => {
    setFilteredDateCourses(filteredDateCourses)
    if (dateSearchQuery.trim() || Object.keys(dateFilters).length > 0) {
      setDisplayedDateCourses(filteredDateCourses.slice(0, ITEMS_PER_PAGE))
      setDateHasMore(false)
      setDatePage(0)
    }
  }, [filteredDateCourses, dateSearchQuery, dateFilters])

  useEffect(() => {
    filterDateCourses()
  }, [filterDateCourses, dateFilters])

  // IntersectionObserver 설정
  useEffect(() => {
    if (!observerTarget.current || !dateHasMore || dateIsLoadingMore || dateSearchQuery.trim())
      return

    const observer = new IntersectionObserver(
      entries => {
        if (
          entries[0].isIntersecting &&
          dateHasMore &&
          !dateIsLoadingMore &&
          !dateSearchQuery.trim()
        ) {
          loadMoreDateCourses()
        }
      },
      { threshold: 0.1 }
    )

    const currentTarget = observerTarget.current
    observer.observe(currentTarget)

    return () => {
      observer.disconnect()
    }
  }, [dateHasMore, dateIsLoadingMore, dateSearchQuery, loadMoreDateCourses])

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  const selectedCourse = courseType === "date" ? selectedDateCourse : selectedTravelCourse

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
                setCreatingCourses(prev =>
                  prev.map(c =>
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
              className="absolute top-4 sm:top-6 left-4 sm:left-6 bg-card border border-border rounded-lg p-3 sm:p-4 shadow-lg max-w-[calc(100vw-2rem)] sm:max-w-sm z-40 max-h-[80vh] overflow-y-auto"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg mb-2 text-foreground line-clamp-2">
                    {selectedCourse.title}
                  </h3>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      <span>{selectedCourse.duration}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      <span>{selectedCourse.place_count}개 장소</span>
                    </div>
                    {formatPriceRange(selectedCourse.min_price, selectedCourse.max_price) && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-900/30">
                          <Wallet className="h-3 w-3" />
                          <span className="text-xs font-medium">
                            {formatPriceRange(selectedCourse.min_price, selectedCourse.max_price)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (courseType === "date") {
                      setSelectedDateCourse(null)
                      setSelectedPlace(null)
                    } else {
                      setSelectedTravelCourse(null)
                      setSelectedPlace(null)
                    }
                  }}
                  className="h-9 w-9 sm:h-8 sm:w-8 p-0 flex-shrink-0 z-50 relative touch-manipulation"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* 장소 목록 */}
              {selectedCourse.places && selectedCourse.places.length > 0 && (
                <div className="mt-3 sm:mt-4 space-y-2 border-t border-border/50 pt-3">
                  <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    방문 순서
                  </div>
                  {selectedCourse.places.map((place, index) => {
                    const placeWithOrder = place as Place & { order_index?: number }
                    const placeNumber =
                      placeWithOrder.order_index !== undefined
                        ? placeWithOrder.order_index + 1
                        : index + 1
                    return (
                      <div
                        key={
                          place.id
                            ? `${place.id}-${index}`
                            : `place-${index}-${place.lat}-${place.lng}`
                        }
                        className="flex items-start gap-2 p-2 sm:p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer touch-manipulation"
                        onClick={() => handlePlaceClick(place)}
                      >
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                          {placeNumber}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-xs sm:text-sm text-foreground truncate">
                            {place.name}
                          </div>
                          {place.address && (
                            <div className="text-[10px] sm:text-xs text-muted-foreground truncate mt-0.5">
                              {place.address}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* 코스 타입 전환 버튼 - 모바일에서는 검색창 아래 우측, 데스크톱에서는 우측 상단 */}
      <div
        className={`absolute top-20 sm:top-4 right-4 z-10 ${
          isMobile
            ? "flex flex-row gap-2 flex-wrap max-w-[calc(100vw-8rem)]"
            : "flex flex-col gap-3"
        }`}
      >
        <Button
          onClick={() => handleCourseTypeChange("date")}
          size={isMobile ? "sm" : "lg"}
          variant={courseType === "date" ? "default" : "outline"}
          className={`shadow-2xl border-0 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 touch-manipulation ${
            isMobile ? "px-3 py-2.5 text-xs" : "px-6 py-6 h-auto text-base"
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
          className={`shadow-2xl border-0 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 touch-manipulation ${
            isMobile ? "px-3 py-2.5 text-xs" : "px-6 py-6 h-auto text-base"
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
          className={`shadow-2xl shadow-primary/30 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-700 text-white border-0 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-primary/40 touch-manipulation ${
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
        <div className="h-full w-full bg-background border-r border-border shadow-xl pointer-events-auto flex flex-col relative overflow-hidden">
          {/* 모바일에서 사이드바 닫기 버튼 */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(false)}
              className="absolute top-4 right-4 z-50 h-10 w-10 sm:h-8 sm:w-8 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-lg touch-manipulation"
              aria-label="사이드바 닫기"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {sidebarMode === "browse" ? (
            <>
              {courseType === "date" ? (
                <>
                  {/* 선택된 데이트 코스 상세 뷰 */}
                  {selectedDateCourse ? (
                    <div className="h-full w-full flex flex-col overflow-hidden">
                      {/* 뒤로가기 헤더 */}
                      <div className="p-3 sm:p-4 border-b border-border bg-card flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedDateCourse(null)
                            setSelectedPlace(null)
                            // 저장된 스크롤 위치로 복원
                            setTimeout(() => {
                              if (dateScrollContainerRef.current) {
                                dateScrollContainerRef.current.scrollTop = dateScrollPosition
                              }
                            }, 0)
                          }}
                          className="h-9 w-9 sm:h-10 sm:w-10 p-0 flex-shrink-0"
                        >
                          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                        <h2 className="text-base sm:text-lg font-semibold text-foreground truncate">
                          코스 상세
                        </h2>
                      </div>

                      {/* 상세 정보 - 전체 영역 스크롤 */}
                      <div
                        className="flex-1 overflow-y-auto min-h-0"
                        style={{ WebkitOverflowScrolling: "touch" }}
                      >
                        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 pb-20 sm:pb-24">
                          {/* 코스 이미지 */}
                          {selectedDateCourse.image_url && (
                            <div className="relative w-full h-48 sm:h-64 rounded-lg overflow-hidden">
                              <Image
                                src={selectedDateCourse.image_url}
                                alt={selectedDateCourse.title}
                                fill
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                              <div className="absolute bottom-4 left-4 right-4">
                                <Badge className="bg-background/90 backdrop-blur-sm text-foreground border-0 text-sm">
                                  {selectedDateCourse.region}
                                </Badge>
                              </div>
                            </div>
                          )}

                          {/* 코스 기본 정보 */}
                          <div className="space-y-3 sm:space-y-4">
                            <div>
                              <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3">
                                {selectedDateCourse.title}
                              </h1>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-4 w-4" />
                                  <span>{selectedDateCourse.duration}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="h-4 w-4" />
                                  <span>{selectedDateCourse.place_count}개 장소</span>
                                </div>
                                {formatPriceRange(
                                  selectedDateCourse.min_price,
                                  selectedDateCourse.max_price
                                ) && (
                                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-900/30">
                                    <Wallet className="h-3 w-3" />
                                    <span className="text-xs font-medium">
                                      {formatPriceRange(
                                        selectedDateCourse.min_price,
                                        selectedDateCourse.max_price
                                      )}
                                    </span>
                                  </div>
                                )}
                                <Badge variant="secondary">{selectedDateCourse.region}</Badge>
                              </div>
                              {selectedDateCourse.description && (
                                <p className="text-sm sm:text-base text-foreground leading-relaxed">
                                  {selectedDateCourse.description}
                                </p>
                              )}
                            </div>

                            {/* 장소 목록 */}
                            {selectedDateCourse.places && selectedDateCourse.places.length > 0 && (
                              <div className="space-y-3 sm:space-y-4">
                                <div className="flex items-center justify-between">
                                  <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                                    방문 장소
                                  </h2>
                                  <Badge variant="outline" className="text-xs sm:text-sm">
                                    총 {selectedDateCourse.places.length}개
                                  </Badge>
                                </div>
                                <div className="space-y-2 sm:space-y-3">
                                  {selectedDateCourse.places.map((place, index) => {
                                    const placeWithOrder = place as Place & { order_index?: number }
                                    const placeNumber =
                                      placeWithOrder.order_index !== undefined
                                        ? placeWithOrder.order_index + 1
                                        : index + 1
                                    return (
                                      <Card
                                        key={
                                          place.id
                                            ? `${place.id}-${index}`
                                            : `place-${index}-${place.lat}-${place.lng}`
                                        }
                                        className="border-border hover:border-primary/50 transition-colors cursor-pointer"
                                        onClick={() => handlePlaceClick(place)}
                                      >
                                        <CardContent className="p-3 sm:p-4">
                                          <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                                              {placeNumber}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <h3 className="font-semibold text-sm sm:text-base text-foreground mb-1">
                                                {place.name}
                                              </h3>
                                              {place.address && (
                                                <p className="text-xs sm:text-sm text-muted-foreground">
                                                  {place.address}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="p-4 sm:p-5 md:p-6 border-b border-border bg-card">
                        <div className="flex items-center gap-3 sm:gap-4 mb-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-primary fill-primary" />
                          </div>
                          <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                              데이트 코스
                            </h1>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                              당일로 즐길 수 있는 로맨틱한 데이트 코스
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 sm:p-4 border-b border-border bg-muted/30">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                          <Input
                            placeholder="지역명으로 검색..."
                            value={dateSearchQuery}
                            onChange={e => setDateSearchQuery(e.target.value)}
                            className="pl-9 sm:pl-10 pr-3 sm:pr-4 h-10 sm:h-11 bg-background"
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

                      <div
                        ref={dateScrollContainerRef}
                        className="flex-1 overflow-y-auto min-h-0"
                        style={{ WebkitOverflowScrolling: "touch" }}
                      >
                        <div className="px-3 pt-3 sm:px-4 sm:pt-4 pb-40">
                          {dateIsLoading ? (
                            <div className="flex items-center justify-center h-full min-h-[400px]">
                              <div className="text-center">
                                <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary mx-auto mb-3" />
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  데이트 코스를 불러오는 중...
                                </p>
                              </div>
                            </div>
                          ) : displayedDateCourses.length === 0 ? (
                            <div className="text-center py-12 sm:py-16">
                              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                              </div>
                              <p className="text-sm sm:text-base font-semibold text-foreground mb-1">
                                검색 결과가 없습니다
                              </p>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                다른 키워드로 검색해보세요
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <AnimatePresence>
                                {displayedDateCourses.map(course => {
                                  const typedCourse = course as DateCourse
                                  const courseId = typedCourse.id
                                  const currentSelectedId: string | undefined = selectedDateCourse
                                    ? (selectedDateCourse as DateCourse).id
                                    : undefined
                                  const isSelected = currentSelectedId === courseId
                                  return (
                                    <motion.div
                                      key={typedCourse.id}
                                      initial={{ opacity: 0, y: 20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -20 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <Card
                                        className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50 touch-manipulation ${
                                          isSelected
                                            ? "ring-2 ring-primary border-primary"
                                            : "border-border hover:border-primary/30"
                                        }`}
                                        onClick={() => handleDateCourseSelect(course)}
                                      >
                                        <CardContent className="p-3 sm:p-4">
                                          {course.image_url && (
                                            <div className="relative w-full h-32 sm:h-36 md:h-40 mb-3 rounded-lg overflow-hidden group">
                                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10" />
                                              <Image
                                                src={course.image_url}
                                                alt={course.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                              />
                                              <div className="absolute bottom-2 left-2 right-2 z-20">
                                                <Badge className="bg-background/80 backdrop-blur-sm text-foreground border-0 text-[10px] sm:text-xs">
                                                  {course.region}
                                                </Badge>
                                              </div>
                                            </div>
                                          )}
                                          <div className="space-y-1.5 sm:space-y-2">
                                            <div className="flex items-center gap-1.5 sm:gap-2">
                                              <h3 className="font-semibold text-sm sm:text-base line-clamp-1 text-foreground">
                                                {course.title}
                                              </h3>
                                            </div>
                                            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
                                              <div className="flex items-center gap-1 flex-shrink-0">
                                                <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                                                <span className="whitespace-nowrap">
                                                  {course.duration}
                                                </span>
                                              </div>
                                              <span className="flex-shrink-0">•</span>
                                              <div className="flex items-center gap-1 flex-shrink-0">
                                                <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                                                <span className="whitespace-nowrap">
                                                  {course.place_count}개 장소
                                                </span>
                                              </div>
                                              {formatPriceRange(
                                                course.min_price,
                                                course.max_price
                                              ) && (
                                                <>
                                                  <span className="flex-shrink-0">•</span>
                                                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-900/30 flex-shrink-0">
                                                    <Wallet className="h-3 w-3 flex-shrink-0" />
                                                    <span className="text-xs font-medium whitespace-nowrap">
                                                      {formatPriceRange(
                                                        course.min_price,
                                                        course.max_price
                                                      )}
                                                    </span>
                                                  </div>
                                                </>
                                              )}
                                            </div>
                                            {course.description && (
                                              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                                                {course.description}
                                              </p>
                                            )}
                                            <div className="flex items-center justify-between pt-2 border-t border-border">
                                              <Badge
                                                variant="secondary"
                                                className="text-[10px] sm:text-xs"
                                              >
                                                {course.region}
                                              </Badge>
                                              <div className="flex items-center gap-1 text-primary">
                                                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap pt-2">
                                              {course.places.slice(0, 3).map((place, index) => {
                                                const Icon = getTypeIcon(place.type)
                                                return (
                                                  <Badge
                                                    key={
                                                      place.id
                                                        ? `${place.id}-${index}`
                                                        : `place-${index}-${place.lat}-${place.lng}`
                                                    }
                                                    variant="outline"
                                                    className="text-[10px] sm:text-xs"
                                                  >
                                                    <Icon className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                                                    {place.type}
                                                  </Badge>
                                                )
                                              })}
                                              {course.places.length > 3 && (
                                                <Badge
                                                  variant="outline"
                                                  className="text-[10px] sm:text-xs"
                                                >
                                                  +{course.places.length - 3}
                                                </Badge>
                                              )}
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    </motion.div>
                                  )
                                })}
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
                  )}
                </>
              ) : (
                <TravelSidebar
                  courses={travelCourses}
                  searchQuery={travelSearchQuery}
                  onSearchChange={setTravelSearchQuery}
                  selectedCourse={selectedTravelCourse}
                  onCourseSelect={handleTravelCourseSelect}
                  onClose={() => {
                    setSelectedTravelCourse(null)
                    setSelectedPlace(null)
                  }}
                  isLoading={travelIsLoading}
                  isLoadingMore={travelIsLoadingMore}
                  error={travelError}
                  hasMore={travelHasMore}
                  onLoadMore={loadMoreTravelCourses}
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
                  className="absolute top-4 right-4 z-50 h-10 w-10 sm:h-8 sm:w-8 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-lg touch-manipulation"
                  aria-label="사이드바 닫기"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <div className="p-3 sm:p-4 pb-16 max-w-full overflow-hidden">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 max-w-full overflow-hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSidebarMode("browse")
                      setSelectedCourseId(null)
                      setCreatingCourses([])
                    }}
                    className="h-9 w-9 p-0 flex-shrink-0 touch-manipulation"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-lg sm:text-xl font-bold text-foreground truncate">
                    코스 만들기
                  </h2>
                </div>

                {selectedCourseId === null ? (
                  <div className="space-y-3 sm:space-y-4">
                    <Button
                      onClick={() => {
                        const newCourseId = `new-${Date.now()}`
                        setCreatingCourses([
                          ...creatingCourses,
                          {
                            id: newCourseId,
                            title: "",
                            description: "",
                            is_public: false,
                            places: [],
                          },
                        ])
                        setSelectedCourseId(newCourseId)
                      }}
                      className="w-full h-11 sm:h-12 bg-primary hover:bg-primary/90 text-primary-foreground touch-manipulation"
                    >
                      <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />새 코스 만들기
                    </Button>

                    {creatingCourses.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-semibold">진행 중인 코스</Label>
                        {creatingCourses.map(course => (
                          <Card
                            key={course.id}
                            className="cursor-pointer hover:border-primary/50 transition-colors touch-manipulation"
                            onClick={() => setSelectedCourseId(course.id)}
                          >
                            <CardContent className="p-3 sm:p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-semibold text-xs sm:text-sm">
                                    {course.title || "제목 없음"}
                                  </h3>
                                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                                    {course.places.length}개 장소
                                  </p>
                                </div>
                                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
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
                      <div className="space-y-3 sm:space-y-4 max-w-full overflow-hidden">
                        <Card className="border border-border max-w-full overflow-hidden">
                          <CardHeader className="p-4 sm:p-6 max-w-full overflow-hidden">
                            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                {courseType === "date" ? (
                                  <Heart className="h-4 w-4 text-primary" />
                                ) : (
                                  <Plane className="h-4 w-4 text-primary" />
                                )}
                              </div>
                              코스 정보 입력
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-4 sm:pt-5 space-y-3 sm:space-y-4 max-w-full overflow-hidden">
                            <div>
                              <Label
                                htmlFor="course-title"
                                className="text-xs sm:text-sm font-semibold mb-2"
                              >
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
                                className="h-10 sm:h-11 w-full max-w-full"
                                maxLength={100}
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor="course-description"
                                className="text-xs sm:text-sm font-semibold mb-2"
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
                                className="h-10 sm:h-11 w-full max-w-full"
                                maxLength={200}
                              />
                            </div>
                            <div className="flex items-center justify-between pt-2">
                              <div className="space-y-0.5">
                                <Label
                                  htmlFor="course-public"
                                  className="text-xs sm:text-sm font-semibold"
                                >
                                  공개 설정
                                </Label>
                                <p className="text-[10px] sm:text-xs text-muted-foreground">
                                  공개하면 다른 사용자들이 이 코스를 볼 수 있습니다
                                </p>
                              </div>
                              <Switch
                                id="course-public"
                                checked={selectedCourse.is_public}
                                onCheckedChange={checked => {
                                  setCreatingCourses(
                                    creatingCourses.map(c =>
                                      c.id === selectedCourseId ? { ...c, is_public: checked } : c
                                    )
                                  )
                                }}
                              />
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border border-border">
                          <CardHeader className="p-4 sm:p-6">
                            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <MapPin className="h-4 w-4 text-primary" />
                              </div>
                              장소 추가
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-4 sm:pt-5 max-w-full overflow-hidden">
                            <LocationInput
                              label=""
                              value=""
                              onChange={() => {}}
                              showPreview={true}
                              className="max-w-full"
                              onLocationSelect={async location => {
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

                                try {
                                  // place_id 찾기 또는 생성
                                  const placeResponse = await fetch("/api/places/find-or-create", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      name: location.name || location.address,
                                      address: location.address,
                                      lat: location.lat,
                                      lng: location.lng,
                                      type: "ETC",
                                      region: selectedCourse.title.includes("서울")
                                        ? "서울"
                                        : selectedCourse.title.includes("부산")
                                          ? "부산"
                                          : undefined,
                                    }),
                                  })

                                  if (!placeResponse.ok) {
                                    throw new Error("장소를 찾거나 생성할 수 없습니다")
                                  }

                                  const { place_id } = await placeResponse.json()

                                  const newPlace = {
                                    id: place_id,
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
                                } catch (error) {
                                  toast.error(
                                    error instanceof Error
                                      ? error.message
                                      : "장소 추가에 실패했습니다"
                                  )
                                }
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
                                      key={
                                        place.id
                                          ? `${place.id}-${index}`
                                          : `place-${index}-${place.lat}-${place.lng}`
                                      }
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

                        <div className="flex gap-2 sm:gap-3 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => setSelectedCourseId(null)}
                            className="flex-1 h-11 sm:h-12 touch-manipulation"
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
                                let region = "기타"
                                if (firstPlace?.address) {
                                  const match = firstPlace.address.match(
                                    /(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)/
                                  )
                                  region = match ? match[1] : "기타"
                                }

                                const response = await fetch("/api/user-courses/create", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    title: selectedCourse.title,
                                    description: selectedCourse.description,
                                    course_type: courseType,
                                    region: region,
                                    is_public: selectedCourse.is_public,
                                    places: selectedCourse.places.map((p, index) => ({
                                      place_id: p.id,
                                      day_number:
                                        courseType === "travel"
                                          ? Math.floor(
                                              index / Math.ceil(selectedCourse.places.length / 3)
                                            ) + 1
                                          : 1,
                                      order_index: index,
                                    })),
                                  }),
                                })

                                if (!response.ok) {
                                  const errorData = await response.json().catch(() => ({}))
                                  throw new Error(errorData.error || "저장에 실패했습니다")
                                }

                                const data = await response.json()
                                toast.success(
                                  data.message ||
                                    (courseType === "date"
                                      ? "데이트 코스가 저장되었습니다!"
                                      : "여행 코스가 저장되었습니다!")
                                )
                                setCreatingCourses(
                                  creatingCourses.filter(c => c.id !== selectedCourseId)
                                )
                                setSelectedCourseId(null)
                                setSidebarMode("browse")

                                // 서버 컴포넌트 새로고침 (서버에서 user_courses 포함하여 다시 로드)
                                // 공개된 코스인 경우 사이드바에 표시되도록 페이지 새로고침
                                if (selectedCourse.is_public) {
                                  router.refresh()
                                  // 약간의 지연 후 페이지를 다시 로드하여 최신 데이터 표시
                                  setTimeout(() => {
                                    router.refresh()
                                  }, 500)
                                }
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
                            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground border-0 rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.02] font-semibold h-11 sm:h-12 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
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

      {selectedPlace &&
        (() => {
          const place = selectedPlace
          return (
            <>
              {/* 모달 - 전체 화면 (헤더 위에 표시) */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed inset-0 z-[100] flex flex-col bg-background"
                onClick={e => {
                  // 배경 클릭 시 닫기
                  if (e.target === e.currentTarget) {
                    setSelectedPlace(null)
                  }
                }}
              >
                <Card className="flex flex-col h-full w-full rounded-none border-0 shadow-none overflow-hidden">
                  {/* 헤더 - sticky로 스크롤 시에도 보이도록 */}
                  <CardHeader className="sticky top-0 z-10 pb-3 sm:pb-4 border-b border-border bg-card flex-shrink-0">
                    <div className="flex items-start justify-between gap-3 sm:gap-4">
                      <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                        {(() => {
                          const Icon = getTypeIcon(place.type)
                          return (
                            <div className="p-2 sm:p-2.5 rounded-xl bg-primary/10 flex-shrink-0">
                              <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            </div>
                          )
                        })()}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-1.5 text-foreground line-clamp-2">
                            {place.name}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                            <span className="line-clamp-1">
                              {place.address || "주소 정보 없음"}
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedPlace(null)}
                        className="h-10 w-10 sm:h-8 sm:w-8 flex-shrink-0 rounded-lg hover:bg-muted touch-manipulation"
                        aria-label="닫기"
                      >
                        <X className="h-5 w-5 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  {/* 컨텐츠 - 스크롤 최적화 */}
                  <CardContent
                    className="p-3 sm:p-4 md:p-6 overflow-y-auto flex-1 min-h-0"
                    style={{ WebkitOverflowScrolling: "touch" }}
                  >
                    <div className="space-y-4 sm:space-y-5 md:space-y-6">
                      {/* 이미지 */}
                      {place.image_url && (
                        <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden shadow-md border border-border">
                          <Image
                            src={place.image_url}
                            alt={place.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      {/* 기본 정보 배지 */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs font-medium">
                          {place.type}
                        </Badge>
                        {place.rating !== null && place.rating !== undefined && (
                          <div className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/30">
                            <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">
                              {place.rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                        {place.price_level !== null && place.price_level !== undefined && (
                          <div className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30">
                            <span className="text-xs font-semibold text-green-700 dark:text-green-300">
                              {"💰".repeat(place.price_level) || "💰"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 설명 */}
                      {place.description && (
                        <div>
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            {place.description}
                          </p>
                        </div>
                      )}

                      {/* 상세 정보 그리드 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                        {(place.phone || placeDetails?.telephone) && (
                          <div className="p-2.5 sm:p-3 rounded-lg bg-muted/50 border border-border">
                            <div className="text-xs font-medium text-muted-foreground mb-1">
                              전화번호
                            </div>
                            <div className="text-xs sm:text-sm font-medium text-foreground break-words">
                              {placeDetails?.telephone || place.phone}
                            </div>
                          </div>
                        )}
                        {placeDetails?.category && (
                          <div className="p-2.5 sm:p-3 rounded-lg bg-muted/50 border border-border">
                            <div className="text-xs font-medium text-muted-foreground mb-1">
                              카테고리
                            </div>
                            <div className="text-xs sm:text-sm font-medium text-foreground break-words">
                              {placeDetails.category}
                            </div>
                          </div>
                        )}
                        {placeDetails?.roadAddress &&
                          placeDetails.roadAddress !== place.address && (
                            <div className="p-2.5 sm:p-3 rounded-lg bg-muted/50 border border-border sm:col-span-2">
                              <div className="text-xs font-medium text-muted-foreground mb-1">
                                도로명 주소
                              </div>
                              <div className="text-xs sm:text-sm font-medium text-foreground break-words">
                                {placeDetails.roadAddress}
                              </div>
                            </div>
                          )}
                      </div>

                      {/* 네이버 지도 링크 */}
                      {placeDetails?.link && (
                        <div>
                          <a
                            href={placeDetails.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-xs sm:text-sm font-medium touch-manipulation"
                          >
                            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            네이버 지도에서 보기
                            <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </a>
                        </div>
                      )}

                      {/* 로딩 상태 */}
                      {isLoadingPlaceDetails && (
                        <div className="flex items-center justify-center py-6 sm:py-8">
                          <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-primary" />
                          <span className="text-xs sm:text-sm text-muted-foreground ml-2">
                            장소 정보를 불러오는 중...
                          </span>
                        </div>
                      )}
                      {/* 블로그 포스트 */}
                      {placeDetails?.blogs && placeDetails.blogs.length > 0 && (
                        <div className="border-t border-border pt-4 sm:pt-6">
                          <h4 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 text-foreground">
                            관련 블로그 포스트
                          </h4>
                          <div className="space-y-2.5 sm:space-y-3">
                            {placeDetails.blogs.map((blog, index) => (
                              <a
                                key={index}
                                href={blog.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block border border-border rounded-lg p-3 sm:p-4 hover:border-primary/50 hover:bg-muted/30 transition-all group touch-manipulation"
                              >
                                <div className="flex gap-3 sm:gap-4">
                                  {blog.image && (
                                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0 rounded-lg overflow-hidden border border-border">
                                      <Image
                                        src={blog.image}
                                        alt={blog.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform"
                                        onError={e => {
                                          e.currentTarget.parentElement!.style.display = "none"
                                        }}
                                      />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-semibold text-xs sm:text-sm md:text-base mb-1 sm:mb-1.5 text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                      {blog.title}
                                    </h5>
                                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-1.5 sm:mb-2">
                                      {blog.description}
                                    </p>
                                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-muted-foreground">
                                      <span className="truncate">{blog.bloggername}</span>
                                      {blog.postdate && (
                                        <>
                                          <span>•</span>
                                          <span className="flex-shrink-0">
                                            {`${blog.postdate.slice(0, 4)}.${blog.postdate.slice(4, 6)}.${blog.postdate.slice(6, 8)}`}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )
        })()}

      {/* 모바일에서 사이드바 열기 버튼 */}
      {isMobile && !isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute bottom-16 right-6 z-50 pb-safe"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0.5rem)" }}
        >
          <Button
            onClick={() => setIsSidebarOpen(true)}
            size="lg"
            className="shadow-2xl bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-14 w-14 p-0 touch-manipulation"
            aria-label="사이드바 열기"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </motion.div>
      )}
    </div>
  )
}
