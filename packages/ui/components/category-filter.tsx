"use client"

import * as React from "react"
import { Heart, Mountain, Leaf, UtensilsCrossed, Palette } from "lucide-react"
import { cn } from "@lovetrip/utils"
import { Button } from "./button"

export type CategoryType = "romantic" | "adventurous" | "relaxing" | "foodie" | "artistic"

export interface CategoryOption {
  id: CategoryType
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const categoryOptions: CategoryOption[] = [
  {
    id: "romantic",
    label: "로맨틱",
    icon: Heart,
  },
  {
    id: "adventurous",
    label: "모험",
    icon: Mountain,
  },
  {
    id: "relaxing",
    label: "휴식",
    icon: Leaf,
  },
  {
    id: "foodie",
    label: "맛집",
    icon: UtensilsCrossed,
  },
  {
    id: "artistic",
    label: "예술",
    icon: Palette,
  },
]

export interface CategoryFilterProps {
  selectedCategories: CategoryType[]
  onCategoryChange: (categories: CategoryType[]) => void
  className?: string
  allowMultiple?: boolean
}

export function CategoryFilter({
  selectedCategories,
  onCategoryChange,
  className,
  allowMultiple = true,
}: CategoryFilterProps) {
  const handleCategoryClick = (categoryId: CategoryType) => {
    if (allowMultiple) {
      if (selectedCategories.includes(categoryId)) {
        onCategoryChange(selectedCategories.filter((id) => id !== categoryId))
      } else {
        onCategoryChange([...selectedCategories, categoryId])
      }
    } else {
      onCategoryChange(selectedCategories.includes(categoryId) ? [] : [categoryId])
    }
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2 sm:gap-3", className)}>
      {categoryOptions.map((option) => {
        const Icon = option.icon
        const isSelected = selectedCategories.includes(option.id)

        return (
          <Button
            key={option.id}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryClick(option.id)}
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
