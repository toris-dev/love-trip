"use client"

import { useEffect, useState } from "react"
import { RewardNotification } from "@/components/shared/reward-notification"

export function MyTripsClient() {
  const [rewards, setRewards] = useState<{
    xp: number
    points: number
    badge?: { id: string; name: string }
    leveledUp: boolean
  } | null>(null)

  useEffect(() => {
    // 세션 스토리지에서 보상 정보 확인
    const storedRewards = sessionStorage.getItem("coursePublishRewards")
    if (storedRewards) {
      try {
        const parsedRewards = JSON.parse(storedRewards)
        setRewards(parsedRewards)
        // 한 번 표시한 후 제거
        sessionStorage.removeItem("coursePublishRewards")
      } catch (error) {
        console.error("Failed to parse rewards:", error)
      }
    }
  }, [])

  return (
    <>
      <RewardNotification rewards={rewards} onClose={() => setRewards(null)} />
    </>
  )
}
