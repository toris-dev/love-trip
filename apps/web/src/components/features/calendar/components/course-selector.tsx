"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@lovetrip/ui/components/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@lovetrip/ui/components/tabs"
import { Loader2, MapPin, Calendar as CalendarIcon } from "lucide-react"
import type { CourseForCalendar, TravelPlanForCalendar } from "../types"

interface CourseSelectorProps {
  onSelectCourse: (course: CourseForCalendar) => void
  onSelectTravelPlan: (plan: TravelPlanForCalendar) => void
  userId: string
}

export function CourseSelector({
  onSelectCourse,
  onSelectTravelPlan,
  userId,
}: CourseSelectorProps) {
  const [courses, setCourses] = useState<CourseForCalendar[]>([])
  const [travelPlans, setTravelPlans] = useState<TravelPlanForCalendar[]>([])
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [loadingPlans, setLoadingPlans] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCourses()
    loadTravelPlans()
  }, [loadCourses, loadTravelPlans])

  const loadCourses = useCallback(async () => {
    setLoadingCourses(true)
    setError(null)
    try {
      // 모든 코스 가져오기 (내 코스 + 공개 코스)
      // type 파라미터 없이 호출하면 모든 코스를 반환
      const response = await fetch(`/api/user-courses?limit=500&sort=popular`)
      if (!response.ok) {
        throw new Error("코스를 불러오는데 실패했습니다")
      }
      const data = await response.json()
      setCourses(data.courses || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "코스를 불러오는데 실패했습니다"
      setError(errorMessage)
      console.error("Error loading courses:", err)
    } finally {
      setLoadingCourses(false)
    }
  }, [])

  const loadTravelPlans = useCallback(async () => {
    setLoadingPlans(true)
    setError(null)
    try {
      const response = await fetch(`/api/travel-plans`)
      if (!response.ok) {
        throw new Error("여행 계획을 불러오는데 실패했습니다")
      }
      const data = await response.json()
      setTravelPlans(data.plans || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "여행 계획을 불러오는데 실패했습니다"
      setError(errorMessage)
      console.error("Error loading travel plans:", err)
    } finally {
      setLoadingPlans(false)
    }
  }, [])

  const handleCourseClick = async (courseId: string) => {
    try {
      const response = await fetch(`/api/user-courses/${courseId}`)
      if (!response.ok) {
        throw new Error("코스 상세 정보를 불러오는데 실패했습니다")
      }
      const data = await response.json()
      onSelectCourse(data.course)
    } catch (err) {
      setError(err instanceof Error ? err.message : "코스 상세 정보를 불러오는데 실패했습니다")
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20"
        >
          {error}
        </div>
      )}

      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="courses">데이트/여행 코스</TabsTrigger>
          <TabsTrigger value="plans">여행 계획</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-2 mt-4">
          {loadingCourses ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              등록된 코스가 없습니다
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {courses.map(course => (
                <Card
                  key={course.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleCourseClick(course.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{course.title}</h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{course.region}</span>
                          <span>•</span>
                          <span>{course.course_type === "date" ? "데이트" : "여행"} 코스</span>
                          <span>•</span>
                          <span>{course.place_count}개 장소</span>
                        </div>
                        {course.duration && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <CalendarIcon className="h-3 w-3" />
                            <span>{course.duration}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="plans" className="space-y-2 mt-4">
          {loadingPlans ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : travelPlans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              등록된 여행 계획이 없습니다
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {travelPlans.map(plan => (
                <Card
                  key={plan.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onSelectTravelPlan(plan)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{plan.title}</h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{plan.destination}</span>
                          <span>•</span>
                          <span>
                            {new Date(plan.start_date).toLocaleDateString("ko-KR", {
                              month: "short",
                              day: "numeric",
                            })}{" "}
                            -{" "}
                            {new Date(plan.end_date).toLocaleDateString("ko-KR", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
