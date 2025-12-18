"use server"

import { createClient, createServiceClient } from "@lovetrip/api/supabase/server"
import type { Subscription, SubscriptionStatus, SubscriptionTier } from "../types"

/**
 * 사용자의 구독 정보 조회 또는 생성
 * 구독이 없으면 무료 구독을 자동으로 생성
 */
export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (error) {
    // 구독 정보가 없으면 무료 구독 생성
    if (error.code === "PGRST116") {
      return await createFreeSubscription(userId)
    }
    console.error("[SubscriptionService] Error fetching subscription:", error)
    throw new Error("구독 정보를 불러오는데 실패했습니다")
  }

  // 만료된 구독은 무료로 전환
  if (data.status === "expired" || (data.end_date && new Date(data.end_date) < new Date())) {
    return await createFreeSubscription(userId)
  }

  return {
    id: data.id,
    userId: data.user_id,
    tier: data.tier as SubscriptionTier,
    status: data.status as SubscriptionStatus,
    startDate: data.start_date,
    endDate: data.end_date,
    cancelAtPeriodEnd: data.cancel_at_period_end ?? false,
    createdAt: data.created_at ?? new Date().toISOString(),
    updatedAt: data.updated_at ?? new Date().toISOString(),
  }
}

/**
 * 무료 구독 생성
 */
export async function createFreeSubscription(userId: string): Promise<Subscription> {
  // 서버 사이드에서 구독을 생성할 때는 서비스 역할 클라이언트를 사용하여 RLS 우회
  const supabase = createServiceClient()

  // 기존 구독이 있으면 업데이트, 없으면 생성
  const { data: existing } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (existing) {
    // 기존 구독을 무료로 업데이트
    const { data, error } = await supabase
      .from("subscriptions")
      .update({
        tier: "free",
        status: "active",
        start_date: new Date().toISOString(),
        end_date: null,
        cancel_at_period_end: false,
      })
      .eq("id", existing.id)
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      userId: data.user_id,
      tier: data.tier as SubscriptionTier,
      status: data.status as SubscriptionStatus,
      startDate: data.start_date,
      endDate: data.end_date,
      cancelAtPeriodEnd: data.cancel_at_period_end ?? false,
      createdAt: data.created_at ?? new Date().toISOString(),
      updatedAt: data.updated_at ?? new Date().toISOString(),
    }
  } else {
    // 새 무료 구독 생성
    return await createSubscription(userId, "free", new Date().toISOString(), null)
  }
}

/**
 * 사용자가 프리미엄 구독자인지 확인
 */
export async function isPremiumUser(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId)
  return subscription?.tier === "premium" && subscription?.status === "active"
}

/**
 * 구독 생성 (결제 완료 후)
 */
export async function createSubscription(
  userId: string,
  tier: SubscriptionTier,
  startDate: string,
  endDate: string | null = null
): Promise<Subscription> {
  // 서버 사이드에서 구독을 생성할 때는 서비스 역할 클라이언트를 사용하여 RLS 우회
  // 이렇게 하면 사용자 세션이 없어도 구독을 생성할 수 있습니다
  const supabase = createServiceClient()

  // 기존 구독이 있으면 업데이트, 없으면 생성
  const { data: existing } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (existing) {
    // 기존 구독 업데이트
    const { data, error } = await supabase
      .from("subscriptions")
      .update({
        tier,
        status: "active",
        start_date: startDate,
        end_date: endDate,
        cancel_at_period_end: false,
      })
      .eq("id", existing.id)
      .select()
      .single()

    if (error) {
      console.error("[SubscriptionService] Error updating subscription:", error)
      throw new Error("구독을 업데이트하는데 실패했습니다")
    }

    return {
      id: data.id,
      userId: data.user_id,
      tier: data.tier as SubscriptionTier,
      status: data.status as SubscriptionStatus,
      startDate: data.start_date,
      endDate: data.end_date,
      cancelAtPeriodEnd: data.cancel_at_period_end ?? false,
      createdAt: data.created_at ?? new Date().toISOString(),
      updatedAt: data.updated_at ?? new Date().toISOString(),
    }
  } else {
    // 새 구독 생성
    const { data, error } = await supabase
      .from("subscriptions")
      .insert({
        user_id: userId,
        tier,
        status: "active",
        start_date: startDate,
        end_date: endDate,
        cancel_at_period_end: false,
      })
      .select()
      .single()

    if (error) {
      const errorInfo = {
        message: error?.message || "Unknown error",
        code: error?.code || "NO_CODE",
        details: error?.details || null,
        hint: error?.hint || null,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      }
      console.error("[SubscriptionService] Error creating subscription:", errorInfo)
      console.error("[SubscriptionService] Full error object:", error)
      throw new Error(`구독을 생성하는데 실패했습니다: ${errorInfo.message} (${errorInfo.code})`)
    }

    return {
      id: data.id,
      userId: data.user_id,
      tier: data.tier as SubscriptionTier,
      status: data.status as SubscriptionStatus,
      startDate: data.start_date,
      endDate: data.end_date,
      cancelAtPeriodEnd: data.cancel_at_period_end ?? false,
      createdAt: data.created_at ?? new Date().toISOString(),
      updatedAt: data.updated_at ?? new Date().toISOString(),
    }
  }
}

/**
 * 구독 취소 (기간 종료 시 자동 취소)
 */
export async function cancelSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("subscriptions")
    .update({
      cancel_at_period_end: cancelAtPeriodEnd,
      status: cancelAtPeriodEnd ? "active" : "canceled",
    })
    .eq("id", subscriptionId)

  if (error) {
    console.error("[SubscriptionService] Error canceling subscription:", error)
    throw new Error("구독을 취소하는데 실패했습니다")
  }
}
