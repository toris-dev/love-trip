"use client"

import { useState, useEffect } from "react"
import { Button } from "@lovetrip/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@lovetrip/ui/components/dialog"
import { Input } from "@lovetrip/ui/components/input"
import { Label } from "@lovetrip/ui/components/label"
import { RadioGroup, RadioGroupItem } from "@lovetrip/ui/components/radio-group"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { CourseForCalendar, TravelPlanForCalendar, CourseOption } from "../types"
import { useEventActions } from "../hooks/use-event-actions"

interface AddCourseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: CourseForCalendar | null
  travelPlan: TravelPlanForCalendar | null
  selectedCalendar: string | null
  onSuccess?: () => void
}

export function AddCourseDialog({
  open,
  onOpenChange,
  course,
  travelPlan,
  selectedCalendar,
  onSuccess,
}: AddCourseDialogProps) {
  const [option, setOption] = useState<CourseOption>("single")
  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("10:00")
  const [endDate, setEndDate] = useState("")
  const [endTime, setEndTime] = useState("18:00")
  const [intervalMinutes, setIntervalMinutes] = useState(60)
  const [loading, setLoading] = useState(false)
  const [travelPlanPlaces, setTravelPlanPlaces] = useState<
    Array<{
      id: string
      place_name: string
      place_address?: string | null
      place_lat?: number | null
      place_lng?: number | null
      place_type?: string | null
      order_index: number
      visit_duration_minutes?: number | null
      day_number?: number | null
      place_id?: string | null
      place?: {
        id: string
        name: string
        address?: string | null
        lat: number
        lng: number
        type: string
      } | null
    }>
  >([])

  const { handleCreateEvent } = useEventActions(selectedCalendar, onSuccess)

  const selectedItem = course || travelPlan

  useEffect(() => {
    if (open && selectedItem) {
      // 기본값 설정
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      setStartDate(today.toISOString().split("T")[0])
      setEndDate(tomorrow.toISOString().split("T")[0])

      // 여행 계획인 경우 장소 정보 로드
      if (travelPlan) {
        loadTravelPlanPlaces(travelPlan.id)
      }
    }
  }, [open, selectedItem, travelPlan])

  const loadTravelPlanPlaces = async (planId: string) => {
    try {
      // API 엔드포인트를 통해 장소 정보 가져오기
      const response = await fetch(`/api/travel-plans/${planId}/places`)
      if (!response.ok) {
        throw new Error("장소 정보를 불러오는데 실패했습니다")
      }
      const data = await response.json()
      const places = data.places || []

      // travel_day_places 데이터를 Place 형식으로 변환
      interface TravelDayPlace {
        id: string
        place_name?: string | null
        place_address?: string | null
        place_lat?: number | null
        place_lng?: number | null
        place_type?: string | null
        order_index?: number | null
        visit_duration_minutes?: number | null
        day_number?: number | null
        place_id?: string | null
        [key: string]: unknown
      }

      const formattedPlaces = (places as TravelDayPlace[]).map(p => ({
        id: p.id,
        place_name: p.place_name || "장소",
        place_address: p.place_address || "",
        place_lat: p.place_lat,
        place_lng: p.place_lng,
        place_type: p.place_type,
        order_index: p.order_index || 0,
        visit_duration_minutes: p.visit_duration_minutes || 60,
        day_number: p.day_number || 1,
        place: p.place_name
          ? {
              id: `stored-${p.id}`,
              name: p.place_name,
              address: p.place_address || null,
              lat: Number(p.place_lat || 0),
              lng: Number(p.place_lng || 0),
              type: (p.place_type as "CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC") || "ETC",
            }
          : null,
      }))

      setTravelPlanPlaces(formattedPlaces)
    } catch (error) {
      console.error("Error loading travel plan places:", error)
      toast.error("장소 정보를 불러오는데 실패했습니다")
    }
  }

  const calculateEndDateTime = (start: Date, durationMinutes: number): Date => {
    const end = new Date(start)
    end.setMinutes(end.getMinutes() + durationMinutes)
    return end
  }

  const formatDateTimeLocal = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const handleSubmit = async () => {
    if (!selectedCalendar) {
      toast.error("캘린더를 선택해주세요")
      return
    }

    if (!selectedItem) {
      toast.error("코스 또는 여행 계획을 선택해주세요")
      return
    }

    if (!startDate) {
      toast.error("시작 날짜를 선택해주세요")
      return
    }

    setLoading(true)

    try {
      if (option === "single") {
        // 코스 전체를 하나의 이벤트로 추가
        const startDateTime = new Date(`${startDate}T${startTime}`)
        let endDateTime: Date

        if (endDate && endTime) {
          endDateTime = new Date(`${endDate}T${endTime}`)
        } else if (course?.duration) {
          // duration 파싱 (예: "3시간", "1일" 등)
          const durationMatch = course.duration.match(/(\d+)(시간|일|분)/)
          if (durationMatch) {
            const value = parseInt(durationMatch[1])
            const unit = durationMatch[2]
            let minutes = 0
            if (unit === "시간") minutes = value * 60
            else if (unit === "일") minutes = value * 24 * 60
            else if (unit === "분") minutes = value
            endDateTime = calculateEndDateTime(startDateTime, minutes)
          } else {
            endDateTime = calculateEndDateTime(startDateTime, 240) // 기본 4시간
          }
        } else {
          endDateTime = calculateEndDateTime(startDateTime, 240) // 기본 4시간
        }

        await handleCreateEvent(
          {
            title: selectedItem.title,
            description: selectedItem.description || "",
            start_time: formatDateTimeLocal(startDateTime),
            end_time: formatDateTimeLocal(endDateTime),
            location: course?.region || travelPlan?.destination || "",
            place_id: "",
          },
          () => {
            onOpenChange(false)
            resetForm()
          }
        )
      } else {
        // 각 장소를 개별 이벤트로 추가
        const places = course?.places || travelPlanPlaces
        if (!places || places.length === 0) {
          toast.error("장소 정보가 없습니다")
          setLoading(false)
          return
        }

        const startDateTime = new Date(`${startDate}T${startTime}`)
        let currentTime = new Date(startDateTime)

        // 장소별로 이벤트 생성
        for (let i = 0; i < places.length; i++) {
          const place = places[i]
          const placeName = place.place_name || place.place?.name || `장소 ${i + 1}`
          const placeAddress = place.place_address || place.place?.address || ""

          // visit_duration_minutes 또는 기본값 사용
          const durationMinutes = place.visit_duration_minutes || intervalMinutes
          const placeStartTime = new Date(currentTime)
          const placeEndTime = calculateEndDateTime(placeStartTime, durationMinutes)

          await handleCreateEvent(
            {
              title: `${selectedItem.title} - ${placeName}`,
              description: place.place?.description || selectedItem.description || "",
              start_time: formatDateTimeLocal(placeStartTime),
              end_time: formatDateTimeLocal(placeEndTime),
              location: placeAddress,
              place_id: place.place_id || place.place?.id || "",
            },
            undefined
          )

          // 다음 장소 시작 시간 계산 (현재 장소 종료 시간 + 이동 시간 30분)
          currentTime = new Date(placeEndTime)
          currentTime.setMinutes(currentTime.getMinutes() + 30)
        }

        toast.success(`${places.length}개의 일정이 추가되었습니다`)
        onOpenChange(false)
        resetForm()
      }
    } catch (error) {
      console.error("Error adding course to calendar:", error)
      toast.error("일정 추가에 실패했습니다")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setOption("single")
    setStartDate("")
    setStartTime("10:00")
    setEndDate("")
    setEndTime("18:00")
    setIntervalMinutes(60)
    setTravelPlanPlaces([])
  }

  if (!selectedItem) return null

  const places = course?.places || travelPlanPlaces
  const placeCount = places?.length || 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>캘린더에 추가</DialogTitle>
          <DialogDescription>{selectedItem.title}을(를) 캘린더에 추가합니다</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label>추가 방식</Label>
            <RadioGroup value={option} onValueChange={value => setOption(value as CourseOption)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="single" id="single" />
                <Label htmlFor="single" className="font-normal cursor-pointer">
                  코스 전체를 하나의 이벤트로 추가
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="multiple" id="multiple" />
                <Label htmlFor="multiple" className="font-normal cursor-pointer">
                  각 장소를 개별 이벤트로 추가 ({placeCount}개)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {option === "single" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">시작 날짜 *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_time">시작 시간</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">종료 날짜</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time">종료 시간</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                />
              </div>
              {!endDate && (
                <p className="text-xs text-muted-foreground">
                  종료 날짜를 지정하지 않으면 코스 duration을 기반으로 자동 계산됩니다
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="start_date_multiple">시작 날짜 *</Label>
                <Input
                  id="start_date_multiple"
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_time_multiple">시작 시간</Label>
                <Input
                  id="start_time_multiple"
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interval">장소 간 이동 시간 (분)</Label>
                <Input
                  id="interval"
                  type="number"
                  min="0"
                  value={intervalMinutes}
                  onChange={e => setIntervalMinutes(parseInt(e.target.value) || 30)}
                />
                <p className="text-xs text-muted-foreground">
                  각 장소 방문 후 다음 장소로 이동하는 시간입니다 (기본값: 30분)
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              취소
            </Button>
            <Button onClick={handleSubmit} disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  추가 중...
                </>
              ) : (
                "추가"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
