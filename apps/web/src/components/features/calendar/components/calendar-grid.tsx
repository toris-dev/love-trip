"use client"

import { Button } from "@lovetrip/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@lovetrip/ui/components/card"
import { Badge } from "@lovetrip/ui/components/badge"
import { Plus } from "lucide-react"
import { motion } from "framer-motion"
import type { CalendarEvent } from "@lovetrip/couple/services"
import type { CurrentUserInfo, PartnerInfo } from "../types"

interface CalendarGridProps {
  currentMonth: Date
  events: CalendarEvent[]
  currentUserInfo: CurrentUserInfo | null
  partnerInfo: PartnerInfo | null
  onDateClick: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
  onDeleteEvent: (eventId: string) => void
  onNavigateMonth: (direction: "prev" | "next") => void
  onTodayClick: () => void
}

export function CalendarGrid({
  currentMonth,
  events,
  currentUserInfo,
  partnerInfo,
  onDateClick,
  onEventClick,
  onDeleteEvent,
  onNavigateMonth,
  onTodayClick,
}: CalendarGridProps) {
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    // 빈 칸 추가
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    // 날짜 추가
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    return days
  }

  const getEventsForDate = (date: Date | null) => {
    if (!date) return []
    const dateStr = date.toISOString().split("T")[0]
    return events.filter(event => event.start_time.startsWith(dateStr))
  }

  const days = getDaysInMonth()
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"]

  return (
    <Card>
      <CardHeader className="p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg sm:text-xl">
              {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
            </CardTitle>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateMonth("prev")}
              className="flex-1 sm:flex-initial text-xs sm:text-sm"
            >
              이전
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onTodayClick}
              className="flex-1 sm:flex-initial text-xs sm:text-sm"
            >
              오늘
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateMonth("next")}
              className="flex-1 sm:flex-initial text-xs sm:text-sm"
            >
              다음
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2 sm:mb-4">
          {weekDays.map(day => (
            <div
              key={day}
              className="text-center font-semibold text-xs sm:text-sm py-1 sm:py-2"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
          {days.map((date, index) => {
            const dayEvents = getEventsForDate(date)
            const isToday = date && date.toDateString() === new Date().toDateString()

            return (
              <motion.div
                key={index}
                className={`min-h-[60px] sm:min-h-[100px] p-1 sm:p-2 border rounded sm:rounded-lg ${
                  isToday ? "bg-primary/10 border-primary" : "bg-card"
                } ${date ? "cursor-pointer hover:bg-muted/50" : ""}`}
                whileHover={date ? { scale: 1.02 } : {}}
                onClick={() => {
                  if (date && dayEvents.length === 0) {
                    onDateClick(date)
                  }
                }}
              >
                {date && (
                  <>
                    <div
                      className={`text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 ${
                        isToday ? "text-primary" : ""
                      }`}
                    >
                      {date.getDate()}
                    </div>
                    <div className="space-y-0.5 sm:space-y-1">
                      {dayEvents.slice(0, 1).map(event => {
                        const isMyEvent = currentUserInfo?.id === event.created_by
                        const eventColor = isMyEvent
                          ? "bg-primary/20 border-primary/50"
                          : "bg-accent/20 border-accent/50"
                        const eventNickname = isMyEvent
                          ? currentUserInfo?.nickname || "나"
                          : partnerInfo?.nickname || "파트너"

                        return (
                          <Badge
                            key={event.id}
                            variant="secondary"
                            className={`w-full text-[8px] sm:text-xs p-0.5 sm:p-1 cursor-pointer hover:opacity-80 border ${eventColor}`}
                            onClick={e => {
                              e.stopPropagation()
                              onEventClick(event)
                            }}
                          >
                            <div className="truncate flex items-center gap-0.5 sm:gap-1">
                              <span className="font-semibold text-[8px] sm:text-[10px]">
                                {eventNickname}
                              </span>
                              <span className="truncate hidden sm:inline">{event.title}</span>
                            </div>
                          </Badge>
                        )
                      })}
                      {dayEvents.length > 1 && (
                        <div className="text-[8px] sm:text-xs text-muted-foreground">
                          +{dayEvents.length - 1}
                        </div>
                      )}
                      {dayEvents.length === 0 && (
                        <div className="flex items-center justify-center py-1 sm:py-2">
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

