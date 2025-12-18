"use client"

import { Button } from "@lovetrip/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@lovetrip/ui/components/card"
import { Badge } from "@lovetrip/ui/components/badge"
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles } from "lucide-react"
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
    <Card className="border-2 border-primary/20 shadow-xl overflow-hidden">
      <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-primary/10 to-purple-500/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
              <CalendarIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-foreground via-primary to-purple-600 bg-clip-text text-transparent">
                {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
              </CardTitle>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateMonth("prev")}
              className="flex-1 sm:flex-initial text-xs sm:text-sm hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              이전
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={onTodayClick}
              className="flex-1 sm:flex-initial text-xs sm:text-sm bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white border-0 shadow-lg shadow-primary/30"
            >
              <Sparkles className="h-4 w-4 mr-1" />
              오늘
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateMonth("next")}
              className="flex-1 sm:flex-initial text-xs sm:text-sm hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
            >
              다음
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 bg-gradient-to-br from-background to-primary/5">
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3 sm:mb-4">
          {weekDays.map((day, index) => (
            <motion.div
              key={day}
              className="text-center font-bold text-xs sm:text-sm py-2 sm:py-3 rounded-lg bg-muted/50"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {day}
            </motion.div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {days.map((date, index) => {
            const dayEvents = getEventsForDate(date)
            const isToday = date && date.toDateString() === new Date().toDateString()

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                className={`min-h-[60px] sm:min-h-[100px] p-1.5 sm:p-2.5 border-2 rounded-xl transition-all duration-300 ${
                  isToday
                    ? "bg-gradient-to-br from-primary/20 to-purple-500/20 border-primary shadow-lg shadow-primary/30"
                    : "bg-card border-border hover:border-primary/30"
                } ${date ? "cursor-pointer hover:bg-muted/50 hover:shadow-md" : ""}`}
                whileHover={date ? { scale: 1.03, y: -2 } : {}}
                onClick={() => {
                  if (date && dayEvents.length === 0) {
                    onDateClick(date)
                  }
                }}
              >
                {date && (
                  <>
                    <div
                      className={`text-xs sm:text-sm font-bold mb-1 sm:mb-2 ${
                        isToday
                          ? "text-primary w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-lg"
                          : "text-foreground"
                      }`}
                    >
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 1).map(event => {
                        const isMyEvent = currentUserInfo?.id === event.created_by
                        const eventColor = isMyEvent
                          ? "bg-gradient-to-r from-primary/30 to-primary/20 border-primary/60"
                          : "bg-gradient-to-r from-primary/30 to-indigo-500/20 border-primary/60"
                        const eventNickname = isMyEvent
                          ? currentUserInfo?.nickname || "나"
                          : partnerInfo?.nickname || "파트너"

                        return (
                          <motion.div
                            key={event.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Badge
                              variant="secondary"
                              className={`w-full text-[8px] sm:text-xs p-1 sm:p-1.5 cursor-pointer border-2 ${eventColor} rounded-lg shadow-sm hover:shadow-md transition-all`}
                              onClick={e => {
                                e.stopPropagation()
                                onEventClick(event)
                              }}
                            >
                              <div className="truncate flex items-center gap-1">
                                <span className="font-bold text-[8px] sm:text-[10px]">
                                  {eventNickname}
                                </span>
                                <span className="truncate hidden sm:inline text-[10px]">
                                  {event.title}
                                </span>
                              </div>
                            </Badge>
                          </motion.div>
                        )
                      })}
                      {dayEvents.length > 1 && (
                        <motion.div
                          className="text-[8px] sm:text-xs text-muted-foreground font-semibold px-1 py-0.5 rounded bg-muted/50"
                          whileHover={{ scale: 1.1 }}
                        >
                          +{dayEvents.length - 1}개 더
                        </motion.div>
                      )}
                      {dayEvents.length === 0 && (
                        <motion.div
                          className="flex items-center justify-center py-1 sm:py-2 opacity-30"
                          whileHover={{ opacity: 1, scale: 1.2 }}
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                        </motion.div>
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
