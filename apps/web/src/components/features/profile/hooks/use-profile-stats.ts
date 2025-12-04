"use client"

import { useState, useEffect } from "react"
import type { GamificationData } from "../types"

interface ProfileStats {
  gamification: GamificationData
  stats: {
    totalPlans: number
    completedTrips: number
    planningTrips: number
    visitedPlaces: number
    badgeCount: number
  }
  achievements: any[]
}

export function useProfileStats() {
  const [data, setData] = useState<ProfileStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/profile/stats")
      if (!response.ok) {
        throw new Error("통계를 불러오는 중 오류가 발생했습니다")
      }
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다")
      console.error("Failed to load profile stats:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return { data, isLoading, error, refetch: loadStats }
}

