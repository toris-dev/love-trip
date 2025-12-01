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
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>
              {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
            </CardTitle>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onNavigateMonth("prev")}>
              이전
            </Button>
            <Button variant="outline" size="sm" onClick={onTodayClick}>
              오늘
            </Button>
            <Button variant="outline" size="sm" onClick={() => onNavigateMonth("next")}>
              다음
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-4">
          {weekDays.map(day => (
            <div key={day} className="text-center font-semibold text-sm py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            const dayEvents = getEventsForDate(date)
            const isToday = date && date.toDateString() === new Date().toDateString()

            return (
              <motion.div
                key={index}
                className={`min-h-[100px] p-2 border rounded-lg ${
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
                      className={`text-sm font-medium mb-1 ${isToday ? "text-primary" : ""}`}
                    >
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map(event => {
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
                            className={`w-full text-xs p-1 cursor-pointer hover:opacity-80 border ${eventColor}`}
                            onClick={e => {
                              e.stopPropagation()
                              if (event.place_id) {
                                onEventClick(event)
                              } else {
                                if (confirm(`"${event.title}" 일정을 삭제하시겠습니까?`)) {
                                  onDeleteEvent(event.id)
                                }
                              }
                            }}
                          >
                            <div className="truncate flex items-center gap-1">
                              <span className="font-semibold text-[10px]">{eventNickname}</span>
                              <span className="truncate">{event.title}</span>
                            </div>
                          </Badge>
                        )
                      })}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayEvents.length - 2}개 더
                        </div>
                      )}
                      {dayEvents.length === 0 && (
                        <div className="flex items-center justify-center py-2">
                          <Plus className="h-4 w-4 text-muted-foreground/50" />
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

