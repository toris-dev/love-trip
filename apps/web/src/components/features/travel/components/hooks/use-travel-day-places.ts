/**
 * 여행 일차 장소 관리 커스텀 훅
 * API 호출 로직을 분리하여 재사용성 향상
 */

import { useState, useCallback } from "react"
import { toast } from "sonner"

interface UseTravelDayPlacesOptions {
  travelPlanId: string
  travelDayId: string
  onUpdate?: () => void
}

import type { Database } from "@lovetrip/shared/types/database"
import type { Place } from "@lovetrip/shared/types/course"
type TravelDayPlace = Database["public"]["Tables"]["travel_day_places"]["Row"] & {
  places: Place | null
}

/**
 * API 에러 처리 헬퍼
 */
const handleApiError = (error: unknown, defaultMessage: string): string => {
  if (error instanceof Error) {
    return error.message
  }
  return defaultMessage
}

/**
 * 여행 일차 장소 관리 훅
 */
export function useTravelDayPlaces({
  travelPlanId,
  travelDayId,
  onUpdate,
}: UseTravelDayPlacesOptions) {
  const [isLoading, setIsLoading] = useState(false)

  /**
   * 장소 목록 불러오기
   */
  const loadPlaces = useCallback(async (): Promise<TravelDayPlace[]> => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/travel-plans/${travelPlanId}/days/${travelDayId}/places`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "장소 목록을 불러오는데 실패했습니다")
      }

      const { data } = await response.json()
      return data || []
    } catch (error) {
      console.error("Error loading places:", error)
      const message = handleApiError(error, "장소 목록을 불러오는데 실패했습니다")
      toast.error(message)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [travelPlanId, travelDayId])

  /**
   * 장소 추가
   */
  const addPlace = useCallback(
    async (placeId: string): Promise<boolean> => {
      try {
        const response = await fetch(
          `/api/travel-plans/${travelPlanId}/days/${travelDayId}/places`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ place_id: placeId }),
          }
        )

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || "장소 추가에 실패했습니다")
        }

        toast.success("장소가 추가되었습니다")
        onUpdate?.()
        return true
      } catch (error) {
        console.error("Error adding place:", error)
        const message = handleApiError(error, "장소 추가에 실패했습니다")
        toast.error(message)
        return false
      }
    },
    [travelPlanId, travelDayId, onUpdate]
  )

  /**
   * 장소 제거
   */
  const removePlace = useCallback(
    async (placeId: string): Promise<boolean> => {
      try {
        const response = await fetch(
          `/api/travel-plans/${travelPlanId}/days/${travelDayId}/places/${placeId}`,
          {
            method: "DELETE",
          }
        )

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || "장소 제거에 실패했습니다")
        }

        toast.success("장소가 제거되었습니다")
        onUpdate?.()
        return true
      } catch (error) {
        console.error("Error removing place:", error)
        const message = handleApiError(error, "장소 제거에 실패했습니다")
        toast.error(message)
        return false
      }
    },
    [travelPlanId, travelDayId, onUpdate]
  )

  /**
   * 장소 순서 변경
   */
  const updateOrder = useCallback(
    async (placeId: string, newOrderIndex: number): Promise<boolean> => {
      try {
        const response = await fetch(
          `/api/travel-plans/${travelPlanId}/days/${travelDayId}/places/${placeId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order_index: newOrderIndex }),
          }
        )

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || "순서 변경에 실패했습니다")
        }

        onUpdate?.()
        return true
      } catch (error) {
        console.error("Error updating order:", error)
        const message = handleApiError(error, "순서 변경에 실패했습니다")
        toast.error(message)
        return false
      }
    },
    [travelPlanId, travelDayId, onUpdate]
  )

  return {
    loadPlaces,
    addPlace,
    removePlace,
    updateOrder,
    isLoading,
  }
}
