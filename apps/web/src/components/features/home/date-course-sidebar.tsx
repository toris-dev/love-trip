"use client"

import { useState } from "react"
import { Button } from "@lovetrip/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@lovetrip/ui/components/card"
import { Input } from "@lovetrip/ui/components/input"
import { Label } from "@lovetrip/ui/components/label"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@lovetrip/ui/components/sheet"
import { MapPin, Plus, X, GripVertical, ArrowLeft, Save } from "lucide-react"
import { LocationInput } from "@/components/shared/location-input"
import { toast } from "sonner"
import type { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

interface Place {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  type: "CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC"
}

interface DateCourse {
  id: string
  title: string
  description: string
  places: Place[]
}

interface DateCourseSidebarProps {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DateCourseSidebar({ user, open, onOpenChange }: DateCourseSidebarProps) {
  const router = useRouter()
  const [courses, setCourses] = useState<DateCourse[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<"list" | "edit">("list")
  const [isSaving, setIsSaving] = useState(false)

  const selectedCourse = courses.find(c => c.id === selectedCourseId)

  const handleCreateCourse = () => {
    const newCourse: DateCourse = {
      id: `course-${Date.now()}`,
      title: "",
      description: "",
      places: [],
    }
    setCourses([...courses, newCourse])
    setSelectedCourseId(newCourse.id)
    setCurrentStep("edit")
  }

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId)
    setCurrentStep("edit")
  }

  const handleDeleteCourse = (courseId: string) => {
    setCourses(courses.filter(c => c.id !== courseId))
    if (selectedCourseId === courseId) {
      setSelectedCourseId(null)
      setCurrentStep("list")
    }
  }

  const handleUpdateCourse = (updates: Partial<DateCourse>) => {
    if (!selectedCourseId) return
    setCourses(courses.map(c => (c.id === selectedCourseId ? { ...c, ...updates } : c)))
  }

  const handleAddPlace = (location: {
    address: string
    lat: number
    lng: number
    name?: string
  }) => {
    if (!selectedCourseId) return

    const newPlace: Place = {
      id: `place-${Date.now()}-${Math.random()}`,
      name: location.name || location.address,
      address: location.address,
      lat: location.lat,
      lng: location.lng,
      type: "ETC",
    }

    handleUpdateCourse({
      places: [...(selectedCourse?.places || []), newPlace],
    })

    toast.success("장소가 추가되었습니다")
  }

  const handleRemovePlace = (placeId: string) => {
    if (!selectedCourseId) return
    handleUpdateCourse({
      places: selectedCourse?.places.filter(p => p.id !== placeId) || [],
    })
    toast.success("장소가 제거되었습니다")
  }

  const handleSaveCourse = async () => {
    if (!selectedCourse || !user) {
      toast.error("로그인이 필요합니다")
      return
    }

    if (!selectedCourse.title.trim()) {
      toast.error("코스 제목을 입력해주세요")
      return
    }

    if (selectedCourse.places.length === 0) {
      toast.error("최소 1개 이상의 장소를 추가해주세요")
      return
    }

    setIsSaving(true)
    try {
      // 지역 자동 추출
      const firstPlace = selectedCourse.places[0]
      let destination = "기타"
      if (firstPlace?.address) {
        const match = firstPlace.address.match(
          /(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)/
        )
        destination = match ? match[1] : "기타"
      }

      // 오늘 날짜로 설정 (데이트 코스는 당일)
      const today = new Date().toISOString().split("T")[0]

      const response = await fetch("/api/travel-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedCourse.title,
          destination: destination,
          description: selectedCourse.description,
          start_date: today,
          end_date: today,
          total_budget: 0,
          course_type: "date",
          places: selectedCourse.places.map((p, index) => ({
            place_id: p.id,
            day_number: 1,
            order_index: index,
          })),
          budget_items: [],
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "저장에 실패했습니다")
      }

      toast.success("데이트 코스가 저장되었습니다!")
      setCurrentStep("list")
      setSelectedCourseId(null)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "저장에 실패했습니다")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>데이트 코스 만들기</SheetTitle>
          <SheetDescription>여러 데이트 코스를 만들고 장소를 추가해보세요</SheetDescription>
        </SheetHeader>

        {currentStep === "list" ? (
          <div className="mt-6 space-y-4">
            <Button onClick={handleCreateCourse} className="w-full" size="lg">
              <Plus className="h-4 w-4 mr-2" />새 코스 만들기
            </Button>

            {courses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>아직 만든 코스가 없습니다</p>
                <p className="text-sm mt-2">새 코스 만들기 버튼을 눌러 시작하세요</p>
              </div>
            ) : (
              <div className="space-y-3">
                {courses.map(course => (
                  <Card
                    key={course.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleSelectCourse(course.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base mb-1">
                            {course.title || "제목 없음"}
                          </CardTitle>
                          {course.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {course.description}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={e => {
                            e.stopPropagation()
                            handleDeleteCourse(course.id)
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{course.places.length}개 장소</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          selectedCourse && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCurrentStep("list")
                    setSelectedCourseId(null)
                  }}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  목록으로
                </Button>
              </div>

              {/* 코스 정보 입력 */}
              <Card>
                <CardHeader>
                  <CardTitle>코스 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="course-title">코스 제목 *</Label>
                    <Input
                      id="course-title"
                      value={selectedCourse.title}
                      onChange={e => handleUpdateCourse({ title: e.target.value })}
                      placeholder="예: 서울 로맨틱 데이트 코스"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="course-description">코스 설명</Label>
                    <Input
                      id="course-description"
                      value={selectedCourse.description}
                      onChange={e => handleUpdateCourse({ description: e.target.value })}
                      placeholder="코스에 대한 간단한 설명을 입력하세요"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 장소 검색 및 추가 */}
              <Card>
                <CardHeader>
                  <CardTitle>장소 추가</CardTitle>
                </CardHeader>
                <CardContent>
                  <LocationInput
                    label=""
                    value=""
                    onChange={() => {}}
                    onLocationSelect={handleAddPlace}
                    placeholder="장소명 또는 주소를 입력하세요"
                  />
                </CardContent>
              </Card>

              {/* 추가된 장소 목록 */}
              {selectedCourse.places.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>추가된 장소 ({selectedCourse.places.length}개)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedCourse.places.map((place, index) => (
                        <div
                          key={place.id}
                          className="flex items-center gap-3 p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <GripVertical className="h-4 w-4" />
                            <span className="text-sm font-medium w-6">{index + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{place.name}</p>
                            {place.address && (
                              <p className="text-xs text-muted-foreground truncate">
                                {place.address}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemovePlace(place.id)}
                            className="flex-shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 저장 버튼 */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentStep("list")
                    setSelectedCourseId(null)
                  }}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  onClick={handleSaveCourse}
                  disabled={
                    isSaving || !selectedCourse.title.trim() || selectedCourse.places.length === 0
                  }
                  className="flex-1"
                >
                  {isSaving ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      저장 중...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      저장
                    </>
                  )}
                </Button>
              </div>
            </div>
          )
        )}
      </SheetContent>
    </Sheet>
  )
}
