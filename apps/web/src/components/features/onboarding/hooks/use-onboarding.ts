"use client"

import { useState, useEffect } from "react"
import { createClient } from "@lovetrip/api/supabase/client"

export interface OnboardingState {
  isCompleted: boolean
  currentStep: number
  totalSteps: number
}

/**
 * 온보딩 상태 관리 훅
 */
export function useOnboarding() {
  const [onboardingState, setOnboardingState] = useState<OnboardingState | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadOnboardingState()
  }, [])

  const loadOnboardingState = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setOnboardingState(null)
        setIsLoading(false)
        return
      }

      // 온보딩 완료 여부 확인 (로컬 스토리지 우선, 없으면 프로필 확인)
      const localOnboardingCompleted = localStorage.getItem(`onboarding_completed_${user.id}`)

      if (localOnboardingCompleted === "true") {
        setOnboardingState({
          isCompleted: true,
          currentStep: 0,
          totalSteps: 3,
        })
        return
      }

      // 프로필에서 온보딩 완료 여부 확인 (필드가 있을 경우)
      try {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", user.id)
          .single()

        // 필드가 없으면 에러가 발생할 수 있음 (마이그레이션 전)
        if (profileError && profileError.code !== "PGRST116") {
          console.warn("onboarding_completed field may not exist:", profileError)
        }

        const isCompleted = profile?.onboarding_completed || false
        if (isCompleted) {
          localStorage.setItem(`onboarding_completed_${user.id}`, "true")
        }

        setOnboardingState({
          isCompleted,
          currentStep: 0,
          totalSteps: 3,
        })
      } catch (error) {
        // profiles 테이블에 onboarding_completed 필드가 없을 수 있음
        console.warn("Failed to check onboarding status:", error)
        setOnboardingState({
          isCompleted: false,
          currentStep: 0,
          totalSteps: 3,
        })
      }
    } catch (error) {
      console.error("Error loading onboarding state:", error)
      setOnboardingState({
        isCompleted: false,
        currentStep: 0,
        totalSteps: 3,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const completeOnboarding = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // 로컬 스토리지에 저장
      localStorage.setItem(`onboarding_completed_${user.id}`, "true")

      // 프로필 업데이트 시도 (onboarding_completed 필드가 있을 경우)
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ onboarding_completed: true })
          .eq("id", user.id)

        if (error) {
          // 필드가 없으면 무시 (마이그레이션 전)
          if (error.code === "42703" || error.message.includes("onboarding_completed")) {
            console.warn("onboarding_completed field may not exist. Run migration first.")
          } else {
            console.warn("Failed to update onboarding status:", error)
          }
        }
      } catch (profileError) {
        // 프로필 업데이트 실패는 무시
        console.warn("Failed to update profile:", profileError)
      }

      setOnboardingState(prev => (prev ? { ...prev, isCompleted: true } : null))
    } catch (error) {
      console.error("Error completing onboarding:", error)
    }
  }

  const setCurrentStep = (step: number) => {
    setOnboardingState(prev =>
      prev ? { ...prev, currentStep: Math.min(step, prev.totalSteps - 1) } : null
    )
  }

  return {
    onboardingState,
    isLoading,
    completeOnboarding,
    setCurrentStep,
    reload: loadOnboardingState,
  }
}
