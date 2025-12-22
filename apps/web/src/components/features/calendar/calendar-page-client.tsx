"use client"

import { useState, useCallback } from "react"
import { User, Menu, X } from "lucide-react"
import { Button } from "@lovetrip/ui/components/button"
import { useIsMobile } from "@/hooks/use-mobile"
import { useCalendarEvents } from "@/components/features/calendar/hooks/use-calendar-events"
import { useEventActions } from "@/components/features/calendar/hooks/use-event-actions"
import { CalendarSidebar } from "@/components/features/calendar/components/calendar-sidebar"
import { CalendarGrid } from "@/components/features/calendar/components/calendar-grid"
import { EventsList } from "@/components/features/calendar/components/events-list"
import { EventDetailDialog } from "@/components/features/calendar/components/event-detail-dialog"
import { CoupleRequired } from "@/components/features/calendar/components/couple-required"
import type { CalendarEventWithPlace, Place } from "@/components/features/calendar/types"
import type { Couple, SharedCalendar } from "@lovetrip/couple/services"
import type { PartnerInfo, CurrentUserInfo } from "@/components/features/calendar/types"

interface CalendarPageClientProps {
  initialCouple: Couple | null
  initialCalendars: SharedCalendar[]
  initialPartnerInfo: PartnerInfo | null
  initialCurrentUserInfo: CurrentUserInfo | null
  user: { id: string; email?: string } | null
}

export function CalendarPageClient({
  initialCouple,
  initialCalendars,
  initialPartnerInfo,
  initialCurrentUserInfo,
  user,
}: CalendarPageClientProps) {
  const [couple] = useState<Couple | null>(initialCouple)
  const [calendars] = useState<SharedCalendar[]>(initialCalendars)
  const [selectedCalendar, setSelectedCalendar] = useState<string | null>(
    initialCalendars.length > 0 ? initialCalendars[0].id : null
  )
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedEventForDetail, setSelectedEventForDetail] =
    useState<CalendarEventWithPlace | null>(null)
  const [partnerInfo] = useState<PartnerInfo | null>(initialPartnerInfo)
  const [currentUserInfo] = useState<CurrentUserInfo | null>(initialCurrentUserInfo)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useIsMobile()

  const { events, loadEvents } = useCalendarEvents(selectedCalendar, currentMonth)
  const { handleDeleteEvent } = useEventActions(selectedCalendar || null, loadEvents)

  const handleDateClick = (_date: Date) => {
    // CreateEventDialog는 내부에서 상태를 관리하므로 여기서는 처리하지 않음
  }

  const loadPlaceDetails = useCallback(async (_placeId: string): Promise<Place | null> => {
    // places 테이블이 삭제되어 null 반환
    return null
  }, [])

  const handleEventClick = useCallback(
    async (event: (typeof events)[0]) => {
      let placeDetails: Place | null = null
      if (event.place_id) {
        placeDetails = await loadPlaceDetails(event.place_id)
      }
      setSelectedEventForDetail({ ...event, place: placeDetails || undefined })
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

  if (!couple) {
    return <CoupleRequired />
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="mb-4 sm:mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            커플 캘린더
          </h1>
          {isMobile && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          )}
        </div>
        {partnerInfo && (
          <p className="text-sm sm:text-base text-muted-foreground">
            <User className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
            {partnerInfo.nickname || partnerInfo.name || "파트너"}와 함께 일정을 공유하세요
          </p>
        )}
      </div>

      <div className="grid lg:grid-cols-4 gap-4 sm:gap-6">
        {/* 모바일 사이드바 - 드로어 형태 */}
        {isMobile ? (
          <>
            {sidebarOpen && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div
                  className="absolute inset-0 bg-black/50"
                  onClick={() => setSidebarOpen(false)}
                />
                <div className="absolute left-0 top-0 bottom-0 w-80 bg-background border-r border-border shadow-xl overflow-y-auto">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold">메뉴</h2>
                      <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                    <CalendarSidebar
                      calendars={calendars}
                      selectedCalendar={selectedCalendar}
                      onSelectCalendar={id => {
                        setSelectedCalendar(id)
                        setSidebarOpen(false)
                      }}
                      onEventCreated={() => {
                        loadEvents()
                        setSidebarOpen(false)
                      }}
                      user={user}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <CalendarSidebar
            calendars={calendars}
            selectedCalendar={selectedCalendar}
            onSelectCalendar={setSelectedCalendar}
            onEventCreated={loadEvents}
            user={user}
          />
        )}

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
