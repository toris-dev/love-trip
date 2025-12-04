"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@lovetrip/ui/components/card"
import { Button } from "@lovetrip/ui/components/button"
import { Plus, MapPin, Calendar as CalendarIcon } from "lucide-react"
import type { SharedCalendar } from "@lovetrip/couple/services"
import { CreateEventDialog } from "./create-event-dialog"
import { TravelPlanWizard } from "@/components/features/home/travel-plan-wizard"
import { createClient } from "@lovetrip/api/supabase/client"

interface CalendarSidebarProps {
  calendars: SharedCalendar[]
  selectedCalendar: string | null
  onSelectCalendar: (calendarId: string) => void
  onEventCreated?: () => void
  user: { id: string; email?: string } | null
}

export function CalendarSidebar({
  calendars,
  selectedCalendar,
  onSelectCalendar,
  onEventCreated,
  user,
}: CalendarSidebarProps) {
  const router = useRouter()
  const [wizardOpen, setWizardOpen] = useState(false)
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  return (
    <div className="lg:col-span-1 space-y-4">
      {/* 빠른 액션 버튼 */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">빠른 추가</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setQuickAddOpen(true)}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            일정 추가
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              if (user) {
                setWizardOpen(true)
              } else {
                router.push("/login")
              }
            }}
          >
            <MapPin className="h-4 w-4 mr-2" />
            여행 계획 만들기
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">캘린더</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {calendars.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              캘린더가 없습니다
            </p>
          ) : (
            calendars.map(cal => (
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
            ))
          )}
        </CardContent>
      </Card>

      <CreateEventDialog
        selectedCalendar={selectedCalendar}
        onSuccess={() => {
          onEventCreated?.()
          setQuickAddOpen(false)
        }}
        open={quickAddOpen}
        onOpenChange={setQuickAddOpen}
      />

      {user && (
        <TravelPlanWizard user={user} open={wizardOpen} onOpenChange={setWizardOpen} />
      )}
    </div>
  )
}

