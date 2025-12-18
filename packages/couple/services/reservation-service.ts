"use server"

import { createClient } from "@lovetrip/api/supabase/server"
import type { Database } from "@lovetrip/shared/types/database"

type ReservationReminder = Database["public"]["Tables"]["reservation_reminders"]["Row"]
type ReservationReminderInsert = Database["public"]["Tables"]["reservation_reminders"]["Insert"]
type ReservationReminderUpdate = Database["public"]["Tables"]["reservation_reminders"]["Update"]

/**
 * 사용자의 예약 리마인더 목록 조회
 */
export async function getReservationReminders(
  userId: string,
  travelPlanId?: string
): Promise<ReservationReminder[]> {
  const supabase = await createClient()

  let query = supabase
    .from("reservation_reminders")
    .select("*")
    .eq("user_id", userId)
    .order("reservation_date", { ascending: true })

  if (travelPlanId) {
    query = query.eq("travel_plan_id", travelPlanId)
  }

  const { data, error } = await query

  if (error) {
    console.error("[ReservationService] Error fetching reminders:", error)
    throw new Error("예약 리마인더를 불러오는데 실패했습니다")
  }

  return data || []
}

/**
 * 예약 리마인더 생성
 */
export async function createReservationReminder(
  userId: string,
  reminder: Omit<ReservationReminderInsert, "user_id">
): Promise<ReservationReminder> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("reservation_reminders")
    .insert({
      ...reminder,
      user_id: userId,
    })
    .select()
    .single()

  if (error) {
    console.error("[ReservationService] Error creating reminder:", error)
    throw new Error("예약 리마인더를 생성하는데 실패했습니다")
  }

  return data
}

/**
 * 예약 리마인더 업데이트
 */
export async function updateReservationReminder(
  reminderId: string,
  userId: string,
  updates: ReservationReminderUpdate
): Promise<ReservationReminder> {
  const supabase = await createClient()

  // 권한 확인
  const { data: existing } = await supabase
    .from("reservation_reminders")
    .select("user_id")
    .eq("id", reminderId)
    .single()

  if (!existing) {
    throw new Error("예약 리마인더를 찾을 수 없습니다")
  }

  if (existing.user_id !== userId) {
    throw new Error("예약 리마인더를 수정할 권한이 없습니다")
  }

  const { data, error } = await supabase
    .from("reservation_reminders")
    .update(updates)
    .eq("id", reminderId)
    .select()
    .single()

  if (error) {
    console.error("[ReservationService] Error updating reminder:", error)
    throw new Error("예약 리마인더를 업데이트하는데 실패했습니다")
  }

  return data
}

/**
 * 예약 리마인더 삭제
 */
export async function deleteReservationReminder(
  reminderId: string,
  userId: string
): Promise<void> {
  const supabase = await createClient()

  // 권한 확인
  const { data: existing } = await supabase
    .from("reservation_reminders")
    .select("user_id")
    .eq("id", reminderId)
    .single()

  if (!existing) {
    throw new Error("예약 리마인더를 찾을 수 없습니다")
  }

  if (existing.user_id !== userId) {
    throw new Error("예약 리마인더를 삭제할 권한이 없습니다")
  }

  const { error } = await supabase
    .from("reservation_reminders")
    .delete()
    .eq("id", reminderId)

  if (error) {
    console.error("[ReservationService] Error deleting reminder:", error)
    throw new Error("예약 리마인더를 삭제하는데 실패했습니다")
  }
}

/**
 * 다가오는 예약 리마인더 조회 (알림 전송용)
 */
export async function getUpcomingReservations(
  hoursAhead: number = 24
): Promise<ReservationReminder[]> {
  const supabase = await createClient()

  const now = new Date()
  const targetTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000)

  const { data, error } = await supabase
    .from("reservation_reminders")
    .select("*")
    .gte("reservation_date", now.toISOString())
    .lte("reservation_date", targetTime.toISOString())
    .eq("is_sent", false)
    .order("reservation_date", { ascending: true })

  if (error) {
    console.error("[ReservationService] Error fetching upcoming reservations:", error)
    return []
  }

  return data || []
}

