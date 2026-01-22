"use server"

import { createClient } from "@lovetrip/api/supabase/server"
import type { Database } from "@lovetrip/shared/types/database"

type TravelMemory = Database["public"]["Tables"]["travel_memories"]["Row"]
type TravelMemoryInsert = Database["public"]["Tables"]["travel_memories"]["Insert"]
type TravelMemoryUpdate = Database["public"]["Tables"]["travel_memories"]["Update"]

/**
 * 여행 계획의 추억 목록 조회
 */
export async function getTravelMemories(
  travelPlanId: string,
  userId: string
): Promise<TravelMemory[]> {
  const supabase = await createClient()

  // 여행 계획 소유권 확인
  const { data: plan } = await supabase
    .from("travel_plans")
    .select("user_id")
    .eq("id", travelPlanId)
    .single()

  if (!plan) {
    throw new Error("여행 계획을 찾을 수 없습니다")
  }

  // 권한 확인: 소유자이거나 커플이 공유한 경우
  const { data: couple } = await supabase
    .from("couples")
    .select("id, user1_id, user2_id")
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .eq("status", "accepted")
    .single()

  const isOwner = plan.user_id === userId
  const isPartner = couple && (couple.user1_id === userId || couple.user2_id === userId)

  if (!isOwner && !isPartner) {
    throw new Error("추억을 조회할 권한이 없습니다")
  }

  const { data, error } = await supabase
    .from("travel_memories")
    .select("*")
    .eq("travel_plan_id", travelPlanId)
    .order("memory_date", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[TravelMemoryService] Error fetching memories:", error)
    throw new Error("추억을 불러오는데 실패했습니다")
  }

  return data || []
}

/**
 * 추억 생성
 */
export async function createTravelMemory(
  userId: string,
  memory: Omit<TravelMemoryInsert, "user_id">
): Promise<TravelMemory> {
  const supabase = await createClient()

  // 여행 계획 소유권 확인
  const { data: plan } = await supabase
    .from("travel_plans")
    .select("user_id")
    .eq("id", memory.travel_plan_id)
    .single()

  if (!plan) {
    throw new Error("여행 계획을 찾을 수 없습니다")
  }

  if (plan.user_id !== userId) {
    throw new Error("추억을 생성할 권한이 없습니다")
  }

  const { data, error } = await supabase
    .from("travel_memories")
    .insert({
      ...memory,
      user_id: userId,
    })
    .select()
    .single()

  if (error) {
    console.error("[TravelMemoryService] Error creating memory:", error)
    throw new Error("추억을 생성하는데 실패했습니다")
  }

  return data
}

/**
 * 추억 업데이트
 */
export async function updateTravelMemory(
  memoryId: string,
  userId: string,
  updates: TravelMemoryUpdate
): Promise<TravelMemory> {
  const supabase = await createClient()

  // 권한 확인
  const { data: existing } = await supabase
    .from("travel_memories")
    .select("user_id")
    .eq("id", memoryId)
    .single()

  if (!existing) {
    throw new Error("추억을 찾을 수 없습니다")
  }

  if (existing.user_id !== userId) {
    throw new Error("추억을 수정할 권한이 없습니다")
  }

  const { data, error } = await supabase
    .from("travel_memories")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", memoryId)
    .select()
    .single()

  if (error) {
    console.error("[TravelMemoryService] Error updating memory:", error)
    throw new Error("추억을 업데이트하는데 실패했습니다")
  }

  return data
}

/**
 * 추억 삭제
 */
export async function deleteTravelMemory(memoryId: string, userId: string): Promise<void> {
  const supabase = await createClient()

  // 권한 확인
  const { data: existing } = await supabase
    .from("travel_memories")
    .select("user_id, photo_urls")
    .eq("id", memoryId)
    .single()

  if (!existing) {
    throw new Error("추억을 찾을 수 없습니다")
  }

  if (existing.user_id !== userId) {
    throw new Error("추억을 삭제할 권한이 없습니다")
  }

  // Supabase Storage에서 사진 삭제
  if (existing.photo_urls && existing.photo_urls.length > 0) {
    const photoPaths = existing.photo_urls
      .map((url) => {
        // URL에서 경로 추출 (예: https://xxx.supabase.co/storage/v1/object/public/memories/path/to/image.jpg)
        const match = url.match(/\/memories\/(.+)$/)
        return match ? match[1] : null
      })
      .filter((path): path is string => path !== null)

    if (photoPaths.length > 0) {
      const { error: deleteError } = await supabase.storage
        .from("memories")
        .remove(photoPaths)

      if (deleteError) {
        console.error("[TravelMemoryService] Error deleting photos from storage:", deleteError)
        // 스토리지 삭제 실패해도 DB 레코드는 삭제 진행
      }
    }
  }

  const { error } = await supabase.from("travel_memories").delete().eq("id", memoryId)

  if (error) {
    console.error("[TravelMemoryService] Error deleting memory:", error)
    throw new Error("추억을 삭제하는데 실패했습니다")
  }
}

/**
 * 사용자의 모든 추억 조회 (여행 계획별 그룹화)
 */
export async function getUserMemories(userId: string): Promise<
  Array<{
    travelPlan: Database["public"]["Tables"]["travel_plans"]["Row"]
    memories: TravelMemory[]
  }>
> {
  const supabase = await createClient()

  const { data: memories, error } = await supabase
    .from("travel_memories")
    .select(
      `
      *,
      travel_plans (
        id,
        title,
        destination,
        start_date,
        end_date,
        created_at
      )
    `
    )
    .eq("user_id", userId)
    .order("memory_date", { ascending: false })

  if (error) {
    console.error("[TravelMemoryService] Error fetching user memories:", error)
    throw new Error("추억을 불러오는데 실패했습니다")
  }

  // 여행 계획별로 그룹화
  const grouped = new Map<
    string,
    {
      travelPlan: Database["public"]["Tables"]["travel_plans"]["Row"]
      memories: TravelMemory[]
    }
  >()

  memories?.forEach((memory: any) => {
    const planId = memory.travel_plan_id
    if (!grouped.has(planId)) {
      grouped.set(planId, {
        travelPlan: memory.travel_plans,
        memories: [],
      })
    }
    grouped.get(planId)!.memories.push(memory)
  })

  return Array.from(grouped.values())
}
