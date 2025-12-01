/**
 * Couple Domain Types
 */

export interface CalendarEvent {
  id: string
  calendar_id: string
  title: string
  description?: string
  start_time: string
  end_time?: string
  location?: string
  place_id?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface SharedCalendar {
  id: string
  couple_id: string
  name: string
  color: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface Couple {
  id: string
  user1_id: string
  user2_id: string
  status: "pending" | "accepted" | "rejected" | "blocked"
  created_at: string
  updated_at: string
}

