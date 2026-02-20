"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@lovetrip/ui/components/button"
import { Sparkles } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@lovetrip/api/supabase/client"
import type { Database } from "@lovetrip/shared/types/database"
import { TravelDayPlaces } from "./travel-day-places"
import { PremiumUpgradeBanner } from "@/components/shared/premium-upgrade-banner"

type TravelDay = Database["public"]["Tables"]["travel_days"]["Row"]

export interface TravelPlanDaysSectionProps {
  planId: string
  isPremium?: boolean
}

export function TravelPlanDaysSection({ planId, isPremium = false }: TravelPlanDaysSectionProps) {
  const [travelDays, setTravelDays] = useState<TravelDay[]>([])
  const [isLoadingDays, setIsLoadingDays] = useState(true)
  const [isRescheduling, setIsRescheduling] = useState(false)

  const loadTravelDays = useCallback(async () => {
    try {
      setIsLoadingDays(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from("travel_days")
        .select("*")
        .eq("travel_plan_id", planId)
        .order("day_number", { ascending: true })

      if (error) throw error
      setTravelDays(data || [])
    } catch (error) {
      console.error("Error loading travel days:", error)
      toast.error("일차 정보를 불러오는데 실패했습니다")
    } finally {
      setIsLoadingDays(false)
    }
  }, [planId])

  useEffect(() => {
    loadTravelDays()
  }, [loadTravelDays])

  const handleReschedule = useCallback(async () => {
    if (!isPremium) {
      toast.error("일정 자동 재편성은 프리미엄 구독자만 사용할 수 있습니다.")
      return
    }
    try {
      setIsRescheduling(true)
      const response = await fetch(`/api/travel-plans/${planId}/reschedule`, {
        method: "POST",
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || "일정 재편성에 실패했습니다")
      }
      toast.success(data.message || "일정이 재편성되었습니다.")
      await loadTravelDays()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "일정 재편성에 실패했습니다")
    } finally {
      setIsRescheduling(false)
    }
  }, [planId, isPremium, loadTravelDays])

  if (isLoadingDays || travelDays.length === 0) {
    return null
  }

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-bold">여행 일정</h2>
        {isPremium ? (
          <Button
            variant="default"
            size="sm"
            onClick={handleReschedule}
            disabled={isRescheduling}
            title="거리 기준으로 일차별 방문 순서를 자동으로 최적화합니다"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {isRescheduling ? "재편성 중..." : "일정 자동 재편성"}
          </Button>
        ) : (
          <PremiumUpgradeBanner
            featureName="일정 자동 재편성"
            featureDescription="거리 기준으로 일차별 방문 순서를 자동 최적화할 수 있습니다."
            trigger={
              <Button variant="outline" size="sm">
                <Sparkles className="h-4 w-4 mr-2" />
                일정 자동 재편성
              </Button>
            }
          />
        )}
      </div>
      {travelDays.map(day => (
        <TravelDayPlaces
          key={day.id}
          travelPlanId={planId}
          travelDay={day}
          onUpdate={() => {}}
        />
      ))}
    </div>
  )
}
