"use server"

import { isPremiumUser } from "./subscription-service"
import type { PremiumFeatureKey } from "../types"
import { PREMIUM_FEATURES } from "../types"

/**
 * 사용자가 특정 프리미엄 기능을 사용할 수 있는지 확인
 */
export async function canUseFeature(
  userId: string,
  feature: PremiumFeatureKey
): Promise<boolean> {
  const isPremium = await isPremiumUser(userId)

  // 프리미엄 기능 목록
  const premiumOnlyFeatures: PremiumFeatureKey[] = [
    PREMIUM_FEATURES.THEME_COURSES,
    PREMIUM_FEATURES.COUPLE_CURATION,
    PREMIUM_FEATURES.AI_RESCHEDULE,
    PREMIUM_FEATURES.BUDGET_OPTIMIZATION,
    PREMIUM_FEATURES.ANNIVERSARY_REMINDERS,
    PREMIUM_FEATURES.UNLIMITED_ALBUM,
    PREMIUM_FEATURES.PREMIUM_BADGE,
    PREMIUM_FEATURES.ADVANCED_FILTERS,
    PREMIUM_FEATURES.AD_FREE,
  ]

  // 프리미엄 전용 기능인 경우 프리미엄 구독자만 사용 가능
  if (premiumOnlyFeatures.includes(feature)) {
    return isPremium
  }

  // 기본 기능은 모두 사용 가능
  return true
}

/**
 * 프리미엄 기능 사용 시도 (권한 체크 포함)
 */
export async function requirePremiumFeature(
  userId: string,
  feature: PremiumFeatureKey
): Promise<void> {
  const canUse = await canUseFeature(userId, feature)

  if (!canUse) {
    throw new Error(
      "이 기능은 프리미엄 구독자만 사용할 수 있습니다. 구독을 업그레이드해주세요."
    )
  }
}

