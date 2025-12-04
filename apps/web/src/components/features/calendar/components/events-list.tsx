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
    <Card className="mt-4 sm:mt-6">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl">이번 달 일정</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-3 sm:space-y-4">
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
                className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border-2 rounded-lg hover:opacity-80 transition-colors cursor-pointer ${eventColor}`}
                whileHover={{ x: 2 }}
                onClick={() => {
                  onEventClick(event)
                }}
              >
                <div className="flex items-start gap-3 sm:gap-4 flex-1 w-full sm:w-auto">
                  <div className="flex-shrink-0">
                    <CalendarIcon
                      className={`h-4 w-4 sm:h-5 sm:w-5 ${isMyEvent ? "text-primary" : "text-accent"}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                      <h3 className="font-semibold text-sm sm:text-base truncate">
                        {event.title}
                      </h3>
                      <Badge
                        variant={isMyEvent ? "default" : "secondary"}
                        className="text-[10px] sm:text-xs w-fit"
                      >
                        {eventNickname}
                      </Badge>
                    </div>
                    {event.description && (
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="truncate">
                          {new Date(event.start_time).toLocaleString("ko-KR", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={e => {
                    e.stopPropagation()
                    onEventClick(event)
                  }}
                  className="text-muted-foreground hover:text-foreground w-full sm:w-auto text-xs sm:text-sm"
                >
                  상세보기
                </Button>
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

