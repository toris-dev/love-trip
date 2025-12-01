"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@lovetrip/ui/components/dialog"
import { Button } from "@lovetrip/ui/components/button"
import { Label } from "@lovetrip/ui/components/label"
import { Badge } from "@lovetrip/ui/components/badge"
import { MapPin, Star } from "lucide-react"
import Image from "next/image"
import type { CalendarEventWithPlace } from "../types"

interface EventDetailDialogProps {
  event: CalendarEventWithPlace | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDelete: (eventId: string) => void
}

export function EventDetailDialog({
  event,
  open,
  onOpenChange,
  onDelete,
}: EventDetailDialogProps) {
  if (!event) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
          <DialogDescription>
            {new Date(event.start_time).toLocaleString("ko-KR")}
            {event.end_time && ` - ${new Date(event.end_time).toLocaleString("ko-KR")}`}
          </DialogDescription>
        </DialogHeader>
        {event.place && (
          <div className="space-y-4">
            {event.place.image_url && (
              <div className="relative w-full h-48 rounded-lg overflow-hidden">
                <Image
                  src={event.place.image_url}
                  alt={event.place.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{event.place.name}</h3>
                {event.place.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{event.place.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              {event.place.address && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{event.place.address}</span>
                </div>
              )}
              {event.place.description && (
                <p className="text-sm text-muted-foreground mt-2">{event.place.description}</p>
              )}
              {event.place.type && (
                <Badge variant="secondary" className="mt-2">
                  {event.place.type}
                </Badge>
              )}
            </div>
          </div>
        )}
        {event.description && (
          <div className="space-y-2">
            <Label>일정 설명</Label>
            <p className="text-sm text-muted-foreground">{event.description}</p>
          </div>
        )}
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => {
              if (confirm(`"${event.title}" 일정을 삭제하시겠습니까?`)) {
                onDelete(event.id)
                onOpenChange(false)
              }
            }}
          >
            삭제
          </Button>
          <Button onClick={() => onOpenChange(false)}>닫기</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

