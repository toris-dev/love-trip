"use client"

import { calendarService } from "@lovetrip/couple/services"
import { toast } from "sonner"
import type { NewEventForm } from "../types"

export function useEventActions(selectedCalendar: string | null, onSuccess?: () => void) {
  const handleCreateEvent = async (newEvent: NewEventForm, onComplete?: () => void) => {
    if (!selectedCalendar) {
      toast.error("캘린더를 선택해주세요")
      return
    }

    if (!newEvent.title || newEvent.title.trim() === "") {
      toast.error("제목을 입력해주세요")
      return
    }

    if (!newEvent.start_time || newEvent.start_time.trim() === "") {
      toast.error("시작 시간을 입력해주세요")
      return
    }

    try {
      // datetime-local 형식을 ISO 형식으로 변환
      const startTime = newEvent.start_time
        ? new Date(newEvent.start_time).toISOString()
        : undefined
      const endTime = newEvent.end_time ? new Date(newEvent.end_time).toISOString() : undefined

      const result = await calendarService.createEvent({
        calendar_id: selectedCalendar,
        title: newEvent.title,
        description: newEvent.description || undefined,
        start_time: startTime!,
        end_time: endTime || undefined,
        location: newEvent.location || undefined,
        place_id: newEvent.place_id || undefined,
      })

      if (result.success) {
        toast.success("일정이 추가되었습니다")
        onComplete?.()
        onSuccess?.()
      } else {
        console.error("Event creation error:", result.error)
        toast.error(result.error || "일정 추가에 실패했습니다")
      }
    } catch (error) {
      console.error("Error creating event:", error)
      toast.error(error instanceof Error ? error.message : "일정 추가에 실패했습니다")
    }
  }

  const handleDeleteEvent = async (eventId: string, onSuccess?: () => void) => {
    if (!confirm("정말 이 일정을 삭제하시겠습니까?")) return

    const result = await calendarService.deleteEvent(eventId)
    if (result.success) {
      toast.success("일정이 삭제되었습니다")
      onSuccess?.()
    } else {
      toast.error(result.error || "일정 삭제에 실패했습니다")
    }
  }

  return {
    handleCreateEvent,
    handleDeleteEvent,
  }
}

