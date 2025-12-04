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

async function getInitialDateCourses(): Promise<{
  courses: DateCourse[]
  hasMore: boolean
  totalCount: number
}> {
  const supabase = await createClient()
  const from = 0
  const to = ITEMS_PER_PAGE - 1

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
          dateCoursesData.map(async course => {
            const { data: placesData, error: placesError } = await supabase
              .from("date_course_places")
              .select("place_id, order_index, distance_from_previous_km, visit_duration_minutes")
              .eq("date_course_id", course.id)
              .order("order_index", { ascending: true })

      if (placesError || !placesData || placesData.length === 0) {
              return null
            }

      const placeIds = placesData.map(p => p.place_id)
            const { data: places, error: placesDetailError } = await supabase
              .from("places")
              .select("*")
              .in("id", placeIds)

      if (placesDetailError || !places || places.length === 0) {
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

  return {
    courses: validCourses,
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
        places (*)
      )
    `,
      { count: "exact" }
    )
    .order("region")
    .range(from, to)

  if (coursesError || !coursesData || coursesData.length === 0) {
    return {
      courses: [],
      hasMore: false,
      totalCount: 0,
    }
  }

  const totalCount = count || 0
  const hasMore = to < totalCount - 1

  const travelCourses: TravelCourse[] = ((coursesData as CourseWithPlaces[]) || [])
    .filter(course => course.place_count > 0)
    .map(course => {
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

  return {
    courses: travelCourses,
    hasMore,
    totalCount,
  }
}

interface DatePageProps {
  searchParams: Promise<{ type?: string }>
}

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
