import type { CalendarEvent } from "@lovetrip/couple/services"
import type { Place as SharedPlace } from "@lovetrip/shared/types/course"

export type Place = SharedPlace
export type CalendarEventWithPlace = CalendarEvent & { place?: Place }

export interface NewEventForm {
  title: string
  description: string
  start_time: string
  end_time: string
  location: string
  place_id: string
}

export interface PartnerInfo {
  id: string
  email: string
  name?: string
  nickname?: string
}

export interface CurrentUserInfo {
  id: string
  nickname?: string
}

export type CourseOption = "single" | "multiple"

export interface CourseForCalendar {
  id: string
  title: string
  description?: string | null
  course_type: "date" | "travel"
  region: string
  place_count: number
  duration?: string | null
  places?: Array<{
    id: string
    place_name: string
    place_address?: string | null
    place_lat?: number | null
    place_lng?: number | null
    place_type?: string | null
    order_index: number
    visit_duration_minutes?: number | null
    day_number?: number | null
    place?: {
      id: string
      name: string
      address?: string | null
      lat: number
      lng: number
      type: string
    } | null
  }>
}

export interface TravelPlanForCalendar {
  id: string
  title: string
  description?: string | null
  destination: string
  start_date: string
  end_date: string
  places?: number
}
