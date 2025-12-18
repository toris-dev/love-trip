"use client"

import { useState, useEffect } from "react"
import { calendarService, type Couple, type SharedCalendar } from "@lovetrip/couple/services"
import { createClient } from "@lovetrip/api/supabase/client"
import { toast } from "sonner"
import type { PartnerInfo, CurrentUserInfo } from "../types"

export function useCalendarData() {
  const [couple, setCouple] = useState<Couple | null>(null)
  const [calendars, setCalendars] = useState<SharedCalendar[]>([])
  const [selectedCalendar, setSelectedCalendar] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [partnerInfo, setPartnerInfo] = useState<PartnerInfo | null>(null)
  const [currentUserInfo, setCurrentUserInfo] = useState<CurrentUserInfo | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const coupleData = await calendarService.getMyCouple()
      setCouple(coupleData)

      if (coupleData) {
        let calendarsData = await calendarService.getCalendars()

        // 캘린더가 없으면 기본 캘린더 생성
        if (calendarsData.length === 0) {
          console.log("[Calendar] No calendars found, creating default calendar")
          const createResult = await calendarService.createDefaultCalendar(coupleData.id)
          if (createResult.success) {
            calendarsData = await calendarService.getCalendars()
          }
        }

        setCalendars(calendarsData)
        if (calendarsData.length > 0) {
          setSelectedCalendar(calendarsData[0].id)
          console.log("[Calendar] Selected calendar:", calendarsData[0].id)
        } else {
          console.error("[Calendar] No calendars available after creation attempt")
          toast.error("캘린더를 불러올 수 없습니다")
        }

        // 사용자 및 파트너 정보 가져오기
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          // 현재 사용자 프로필 가져오기
          const { data: currentUserProfile } = await supabase
            .from("profiles")
            .select("nickname")
            .eq("id", user.id)
            .single()

          setCurrentUserInfo({
            id: user.id,
            nickname: currentUserProfile?.nickname || undefined,
          })

          const partnerId =
            coupleData.user1_id === user.id ? coupleData.user2_id : coupleData.user1_id

          // API를 통해 파트너 정보 가져오기
          const response = await fetch(`/api/users/find?id=${partnerId}`).catch(() => null)
          if (response && response.ok) {
            const partner = await response.json()

            // 파트너 프로필 가져오기
            const { data: partnerProfile } = await supabase
              .from("profiles")
              .select("nickname, display_name")
              .eq("id", partnerId)
              .single()

            setPartnerInfo({
              id: partnerId,
              email: partner.email || "",
              name: partnerProfile?.display_name || undefined,
              nickname: partnerProfile?.nickname || undefined,
            })
          }
        }
      }
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("데이터를 불러오는데 실패했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  return {
    couple,
    calendars,
    selectedCalendar,
    setSelectedCalendar,
    isLoading,
    partnerInfo,
    currentUserInfo,
  }
}
