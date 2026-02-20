"use client"

import * as React from "react"
import { Mountain, Flame, Crown, DollarSign, Sparkles, Zap } from "lucide-react"
import { cn } from "@lovetrip/shared"
import { Button } from "./button"

export type MoodType =
  | "adventurous"
  | "cozy"
  | "luxurious"
  | "budget-friendly"
  | "hidden-gem"
  | "high-energy"

export interface MoodOption {
  id: MoodType
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const moodOptions: MoodOption[] = [
  {
    id: "adventurous",
    label: "모험",
    icon: Mountain,
  },
  {
    id: "cozy",
    label: "Cozy",
    icon: Flame,
  },
  {
    id: "luxurious",
    label: "Luxurious",
    icon: Crown,
  },
  {
    id: "budget-friendly",
    label: "Budget-Friendly",
    icon: DollarSign,
  },
  {
    id: "hidden-gem",
    label: "Hidden Gem",
    icon: Sparkles,
  },
  {
    id: "high-energy",
    label: "High-Energy",
    icon: Zap,
  },
]

export interface MoodFilterProps {
  selectedMoods: MoodType[]
  onMoodChange: (moods: MoodType[]) => void
  className?: string
  allowMultiple?: boolean
}

export function MoodFilter({
  selectedMoods,
  onMoodChange,
  className,
  allowMultiple = true,
}: MoodFilterProps) {
  const handleMoodClick = (moodId: MoodType) => {
    if (allowMultiple) {
      if (selectedMoods.includes(moodId)) {
        onMoodChange(selectedMoods.filter((id) => id !== moodId))
      } else {
        onMoodChange([...selectedMoods, moodId])
      }
    } else {
      onMoodChange(selectedMoods.includes(moodId) ? [] : [moodId])
    }
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2 sm:gap-3", className)}>
      {moodOptions.map((option) => {
        const Icon = option.icon
        const isSelected = selectedMoods.includes(option.id)

        return (
          <Button
            key={option.id}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => handleMoodClick(option.id)}
            className={cn(
              "rounded-full px-4 py-2 h-auto font-medium transition-all duration-200",
              isSelected
                ? "bg-primary text-primary-foreground border-primary shadow-sm hover:bg-primary/90"
                : "bg-white dark:bg-card border-border hover:bg-muted hover:border-primary/30 hover:text-foreground"
            )}
            aria-pressed={isSelected}
          >
            <Icon className="h-4 w-4 mr-2" />
            <span>{option.label}</span>
          </Button>
        )
      })}
    </div>
  )
}
