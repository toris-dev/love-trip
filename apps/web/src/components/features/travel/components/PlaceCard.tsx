/**
 * 장소 카드 컴포넌트
 * 재사용 가능한 장소 표시 컴포넌트
 */

import { Card, CardContent } from "@lovetrip/ui/components/card"
import { Badge } from "@lovetrip/ui/components/badge"
import { MapPin, Clock } from "lucide-react"
import Image from "next/image"
import type { Place } from "@lovetrip/shared/types/course"

interface PlaceCardProps {
  place: Place
  orderIndex?: number
  visitTime?: string | null
  notes?: string | null
  showOrder?: boolean
  onRemove?: () => void
}

/**
 * 장소 카드 컴포넌트
 */
export function PlaceCard({
  place,
  orderIndex,
  visitTime,
  notes,
  showOrder = false,
  onRemove,
}: PlaceCardProps) {
  return (
    <Card className="relative">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {showOrder && orderIndex !== undefined && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-sm font-medium">{orderIndex + 1}</span>
            </div>
          )}
          <div className="flex-1">
            <h4 className="font-semibold">{place.name}</h4>
            {place.address && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {place.address}
              </p>
            )}
            {visitTime && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" />
                {visitTime}
              </p>
            )}
            {notes && <p className="text-sm text-muted-foreground mt-2">{notes}</p>}
          </div>
          {onRemove && (
            <button
              onClick={onRemove}
              className="text-muted-foreground hover:text-destructive transition-colors"
              aria-label="장소 제거"
            >
              ×
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
