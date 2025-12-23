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
