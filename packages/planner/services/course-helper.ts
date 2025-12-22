/**
 * Course Helper Functions
 *
 * 코스 관련 공통 헬퍼 함수들
 * 중복 코드를 제거하고 재사용 가능한 함수들을 제공합니다.
 */

import type { Place } from "@lovetrip/shared/types/course"
import type { UserCoursePlace, TravelCoursePlace } from "@lovetrip/shared/types/course"

/**
 * UserCoursePlace에서 Place로 변환
 */
export function convertUserCoursePlaceToPlace(
  coursePlace: UserCoursePlace,
  orderIndex: number
): Place | null {
  if (!coursePlace.place_name || !coursePlace.place_lat || !coursePlace.place_lng) {
    return null
  }

  return {
    id: `stored-${coursePlace.id}`,
    name: coursePlace.place_name,
    lat: Number(coursePlace.place_lat),
    lng: Number(coursePlace.place_lng),
    type: (coursePlace.place_type as "CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC") || "ETC",
    rating: coursePlace.place_rating ? Number(coursePlace.place_rating) : null,
    price_level: coursePlace.place_price_level ? Number(coursePlace.place_price_level) : null,
    description: coursePlace.place_description || null,
    image_url: coursePlace.place_image_url || null,
    address: coursePlace.place_address || null,
  }
}

/**
 * TravelCoursePlace에서 Place로 변환
 */
export function convertTravelCoursePlaceToPlace(
  coursePlace: TravelCoursePlace,
  orderIndex: number
): Place | null {
  if (!coursePlace.place_name || !coursePlace.place_lat || !coursePlace.place_lng) {
    return null
  }

  return {
    id: `stored-${coursePlace.id}`,
    name: coursePlace.place_name,
    lat: Number(coursePlace.place_lat),
    lng: Number(coursePlace.place_lng),
    type: (coursePlace.place_type as "CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC") || "ETC",
    rating: coursePlace.place_rating ? Number(coursePlace.place_rating) : null,
    price_level: coursePlace.place_price_level ? Number(coursePlace.place_price_level) : null,
    description: coursePlace.place_description || null,
    image_url: coursePlace.place_image_url || null,
    address: coursePlace.place_address || null,
  }
}

/**
 * DateCoursePlace에서 Place로 변환 (date_course_places 테이블용)
 */
export function convertDateCoursePlaceToPlace(
  coursePlace: {
    place_id: string | null
    place_name: string | null
    place_lat: number | null
    place_lng: number | null
    place_type: string | null
    place_rating: number | null
    place_price_level: number | null
    place_description: string | null
    place_image_url: string | null
    place_address: string | null
    order_index: number
  },
  orderIndex: number
): Place | null {
  if (!coursePlace.place_name || !coursePlace.place_lat || !coursePlace.place_lng) {
    return null
  }

  return {
    id: `stored-${orderIndex}`,
    name: coursePlace.place_name,
    lat: Number(coursePlace.place_lat),
    lng: Number(coursePlace.place_lng),
    type: (coursePlace.place_type as "CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC") || "ETC",
    rating: coursePlace.place_rating ? Number(coursePlace.place_rating) : null,
    price_level: coursePlace.place_price_level ? Number(coursePlace.place_price_level) : null,
    description: coursePlace.place_description || null,
    image_url: coursePlace.place_image_url || null,
    address: coursePlace.place_address || null,
  }
}
