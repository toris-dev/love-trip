"use client"

import * as React from "react"
import { User, Car, Bus } from "lucide-react"
import { cn } from "@lovetrip/shared"
import { Button } from "@lovetrip/ui/components/button"

export type TransportMode = "walking" | "driving" | "transit"

export interface TransportSelectorProps {
  selectedMode: TransportMode
  onModeChange: (mode: TransportMode) => void
  className?: string
}

const transportModes: Array<{
  id: TransportMode
  label: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  {
    id: "walking",
    label: "도보",
    icon: User,
  },
  {
    id: "driving",
    label: "자동차",
    icon: Car,
  },
  {
    id: "transit",
    label: "대중교통",
    icon: Bus,
  },
]

export function TransportSelector({
  selectedMode,
  onModeChange,
  className,
}: TransportSelectorProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {transportModes.map((mode) => {
        const Icon = mode.icon
        const isSelected = selectedMode === mode.id

        return (
          <Button
            key={mode.id}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => onModeChange(mode.id)}
            className={cn(
              "rounded-full w-10 h-10 p-0 flex items-center justify-center transition-all duration-200",
              isSelected
                ? "bg-primary text-primary-foreground border-primary shadow-sm hover:bg-primary/90"
                : "bg-white dark:bg-card border-border hover:bg-muted hover:border-primary/30"
            )}
            aria-pressed={isSelected}
            aria-label={`${mode.label} 선택`}
          >
            <Icon className="h-4 w-4" />
          </Button>
        )
      })}
    </div>
  )
}
