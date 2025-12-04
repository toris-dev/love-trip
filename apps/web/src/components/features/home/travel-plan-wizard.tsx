"use client"

import { useState, useEffect } from "react"
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
  Users,
  Share2,
  Gift,
  X,
  GripVertical,
} from "lucide-react"
import { Switch } from "@lovetrip/ui/components/switch"
import { LocationInput } from "@/components/shared/location-input"
import { toast } from "sonner"
import dynamic from "next/dynamic"

const NaverMapView = dynamic(() => import("@/components/shared/naver-map-view"), { ssr: false })

interface TravelPlanWizardProps {
  user: { id: string; email?: string } | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

type WizardStep = "places" | "budget" | "confirm"

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
  const [step, setStep] = useState<WizardStep>("places")
  const [places, setPlaces] = useState<
    Array<{
      id: string
      name: string
      address: string
      lat: number
      lng: number
      type: "CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC"
    }>
  >([])
  const [courseTitle, setCourseTitle] = useState("")
  const [courseDescription, setCourseDescription] = useState("")
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
  const [departureLocation, setDepartureLocation] = useState<{
    address: string
    lat: number
    lng: number
  } | null>(null)
  const [destinationLocation, setDestinationLocation] = useState<{
    address: string
    lat: number
    lng: number
  } | null>(null)
  const [isPublic, setIsPublic] = useState(false)
  const [isPremium, setIsPremium] = useState(false)

  // 프리미엄 구독 확인 (필요시 사용)
  useEffect(() => {
    if (user) {
      fetch("/api/subscription/check")
        .then(res => res.json())
        .then(data => setIsPremium(data.isPremium || false))
        .catch(() => setIsPremium(false))
    }
  }, [user])

  const progress = step === "places" ? 33 : step === "budget" ? 66 : 100

  const estimateBudgetFromPlaces = (
    placesList: Array<{ type: "CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC" }>,
    startDate: string,
    endDate: string
  ): BudgetData => {
    let duration = 1
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    }

    // 장소 타입별 예산 추정
    const foodPlaces = placesList.filter(p => p.type === "FOOD" || p.type === "CAFE").length
    const activityPlaces = placesList.filter(p => p.type === "VIEW" || p.type === "MUSEUM").length

    const baseTransportation = duration >= 3 ? 300000 : 200000
    const baseAccommodation = duration * 150000
    const baseFood = foodPlaces * 50000
    const baseActivity = activityPlaces * 20000
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

    if (places.length === 0) {
      toast.error("최소 1개 이상의 장소를 추가해주세요")
      setStep("places")
      return
    }

    if (!courseTitle.trim()) {
      toast.error("코스 제목을 입력해주세요")
      setStep("places")
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
      // 코스 정보 준비
      const coursePlaces = places.map(p => ({
        id: p.id,
        name: p.name,
        lat: p.lat,
        lng: p.lng,
        type: p.type,
        rating: 0,
        price_level: 0,
        description: "",
        image_url: "",
      }))

      // 지역 자동 추출 (첫 장소 주소에서)
      const firstPlace = places[0]
      let courseDestination = "기타"
      if (firstPlace?.address) {
        // 주소에서 지역 추출 (예: "서울특별시 강남구" -> "서울")
        const match = firstPlace.address.match(
          /(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)/
        )
        courseDestination = match ? match[1] : "기타"
      }

      // 1. travel_plan 생성
      const response = await fetch("/api/travel-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: courseTitle,
          destination: courseDestination,
          description: courseDescription,
          start_date: travelDates.start,
          end_date: travelDates.end,
          total_budget: budget.total,
          course_type: travelDates.start === travelDates.end ? "date" : "travel",
          places: coursePlaces.map((p, index) => ({
            place_id: p.id,
            day_number: calculateDayNumber(
              index,
              coursePlaces.length,
              travelDates.start,
              travelDates.end
            ),
            order_index: index,
          })),
          budget_items: [
            { category: "교통비", name: "교통비", planned_amount: budget.transportation },
            { category: "숙박비", name: "숙박비", planned_amount: budget.accommodation },
            { category: "식비", name: "식비", planned_amount: budget.food },
            { category: "액티비티", name: "액티비티", planned_amount: budget.activity },
            { category: "쇼핑", name: "쇼핑", planned_amount: budget.shopping },
            { category: "기타", name: "기타", planned_amount: budget.other },
          ],
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "여행 계획 저장에 실패했습니다")
      }

      const { plan } = await response.json()

      // 2. 공개 옵션이 선택된 경우 user_course로 변환
      if (isPublic) {
        const publishResponse = await fetch(`/api/user-courses/${plan.id}/publish`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: courseTitle,
            description: courseDescription,
            isPublic: true,
          }),
        })

        if (publishResponse.ok) {
          const { rewards } = await publishResponse.json()

          // 배지 획득 시 특별 알림
          if (rewards?.badge) {
            toast.success(
              `🎉 축하합니다! 코스가 공개되었고 "${rewards.badge.name}" 배지를 획득했습니다!`,
              {
                description: `보상: XP ${rewards.xp || 0} + 포인트 ${rewards.points || 0}${rewards.leveledUp ? " (레벨 업!)" : ""}`,
                duration: 5000,
              }
            )
          } else {
            toast.success(`여행 계획이 공개되었습니다!`, {
              description: `보상: XP ${rewards?.xp || 0} + 포인트 ${rewards?.points || 0}${rewards?.leveledUp ? " (레벨 업!)" : ""}`,
              duration: 4000,
            })
          }
        } else {
          toast.success("여행 계획이 저장되었습니다! (공개는 나중에 설정할 수 있습니다)")
        }
      } else {
        toast.success("여행 계획이 저장되었습니다!")
      }

      onOpenChange(false)
      router.push("/my-trips")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "여행 계획 저장에 실패했습니다")
      console.error(error)
    }
  }

  // 일차 계산 함수
  const calculateDayNumber = (
    index: number,
    totalPlaces: number,
    startDate: string,
    endDate: string
  ): number => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

    if (diffDays === 1) return 1 // 당일 코스

    // 여러 일차에 장소를 균등 분배
    const placesPerDay = Math.ceil(totalPlaces / diffDays)
    return Math.floor(index / placesPerDay) + 1
  }

  // LocationInput에서 선택한 위치를 Place 형식으로 변환하여 추가
  const handleAddPlace = (location: {
    address: string
    lat: number
    lng: number
    name?: string
  }) => {
    if (places.some(p => p.lat === location.lat && p.lng === location.lng)) {
      toast.error("이미 추가된 장소입니다")
      return
    }

    const newPlace = {
      id: `place-${Date.now()}-${Math.random()}`,
      name: location.name || location.address,
      address: location.address,
      lat: location.lat,
      lng: location.lng,
      type: "ETC" as const,
    }

    setPlaces([...places, newPlace])
    toast.success("장소가 추가되었습니다")
  }

  const handleRemovePlace = (placeId: string) => {
    setPlaces(places.filter(p => p.id !== placeId))
    toast.success("장소가 제거되었습니다")
  }

  const handlePlacesNext = () => {
    if (places.length === 0) {
      toast.error("최소 1개 이상의 장소를 추가해주세요")
      return
    }
    if (!courseTitle.trim()) {
      toast.error("코스 제목을 입력해주세요")
      return
    }

    const estimatedBudget = estimateBudgetFromPlaces(
      places,
      travelDates.start || new Date().toISOString().split("T")[0],
      travelDates.end || new Date().toISOString().split("T")[0]
    )
    setBudget(estimatedBudget)
    setStep("budget")
  }

  const handleClose = () => {
    setStep("places")
    setPlaces([])
    setCourseTitle("")
    setCourseDescription("")
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
    setDepartureLocation(null)
    setDestinationLocation(null)
    setIsPublic(false)
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
                  step === "places" ? "font-semibold text-primary" : "text-muted-foreground"
                }
              >
                1. 장소 추가
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

        {/* Step 1: 장소 추가 */}
        {step === "places" && (
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">데이트 코스 만들기</h3>
                <p className="text-sm text-muted-foreground">
                  장소를 검색하여 추가하고 순서를 정해보세요
                </p>
              </div>

              {/* 코스 정보 입력 */}
              <Card>
                <CardHeader className="p-3 sm:p-4">
                  <CardTitle className="text-sm sm:text-base">코스 정보</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0 space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="course-title">코스 제목 *</Label>
                    <Input
                      id="course-title"
                      value={courseTitle}
                      onChange={e => setCourseTitle(e.target.value)}
                      placeholder="예: 서울 로맨틱 데이트 코스"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="course-description">코스 설명 (선택)</Label>
                    <Input
                      id="course-description"
                      value={courseDescription}
                      onChange={e => setCourseDescription(e.target.value)}
                      placeholder="코스에 대한 간단한 설명을 입력하세요"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 장소 검색 및 추가 */}
              <Card>
                <CardHeader className="p-3 sm:p-4">
                  <CardTitle className="text-sm sm:text-base">장소 추가</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0">
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
              {places.length > 0 && (
                <Card>
                  <CardHeader className="p-3 sm:p-4">
                    <CardTitle className="text-sm sm:text-base">
                      추가된 장소 ({places.length}개)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 pt-0">
                    <div className="space-y-2">
                      {places.map((place, index) => (
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

              {/* 다음 버튼 */}
              <div className="flex justify-end pt-2">
                <Button
                  onClick={handlePlacesNext}
                  disabled={places.length === 0 || !courseTitle.trim()}
                  className="w-full sm:w-auto"
                >
                  다음
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
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

              {/* 출발지/목적지 입력 */}
              <Card>
                <CardHeader className="p-3 sm:p-4">
                  <CardTitle className="text-sm sm:text-base">출발지 및 목적지</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0 space-y-4">
                  <LocationInput
                    label="출발지"
                    value={departureLocation?.address || ""}
                    onChange={address => {
                      if (!address) {
                        setDepartureLocation(null)
                      }
                    }}
                    onLocationSelect={location => {
                      setDepartureLocation({
                        address: location.address,
                        lat: location.lat,
                        lng: location.lng,
                      })
                    }}
                    placeholder="출발지를 입력하세요 (예: 서울역, 강남역)"
                  />
                  <LocationInput
                    label="목적지"
                    value={destinationLocation?.address || ""}
                    onChange={address => {
                      if (!address) {
                        setDestinationLocation(null)
                      }
                    }}
                    onLocationSelect={location => {
                      setDestinationLocation({
                        address: location.address,
                        lat: location.lat,
                        lng: location.lng,
                      })
                    }}
                    placeholder="목적지를 입력하세요 (예: 제주도, 부산)"
                  />
                </CardContent>
              </Card>

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
                  onClick={() => setStep("places")}
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
        {step === "confirm" && places.length > 0 && (
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
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm sm:text-base lg:text-lg mb-1">
                        {courseTitle}
                      </h4>
                      {courseDescription && (
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                          {courseDescription}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="text-[10px] sm:text-xs">
                          <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                          {places.length}개 장소
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {places.map((place, index) => (
                        <div
                          key={place.id}
                          className="flex items-center gap-3 p-2 border rounded-lg bg-muted/30"
                        >
                          <span className="text-xs font-medium w-6">{index + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{place.name}</p>
                            {place.address && (
                              <p className="text-xs text-muted-foreground truncate">
                                {place.address}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
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

              {/* 출발지/목적지 지도 */}
              {(departureLocation || destinationLocation) && (
                <Card>
                  <CardHeader className="p-3 sm:p-6">
                    <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      출발지 및 목적지
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 pt-0 space-y-3">
                    {departureLocation && (
                      <div className="text-xs sm:text-sm">
                        <span className="font-medium text-muted-foreground">출발지: </span>
                        <span>{departureLocation.address}</span>
                      </div>
                    )}
                    {destinationLocation && (
                      <div className="text-xs sm:text-sm">
                        <span className="font-medium text-muted-foreground">목적지: </span>
                        <span>{destinationLocation.address}</span>
                      </div>
                    )}
                    <div className="h-64 rounded-lg overflow-hidden border">
                      <NaverMapView
                        places={[
                          ...(departureLocation
                            ? [
                                {
                                  id: "departure",
                                  name: "출발지",
                                  lat: departureLocation.lat,
                                  lng: departureLocation.lng,
                                  type: "ETC" as const,
                                  rating: 0,
                                  priceLevel: 0,
                                  description: departureLocation.address,
                                  image: "",
                                },
                              ]
                            : []),
                          ...(destinationLocation
                            ? [
                                {
                                  id: "destination",
                                  name: "목적지",
                                  lat: destinationLocation.lat,
                                  lng: destinationLocation.lng,
                                  type: "ETC" as const,
                                  rating: 0,
                                  priceLevel: 0,
                                  description: destinationLocation.address,
                                  image: "",
                                },
                              ]
                            : []),
                        ]}
                        path={
                          departureLocation && destinationLocation
                            ? [
                                { lat: departureLocation.lat, lng: departureLocation.lng },
                                { lat: destinationLocation.lat, lng: destinationLocation.lng },
                              ]
                            : []
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 공개 옵션 */}
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-primary" />
                    코스 공개하기
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-medium mb-1">
                        다른 커플과 코스를 공유하시겠어요?
                      </p>
                      <p className="text-xs text-muted-foreground">
                        공개하면 다른 사용자들이 내 코스를 볼 수 있고, 좋아요/저장을 받을 때마다
                        보상을 받을 수 있어요!
                      </p>
                    </div>
                    <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                  </div>
                  {isPublic && (
                    <div className="flex items-start gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
                      <Gift className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="text-xs">
                        <p className="font-medium mb-1">공개 보상:</p>
                        <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                          <li>XP 100 + 포인트 50 (첫 코스 공개 시 배지 추가)</li>
                          <li>좋아요 받기: XP 5 + 포인트 2</li>
                          <li>저장 받기: XP 10 + 포인트 5</li>
                        </ul>
                      </div>
                    </div>
                  )}
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
