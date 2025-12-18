import { createClient } from "@lovetrip/api/supabase/server"
import { CoursesPageClient } from "@/components/features/courses/courses-page-client"
import type { Database } from "@lovetrip/shared/types/database"

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

type TravelCourse = {
  id: string
  title: string
  region: string
  description?: string
  image_url?: string | null
  place_count: number
  places: Place[]
  duration: string
}

type CourseWithPlaces = Database["public"]["Tables"]["travel_courses"]["Row"] & {
  travel_course_places: Array<{
    day_number: number
    order_index: number
    places: Place | null
  }>
}

/**
 * user_courses에서 공개된 코스를 DateCourse 형식으로 변환
 */
async function getUserDateCourses(
  supabase: any,
  limit: number = ITEMS_PER_PAGE
): Promise<DateCourse[]> {
  const { data: userCoursesData, error } = await supabase
    .from("user_courses")
    .select("*")
    .eq("course_type", "date")
    .eq("is_public", true)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error || !userCoursesData || userCoursesData.length === 0) {
    return []
  }

  const coursesWithPlaces = await Promise.all(
    userCoursesData.map(async course => {
      // 하이브리드 방식: place_id와 저장된 정보 모두 조회
      const { data: placesData, error: placesError } = await supabase
        .from("user_course_places")
        .select(
          "place_id, place_name, place_lat, place_lng, place_address, place_type, place_rating, place_price_level, place_image_url, place_description, order_index, visit_duration_minutes"
        )
        .eq("user_course_id", course.id)
        .order("order_index", { ascending: true })

      if (placesError || !placesData || placesData.length === 0) {
        return null
      }

      // place_id가 있는 장소들만 places 테이블에서 조회
      const placeIds = placesData.filter(p => p.place_id).map(p => p.place_id!)
      let placesFromDb: Place[] = []
      if (placeIds.length > 0) {
        const { data: places, error: placesDetailError } = await supabase
          .from("places")
          .select("*")
          .in("id", placeIds)

        if (!placesDetailError && places) {
          placesFromDb = places
        }
      }

      // 하이브리드 방식: place_id가 있으면 places 테이블에서, 없으면 저장된 정보 사용
      const sortedPlaces =
        placesData
          ?.map(cp => {
            // place_id가 있고 places 테이블에서 조회된 경우
            if (cp.place_id) {
              const place = placesFromDb.find(p => p.id === cp.place_id)
              if (place) {
                return { ...place, order_index: cp.order_index }
              }
            }

            // place_id가 없고 저장된 정보가 있는 경우
            if (cp.place_name && cp.place_lat && cp.place_lng) {
              const place: Place = {
                id: `stored-${cp.order_index}`,
                name: cp.place_name,
                lat: Number(cp.place_lat),
                lng: Number(cp.place_lng),
                type: (cp.place_type as "CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC") || "ETC",
                rating: cp.place_rating ? Number(cp.place_rating) : 0,
                price_level: cp.place_price_level ? Number(cp.place_price_level) : 0,
                description: cp.place_description || "",
                image_url: cp.place_image_url || null,
                address: cp.place_address || null,
                tour_content_id: null,
                tour_content_type_id: null,
                area_code: null,
                sigungu_code: null,
                category1: null,
                category2: null,
                category3: null,
                homepage: null,
                phone: null,
                opening_hours: null,
                zipcode: null,
                overview: null,
                created_time: null,
                modified_time: null,
                map_level: null,
                course_type: null,
                created_at: null,
                updated_at: null,
              }
              return { ...place, order_index: cp.order_index }
            }

            return null
          })
          .filter((p): p is Place & { order_index: number } => p !== null)
          .sort((a, b) => a.order_index - b.order_index) || []

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

  return coursesWithPlaces.filter((c): c is DateCourse => c !== null)
}

/**
 * user_courses에서 공개된 여행 코스를 TravelCourse 형식으로 변환
 */
async function getUserTravelCourses(
  supabase: any,
  limit: number = ITEMS_PER_PAGE
): Promise<TravelCourse[]> {
  const { data: userCoursesData, error } = await supabase
    .from("user_courses")
    .select("*")
    .eq("course_type", "travel")
    .eq("is_public", true)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error || !userCoursesData || userCoursesData.length === 0) {
    return []
  }

  const coursesWithPlaces = await Promise.all(
    userCoursesData.map(async course => {
      const { data: placesData, error: placesError } = await supabase
        .from("user_course_places")
        .select(
          "place_id, place_name, place_lat, place_lng, place_address, place_type, place_rating, place_price_level, place_image_url, place_description, order_index, day_number, visit_duration_minutes"
        )
        .eq("user_course_id", course.id)
        .order("day_number", { ascending: true })
        .order("order_index", { ascending: true })

      if (placesError || !placesData || placesData.length === 0) {
        return null
      }

      // place_id가 있는 장소들만 places 테이블에서 조회
      const placeIds = placesData.filter(p => p.place_id).map(p => p.place_id!)
      let placesFromDb: Place[] = []
      if (placeIds.length > 0) {
        const { data: places, error: placesDetailError } = await supabase
          .from("places")
          .select("*")
          .in("id", placeIds)

        if (!placesDetailError && places) {
          placesFromDb = places
        }
      }

      // 하이브리드 방식: place_id가 있으면 places 테이블에서, 없으면 저장된 정보 사용
      const sortedPlaces = placesData
        ?.map(cp => {
          // place_id가 있고 places 테이블에서 조회된 경우
          if (cp.place_id) {
            const place = placesFromDb.find(p => p.id === cp.place_id)
            if (place) {
              return place
            }
          }

          // place_id가 없고 저장된 정보가 있는 경우
          if (cp.place_name && cp.place_lat && cp.place_lng) {
            const place: Place = {
              id: `stored-${cp.order_index}`,
              name: cp.place_name,
              lat: Number(cp.place_lat),
              lng: Number(cp.place_lng),
              type: (cp.place_type as "CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC") || "ETC",
              rating: cp.place_rating ? Number(cp.place_rating) : 0,
              price_level: cp.place_price_level ? Number(cp.place_price_level) : 0,
              description: cp.place_description || "",
              image_url: cp.place_image_url || null,
              address: cp.place_address || null,
              tour_content_id: null,
              tour_content_type_id: null,
              area_code: null,
              sigungu_code: null,
              category1: null,
              category2: null,
              category3: null,
              homepage: null,
              phone: null,
              opening_hours: null,
              zipcode: null,
              overview: null,
              created_time: null,
              modified_time: null,
              map_level: null,
              course_type: null,
              created_at: null,
              updated_at: null,
            }
            return place
          }

          return null
        })
        .filter((p): p is Place => p !== null)

      return {
        id: course.id,
        title: course.title,
        region: course.region,
        description: course.description || undefined,
        image_url: course.image_url,
        place_count: course.place_count || sortedPlaces.length,
        places: sortedPlaces,
        duration: course.duration || "1박2일",
      } as TravelCourse
    })
  )

  return coursesWithPlaces.filter((c): c is TravelCourse => c !== null)
}

async function getInitialDateCourses(): Promise<{
  courses: DateCourse[]
  hasMore: boolean
  totalCount: number
}> {
  const supabase = await createClient()
  const from = 0
  const to = ITEMS_PER_PAGE - 1

  // date_courses와 user_courses를 병렬로 조회
  const [dateCoursesResult, userDateCourses] = await Promise.all([
    (async () => {
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

      if (coursesError || !dateCoursesData || dateCoursesData.length === 0) {
        return { courses: [], count: 0 }
      }

      const totalCount = count || 0
      const hasMore = to < totalCount - 1

      // 각 코스의 장소 정보 가져오기
      const coursesWithPlaces = await Promise.all(
        dateCoursesData.map(async course => {
          // 하이브리드 방식: place_id와 저장된 정보 모두 조회
          const { data: placesData, error: placesError } = await supabase
            .from("date_course_places")
            .select(
              "place_id, place_name, place_lat, place_lng, place_address, place_type, place_rating, place_price_level, place_image_url, place_description, order_index, distance_from_previous_km, visit_duration_minutes"
            )
            .eq("date_course_id", course.id)
            .order("order_index", { ascending: true })

          if (placesError || !placesData || placesData.length === 0) {
            return null
          }

          // place_id가 있는 장소들만 places 테이블에서 조회
          const placeIds = placesData.filter(p => p.place_id).map(p => p.place_id!)
          let placesFromDb: Place[] = []
          if (placeIds.length > 0) {
            const { data: places, error: placesDetailError } = await supabase
              .from("places")
              .select("*")
              .in("id", placeIds)

            if (!placesDetailError && places) {
              placesFromDb = places
            }
          }

          // 하이브리드 방식: place_id가 있으면 places 테이블에서, 없으면 저장된 정보 사용
          const sortedPlaces =
            placesData
              ?.map(cp => {
                // place_id가 있고 places 테이블에서 조회된 경우
                if (cp.place_id) {
                  const place = placesFromDb.find(p => p.id === cp.place_id)
                  if (place) {
                    return { ...place, order_index: cp.order_index }
                  }
                }

                // place_id가 없고 저장된 정보가 있는 경우
                if (cp.place_name && cp.place_lat && cp.place_lng) {
                  const place: Place = {
                    id: `stored-${cp.order_index}`,
                    name: cp.place_name,
                    lat: Number(cp.place_lat),
                    lng: Number(cp.place_lng),
                    type: (cp.place_type as "CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC") || "ETC",
                    rating: cp.place_rating ? Number(cp.place_rating) : 0,
                    price_level: cp.place_price_level ? Number(cp.place_price_level) : 0,
                    description: cp.place_description || "",
                    image_url: cp.place_image_url || null,
                    address: cp.place_address || null,
                    tour_content_id: null,
                    tour_content_type_id: null,
                    area_code: null,
                    sigungu_code: null,
                    category1: null,
                    category2: null,
                    category3: null,
                    homepage: null,
                    phone: null,
                    opening_hours: null,
                    zipcode: null,
                    overview: null,
                    created_time: null,
                    modified_time: null,
                    map_level: null,
                    course_type: null,
                    created_at: null,
                    updated_at: null,
                  }
                  return { ...place, order_index: cp.order_index }
                }

                return null
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

      return {
        courses: coursesWithPlaces.filter((c): c is DateCourse => c !== null),
        count: totalCount,
      }
    })(),
    getUserDateCourses(supabase, ITEMS_PER_PAGE),
  ])

  // 두 소스의 코스를 통합 (중복 제거 - ID 기준)
  const courseMap = new Map<string, DateCourse>()

  // date_courses 먼저 추가
  dateCoursesResult.courses.forEach(course => {
    courseMap.set(course.id, course)
  })

  // user_courses 추가 (중복되지 않는 경우만)
  userDateCourses.forEach(course => {
    if (!courseMap.has(course.id)) {
      courseMap.set(course.id, course)
    }
  })

  const allCourses = Array.from(courseMap.values())
  // 최신순으로 정렬
  allCourses.sort((a, b) => {
    // created_at이 없으면 뒤로
    return 0
  })

  const totalCount = dateCoursesResult.count + userDateCourses.length
  const hasMore = allCourses.length >= ITEMS_PER_PAGE

  return {
    courses: allCourses.slice(0, ITEMS_PER_PAGE),
    hasMore,
    totalCount,
  }
}

async function getInitialTravelCourses(): Promise<{
  courses: TravelCourse[]
  hasMore: boolean
  totalCount: number
}> {
  const supabase = await createClient()
  const from = 0
  const to = ITEMS_PER_PAGE - 1

  // travel_courses와 user_courses를 병렬로 조회
  const [travelCoursesResult, userTravelCourses] = await Promise.all([
    (async () => {
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
            place_description,
            places (*)
          )
        `,
          { count: "exact" }
        )
        .order("region")
        .range(from, to)

      if (coursesError || !coursesData || coursesData.length === 0) {
        return { courses: [], count: 0 }
      }

      const totalCount = count || 0
      const hasMore = to < totalCount - 1

      const travelCourses: TravelCourse[] = ((coursesData as any[]) || [])
        .filter(course => course.place_count > 0)
        .map(course => {
          const sortedPlaces = (course.travel_course_places || [])
            .sort((a: any, b: any) => {
              if (a.day_number !== b.day_number) {
                return a.day_number - b.day_number
              }
              return a.order_index - b.order_index
            })
            .map((tcp: any) => {
              // place_id가 있고 places 테이블에서 조회된 경우
              if (tcp.place_id && tcp.places) {
                return tcp.places
              }

              // place_id가 없고 저장된 정보가 있는 경우
              if (!tcp.place_id && tcp.place_name && tcp.place_lat && tcp.place_lng) {
                const place: Place = {
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
                  tour_content_id: null,
                  tour_content_type_id: null,
                  area_code: null,
                  sigungu_code: null,
                  category1: null,
                  category2: null,
                  category3: null,
                  homepage: null,
                  phone: null,
                  opening_hours: null,
                  zipcode: null,
                  overview: null,
                  created_time: null,
                  modified_time: null,
                  map_level: null,
                  course_type: null,
                  created_at: null,
                  updated_at: null,
                }
                return place
              }

              return null
            })
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

      return {
        courses: travelCourses,
        count: totalCount,
      }
    })(),
    getUserTravelCourses(supabase, ITEMS_PER_PAGE),
  ])

  // 두 소스의 코스를 통합 (중복 제거 - ID 기준)
  const courseMap = new Map<string, TravelCourse>()

  // travel_courses 먼저 추가
  travelCoursesResult.courses.forEach(course => {
    courseMap.set(course.id, course)
  })

  // user_courses 추가 (중복되지 않는 경우만)
  userTravelCourses.forEach(course => {
    if (!courseMap.has(course.id)) {
      courseMap.set(course.id, course)
    }
  })

  const allCourses = Array.from(courseMap.values())
  const totalCount = travelCoursesResult.count + userTravelCourses.length
  const hasMore = allCourses.length >= ITEMS_PER_PAGE

  return {
    courses: allCourses.slice(0, ITEMS_PER_PAGE),
    hasMore,
    totalCount,
  }
}

interface DatePageProps {
  searchParams: Promise<{ type?: string }>
}

// 동적 렌더링 강제: 항상 최신 데이터를 가져오도록 설정
export const dynamic = "force-dynamic"

export default async function DatePage({ searchParams }: DatePageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const params = await searchParams
  const courseType = params.type === "travel" ? "travel" : "date"

  const [dateCoursesData, travelCoursesData] = await Promise.all([
    getInitialDateCourses(),
    getInitialTravelCourses(),
  ])

  return (
    <CoursesPageClient
      initialDateCourses={dateCoursesData.courses}
      initialDateHasMore={dateCoursesData.hasMore}
      initialDateTotalCount={dateCoursesData.totalCount}
      initialTravelCourses={travelCoursesData.courses}
      initialTravelHasMore={travelCoursesData.hasMore}
      initialTravelTotalCount={travelCoursesData.totalCount}
      initialCourseType={courseType}
      user={user ? { id: user.id, email: user.email } : null}
    />
  )
}
