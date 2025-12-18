"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@lovetrip/ui/components/card"
import { Button } from "@lovetrip/ui/components/button"
import { Badge } from "@lovetrip/ui/components/badge"
import { Calendar as CalendarIcon, Clock, MapPin } from "lucide-react"
import { motion } from "framer-motion"
import type { CalendarEvent } from "@lovetrip/couple/services"
import type { CurrentUserInfo, PartnerInfo } from "../types"

interface EventsListProps {
  events: CalendarEvent[]
  currentUserInfo: CurrentUserInfo | null
  partnerInfo: PartnerInfo | null
  onEventClick: (event: CalendarEvent) => void
  onDeleteEvent: (eventId: string) => void
}

export function EventsList({
  events,
  currentUserInfo,
  partnerInfo,
  onEventClick,
  onDeleteEvent,
}: EventsListProps) {
  if (events.length === 0) {
    return null
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>이번 달 일정</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map(event => {
            const isMyEvent = currentUserInfo?.id === event.created_by
            const eventNickname = isMyEvent
              ? currentUserInfo?.nickname || "나"
              : partnerInfo?.nickname || "파트너"
            const eventColor = isMyEvent
              ? "border-primary/50 bg-primary/5"
              : "border-accent/50 bg-accent/5"

            return (
              <motion.div
                key={event.id}
                className={`flex items-start gap-4 p-4 border-2 rounded-lg hover:opacity-80 transition-colors cursor-pointer ${eventColor}`}
                whileHover={{ x: 4 }}
                onClick={() => {
                  if (event.place_id) {
                    onEventClick(event)
                  }
                }}
              >
                <div className="flex-shrink-0">
                  <CalendarIcon
                    className={`h-5 w-5 ${isMyEvent ? "text-primary" : "text-accent"}`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{event.title}</h3>
                    <Badge variant={isMyEvent ? "default" : "secondary"} className="text-xs">
                      {eventNickname}
                    </Badge>
                  </div>
                  {event.description && (
                    <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(event.start_time).toLocaleString("ko-KR")}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteEvent(event.id)}
                  className="text-destructive hover:text-destructive"
                >
                  삭제
                </Button>
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

