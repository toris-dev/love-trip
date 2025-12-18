export type SubscriptionTier = "free" | "premium"

export type SubscriptionStatus = "active" | "canceled" | "expired" | "trial"

export interface Subscription {
  id: string
  userId: string
  tier: SubscriptionTier
  status: SubscriptionStatus
  startDate: string
  endDate: string | null
  cancelAtPeriodEnd: boolean
  createdAt: string
  updatedAt: string
}

export interface PremiumFeature {
  id: string
  name: string
  description: string
  requiresPremium: boolean
}

/**
 * 프리미엄 기능 목록
 * 기획서 5장 구독 모델 설계 기준
 */
export const PREMIUM_FEATURES = {
  // 테마/기념일/럭셔리/서프라이즈 코스
  THEME_COURSES: "theme_courses",
  // 커플 감성 큐레이션 필터
  COUPLE_CURATION: "couple_curation",
  // AI 일정 자동 재편성
  AI_RESCHEDULE: "ai_reschedule",
  // 예산 최적화 대안 코스 AI 추천
  BUDGET_OPTIMIZATION: "budget_optimization",
  // 기념일 알림 + 예약 리마인더
  ANNIVERSARY_REMINDERS: "anniversary_reminders",
  // 앨범 무제한 + 커플 히스토리 리포트
  UNLIMITED_ALBUM: "unlimited_album",
  // 프리미엄 배지 + 우선 노출
  PREMIUM_BADGE: "premium_badge",
  // 고급 필터 + AI 맞춤 추천
  ADVANCED_FILTERS: "advanced_filters",
  // Ad-Free
  AD_FREE: "ad_free",
} as const

export type PremiumFeatureKey = (typeof PREMIUM_FEATURES)[keyof typeof PREMIUM_FEATURES]

