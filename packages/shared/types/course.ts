/**
 * Course Types
 *
 * 코스 관련 공통 타입 정의
 * database.ts의 타입을 기반으로 재사용 가능한 타입들을 정의합니다.
 */

import type { Database } from "./database"

/**
 * Database 타입 별칭
 */
export type UserCourse = Database["public"]["Tables"]["user_courses"]["Row"]
export type UserCoursePlace = Database["public"]["Tables"]["user_course_places"]["Row"]
export type TravelCourse = Database["public"]["Tables"]["travel_courses"]["Row"]
export type TravelCoursePlace = Database["public"]["Tables"]["travel_course_places"]["Row"]

/**
 * Place 타입
 * places 테이블이 삭제되었으므로 user_course_places/travel_course_places의 저장된 정보를 기반으로 정의
 */
export interface Place {
  id: string
  name: string
  address?: string | null
  lat: number
  lng: number
  type: "CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC"
  rating?: number | null
  price_level?: number | null
  description?: string | null
  image_url?: string | null
}

/**
 * DateCourse 타입
 * user_courses와 user_course_places를 기반으로 한 데이트 코스 타입
 */
export interface DateCourse {
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
  min_price?: number | null
  max_price?: number | null
}

/**
 * TravelCourseWithPlaces 타입
 * travel_courses와 travel_course_places를 기반으로 한 여행 코스 타입
 */
export interface TravelCourseWithPlaces {
  id: string
  title: string
  region: string
  description?: string
  image_url?: string | null
  place_count: number
  places: Place[]
  duration: string
  min_price?: number | null
  max_price?: number | null
}

/**
 * UserCoursePlace에서 Place로 변환하는 헬퍼 타입
 */
export type PlaceFromUserCoursePlace = Pick<
  UserCoursePlace,
  | "place_name"
  | "place_address"
  | "place_lat"
  | "place_lng"
  | "place_type"
  | "place_rating"
  | "place_price_level"
  | "place_description"
  | "place_image_url"
>

/**
 * TravelCoursePlace에서 Place로 변환하는 헬퍼 타입
 */
export type PlaceFromTravelCoursePlace = Pick<
  TravelCoursePlace,
  | "place_name"
  | "place_address"
  | "place_lat"
  | "place_lng"
  | "place_type"
  | "place_rating"
  | "place_price_level"
  | "place_description"
  | "place_image_url"
>
