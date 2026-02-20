"use client"

import { useState } from "react"
import { Button } from "@lovetrip/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@lovetrip/ui/components/card"
import { Progress } from "@lovetrip/ui/components/progress"
import { useOnboarding } from "./hooks/use-onboarding"
import { OnboardingStep1 } from "./onboarding-step-1"
import { OnboardingStep2 } from "./onboarding-step-2"
import { OnboardingStep3 } from "./onboarding-step-3"

interface OnboardingWizardProps {
  onComplete?: () => void
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { onboardingState, completeOnboarding, setCurrentStep } = useOnboarding()
  const [currentStep, setStep] = useState(0)

  if (!onboardingState || onboardingState.isCompleted) {
    return null
  }

  const totalSteps = 3
  const progress = ((currentStep + 1) / totalSteps) * 100

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setStep(currentStep + 1)
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setStep(currentStep - 1)
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = async () => {
    await completeOnboarding()
    onComplete?.()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl mx-4">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>LOVETRIP 시작하기</CardTitle>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              건너뛰기
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
          <CardDescription className="mt-2">
            {currentStep + 1} / {totalSteps}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentStep === 0 && <OnboardingStep1 />}
          {currentStep === 1 && <OnboardingStep2 />}
          {currentStep === 2 && <OnboardingStep3 />}

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
              이전
            </Button>
            <Button onClick={handleNext}>
              {currentStep === totalSteps - 1 ? "시작하기" : "다음"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
