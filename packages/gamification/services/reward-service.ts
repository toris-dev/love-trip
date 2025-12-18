import { createClient, createServiceClient } from "@lovetrip/api/supabase/server"
import type { Database } from "@lovetrip/shared/types/database"

// 보상 규칙 정의
export const COURSE_REWARD_RULES = {
  // 코스 공개 시 즉시 보상
  publish: {
    xp: 100,
    points: 50,
    badge: "course_creator", // 첫 코스 공개 시
  },

  // 다른 사용자가 저장할 때마다
  save: {
    xp: 10, // 저장당 10 XP
    points: 5,
    dailyLimit: 100, // 일일 한도
  },

  // 좋아요 받을 때마다
  like: {
    xp: 5,
    points: 2,
    dailyLimit: 100, // 일일 한도
  },

  // 조회수 기준 보상 (일일)
  views: {
    thresholds: [
      { views: 10, xp: 20, points: 10 },
      { views: 50, xp: 50, points: 25 },
      { views: 100, xp: 100, points: 50 },
      { views: 500, xp: 200, points: 100 },
    ],
  },

  // 인기 코스 보너스 (주간 TOP 10)
  popular: {
    top1: { xp: 500, points: 250, badge: "top_course_creator" },
    top10: { xp: 200, points: 100 },
  },
} as const

/**
 * 사용자 게이미피케이션 데이터 초기화 또는 조회
 */
export async function getOrCreateUserGamification(userId: string) {
  const supabase = await createClient()

  // 기존 데이터 조회
  const { data: existing } = await supabase
    .from("user_gamification")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (existing) {
    return existing
  }

  // 없으면 생성
  const { data: newData, error } = await supabase
    .from("user_gamification")
    .insert({
      user_id: userId,
      level: 1,
      current_xp: 0,
      total_xp: 0,
      points: 0,
      streak: 0,
    })
    .select()
    .single()

  if (error) throw error
  return newData
}

/**
 * XP 추가 및 레벨 계산
 */
export async function addXP(userId: string, amount: number) {
  const supabase = await createClient()

  const gamification = await getOrCreateUserGamification(userId)

  const newTotalXP = gamification.total_xp + amount
  const newCurrentXP = gamification.current_xp + amount

  // 레벨 계산 (레벨당 1000 XP 필요)
  const xpPerLevel = 1000
  const newLevel = Math.floor(newTotalXP / xpPerLevel) + 1
  const xpToNextLevel = newLevel * xpPerLevel
  const currentXPInLevel = newTotalXP % xpPerLevel

  const { data, error } = await supabase
    .from("user_gamification")
    .update({
      level: newLevel,
      current_xp: currentXPInLevel,
      total_xp: newTotalXP,
    })
    .eq("user_id", userId)
    .select()
    .single()

  if (error) throw error

  return {
    ...data,
    xpToNextLevel,
    leveledUp: newLevel > gamification.level,
  }
}

/**
 * 포인트 추가
 */
export async function addPoints(userId: string, amount: number) {
  const supabase = await createClient()

  const gamification = await getOrCreateUserGamification(userId)

  const { data, error } = await supabase
    .from("user_gamification")
    .update({
      points: gamification.points + amount,
    })
    .eq("user_id", userId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * 배지 지급
 * RLS 정책을 우회하기 위해 서비스 역할 키를 사용합니다.
 */
export async function grantBadge(
  userId: string,
  badgeId: string,
  badgeName: string,
  badgeDescription?: string
) {
  // 서비스 역할 키를 사용하여 RLS 정책 우회
  const supabase = createServiceClient()

  // 이미 보유한 배지인지 확인
  const { data: existing } = await supabase
    .from("user_badges")
    .select("*")
    .eq("user_id", userId)
    .eq("badge_id", badgeId)
    .single()

  if (existing) {
    return existing // 이미 보유
  }

  const { data, error } = await supabase
    .from("user_badges")
    .insert({
      user_id: userId,
      badge_id: badgeId,
      badge_name: badgeName,
      badge_description: badgeDescription,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * 오늘 받은 상호작용 보상 수 확인 (일일 한도 체크용)
 * user_course_likes와 user_course_saves를 통해 확인
 */
export async function getTodayRewards(userId: string, action: "save" | "like"): Promise<number> {
  const supabase = await createClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 코스 작성자의 코스에 대한 좋아요/저장 수 확인
  const { data: userCourses } = await supabase
    .from("user_courses")
    .select("id")
    .eq("user_id", userId)
    .eq("is_public", true)
    .eq("status", "published")

  if (!userCourses || userCourses.length === 0) {
    return 0
  }

  const courseIds = userCourses.map(c => c.id)
  const tableName = action === "save" ? "user_course_saves" : "user_course_likes"

  const { count, error } = await supabase
    .from(tableName)
    .select("*", { count: "exact", head: true })
    .in("user_course_id", courseIds)
    .gte("created_at", today.toISOString())

  if (error) {
    console.error("Error getting today rewards:", error)
    return 0
  }

  return count || 0
}

/**
 * 코스 공개 시 보상 지급
 */
export async function grantPublishReward(
  userId: string,
  courseId: string
): Promise<{
  xp: number
  points: number
  badge?: { id: string; name: string }
  leveledUp: boolean
}> {
  const rewards = COURSE_REWARD_RULES.publish

  // 1. XP 지급
  const xpResult = await addXP(userId, rewards.xp)

  // 2. 포인트 지급
  await addPoints(userId, rewards.points)

  // 3. 배지 지급 (첫 코스인 경우)
  const supabase = await createClient()
  const { count } = await supabase
    .from("user_courses")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "published")

  let badge = undefined
  if (count === 1) {
    // 첫 코스 공개
    const badgeData = await grantBadge(
      userId,
      rewards.badge,
      "코스 크리에이터",
      "첫 여행 코스를 공개했습니다!"
    )
    badge = {
      id: badgeData.badge_id,
      name: badgeData.badge_name,
    }
  }

  // 보상 이력은 course_rewards 테이블이 없으므로 로그만 남김
  console.log(
    `Reward granted: User ${userId}, Course ${courseId}, XP: ${rewards.xp}, Points: ${rewards.points}`
  )

  return {
    xp: rewards.xp,
    points: rewards.points,
    badge,
    leveledUp: xpResult.leveledUp,
  }
}

/**
 * 상호작용 보상 지급 (좋아요/저장)
 */
export async function grantInteractionReward(
  courseOwnerId: string,
  courseId: string,
  action: "save" | "like"
): Promise<{ xp: number; points: number } | null> {
  const rewards = COURSE_REWARD_RULES[action]

  // 일일 한도 체크
  const todayRewards = await getTodayRewards(courseOwnerId, action)
  if (todayRewards >= rewards.dailyLimit) {
    return null // 한도 초과
  }

  // XP 및 포인트 지급
  await addXP(courseOwnerId, rewards.xp)
  await addPoints(courseOwnerId, rewards.points)

  // 보상 이력은 course_rewards 테이블이 없으므로 로그만 남김
  console.log(
    `Interaction reward granted: User ${courseOwnerId}, Course ${courseId}, Action: ${action}, XP: ${rewards.xp}, Points: ${rewards.points}`
  )

  return {
    xp: rewards.xp,
    points: rewards.points,
  }
}
