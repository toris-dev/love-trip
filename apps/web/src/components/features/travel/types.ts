import type { Place as SharedPlace } from "@lovetrip/shared/types/course"

export type Place = SharedPlace

export interface TravelCourse {
  id: string
  title: string
  region: string
  description?: string
  image_url?: string | null
  place_count: number
  places: Place[]
  duration: string // "1박2일", "2박3일" 등
  min_price?: number | null
  max_price?: number | null
}
