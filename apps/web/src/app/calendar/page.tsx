"use client"

import { useState, useCallback } from "react"
import { User } from "lucide-react"
import { useCalendarData } from "@/components/features/calendar/hooks/use-calendar-data"
import { useCalendarEvents } from "@/components/features/calendar/hooks/use-calendar-events"
import { useEventActions } from "@/components/features/calendar/hooks/use-event-actions"
import { CalendarSidebar } from "@/components/features/calendar/components/calendar-sidebar"
import { CalendarGrid } from "@/components/features/calendar/components/calendar-grid"
import { EventsList } from "@/components/features/calendar/components/events-list"
import { EventDetailDialog } from "@/components/features/calendar/components/event-detail-dialog"
import { CoupleRequired } from "@/components/features/calendar/components/couple-required"
import { createClient } from "@lovetrip/api/supabase/client"
import type { CalendarEventWithPlace, Place } from "@/components/features/calendar/types"

export default function CalendarPage() {
  const {
    couple,
    calendars,
    selectedCalendar,
    setSelectedCalendar,
    isLoading,
    partnerInfo,
    currentUserInfo,
  } = useCalendarData()

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedEventForDetail, setSelectedEventForDetail] =
    useState<CalendarEventWithPlace | null>(null)

  const { events, loadEvents } = useCalendarEvents(selectedCalendar, currentMonth)
  const { handleDeleteEvent } = useEventActions(selectedCalendar || null, loadEvents)

  const handleDateClick = (_date: Date) => {
    // CreateEventDialog는 내부에서 상태를 관리하므로 여기서는 처리하지 않음
    // 필요시 상태를 상위로 끌어올릴 수 있음
  }

  const loadPlaceDetails = useCallback(async (placeId: string): Promise<Place | null> => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("places").select("*").eq("id", placeId).single()

      if (error) throw error
      return data as Place
    } catch (error) {
      console.error("Error loading place details:", error)
      return null
    }
  }, [])

  const handleEventClick = useCallback(
    async (event: (typeof events)[0]) => {
      if (event.place_id) {
        const placeDetails = await loadPlaceDetails(event.place_id)
        if (placeDetails) {
          setSelectedEventForDetail({ ...event, place: placeDetails })
        }
      }
    },
    [loadPlaceDetails]
  )

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!couple) {
    return <CoupleRequired />
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          커플 캘린더
        </h1>
        {partnerInfo && (
          <p className="text-muted-foreground">
            <User className="h-4 w-4 inline mr-1" />
            {partnerInfo.nickname || partnerInfo.name || "파트너"}와 함께 일정을 공유하세요
          </p>
        )}
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <CalendarSidebar
          calendars={calendars}
          selectedCalendar={selectedCalendar}
          onSelectCalendar={setSelectedCalendar}
          onEventCreated={loadEvents}
        />

        <div className="lg:col-span-3">
          <CalendarGrid
            currentMonth={currentMonth}
            events={events}
            currentUserInfo={currentUserInfo}
            partnerInfo={partnerInfo}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
            onDeleteEvent={handleDeleteEvent}
            onNavigateMonth={navigateMonth}
            onTodayClick={() => setCurrentMonth(new Date())}
          />

          <EventsList
            events={events}
            currentUserInfo={currentUserInfo}
            partnerInfo={partnerInfo}
            onEventClick={handleEventClick}
            onDeleteEvent={handleDeleteEvent}
          />
        </div>
      </div>

      <EventDetailDialog
        event={selectedEventForDetail}
        open={!!selectedEventForDetail}
        onOpenChange={open => !open && setSelectedEventForDetail(null)}
        onDelete={eventId => {
          handleDeleteEvent(eventId)
          setSelectedEventForDetail(null)
        }}
      />
    </div>
  )
}
