"use client"

import { useMemo } from "react"
import { DayPicker, type DateRange } from "react-day-picker"
import { Card, CardContent, CardHeader, CardTitle } from "@lovetrip/ui/components/card"
import { Calendar as CalendarIcon } from "lucide-react"
import { startOfDay } from "date-fns"
import { ko } from "date-fns/locale"
import "react-day-picker/style.css"

interface TripDateRangeCalendarProps {
  startDate: string
  endDate: string
  onRangeChange: (start: string, end: string) => void
  totalDays: number
}

function toDateRange(start: string, end: string): DateRange<Date> | undefined {
  if (!start) return undefined
  const from = new Date(start)
  if (isNaN(from.getTime())) return undefined
  if (!end) return { from, to: from }
  const to = new Date(end)
  if (isNaN(to.getTime())) return { from, to: from }
  return { from, to }
}

function toYYYYMMDD(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function TripDateRangeCalendar({
  startDate,
  endDate,
  onRangeChange,
  totalDays,
}: TripDateRangeCalendarProps) {
  const selected = useMemo(
    () => toDateRange(startDate, endDate),
    [startDate, endDate]
  )

  const defaultMonth = useMemo(() => {
    if (startDate) {
      const d = new Date(startDate)
      if (!isNaN(d.getTime())) return d
    }
    return new Date()
  }, [startDate])

  const handleSelect = (range: DateRange<Date> | undefined) => {
    if (!range?.from) {
      onRangeChange("", "")
      return
    }
    const start = toYYYYMMDD(range.from)
    const end = range.to ? toYYYYMMDD(range.to) : start
    onRangeChange(start, end)
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="py-3 px-4 bg-muted/30 border-b">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarIcon className="h-4 w-4 text-primary" />
          여행 기간 캘린더
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          캘린더에서 시작일·종료일을 드래그해 선택하거나, 입력란에 직접 입력하세요.
        </p>
      </CardHeader>
      <CardContent className="p-3 sm:p-4">
        <DayPicker
          mode="range"
          locale={ko}
          defaultMonth={defaultMonth}
          selected={selected}
          onSelect={handleSelect}
          numberOfMonths={1}
          showOutsideDays
          disabled={{ before: startOfDay(new Date()) }}
          classNames={{
            root: "rdp-trip w-full",
            months: "flex justify-center",
            month: "space-y-3",
            month_caption: "flex justify-center items-center h-9",
            caption_label: "text-sm font-semibold text-foreground",
            nav: "flex items-center gap-1",
            button_previous: "h-8 w-8 rounded-md border border-input bg-background hover:bg-accent flex items-center justify-center",
            button_next: "h-8 w-8 rounded-md border border-input bg-background hover:bg-accent flex items-center justify-center",
            month_grid: "w-full border-collapse",
            weekdays: "flex",
            weekday: "text-muted-foreground text-xs font-medium w-9 flex items-center justify-center",
            weeks: "flex flex-col gap-0.5",
            week: "flex",
            day: "w-9 h-9 p-0 text-center text-sm",
            day_button:
              "w-full h-full rounded-md hover:bg-accent focus:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            selected:
              "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            today: "bg-primary/20 font-semibold",
            outside: "text-muted-foreground/50",
            disabled: "text-muted-foreground/40 cursor-not-allowed",
            range_start: "rounded-l-md bg-primary text-primary-foreground",
            range_end: "rounded-r-md bg-primary text-primary-foreground",
            range_middle: "rounded-none bg-primary/30 text-primary-foreground",
            hidden: "invisible",
          }}
        />
        {totalDays > 0 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              {totalDays}일간 여행
            </p>
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: Math.min(totalDays, 10) }, (_, i) => i + 1).map(
                d => (
                  <span
                    key={d}
                    className="inline-flex items-center justify-center min-w-[2rem] h-7 px-2 rounded-md bg-primary/15 text-primary text-xs font-medium"
                  >
                    {d}일차
                  </span>
                )
              )}
              {totalDays > 10 && (
                <span className="inline-flex items-center text-xs text-muted-foreground">
                  외 {totalDays - 10}일
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
