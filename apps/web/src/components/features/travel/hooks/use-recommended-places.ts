"use client"

import { useState, useEffect, useCallback } from "react"
import { getCoupleRecommendations } from "@lovetrip/recommendation/services"
import type { Place } from "../types"

export function useRecommendedPlaces() {
  const [recommendedPlaces, setRecommendedPlaces] = useState<Place[]>([])

  const loadRecommendedPlaces = useCallback(async () => {
    try {
      // 추천 장소 로드 (여러 개)
      const places = await getCoupleRecommendations({
        preferredTypes: ["VIEW", "MUSEUM"],
        limit: 50, // 여러 개의 추천 장소
      })
      setRecommendedPlaces((places || []) as unknown as Place[])
    } catch (error) {
      console.error("Failed to load recommended places:", error)
    }
  }, [])

  useEffect(() => {
    loadRecommendedPlaces()
  }, [loadRecommendedPlaces])

  return { recommendedPlaces }
}
