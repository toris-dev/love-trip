"use client"

import { createClient } from "@/lib/supabase/client"

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

export class CalendarService {
  private supabase = createClient()

  // 커플 매칭 요청 (닉네임으로)
  async requestCouple(nickname: string): Promise<{ success: boolean; error?: string }> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()
      if (!user) throw new Error("로그인이 필요합니다")

      // API 엔드포인트를 통해 닉네임으로 사용자 찾기
      const response = await fetch(`/api/users/search?nickname=${encodeURIComponent(nickname)}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return { success: false, error: errorData.error || "사용자를 찾을 수 없습니다. 닉네임을 확인해주세요." }
      }

      const foundUser = await response.json()
      if (!foundUser || !foundUser.id) {
        return { success: false, error: "사용자를 찾을 수 없습니다. 닉네임을 확인해주세요." }
      }

      const user2Id = foundUser.id

      // 이미 커플인지 확인
      const { data: existingCouple } = await this.supabase
        .from("couples")
        .select("*")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .or(`user1_id.eq.${user2Id},user2_id.eq.${user2Id}`)
        .eq("status", "accepted")
        .single()

      if (existingCouple) {
        return { success: false, error: "이미 커플로 연결되어 있습니다" }
      }

      // 이미 pending 요청이 있는지 확인
      const { data: pendingRequest } = await this.supabase
        .from("couples")
        .select("*")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .or(`user1_id.eq.${user2Id},user2_id.eq.${user2Id}`)
        .eq("status", "pending")
        .single()

      if (pendingRequest) {
        return { success: false, error: "이미 요청이 있습니다" }
      }

      // 커플 요청 생성
      const { error } = await this.supabase.from("couples").insert({
        user1_id: user.id,
        user2_id: user2Id,
        status: "pending",
      })

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      console.error("Error requesting couple:", error)
      return { success: false, error: error.message || "커플 요청에 실패했습니다" }
    }
  }

  // 커플 요청 수락/거절
  async respondToCoupleRequest(coupleId: string, accept: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()
      if (!user) throw new Error("로그인이 필요합니다")

      const { error } = await this.supabase
        .from("couples")
        .update({ status: accept ? "active" : "inactive" })
        .eq("id", coupleId)
        .eq("user2_id", user.id)

      if (error) throw error

      // 수락 시 기본 캘린더 생성
      if (accept) {
        const { data: couple } = await this.supabase.from("couples").select("*").eq("id", coupleId).single()
        if (couple) {
          await this.createDefaultCalendar(coupleId)
        }
      }

      return { success: true }
    } catch (error: any) {
      console.error("Error responding to couple request:", error)
      return { success: false, error: error.message || "요청 처리에 실패했습니다" }
    }
  }

  // 기본 캘린더 생성
  async createDefaultCalendar(coupleId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()
      if (!user) {
        console.error("[Calendar] No user found")
        return { success: false, error: "로그인이 필요합니다" }
      }

      console.log("[Calendar] Creating default calendar for couple:", coupleId, "user:", user.id)

      // 이미 캘린더가 있는지 확인
      const { data: existing, error: checkError } = await this.supabase
        .from("shared_calendars")
        .select("id")
        .eq("couple_id", coupleId)
        .limit(1)

      if (checkError) {
        console.error("[Calendar] Error checking existing calendars:", checkError)
        return { success: false, error: checkError.message || "캘린더 확인에 실패했습니다" }
      }

      if (existing && existing.length > 0) {
        console.log("[Calendar] Calendar already exists:", existing[0].id)
        return { success: true }
      }

      const { data, error } = await this.supabase
        .from("shared_calendars")
        .insert({
          couple_id: coupleId,
          name: "우리 캘린더",
          color: "#ff8fab",
          created_by: user.id,
        })
        .select()

      if (error) {
        console.error("[Calendar] Error inserting calendar:", {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        })
        throw error
      }

      console.log("[Calendar] Default calendar created successfully:", data)
      return { success: true }
    } catch (error: any) {
      console.error("[Calendar] Error creating default calendar:", {
        error,
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
        stack: error?.stack,
      })
      return {
        success: false,
        error: error?.message || error?.details || error?.hint || "캘린더 생성에 실패했습니다",
      }
    }
  }

  // 내 커플 정보 가져오기
  async getMyCouple(): Promise<Couple | null> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await this.supabase
        .from("couples")
        .select("*")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq("status", "active")
        .single()

      if (error || !data) return null
      return data as Couple
    } catch (error) {
      console.error("Error getting couple:", error)
      return null
    }
  }

  // 공유 캘린더 목록 가져오기
  async getCalendars(): Promise<SharedCalendar[]> {
    try {
      const couple = await this.getMyCouple()
      if (!couple) return []

      const { data, error } = await this.supabase
        .from("shared_calendars")
        .select("*")
        .eq("couple_id", couple.id)
        .order("created_at", { ascending: true })

      if (error) throw error
      return (data || []) as SharedCalendar[]
    } catch (error) {
      console.error("Error getting calendars:", error)
      return []
    }
  }

  // 캘린더 이벤트 가져오기
  async getEvents(calendarId: string, startDate?: Date, endDate?: Date): Promise<CalendarEvent[]> {
    try {
      let query = this.supabase.from("calendar_events").select("*").eq("calendar_id", calendarId)

      if (startDate) {
        query = query.gte("start_time", startDate.toISOString())
      }
      if (endDate) {
        query = query.lte("start_time", endDate.toISOString())
      }

      const { data, error } = await query.order("start_time", { ascending: true })

      if (error) throw error
      return (data || []) as CalendarEvent[]
    } catch (error) {
      console.error("Error getting events:", error)
      return []
    }
  }

  // 이벤트 생성
  async createEvent(event: Omit<CalendarEvent, "id" | "created_at" | "updated_at" | "created_by">): Promise<{ success: boolean; data?: CalendarEvent; error?: string }> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()
      if (!user) throw new Error("로그인이 필요합니다")

      const { data, error } = await this.supabase
        .from("calendar_events")
        .insert({
          ...event,
          created_by: user.id,
        })
        .select()
        .single()

      if (error) throw error

      // 푸시 알림 전송
      await this.sendEventNotification(data as CalendarEvent)

      return { success: true, data: data as CalendarEvent }
    } catch (error: any) {
      console.error("Error creating event:", error)
      return { success: false, error: error.message || "이벤트 생성에 실패했습니다" }
    }
  }

  // 이벤트 업데이트
  async updateEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.from("calendar_events").update(updates).eq("id", eventId)

      if (error) throw error
      return { success: true }
    } catch (error: any) {
      console.error("Error updating event:", error)
      return { success: false, error: error.message || "이벤트 업데이트에 실패했습니다" }
    }
  }

  // 이벤트 삭제
  async deleteEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.from("calendar_events").delete().eq("id", eventId)

      if (error) throw error
      return { success: true }
    } catch (error: any) {
      console.error("Error deleting event:", error)
      return { success: false, error: error.message || "이벤트 삭제에 실패했습니다" }
    }
  }

  // 푸시 알림 전송
  private async sendEventNotification(event: CalendarEvent): Promise<void> {
    try {
      const couple = await this.getMyCouple()
      if (!couple) return

      const {
        data: { user },
      } = await this.supabase.auth.getUser()
      if (!user) return

      // 파트너 ID 찾기
      const partnerId = couple.user1_id === user.id ? couple.user2_id : couple.user1_id

      // 푸시 알림 API 호출
      await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "새로운 일정이 추가되었어요 💕",
          body: `${event.title}${event.start_time ? ` - ${new Date(event.start_time).toLocaleDateString("ko-KR")}` : ""}`,
          url: "/calendar",
          userId: partnerId,
        }),
      })
    } catch (error) {
      console.error("Error sending push notification:", error)
    }
  }
}

export const calendarService = new CalendarService()

