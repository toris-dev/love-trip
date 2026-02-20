"use server"

import { createClient } from "@lovetrip/api/supabase/server"
import type { Database } from "@lovetrip/shared/types/database"

type AnniversaryReminder = Database["public"]["Tables"]["anniversary_reminders"]["Row"]
type AnniversaryReminderInsert = Database["public"]["Tables"]["anniversary_reminders"]["Insert"]
type AnniversaryReminderUpdate = Database["public"]["Tables"]["anniversary_reminders"]["Update"]

/**
 * 오늘이 기념일인지 (월·일 비교, 매년 반복)
 */
function isEventDateToday(eventDateStr: string): boolean {
  const event = new Date(eventDateStr + "T12:00:00Z")
  const today = new Date()
  return event.getUTCMonth() === today.getUTCMonth() && event.getUTCDate() === today.getUTCDate()
}

/**
 * 오늘 이미 알림 보냈는지 여부
 */
function wasNotifiedToday(lastNotifiedAt: string | null): boolean {
  if (!lastNotifiedAt) return false
  const notified = new Date(lastNotifiedAt)
  const today = new Date()
  return (
    notified.getUTCFullYear() === today.getUTCFullYear() &&
    notified.getUTCMonth() === today.getUTCMonth() &&
    notified.getUTCDate() === today.getUTCDate()
  )
}

/**
 * 사용자의 기념일 알림 목록 조회
 */
export async function getAnniversaryReminders(userId: string): Promise<AnniversaryReminder[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("anniversary_reminders")
    .select("*")
    .eq("user_id", userId)
    .order("event_date", { ascending: true })

  if (error) {
    console.error("[AnniversaryService] Error fetching reminders:", error)
    throw new Error("기념일 알림 목록을 불러오는데 실패했습니다")
  }
  return data ?? []
}

/**
 * 기념일 알림 생성
 */
export async function createAnniversaryReminder(
  userId: string,
  reminder: Omit<AnniversaryReminderInsert, "user_id">
): Promise<AnniversaryReminder> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("anniversary_reminders")
    .insert({
      ...reminder,
      user_id: userId,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("[AnniversaryService] Error creating reminder:", error)
    throw new Error("기념일 알림을 등록하는데 실패했습니다")
  }
  return data
}

/**
 * 기념일 알림 수정
 */
export async function updateAnniversaryReminder(
  reminderId: string,
  userId: string,
  updates: AnniversaryReminderUpdate
): Promise<AnniversaryReminder> {
  const supabase = await createClient()
  const { data: existing } = await supabase
    .from("anniversary_reminders")
    .select("user_id")
    .eq("id", reminderId)
    .single()

  if (!existing || existing.user_id !== userId) {
    throw new Error("기념일 알림을 수정할 권한이 없습니다")
  }

  const { data, error } = await supabase
    .from("anniversary_reminders")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", reminderId)
    .select()
    .single()

  if (error) {
    console.error("[AnniversaryService] Error updating reminder:", error)
    throw new Error("기념일 알림을 수정하는데 실패했습니다")
  }
  return data
}

/**
 * 기념일 알림 삭제
 */
export async function deleteAnniversaryReminder(
  reminderId: string,
  userId: string
): Promise<void> {
  const supabase = await createClient()
  const { data: existing } = await supabase
    .from("anniversary_reminders")
    .select("user_id")
    .eq("id", reminderId)
    .single()

  if (!existing || existing.user_id !== userId) {
    throw new Error("기념일 알림을 삭제할 권한이 없습니다")
  }

  const { error } = await supabase.from("anniversary_reminders").delete().eq("id", reminderId)
  if (error) {
    console.error("[AnniversaryService] Error deleting reminder:", error)
    throw new Error("기념일 알림을 삭제하는데 실패했습니다")
  }
}

/**
 * 오늘 알림을 보낼 대상 기념일 조회 (푸시 발송용)
 * - event_date의 월·일이 오늘과 같은 항목
 * - 오늘 아직 알림을 보내지 않은 항목
 */
export async function getDueAnniversaryReminders(): Promise<AnniversaryReminder[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("anniversary_reminders")
    .select("*")
    .order("event_date", { ascending: true })

  if (error) {
    console.error("[AnniversaryService] Error fetching for notification:", error)
    return []
  }

  const today = new Date()
  const todayKey = `${today.getUTCMonth()}-${today.getUTCDate()}`
  return (data ?? []).filter(row => {
    const event = new Date(row.event_date + "T12:00:00Z")
    const eventKey = `${event.getUTCMonth()}-${event.getUTCDate()}`
    if (eventKey !== todayKey) return false
    if (wasNotifiedToday(row.last_notified_at)) return false
    return true
  })
}

/**
 * 기념일 알림 발송 완료 처리 (last_notified_at 갱신)
 */
export async function markAnniversaryNotified(reminderId: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("anniversary_reminders")
    .update({
      last_notified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", reminderId)

  if (error) {
    console.error("[AnniversaryService] Error marking notified:", error)
  }
}
