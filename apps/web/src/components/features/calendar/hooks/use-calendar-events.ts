"use client"

import { useState, useEffect, useCallback } from "react"
import { calendarService, type CalendarEvent } from "@lovetrip/couple/services"
import { toast } from "sonner"

export function useCalendarEvents(selectedCalendar: string | null, currentMonth: Date) {
  const [events, setEvents] = useState<CalendarEvent[]>([])

  const loadEvents = useCallback(async () => {
    if (!selectedCalendar) return

    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

    try {
      const eventsData = await calendarService.getEvents(selectedCalendar, startOfMonth, endOfMonth)
      setEvents(eventsData)
    } catch (error) {
      console.error("Failed to load events:", error)
      toast.error("일정을 불러오는데 실패했습니다")
    }
  }, [selectedCalendar, currentMonth])

  useEffect(() => {
    if (selectedCalendar) {
      loadEvents()
    }
  }, [selectedCalendar, currentMonth, loadEvents])

  return { events, loadEvents }
}

