/**
 * User Course Types
 *
 * 사용자 생성 코스 관련 타입 정의
 */

import type { Database } from "./database"

/**
 * User Course 타입 별칭
 */
export type UserCourse = Database["public"]["Tables"]["user_courses"]["Row"]
export type UserCourseInsert = Database["public"]["Tables"]["user_courses"]["Insert"]
export type UserCourseUpdate = Database["public"]["Tables"]["user_courses"]["Update"]

/**
 * User Course Place 타입 별칭
 */
export type UserCoursePlace = Database["public"]["Tables"]["user_course_places"]["Row"]
export type UserCoursePlaceInsert = Database["public"]["Tables"]["user_course_places"]["Insert"]
export type UserCoursePlaceUpdate = Database["public"]["Tables"]["user_course_places"]["Update"]

/**
 * Place 타입
 */
export type Place = Database["public"]["Tables"]["places"]["Row"]

/**
 * User Course Author
 */
export interface UserCourseAuthor {
  id: string
  display_name: string | null
  nickname: string | null
  avatar_url: string | null
  isPremium?: boolean // 프리미엄 구독자 여부
}

/**
 * User Course with Author
 * 작성자 정보를 포함한 코스 타입
 */
export interface UserCourseWithAuthor extends UserCourse {
  author?: UserCourseAuthor
  isLiked?: boolean
  isSaved?: boolean
}

/**
 * User Course with Places
 * 장소 정보를 포함한 코스 타입
 * 하이브리드 방식: place_id가 있으면 Place 객체, 없으면 null
 */
export interface UserCourseWithPlaces extends UserCourse {
  places: Array<UserCoursePlace & { place: Place | null }>
  author?: UserCourseAuthor
  isLiked?: boolean
  isSaved?: boolean
}
