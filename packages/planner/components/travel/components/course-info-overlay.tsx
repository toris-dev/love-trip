"use client"

import { Button } from "@lovetrip/ui/components/button"
import { Calendar, MapPin } from "lucide-react"
import type { TravelCourse } from "../types"

interface CourseInfoOverlayProps {
  course: TravelCourse | null
  onClose: () => void
}

export function CourseInfoOverlay({ course, onClose }: CourseInfoOverlayProps) {
  if (!course) return null

  return (
    <div className="absolute top-20 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-lg p-4 shadow-lg max-w-sm z-40">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-bold text-lg mb-1">{course.title}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{course.duration}</span>
            <span>•</span>
            <MapPin className="h-4 w-4" />
            <span>{course.place_count}개 장소</span>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
          ×
        </Button>
      </div>
    </div>
  )
}
