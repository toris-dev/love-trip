"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@lovetrip/ui/components/card"
import { Button } from "@lovetrip/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@lovetrip/ui/components/dialog"
import { MapPin, Calendar as CalendarIcon, BookOpen } from "lucide-react"
import type { SharedCalendar } from "@lovetrip/couple/services"
import { CreateEventDialog } from "./create-event-dialog"
import { TravelPlanWizard } from "@/components/features/home/travel-plan-wizard"
import { CourseSelector } from "./course-selector"
import { AddCourseDialog } from "./add-course-dialog"
import type { CourseForCalendar, TravelPlanForCalendar } from "../types"

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
  const [courseSelectorOpen, setCourseSelectorOpen] = useState(false)
  const [addCourseDialogOpen, setAddCourseDialogOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<CourseForCalendar | null>(null)
  const [selectedTravelPlan, setSelectedTravelPlan] = useState<TravelPlanForCalendar | null>(null)

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
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              if (user) {
                setCourseSelectorOpen(true)
              } else {
                router.push("/login")
              }
            }}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            코스 불러오기
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">캘린더</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {calendars.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">캘린더가 없습니다</p>
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
        <>
          <TravelPlanWizard user={user} open={wizardOpen} onOpenChange={setWizardOpen} />

          <Dialog open={courseSelectorOpen} onOpenChange={setCourseSelectorOpen}>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>코스 불러오기</DialogTitle>
                <DialogDescription>
                  내 코스 또는 여행 계획을 선택하여 캘린더에 추가하세요
                </DialogDescription>
              </DialogHeader>
              <CourseSelector
                userId={user.id}
                onSelectCourse={course => {
                  setSelectedCourse(course)
                  setSelectedTravelPlan(null)
                  setCourseSelectorOpen(false)
                  setAddCourseDialogOpen(true)
                }}
                onSelectTravelPlan={plan => {
                  setSelectedTravelPlan(plan)
                  setSelectedCourse(null)
                  setCourseSelectorOpen(false)
                  setAddCourseDialogOpen(true)
                }}
              />
            </DialogContent>
          </Dialog>

          <AddCourseDialog
            open={addCourseDialogOpen}
            onOpenChange={setAddCourseDialogOpen}
            course={selectedCourse}
            travelPlan={selectedTravelPlan}
            selectedCalendar={selectedCalendar}
            onSuccess={() => {
              onEventCreated?.()
              setSelectedCourse(null)
              setSelectedTravelPlan(null)
            }}
          />
        </>
      )}
    </div>
  )
}
