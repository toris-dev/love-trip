"use client"

import { useState, useEffect, useCallback } from "react"
import { getCoupleRecommendations } from "@lovetrip/recommendation/services"
import { createClient } from "@lovetrip/api/supabase/client"
import type { Database } from "@lovetrip/shared/types/database"
import type { TravelCourse, Place } from "../types"

type CourseWithPlaces = Database["public"]["Tables"]["travel_courses"]["Row"] & {
  travel_course_places: Array<{
    day_number: number
    order_index: number
    places: Place | null
  }>
}

export function useTravelCourses() {
  const [courses, setCourses] = useState<TravelCourse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        return
      }

      // DB 데이터를 TravelCourse 형식으로 변환
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
    } catch (error) {
      console.error("Failed to load courses:", error)
      setError(error instanceof Error ? error.message : "코스를 불러오는 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }, [groupTravelCoursesByRegion])

  useEffect(() => {
    loadCourses()
  }, [loadCourses])

  return {
    courses,
    isLoading,
    error,
  }
}

