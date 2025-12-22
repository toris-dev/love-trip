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
    <div className="absolute top-20 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-lg p-4 shadow-lg max-w-sm z-40 max-h-[80vh] overflow-y-auto">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">{course.title}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{course.duration}</span>
            <span>•</span>
            <MapPin className="h-4 w-4" />
            <span>{course.place_count}개 장소</span>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 flex-shrink-0">
          ×
        </Button>
      </div>

      {/* 장소 목록 */}
      {course.places && course.places.length > 0 && (
        <div className="mt-4 space-y-2 border-t border-border/50 pt-3">
          <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
            방문 순서
          </div>
          {course.places.map((place, index) => {
            const placeWithOrder = place as typeof place & { order_index?: number }
            const placeNumber =
              placeWithOrder.order_index !== undefined ? placeWithOrder.order_index + 1 : index + 1
            return (
              <div
                key={place.id ? `${place.id}-${index}` : `place-${index}-${place.lat}-${place.lng}`}
                className="flex items-start gap-2 p-2 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  {placeNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-foreground truncate">{place.name}</div>
                  {place.address && (
                    <div className="text-xs text-muted-foreground truncate mt-0.5">
                      {place.address}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
