"use client"

import { useState, useEffect } from "react"
import { createClient } from "@lovetrip/api/supabase/client"

export interface OnboardingState {
  isCompleted: boolean
  currentStep: number
  totalSteps: number
}

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

      const localOnboardingCompleted = localStorage.getItem(`onboarding_completed_${user.id}`)

      if (localOnboardingCompleted === "true") {
        setOnboardingState({
          isCompleted: true,
          currentStep: 0,
          totalSteps: 3,
        })
        return
      }

      try {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", user.id)
          .single()

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

      localStorage.setItem(`onboarding_completed_${user.id}`, "true")

      try {
        const { error } = await supabase
          .from("profiles")
          .update({ onboarding_completed: true })
          .eq("id", user.id)

        if (error) {
          if (error.code === "42703" || error.message.includes("onboarding_completed")) {
            console.warn("onboarding_completed field may not exist. Run migration first.")
          } else {
            console.warn("Failed to update onboarding status:", error)
          }
        }
      } catch (profileError) {
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
