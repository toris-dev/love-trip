"use server"

import { createClient } from "@lovetrip/api/supabase/server"
import type { Database } from "@lovetrip/shared/types/database"

type AnniversaryReminder = Database["public"]["Tables"]["anniversary_reminders"]["Row"]
type AnniversaryReminderInsert = Database["public"]["Tables"]["anniversary_reminders"]["Insert"]
type AnniversaryReminderUpdate = Database["public"]["Tables"]["anniversary_reminders"]["Update"]

/**
 * 커플의 기념일 알림 목록 조회
 */
export async function getAnniversaryReminders(
  userId: string
): Promise<AnniversaryReminder[]> {
  const supabase = await createClient()

  // 사용자의 커플 정보 조회
  const { data: couple } = await supabase
    .from("couples")
    .select("id")
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .single()

  if (!couple) {
    return []
  }

  // 커플의 기념일 알림 조회
  const { data, error } = await supabase
    .from("anniversary_reminders")
    .select("*")
    .eq("couple_id", couple.id)
    .order("date", { ascending: true })

  if (error) {
    console.error("[AnniversaryService] Error fetching reminders:", error)
    throw new Error("기념일 알림을 불러오는데 실패했습니다")
  }

  return data || []
}

/**
 * 기념일 알림 생성
 */
export async function createAnniversaryReminder(
  userId: string,
  reminder: Omit<AnniversaryReminderInsert, "user_id" | "couple_id">
): Promise<AnniversaryReminder> {
  const supabase = await createClient()

  // 사용자의 커플 정보 조회
  const { data: couple } = await supabase
    .from("couples")
    .select("id")
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .single()

  if (!couple) {
    throw new Error("커플 정보를 찾을 수 없습니다. 먼저 커플을 연결해주세요.")
  }

  const { data, error } = await supabase
    .from("anniversary_reminders")
    .insert({
      ...reminder,
      user_id: userId,
      couple_id: couple.id,
    })
    .select()
    .single()

  if (error) {
    console.error("[AnniversaryService] Error creating reminder:", error)
    throw new Error("기념일 알림을 생성하는데 실패했습니다")
  }

  return data
}

/**
 * 기념일 알림 업데이트
 */
export async function updateAnniversaryReminder(
  reminderId: string,
  userId: string,
  updates: AnniversaryReminderUpdate
): Promise<AnniversaryReminder> {
  const supabase = await createClient()

  // 권한 확인 (커플 멤버인지 확인)
  const { data: reminder } = await supabase
    .from("anniversary_reminders")
    .select("couple_id, couples!inner(user1_id, user2_id)")
    .eq("id", reminderId)
    .single()

  if (!reminder) {
    throw new Error("기념일 알림을 찾을 수 없습니다")
  }

  const couple = reminder.couples as { user1_id: string; user2_id: string }
  if (couple.user1_id !== userId && couple.user2_id !== userId) {
    throw new Error("기념일 알림을 수정할 권한이 없습니다")
  }

  const { data, error } = await supabase
    .from("anniversary_reminders")
    .update(updates)
    .eq("id", reminderId)
    .select()
    .single()

  if (error) {
    console.error("[AnniversaryService] Error updating reminder:", error)
    throw new Error("기념일 알림을 업데이트하는데 실패했습니다")
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

  // 권한 확인
  const { data: reminder } = await supabase
    .from("anniversary_reminders")
    .select("couple_id, couples!inner(user1_id, user2_id)")
    .eq("id", reminderId)
    .single()

  if (!reminder) {
    throw new Error("기념일 알림을 찾을 수 없습니다")
  }

  const couple = reminder.couples as { user1_id: string; user2_id: string }
  if (couple.user1_id !== userId && couple.user2_id !== userId) {
    throw new Error("기념일 알림을 삭제할 권한이 없습니다")
  }

  const { error } = await supabase.from("anniversary_reminders").delete().eq("id", reminderId)

  if (error) {
    console.error("[AnniversaryService] Error deleting reminder:", error)
    throw new Error("기념일 알림을 삭제하는데 실패했습니다")
  }
}

/**
 * 다가오는 기념일 알림 조회 (알림 전송용)
 */
export async function getUpcomingAnniversaries(
  daysAhead: number = 7
): Promise<AnniversaryReminder[]> {
  const supabase = await createClient()

  const today = new Date()
  const targetDate = new Date()
  targetDate.setDate(today.getDate() + daysAhead)

  const { data, error } = await supabase
    .from("anniversary_reminders")
    .select("*")
    .gte("date", today.toISOString().split("T")[0])
    .lte("date", targetDate.toISOString().split("T")[0])
    .order("date", { ascending: true })

  if (error) {
    console.error("[AnniversaryService] Error fetching upcoming anniversaries:", error)
    return []
  }

  return data || []
}

