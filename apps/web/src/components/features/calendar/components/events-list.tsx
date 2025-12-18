"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@lovetrip/ui/components/card"
import { Button } from "@lovetrip/ui/components/button"
import { Badge } from "@lovetrip/ui/components/badge"
import { Calendar as CalendarIcon, Clock, MapPin, Sparkles, Heart } from "lucide-react"
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
    <Card className="mt-4 sm:mt-6 border-2 border-primary/20 shadow-xl">
      <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-primary/10 to-purple-500/10">
        <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          이번 달 일정
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 bg-gradient-to-br from-background to-primary/5">
        <div className="space-y-3 sm:space-y-4">
          {events.map((event, index) => {
            const isMyEvent = currentUserInfo?.id === event.created_by
            const eventNickname = isMyEvent
              ? currentUserInfo?.nickname || "나"
              : partnerInfo?.nickname || "파트너"
            const eventColor = isMyEvent
              ? "border-primary/50 bg-gradient-to-r from-primary/10 to-primary/5"
              : "border-primary/50 bg-gradient-to-r from-primary/10 to-indigo-500/5"

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-5 border-2 rounded-xl transition-all duration-300 cursor-pointer ${eventColor} hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1`}
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  onEventClick(event)
                }}
              >
                <div className="flex items-start gap-3 sm:gap-4 flex-1 w-full sm:w-auto">
                  <motion.div
                    className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg"
                    whileHover={{ rotate: 10, scale: 1.1 }}
                  >
                    <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h3 className="font-bold text-base sm:text-lg truncate group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>
                      <Badge
                        variant={isMyEvent ? "default" : "secondary"}
                        className="text-[10px] sm:text-xs w-fit px-2 py-1 font-semibold shadow-sm"
                      >
                        {isMyEvent ? "💑" : "💕"} {eventNickname}
                      </Badge>
                    </div>
                    {event.description && (
                      <p className="text-xs sm:text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mt-3 text-xs sm:text-sm">
                      <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-muted/50 w-fit">
                        <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                        <span className="font-medium">
                          {new Date(event.start_time).toLocaleString("ko-KR", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-muted/50 w-fit">
                          <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                          <span className="truncate font-medium">{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={e => {
                    e.stopPropagation()
                    onEventClick(event)
                  }}
                  className="w-full sm:w-auto text-xs sm:text-sm bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white border-0 shadow-lg shadow-primary/30 hover:scale-105 transition-all"
                >
                  <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
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
