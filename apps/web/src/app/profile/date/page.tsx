import { createClient } from "@lovetrip/api/supabase/server"
import { ProfileCoursesPageClient } from "@/components/features/profile/profile-courses-page-client"
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

async function getUserDateCourses(userId: string): Promise<{
  courses: DateCourse[]
  hasMore: boolean
  totalCount: number
}> {
  const supabase = await createClient()
  const from = 0
  const to = ITEMS_PER_PAGE - 1

  const {
    data: userCoursesData,
    error: coursesError,
    count,
  } = await supabase
    .from("user_courses")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .eq("course_type", "date")
    .order("created_at", { ascending: false })
    .range(from, to)

  if (coursesError || !userCoursesData || userCoursesData.length === 0) {
    return {
      courses: [],
      hasMore: false,
      totalCount: 0,
    }
  }

  const totalCount = count || 0
  const hasMore = to < totalCount - 1

  // 각 코스의 장소 정보 가져오기
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
        region: course.region || "",
        description: course.description || "",
        image_url: course.image_url,
        place_count: course.place_count || sortedPlaces.length,
        places: sortedPlaces,
        duration: course.duration || "당일 코스",
        total_distance_km: null,
        max_distance_km: null,
        is_public: course.is_public || false,
      } as DateCourse
    })
  )

  const validCourses = coursesWithPlaces.filter((c): c is DateCourse => c !== null)

  return {
    courses: validCourses,
    hasMore,
    totalCount,
  }
}

async function getUserTravelCourses(userId: string): Promise<{
  courses: TravelCourse[]
  hasMore: boolean
  totalCount: number
}> {
  const supabase = await createClient()
  const from = 0
  const to = ITEMS_PER_PAGE - 1

  const {
    data: userCoursesData,
    error: coursesError,
    count,
  } = await supabase
    .from("user_courses")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .eq("course_type", "travel")
    .order("created_at", { ascending: false })
    .range(from, to)

  if (coursesError || !userCoursesData || userCoursesData.length === 0) {
    return {
      courses: [],
      hasMore: false,
      totalCount: 0,
    }
  }

  const totalCount = count || 0
  const hasMore = to < totalCount - 1

  // 각 코스의 장소 정보 가져오기 (하이브리드 방식)
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
      const sortedPlaces =
        placesData
          ?.map(cp => {
            // place_id가 있고 places 테이블에서 조회된 경우
            if (cp.place_id) {
              const place = placesFromDb.find(p => p.id === cp.place_id)
              if (place) {
                return { ...place, order_index: cp.order_index, day_number: cp.day_number || 1 }
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
              return { ...place, order_index: cp.order_index, day_number: cp.day_number || 1 }
            }

            return null
          })
          .filter((p): p is Place & { order_index: number; day_number: number } => p !== null)
          .sort((a, b) => {
            if (a.day_number !== b.day_number) {
              return a.day_number - b.day_number
            }
            return a.order_index - b.order_index
          }) || []

      return {
        id: course.id,
        title: course.title,
        region: course.region || "",
        description: course.description || undefined,
        image_url: course.image_url,
        place_count: course.place_count || sortedPlaces.length,
        places: sortedPlaces,
        duration: course.duration || "1박 2일",
      }
    })
  )

  const validCourses = coursesWithPlaces.filter((c): c is TravelCourse => c !== null)

  return {
    courses: validCourses,
    hasMore,
    totalCount,
  }
}

interface ProfileDatePageProps {
  searchParams: Promise<{ type?: string }>
}

export default async function ProfileDatePage({ searchParams }: ProfileDatePageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const params = await searchParams
  const courseType = params.type === "travel" ? "travel" : "date"

  const [dateCoursesData, travelCoursesData] = await Promise.all([
    getUserDateCourses(user.id),
    getUserTravelCourses(user.id),
  ])

  return (
    <ProfileCoursesPageClient
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
