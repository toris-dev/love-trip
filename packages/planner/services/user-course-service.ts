"use server"

import { createClient as createServerClient } from "@lovetrip/api/supabase/server"
import { grantPublishReward, grantInteractionReward } from "@lovetrip/gamification"
import type {
  Database,
  UserCourse,
  UserCourseUpdate,
  UserCoursePlace,
  UserCoursePlaceInsert,
  UserCourseWithPlaces,
  UserCourseWithAuthor,
  UserCourseAuthor,
  Place,
} from "@lovetrip/shared/types"

/**
 * 사용자가 직접 코스를 생성 (travel_plan 없이)
 */
export async function createUserCourseDirectly(
  userId: string,
  data: {
    title: string
    description?: string
    course_type: "travel" | "date"
    region: string
    is_public: boolean
    places: Array<{
      place_id?: string | null // 하이브리드 방식: place_id가 있으면 사용, 없으면 place_info 사용
      place_info?: {
        // 네이버 API로 검색한 장소 정보
        name: string
        lat: number
        lng: number
        address?: string
        type?: "CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC"
        rating?: number
        price_level?: number
        image_url?: string
        description?: string
      }
      day_number?: number
      order_index: number
      visit_duration_minutes?: number
      notes?: string
    }>
    estimated_budget?: number
    duration?: string
    image_url?: string
  }
): Promise<UserCourse> {
  const supabase = await createServerClient()

  if (!data.title.trim()) {
    throw new Error("코스 제목을 입력해주세요")
  }

  if (!data.places || data.places.length === 0) {
    throw new Error("최소 1개 이상의 장소를 추가해주세요")
  }

  // user_course 생성
  const duration = data.duration || (data.course_type === "date" ? "당일 코스" : "1박2일")

  const { data: userCourse, error: courseError } = await supabase
    .from("user_courses")
    .insert({
      user_id: userId,
      title: data.title,
      description: data.description || null,
      course_type: data.course_type,
      region: data.region,
      is_public: data.is_public,
      status: data.is_public ? "published" : "draft",
      published_at: data.is_public ? new Date().toISOString() : null,
      estimated_budget: data.estimated_budget || null,
      duration,
      place_count: data.places.length,
      image_url: data.image_url || null,
    })
    .select()
    .single()

  if (courseError || !userCourse) {
    throw courseError || new Error("코스 생성에 실패했습니다")
  }

  // user_course_places 생성 (하이브리드 방식)
  const placesToInsert: UserCoursePlaceInsert[] = data.places.map(place => {
    // place_id가 있으면 사용, 없으면 place_info 사용
    if (place.place_id) {
      return {
        user_course_id: userCourse.id,
        place_id: place.place_id,
        day_number: place.day_number || 1,
        order_index: place.order_index,
        visit_duration_minutes: place.visit_duration_minutes || null,
        notes: place.notes || null,
      }
    } else if (place.place_info) {
      // 네이버 API로 검색한 장소 정보 직접 저장
      return {
        user_course_id: userCourse.id,
        place_id: null, // place_id 없음
        place_name: place.place_info.name,
        place_lat: place.place_info.lat,
        place_lng: place.place_info.lng,
        place_address: place.place_info.address || null,
        place_type: place.place_info.type || "ETC",
        place_rating: place.place_info.rating || null,
        place_price_level: place.place_info.price_level || null,
        place_image_url: place.place_info.image_url || null,
        place_description: place.place_info.description || null,
        day_number: place.day_number || 1,
        order_index: place.order_index,
        visit_duration_minutes: place.visit_duration_minutes || null,
        notes: place.notes || null,
      }
    } else {
      throw new Error("장소 정보가 올바르지 않습니다. place_id 또는 place_info가 필요합니다.")
    }
  })

  if (placesToInsert.length > 0) {
    const { error: placesError } = await supabase.from("user_course_places").insert(placesToInsert)

    if (placesError) {
      // 롤백: user_course 삭제
      await supabase.from("user_courses").delete().eq("id", userCourse.id)
      throw placesError
    }
  }

  // 공개로 생성한 경우 보상 지급
  if (data.is_public) {
    await grantPublishReward(userId, userCourse.id)
  }

  return userCourse
}

/**
 * travel_plan을 user_course로 변환하여 저장
 */
export async function createUserCourseFromTravelPlan(
  travelPlanId: string,
  userId: string,
  options: {
    isPublic?: boolean
    title?: string
    description?: string
  } = {}
) {
  const supabase = await createServerClient()

  // 1. travel_plan 정보 가져오기
  const { data: travelPlan, error: planError } = await supabase
    .from("travel_plans")
    .select("*")
    .eq("id", travelPlanId)
    .eq("user_id", userId)
    .single()

  if (planError || !travelPlan) {
    throw new Error("여행 계획을 찾을 수 없습니다")
  }

  // 2. travel_days 및 places 가져오기
  const { data: travelDays } = await supabase
    .from("travel_days")
    .select(
      `
      *,
      travel_day_places (
        *,
        place:places (*)
      )
    `
    )
    .eq("travel_plan_id", travelPlanId)
    .order("day_number", { ascending: true })

  if (!travelDays || travelDays.length === 0) {
    throw new Error("여행 계획에 장소가 없습니다")
  }

  // 3. user_course 생성
  const courseType = travelPlan.start_date === travelPlan.end_date ? "date" : "travel"
  const duration =
    courseType === "date"
      ? "당일 코스"
      : calculateDuration(travelPlan.start_date, travelPlan.end_date)

  const { data: userCourse, error: courseError } = await supabase
    .from("user_courses")
    .insert({
      user_id: userId,
      title: options.title || travelPlan.title,
      description: options.description || travelPlan.description,
      course_type: courseType,
      region: travelPlan.destination,
      is_public: options.isPublic || false,
      status: options.isPublic ? "published" : "draft",
      published_at: options.isPublic ? new Date().toISOString() : null,
      estimated_budget: Number(travelPlan.total_budget) || null,
      duration,
      place_count: travelDays.reduce(
        (
          sum: number,
          day: Database["public"]["Tables"]["travel_days"]["Row"] & {
            travel_day_places?: Array<Database["public"]["Tables"]["travel_day_places"]["Row"]>
          }
        ) => sum + (day.travel_day_places?.length || 0),
        0
      ),
      image_url: null, // 첫 번째 장소의 이미지로 설정 가능
    })
    .select()
    .single()

  if (courseError || !userCourse) {
    throw courseError || new Error("코스 생성에 실패했습니다")
  }

  // 4. user_course_places 생성
  const placesToInsert: UserCoursePlaceInsert[] = []
  for (const day of travelDays) {
    if (!day.travel_day_places) continue

    for (const [index, dayPlace] of day.travel_day_places.entries()) {
      placesToInsert.push({
        user_course_id: userCourse.id,
        place_id: dayPlace.place_id,
        day_number: day.day_number,
        order_index: index,
        visit_duration_minutes: null,
        notes: dayPlace.notes || null,
      })
    }
  }

  if (placesToInsert.length > 0) {
    const { error: placesError } = await supabase.from("user_course_places").insert(placesToInsert)

    if (placesError) {
      // 롤백: user_course 삭제
      await supabase.from("user_courses").delete().eq("id", userCourse.id)
      throw placesError
    }
  }

  // 보상 지급은 API 레벨에서 처리 (중복 방지)

  return userCourse
}

/**
 * 공개 코스 목록 조회
 */
export async function getPublicCourses(options: {
  region?: string
  courseType?: "travel" | "date"
  sort?: "popular" | "recent" | "views" | "likes"
  limit?: number
  offset?: number
  userId?: string // 좋아요/저장 여부 확인용
}): Promise<UserCourseWithAuthor[]> {
  const supabase = await createServerClient()

  let query = supabase
    .from("user_courses")
    .select("*")
    .eq("is_public", true)
    .eq("status", "published")

  // 필터링
  if (options.region) {
    query = query.eq("region", options.region)
  }
  if (options.courseType) {
    query = query.eq("course_type", options.courseType)
  }

  // 정렬
  switch (options.sort) {
    case "popular":
      query = query
        .order("like_count", { ascending: false })
        .order("save_count", { ascending: false })
      break
    case "recent":
      query = query.order("published_at", { ascending: false })
      break
    case "views":
      query = query.order("view_count", { ascending: false })
      break
    case "likes":
      query = query.order("like_count", { ascending: false })
      break
    default:
      query = query.order("created_at", { ascending: false })
  }

  // 페이지네이션
  const limit = options.limit || 20
  const offset = options.offset || 0
  query = query.range(offset, offset + limit - 1)

  const { data: courses, error } = await query

  if (error) throw error

  // 작성자 정보 수동 조회 (FK 누락 대응)
  const userIds = [...new Set(courses?.map((c: UserCourse) => c.user_id) || [])]
  let profileMap = new Map<string, UserCourseAuthor>()

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, nickname, avatar_url")
      .in("id", userIds)

    if (profiles) {
      profileMap = new Map(profiles.map((p: UserCourseAuthor) => [p.id, p]))
    }

    // 프리미엄 구독자 확인
    const { data: subscriptions } = await supabase
      .from("subscriptions")
      .select("user_id, tier, status")
      .in("user_id", userIds)
      .eq("tier", "premium")
      .eq("status", "active")

    const premiumUserIds = new Set(subscriptions?.map((s: { user_id: string }) => s.user_id) || [])

    // 프로필에 프리미엄 정보 추가
    profileMap.forEach((profile, userId) => {
      profile.isPremium = premiumUserIds.has(userId)
    })
  }

  const coursesWithAuthor =
    courses?.map((course: UserCourse) => ({
      ...course,
      author: profileMap.get(course.user_id),
    })) || []

  // 사용자가 좋아요/저장했는지 확인
  if (options.userId && coursesWithAuthor.length > 0) {
    const courseIds = coursesWithAuthor.map((c: UserCourse) => c.id)

    const [likesResult, savesResult] = await Promise.all([
      supabase
        .from("user_course_likes")
        .select("user_course_id")
        .eq("user_id", options.userId)
        .in("user_course_id", courseIds),
      supabase
        .from("user_course_saves")
        .select("user_course_id")
        .eq("user_id", options.userId)
        .in("user_course_id", courseIds),
    ])

    const likedIds = new Set(
      likesResult.data?.map((l: { user_course_id: string }) => l.user_course_id) || []
    )
    const savedIds = new Set(
      savesResult.data?.map((s: { user_course_id: string }) => s.user_course_id) || []
    )

    return coursesWithAuthor.map((course: UserCourse) => ({
      ...course,
      isLiked: likedIds.has(course.id),
      isSaved: savedIds.has(course.id),
    }))
  }

  return coursesWithAuthor
}

/**
 * 코스 상세 조회 (장소 포함)
 */
export async function getUserCourseWithPlaces(
  courseId: string,
  userId?: string
): Promise<UserCourseWithPlaces | null> {
  const supabase = await createServerClient()

  // 코스 정보 조회
  const { data: course, error: courseError } = await supabase
    .from("user_courses")
    .select("*")
    .eq("id", courseId)
    .single()

  if (courseError || !course) {
    return null
  }

  // 공개되지 않은 코스는 소유자만 조회 가능
  if (!course.is_public && course.user_id !== userId) {
    return null
  }

  // 장소 정보 조회 (하이브리드 방식)
  // place_id가 있으면 places 테이블과 조인, 없으면 저장된 정보 사용
  const { data: coursePlaces, error: placesError } = await supabase
    .from("user_course_places")
    .select(
      `
      *,
      place:places (*)
    `
    )
    .eq("user_course_id", courseId)
    .order("day_number", { ascending: true })
    .order("order_index", { ascending: true })

  if (placesError) throw placesError

  // 하이브리드 방식: place_id가 없으면 저장된 정보로 Place 객체 생성
  const placesWithFallback = (coursePlaces || []).map(cp => {
    // place_id가 있고 places 테이블에서 조회된 경우
    if (cp.place_id && cp.place) {
      return { ...cp, place: cp.place }
    }

    // place_id가 없고 저장된 정보가 있는 경우
    if (!cp.place_id && cp.place_name && cp.place_lat && cp.place_lng) {
      const placeFromStored: Place = {
        id: `stored-${cp.id}`, // 임시 ID
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
      return { ...cp, place: placeFromStored }
    }

    // 둘 다 없는 경우 (데이터 불일치)
    return { ...cp, place: null }
  })

  // 조회수 증가 (공개 코스이고 본인이 아닌 경우)
  if (course.is_public && course.user_id !== userId) {
    await supabase
      .from("user_courses")
      .update({ view_count: (course.view_count || 0) + 1 })
      .eq("id", courseId)
  }

  // 좋아요/저장 여부 확인
  let isLiked = false
  let isSaved = false

  if (userId) {
    const [likeResult, saveResult] = await Promise.all([
      supabase
        .from("user_course_likes")
        .select("id")
        .eq("user_course_id", courseId)
        .eq("user_id", userId)
        .single(),
      supabase
        .from("user_course_saves")
        .select("id")
        .eq("user_course_id", courseId)
        .eq("user_id", userId)
        .single(),
    ])

    isLiked = !!likeResult.data
    isSaved = !!saveResult.data
  }

  // 작성자 정보 수동 조회
  const { data: author } = await supabase
    .from("profiles")
    .select("id, display_name, nickname, avatar_url")
    .eq("id", course.user_id)
    .single()

  // 프리미엄 구독자 확인
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("tier, status")
    .eq("user_id", course.user_id)
    .eq("tier", "premium")
    .eq("status", "active")
    .single()

  const isPremium = !!subscription

  return {
    ...course,
    places: placesWithFallback as Array<UserCoursePlace & { place: Place | null }>,
    author: author ? { ...author, isPremium } : undefined,
    isLiked,
    isSaved,
  }
}

/**
 * 코스 좋아요 토글
 */
export async function toggleCourseLike(courseId: string, userId: string) {
  const supabase = await createServerClient()

  // 코스 정보 확인
  const { data: course } = await supabase
    .from("user_courses")
    .select("user_id, is_public")
    .eq("id", courseId)
    .single()

  if (!course) {
    throw new Error("코스를 찾을 수 없습니다")
  }

  // 공개 코스만 좋아요 가능
  if (!course.is_public) {
    throw new Error("공개되지 않은 코스입니다")
  }

  // 자신의 코스는 좋아요 불가
  if (course.user_id === userId) {
    throw new Error("자신의 코스는 좋아요할 수 없습니다")
  }

  // 기존 좋아요 확인
  const { data: existing } = await supabase
    .from("user_course_likes")
    .select("id")
    .eq("user_course_id", courseId)
    .eq("user_id", userId)
    .single()

  if (existing) {
    return await removeLike(courseId, existing.id, course.user_id)
  } else {
    return await addLike(courseId, userId, course.user_id)
  }
}

/**
 * 좋아요 추가
 */
async function addLike(
  courseId: string,
  userId: string,
  courseOwnerId: string
): Promise<{ liked: boolean }> {
  const supabase = await createServerClient()

  // 좋아요 추가
  const { error } = await supabase.from("user_course_likes").insert({
    user_course_id: courseId,
    user_id: userId,
  })

  if (error) {
    throw new Error(`좋아요 추가 실패: ${error.message}`)
  }

  // 좋아요 카운트 증가
  await updateLikeCount(courseId, 1)

  // 작성자에게 보상 지급
  await grantInteractionReward(courseOwnerId, courseId, "like")

  return { liked: true }
}

/**
 * 좋아요 제거
 */
async function removeLike(
  courseId: string,
  likeId: string,
  courseOwnerId: string
): Promise<{ liked: boolean }> {
  const supabase = await createServerClient()

  // 좋아요 제거
  const { error } = await supabase.from("user_course_likes").delete().eq("id", likeId)

  if (error) {
    throw new Error(`좋아요 제거 실패: ${error.message}`)
  }

  // 좋아요 카운트 감소
  await updateLikeCount(courseId, -1)

  return { liked: false }
}

/**
 * 좋아요 카운트 업데이트
 */
async function updateLikeCount(courseId: string, delta: number): Promise<void> {
  const supabase = await createServerClient()

  const { data: course } = await supabase
    .from("user_courses")
    .select("like_count")
    .eq("id", courseId)
    .single()

  if (course) {
    const newLikeCount = Math.max(0, (course.like_count || 0) + delta)
    const { error } = await supabase
      .from("user_courses")
      .update({ like_count: newLikeCount })
      .eq("id", courseId)

    if (error) {
      console.error("Failed to update like count:", error)
      // 카운트 업데이트 실패는 치명적이지 않으므로 에러를 던지지 않음
    }
  }
}

/**
 * 코스 저장 토글
 */
export async function toggleCourseSave(courseId: string, userId: string) {
  const supabase = await createServerClient()

  // 코스 정보 확인
  const { data: course } = await supabase
    .from("user_courses")
    .select("user_id, is_public")
    .eq("id", courseId)
    .single()

  if (!course) {
    throw new Error("코스를 찾을 수 없습니다")
  }

  // 공개 코스만 저장 가능
  if (!course.is_public) {
    throw new Error("공개되지 않은 코스입니다")
  }

  // 기존 저장 확인
  const { data: existing } = await supabase
    .from("user_course_saves")
    .select("id")
    .eq("user_course_id", courseId)
    .eq("user_id", userId)
    .single()

  if (existing) {
    return await removeSave(courseId, existing.id)
  } else {
    return await addSave(courseId, userId, course.user_id)
  }
}

/**
 * 저장 추가
 */
async function addSave(
  courseId: string,
  userId: string,
  courseOwnerId: string
): Promise<{ saved: boolean }> {
  const supabase = await createServerClient()

  // 저장 추가
  const { error } = await supabase.from("user_course_saves").insert({
    user_course_id: courseId,
    user_id: userId,
  })

  if (error) {
    throw new Error(`저장 추가 실패: ${error.message}`)
  }

  // 저장 카운트 증가
  await updateSaveCount(courseId, 1)

  // 자신의 코스가 아닌 경우에만 보상 지급
  if (courseOwnerId !== userId) {
    await grantInteractionReward(courseOwnerId, courseId, "save")
  }

  return { saved: true }
}

/**
 * 저장 제거
 */
async function removeSave(courseId: string, saveId: string): Promise<{ saved: boolean }> {
  const supabase = await createServerClient()

  // 저장 제거
  const { error } = await supabase.from("user_course_saves").delete().eq("id", saveId)

  if (error) {
    throw new Error(`저장 제거 실패: ${error.message}`)
  }

  // 저장 카운트 감소
  await updateSaveCount(courseId, -1)

  return { saved: false }
}

/**
 * 저장 카운트 업데이트
 */
async function updateSaveCount(courseId: string, delta: number): Promise<void> {
  const supabase = await createServerClient()

  const { data: course } = await supabase
    .from("user_courses")
    .select("save_count")
    .eq("id", courseId)
    .single()

  if (course) {
    const newSaveCount = Math.max(0, (course.save_count || 0) + delta)
    const { error } = await supabase
      .from("user_courses")
      .update({ save_count: newSaveCount })
      .eq("id", courseId)

    if (error) {
      console.error("Failed to update save count:", error)
      // 카운트 업데이트 실패는 치명적이지 않으므로 에러를 던지지 않음
    }
  }
}

/**
 * 내가 만든 코스 목록 조회
 */
export async function getMyCourses(userId: string) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("user_courses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * 코스 공개 상태 변경
 */
export async function updateCoursePublishStatus(
  courseId: string,
  userId: string,
  isPublic: boolean
) {
  const supabase = await createServerClient()

  // 코스 소유권 확인
  const { data: course } = await supabase
    .from("user_courses")
    .select("user_id, status")
    .eq("id", courseId)
    .eq("user_id", userId)
    .single()

  if (!course) {
    throw new Error("코스를 찾을 수 없거나 권한이 없습니다")
  }

  const updateData: UserCourseUpdate = {
    is_public: isPublic,
    status: isPublic ? "published" : "draft",
    published_at: isPublic ? new Date().toISOString() : null,
  }

  const { data, error } = await supabase
    .from("user_courses")
    .update(updateData)
    .eq("id", courseId)
    .select()
    .single()

  if (error) throw error

  // 공개로 변경 시 보상 지급 (이전에 공개되지 않았던 경우)
  if (isPublic && course.status !== "published") {
    await grantPublishReward(userId, courseId)
  }

  return data
}

/**
 * 코스 삭제
 */
export async function deleteUserCourse(courseId: string, userId: string) {
  const supabase = await createServerClient()

  // 소유권 확인
  const { data: course } = await supabase
    .from("user_courses")
    .select("user_id")
    .eq("id", courseId)
    .eq("user_id", userId)
    .single()

  if (!course) {
    throw new Error("코스를 찾을 수 없거나 권한이 없습니다")
  }

  const { error } = await supabase.from("user_courses").delete().eq("id", courseId)

  if (error) throw error
}

/**
 * 유틸리티 함수
 */

/**
 * 시작일과 종료일로부터 여행 기간 계산
 *
 * @param startDate - 시작일 (YYYY-MM-DD 형식)
 * @param endDate - 종료일 (YYYY-MM-DD 형식)
 * @returns 여행 기간 문자열 (예: "1박2일", "2박3일")
 *
 * @example
 * ```typescript
 * const duration = calculateDuration("2024-03-01", "2024-03-03")
 * // "2박3일" 반환
 * ```
 */
function calculateDuration(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)

  // 날짜 차이 계산 (밀리초)
  const diffTime = Math.abs(end.getTime() - start.getTime())

  // 일 단위로 변환 (올림)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return "당일 코스"
  }

  if (diffDays === 1) {
    return "1박2일"
  }

  return `${diffDays - 1}박${diffDays}일`
}
