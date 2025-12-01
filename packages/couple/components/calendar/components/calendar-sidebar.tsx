"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@lovetrip/ui/components/card"
import type { SharedCalendar } from "@lovetrip/couple/services"
import { CreateEventDialog } from "./create-event-dialog"

interface CalendarSidebarProps {
  calendars: SharedCalendar[]
  selectedCalendar: string | null
  onSelectCalendar: (calendarId: string) => void
  onEventCreated?: () => void
}

export function CalendarSidebar({
  calendars,
  selectedCalendar,
  onSelectCalendar,
  onEventCreated,
}: CalendarSidebarProps) {
  return (
    <div className="lg:col-span-1 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">캘린더</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {calendars.map(cal => (
            <button
              key={cal.id}
              onClick={() => onSelectCalendar(cal.id)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                selectedCalendar === cal.id
                  ? "bg-primary/10 border-2 border-primary"
                  : "hover:bg-muted"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cal.color }} />
                <span className="font-medium">{cal.name}</span>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      <CreateEventDialog selectedCalendar={selectedCalendar} onSuccess={onEventCreated} />
    </div>
  )
}

