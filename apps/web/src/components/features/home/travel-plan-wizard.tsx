"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@lovetrip/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@lovetrip/ui/components/card"
import { Input } from "@lovetrip/ui/components/input"
import { Label } from "@lovetrip/ui/components/label"
import { Badge } from "@lovetrip/ui/components/badge"
import { Progress } from "@lovetrip/ui/components/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@lovetrip/ui/components/dialog"
import {
  MapPin,
  Wallet,
  Calendar,
  Check,
  ArrowRight,
  ArrowLeft,
  Plane,
  Clock,
  Users,
} from "lucide-react"
import { useTravelCourses, type TravelCourse } from "@lovetrip/planner/components/travel"
import { toast } from "sonner"
import Image from "next/image"

interface TravelPlanWizardProps {
  user: { id: string; email?: string } | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

type WizardStep = "course" | "budget" | "confirm"

interface BudgetData {
  total: number
  transportation: number
  accommodation: number
  food: number
  activity: number
  shopping: number
  other: number
}

export function TravelPlanWizard({ user, open, onOpenChange }: TravelPlanWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState<WizardStep>("course")
  const [selectedCourse, setSelectedCourse] = useState<TravelCourse | null>(null)
  const [budget, setBudget] = useState<BudgetData>({
    total: 0,
    transportation: 0,
    accommodation: 0,
    food: 0,
    activity: 0,
    shopping: 0,
    other: 0,
  })
  const [travelDates, setTravelDates] = useState({
    start: "",
    end: "",
  })

  const { courses, isLoading } = useTravelCourses()

  const progress = step === "course" ? 33 : step === "budget" ? 66 : 100

  const handleCourseSelect = (course: TravelCourse) => {
    setSelectedCourse(course)
    // 코스 기반 예산 추정
    const estimatedBudget = estimateBudget(course)
    setBudget(estimatedBudget)
    setStep("budget")
  }

  const estimateBudget = (course: TravelCourse): BudgetData => {
    const placeCount = course.place_count
    const durationStr = course.duration || ""
    let numbersOnly = ""
    for (let i = 0; i < durationStr.length; i++) {
      const char = durationStr[i]
      if (char >= "0" && char <= "9") {
        numbersOnly += char
      }
    }
    const duration = numbersOnly ? parseInt(numbersOnly, 10) : 2

    // 기본 예산 추정 (1박2일 기준)
    const baseTransportation = duration >= 3 ? 300000 : 200000
    const baseAccommodation = duration * 150000
    const baseFood = duration * 2 * 50000
    const baseActivity = placeCount * 20000
    const baseShopping = 100000
    const baseOther = 50000

    const total =
      baseTransportation + baseAccommodation + baseFood + baseActivity + baseShopping + baseOther

    return {
      total,
      transportation: baseTransportation,
      accommodation: baseAccommodation,
      food: baseFood,
      activity: baseActivity,
      shopping: baseShopping,
      other: baseOther,
    }
  }

  const handleBudgetChange = (category: keyof BudgetData, value: number) => {
    if (category === "total") {
      // 총액 변경 시 비율 유지
      const ratio = value / budget.total || 1
      setBudget({
        total: value,
        transportation: Math.round(budget.transportation * ratio),
        accommodation: Math.round(budget.accommodation * ratio),
        food: Math.round(budget.food * ratio),
        activity: Math.round(budget.activity * ratio),
        shopping: Math.round(budget.shopping * ratio),
        other: Math.round(budget.other * ratio),
      })
    } else {
      const newBudget = { ...budget, [category]: value }
      newBudget.total =
        newBudget.transportation +
        newBudget.accommodation +
        newBudget.food +
        newBudget.activity +
        newBudget.shopping +
        newBudget.other
      setBudget(newBudget)
    }
  }

  const handleSave = async () => {
    if (!user) {
      toast.error("로그인이 필요합니다")
      router.push("/login")
      return
    }

    if (!selectedCourse) {
      toast.error("여행 코스를 선택해주세요")
      setStep("course")
      return
    }

    if (!travelDates.start || !travelDates.end) {
      toast.error("여행 일정을 선택해주세요")
      return
    }

    if (budget.total === 0) {
      toast.error("예산을 설정해주세요")
      setStep("budget")
      return
    }

    try {
      // 여행 계획 저장 로직 (API 호출)
      // TODO: 실제 API 연동
      toast.success("여행 계획이 저장되었습니다!")
      onOpenChange(false)
      router.push("/my-trips")
    } catch (error) {
      toast.error("여행 계획 저장에 실패했습니다")
      console.error(error)
    }
  }

  const handleClose = () => {
    setStep("course")
    setSelectedCourse(null)
    setBudget({
      total: 0,
      transportation: 0,
      accommodation: 0,
      food: 0,
      activity: 0,
      shopping: 0,
      other: 0,
    })
    setTravelDates({ start: "", end: "" })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-6xl h-[90vh] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden sm:max-w-6xl">
        <div className="px-4 sm:px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Plane className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              여행 계획 만들기
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              3단계로 간단하게 여행 계획을 만들어보세요
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* 진행 상황 표시 */}
        <div className="px-4 sm:px-6 pb-4 flex-shrink-0">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span
                className={
                  step === "course" ? "font-semibold text-primary" : "text-muted-foreground"
                }
              >
                1. 코스 선택
              </span>
              <span
                className={
                  step === "budget" ? "font-semibold text-primary" : "text-muted-foreground"
                }
              >
                2. 예산 설정
              </span>
              <span
                className={
                  step === "confirm" ? "font-semibold text-primary" : "text-muted-foreground"
                }
              >
                3. 확인 및 저장
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Step 1: 코스 선택 */}
        {step === "course" && (
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4">
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                여행하고 싶은 코스를 선택해주세요
              </p>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">여행 코스가 없습니다</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pb-4">
                  {courses.map(course => (
                    <Card
                      key={course.id}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        selectedCourse?.id === course.id ? "ring-2 ring-primary shadow-lg" : ""
                      }`}
                      onClick={() => handleCourseSelect(course)}
                    >
                      <CardContent className="p-3 sm:p-4">
                        {course.image_url && (
                          <div className="relative w-full h-24 sm:h-32 mb-2 sm:mb-3 rounded-lg overflow-hidden">
                            <Image
                              src={course.image_url}
                              alt={course.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm sm:text-base lg:text-lg mb-1 line-clamp-1">
                              {course.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                              {course.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-3">
                          <Badge variant="secondary" className="text-[10px] sm:text-xs">
                            <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                            {course.region}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] sm:text-xs">
                            <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                            {course.duration}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] sm:text-xs">
                            <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                            {course.place_count}개
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: 예산 설정 */}
        {step === "budget" && (
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4">
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2 flex items-center gap-2">
                  <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  예산 설정
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                  각 항목별 예산을 입력해주세요
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transportation">교통비</Label>
                  <div className="relative">
                    <Input
                      id="transportation"
                      type="number"
                      value={budget.transportation || ""}
                      onChange={e =>
                        handleBudgetChange("transportation", parseInt(e.target.value) || 0)
                      }
                      placeholder="0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      원
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accommodation">숙박비</Label>
                  <div className="relative">
                    <Input
                      id="accommodation"
                      type="number"
                      value={budget.accommodation || ""}
                      onChange={e =>
                        handleBudgetChange("accommodation", parseInt(e.target.value) || 0)
                      }
                      placeholder="0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      원
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="food">식비</Label>
                  <div className="relative">
                    <Input
                      id="food"
                      type="number"
                      value={budget.food || ""}
                      onChange={e => handleBudgetChange("food", parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      원
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activity">액티비티</Label>
                  <div className="relative">
                    <Input
                      id="activity"
                      type="number"
                      value={budget.activity || ""}
                      onChange={e => handleBudgetChange("activity", parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      원
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shopping">쇼핑</Label>
                  <div className="relative">
                    <Input
                      id="shopping"
                      type="number"
                      value={budget.shopping || ""}
                      onChange={e => handleBudgetChange("shopping", parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      원
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="other">기타</Label>
                  <div className="relative">
                    <Input
                      id="other"
                      type="number"
                      value={budget.other || ""}
                      onChange={e => handleBudgetChange("other", parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      원
                    </span>
                  </div>
                </div>
              </div>

              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm sm:text-base lg:text-lg">총 예산</span>
                    <span className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">
                      {budget.total.toLocaleString()}원
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date" className="text-xs sm:text-sm">
                    출발일
                  </Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={travelDates.start}
                    onChange={e => setTravelDates({ ...travelDates, start: e.target.value })}
                    className="text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date" className="text-xs sm:text-sm">
                    귀국일
                  </Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={travelDates.end}
                    onChange={e => setTravelDates({ ...travelDates, end: e.target.value })}
                    min={travelDates.start}
                    className="text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:justify-end pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep("course")}
                  className="w-full sm:w-auto"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  이전
                </Button>
                <Button onClick={() => setStep("confirm")} className="w-full sm:w-auto">
                  다음
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: 확인 및 저장 */}
        {step === "confirm" && selectedCourse && (
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4">
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  계획 확인
                </h3>
              </div>

              <Card>
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-sm sm:text-base">선택한 코스</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                    {selectedCourse.image_url && (
                      <div className="relative w-full sm:w-24 h-32 sm:h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={selectedCourse.image_url}
                          alt={selectedCourse.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm sm:text-base lg:text-lg mb-1">
                        {selectedCourse.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">
                        {selectedCourse.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="text-[10px] sm:text-xs">
                          <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                          {selectedCourse.region}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] sm:text-xs">
                          <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                          {selectedCourse.duration}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] sm:text-xs">
                          <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                          {selectedCourse.place_count}개 장소
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-sm sm:text-base">예산 정보</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0 space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">교통비</span>
                    <span className="font-medium">{budget.transportation.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">숙박비</span>
                    <span className="font-medium">{budget.accommodation.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">식비</span>
                    <span className="font-medium">{budget.food.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">액티비티</span>
                    <span className="font-medium">{budget.activity.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">쇼핑</span>
                    <span className="font-medium">{budget.shopping.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">기타</span>
                    <span className="font-medium">{budget.other.toLocaleString()}원</span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between font-semibold text-sm sm:text-base lg:text-lg">
                    <span>총 예산</span>
                    <span className="text-primary">{budget.total.toLocaleString()}원</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-sm sm:text-base">여행 일정</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    <span>
                      {travelDates.start && travelDates.end
                        ? `${travelDates.start} ~ ${travelDates.end}`
                        : "일정을 선택해주세요"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row gap-2 sm:justify-end pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep("budget")}
                  className="w-full sm:w-auto"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  이전
                </Button>
                <Button onClick={handleSave} className="w-full sm:w-auto sm:min-w-[120px]">
                  <Check className="h-4 w-4 mr-2" />
                  저장하기
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
