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
import { MapPin, Star, Clock, Calendar as CalendarIcon, Trash2, X } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!event) return null

  const startDate = new Date(event.start_time)
  const endDate = event.end_time ? new Date(event.end_time) : null

  const handleDelete = () => {
    onDelete(event.id)
    onOpenChange(false)
    setShowDeleteConfirm(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{event.title}</DialogTitle>
              <div className="flex items-center gap-4 text-base text-muted-foreground mb-2">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{startDate.toLocaleDateString("ko-KR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
                </div>
                {endDate && (
                  <>
                    <span>~</span>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{endDate.toLocaleDateString("ko-KR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {startDate.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                  {endDate && ` - ${endDate.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}`}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* 장소 정보 */}
          {event.place ? (
          <div className="space-y-4">
            {event.place.image_url && (
                <div className="relative w-full h-64 rounded-lg overflow-hidden border border-border">
                <Image
                  src={event.place.image_url}
                  alt={event.place.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
              <div className="space-y-3">
              <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{event.place.name}</h3>
                {event.place.rating && (
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/30">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                        {event.place.rating.toFixed(1)}
                      </span>
                  </div>
                )}
              </div>
              {event.place.address && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{event.place.address}</span>
                </div>
              )}
              {event.place.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {event.place.description}
                  </p>
              )}
              {event.place.type && (
                <Badge variant="secondary" className="mt-2">
                  {event.place.type}
                </Badge>
              )}
            </div>
          </div>
          ) : event.location ? (
            <div className="space-y-2">
              <Label className="text-base font-semibold">장소</Label>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{event.location}</span>
              </div>
            </div>
          ) : null}

          {/* 일정 설명 */}
        {event.description && (
          <div className="space-y-2">
              <Label className="text-base font-semibold">일정 설명</Label>
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {event.description}
                </p>
              </div>
          </div>
        )}
        </div>

        <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-border">
          {showDeleteConfirm ? (
            <div className="flex items-center gap-3 w-full">
              <div className="flex-1 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm font-medium text-destructive mb-1">
                  정말 삭제하시겠습니까?
                </p>
                <p className="text-xs text-muted-foreground">
                  이 작업은 되돌릴 수 없습니다.
                </p>
              </div>
          <Button
            variant="outline"
                size="lg"
                onClick={() => setShowDeleteConfirm(false)}
              >
                취소
              </Button>
              <Button variant="destructive" size="lg" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
            삭제
          </Button>
            </div>
          ) : (
            <>
              <Button
                variant="destructive"
                size="lg"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                삭제하기
              </Button>
              <Button variant="outline" size="lg" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4 mr-2" />
                닫기
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

