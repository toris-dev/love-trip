"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  MapPin,
  Heart,
  Users,
  Wallet,
  Star,
  Clock,
  Camera,
  Search,
  Plus,
  Minus,
  Calculator,
  TrendingUp,
  PieChart,
} from "lucide-react"
import NaverMapView from "@/components/naver-map-view"
import { travelService } from "@/lib/services/travel-service"
import { createClient } from "@/lib/supabase/client"
import { PWAInstall } from "@/components/pwa-install"
import { PushNotificationSettings } from "@/components/push-notification-settings"

type Place = {
  id: string
  name: string
  lat: number
  lng: number
  type: "CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC"
  rating: number
  priceLevel: number
  description: string
  image: string
}

type TravelPlan = {
  id: string
  title: string
  destination: string
  duration: string
  budget: string
  score: number
  places: Place[]
  path: { lat: number; lng: number }[]
}

type BudgetItem = {
  id: string
  category: "교통비" | "숙박비" | "식비" | "액티비티" | "쇼핑" | "기타"
  name: string
  planned: number
  actual: number
  date?: string
}

type DetailedTravelPlan = TravelPlan & {
  detailedItinerary: {
    day: number
    title: string
    places: Place[]
    budget: BudgetItem[]
    totalBudget: number
  }[]
}

export default function LoveTripHome() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPlan, setSelectedPlan] = useState<DetailedTravelPlan | null>(null)
  const [activeTab, setActiveTab] = useState("search")
  const [selectedPlace, setSelectedPlace] = useState<any | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [selectedThemes, setSelectedThemes] = useState<string[]>([])
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false)
  const [realPlaces, setRealPlaces] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)

  const samplePlaces: Place[] = [
    {
      id: "1",
      name: "남산타워",
      lat: 37.5512,
      lng: 126.9882,
      type: "VIEW",
      rating: 4.5,
      priceLevel: 2,
      description: "서울의 랜드마크, 로맨틱한 야경 명소",
      image: "/seoul-tower-romantic-night-view.png",
    },
    {
      id: "2",
      name: "홍대 카페거리",
      lat: 37.5563,
      lng: 126.9236,
      type: "CAFE",
      rating: 4.3,
      priceLevel: 1,
      description: "트렌디한 카페들이 모인 데이트 코스",
      image: "/hongdae-cafe-street-couples.png",
    },
    {
      id: "3",
      name: "한강공원",
      lat: 37.5326,
      lng: 126.9619,
      type: "VIEW",
      rating: 4.4,
      priceLevel: 0,
      description: "피크닉과 산책을 즐길 수 있는 힐링 공간",
      image: "/han-river-park-picnic-couples.png",
    },
  ]

  const samplePath = [
    { lat: 37.5563, lng: 126.9236 },
    { lat: 37.5512, lng: 126.9882 },
    { lat: 37.5326, lng: 126.9619 },
  ]

  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([
    { id: "1", category: "교통비", name: "KTX 왕복", planned: 50000, actual: 0 },
    { id: "2", category: "숙박비", name: "호텔 1박", planned: 80000, actual: 0 },
    { id: "3", category: "식비", name: "점심/저녁", planned: 60000, actual: 0 },
    { id: "4", category: "액티비티", name: "남산타워 입장료", planned: 40000, actual: 0 },
  ])

  const [newBudgetItem, setNewBudgetItem] = useState({
    category: "기타" as BudgetItem["category"],
    name: "",
    planned: 0,
  })

  const [selectedBudgetCategory, setSelectedBudgetCategory] = useState<string>("전체")

  const detailedPlans: DetailedTravelPlan[] = [
    {
      id: "1",
      title: "서울 로맨틱 데이트",
      destination: "서울",
      duration: "1박 2일",
      budget: "230,000원",
      score: 95,
      places: samplePlaces,
      path: samplePath,
      detailedItinerary: [
        {
          day: 1,
          title: "첫째 날 - 홍대 & 남산",
          places: [samplePlaces[1], samplePlaces[0]],
          budget: [
            { id: "d1-1", category: "교통비", name: "지하철", planned: 5000, actual: 0 },
            { id: "d1-2", category: "식비", name: "홍대 브런치", planned: 25000, actual: 0 },
            { id: "d1-3", category: "액티비티", name: "남산타워", planned: 20000, actual: 0 },
            { id: "d1-4", category: "식비", name: "저녁식사", planned: 35000, actual: 0 },
          ],
          totalBudget: 85000,
        },
        {
          day: 2,
          title: "둘째 날 - 한강 피크닉",
          places: [samplePlaces[2]],
          budget: [
            { id: "d2-1", category: "식비", name: "피크닉 도시락", planned: 20000, actual: 0 },
            { id: "d2-2", category: "액티비티", name: "자전거 대여", planned: 15000, actual: 0 },
            { id: "d2-3", category: "교통비", name: "택시", planned: 10000, actual: 0 },
          ],
          totalBudget: 45000,
        },
      ],
    },
    {
      id: "2",
      title: "부산 바다 여행",
      destination: "부산",
      duration: "2박 3일",
      budget: "25만원",
      score: 92,
      places: [],
      path: [],
      detailedItinerary: [],
    },
    {
      id: "3",
      title: "제주 힐링 여행",
      destination: "제주",
      duration: "3박 4일",
      budget: "40만원",
      score: 88,
      places: [],
      path: [],
      detailedItinerary: [],
    },
  ]

  const calculateTotalPlanned = () => {
    return budgetItems.reduce((sum, item) => sum + item.planned, 0)
  }

  const calculateTotalActual = () => {
    return budgetItems.reduce((sum, item) => sum + item.actual, 0)
  }

  const calculateBudgetByCategory = () => {
    const categories = budgetItems.reduce(
      (acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = { planned: 0, actual: 0 }
        }
        acc[item.category].planned += item.planned
        acc[item.category].actual += item.actual
        return acc
      },
      {} as Record<string, { planned: number; actual: number }>,
    )

    return categories
  }

  const addBudgetItem = () => {
    if (!newBudgetItem.name || newBudgetItem.planned <= 0) return

    const newItem: BudgetItem = {
      id: Date.now().toString(),
      ...newBudgetItem,
      actual: 0,
    }

    setBudgetItems([...budgetItems, newItem])
    setNewBudgetItem({ category: "기타", name: "", planned: 0 })
  }

  const updateBudgetItem = (id: string, field: "planned" | "actual", value: number) => {
    setBudgetItems((items) => items.map((item) => (item.id === id ? { ...item, [field]: Math.max(0, value) } : item)))
  }

  const deleteBudgetItem = (id: string) => {
    setBudgetItems((items) => items.filter((item) => item.id !== id))
  }

  useEffect(() => {
    const loadUserAndData = async () => {
      const supabase = createClient()

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      // Load places from database
      try {
        setIsLoadingPlaces(true)
        const places = await travelService.getPlaces()
        setRealPlaces(places)
        console.log("[v0] LoveTripHome: Loaded places from database:", places.length)
      } catch (error) {
        console.error("[v0] LoveTripHome: Error loading places:", error)
        // Fallback to sample data if database fails
        setRealPlaces(samplePlaces)
      } finally {
        setIsLoadingPlaces(false)
      }
    }

    loadUserAndData()
  }, [])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    console.log("[v0] LoveTripHome: Starting search for:", searchQuery)

    try {
      // Search in real database
      const searchResults = await travelService.searchPlaces(searchQuery)
      setRealPlaces(searchResults)
      console.log("[v0] LoveTripHome: Search results:", searchResults.length)
    } catch (error) {
      console.error("[v0] LoveTripHome: Search error:", error)
      // Fallback to sample data filter
      const filtered = samplePlaces.filter(
        (place) =>
          place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          place.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setRealPlaces(filtered)
    } finally {
      setIsSearching(false)
      setActiveTab("recommendations")
    }
  }

  const handlePlanSelect = (plan: DetailedTravelPlan) => {
    console.log("[v0] LoveTripHome: Plan selected:", plan.title)
    setSelectedPlan(plan)
    setActiveTab("map")
  }

  const handlePlaceClick = (place: any) => {
    console.log("[v0] LoveTripHome: Place clicked from map:", place.name)
    setSelectedPlace(place)
  }

  const handleThemeToggle = (theme: string) => {
    setSelectedThemes((prev) => (prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme]))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const displayPlaces = realPlaces.length > 0 ? realPlaces : samplePlaces

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-primary fill-primary" />
              <h1 className="text-2xl font-bold text-primary">LOVETRIP</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Users className="h-4 w-4 mr-2" />
                커플 연결
              </Button>
              {user ? (
                <Button variant="outline" size="sm">
                  {user.email}
                </Button>
              ) : (
                <Button variant="outline" size="sm">
                  로그인
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            완벽한 커플 여행을
            <br />
            함께 계획해보세요
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            AI가 추천하는 맞춤형 데이트 코스와 예산 관리로 특별한 추억을 만들어보세요
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 p-6 bg-card rounded-2xl shadow-lg border">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="어디로 여행을 떠나고 싶으신가요?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="text-lg h-12 pl-10"
                />
              </div>
              <Button
                size="lg"
                className="h-12 px-8"
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    검색 중...
                  </>
                ) : (
                  <>
                    <MapPin className="h-5 w-5 mr-2" />
                    여행 계획 시작
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              검색
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              추천
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              지도
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              경비
            </TabsTrigger>
          </TabsList>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-8">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    여행 일정
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">원하는 날짜와 기간을 선택하세요</p>
                  <Button variant="outline" className="w-full mt-4 bg-transparent">
                    날짜 선택
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wallet className="h-5 w-5 mr-2 text-primary" />
                    예산 설정
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">여행 예산을 입력하면 맞춤 추천을 받을 수 있어요</p>
                  <Button variant="outline" className="w-full mt-4 bg-transparent">
                    예산 입력
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="h-5 w-5 mr-2 text-primary" />
                    테마 선택
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {["로맨틱", "힐링", "액티브", "기념일", "야경", "카페투어"].map((theme) => (
                      <Badge
                        key={theme}
                        variant={selectedThemes.includes(theme) ? "default" : "secondary"}
                        className="cursor-pointer hover:bg-primary/20 transition-colors"
                        onClick={() => handleThemeToggle(theme)}
                      >
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">추천 여행 플랜</h3>
              <p className="text-muted-foreground">AI가 선별한 커플을 위한 특별한 여행 코스</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {detailedPlans.map((plan) => (
                <Card
                  key={plan.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handlePlanSelect(plan)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{plan.title}</CardTitle>
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        <Star className="h-3 w-3 mr-1" />
                        {plan.score}
                      </Badge>
                    </div>
                    <CardDescription>{plan.destination}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        {plan.duration}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Wallet className="h-4 w-4 mr-2" />
                        예상 경비: {plan.budget}
                      </div>
                    </div>
                    <Button className="w-full mt-4 bg-transparent" variant="outline">
                      자세히 보기
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Enhanced Map Tab */}
          <TabsContent value="map" className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">여행 지도 & 상세 일정</h3>
              <p className="text-muted-foreground">
                {selectedPlan
                  ? `${selectedPlan.title} 코스를 지도에서 확인하고 상세 일정을 계획해보세요`
                  : "지도에서 여행 코스를 확인하고 상세 일정을 계획해보세요"}
              </p>
              {isLoadingPlaces && (
                <p className="text-sm text-muted-foreground mt-2">데이터베이스에서 장소 정보를 불러오는 중...</p>
              )}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardContent className="p-0">
                    <NaverMapView
                      places={selectedPlan?.places || displayPlaces}
                      path={selectedPlan?.path || samplePath}
                      onPlaceClick={handlePlaceClick}
                    />
                  </CardContent>
                </Card>

                {selectedPlan && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2" />
                        상세 일정표
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {selectedPlan.detailedItinerary.map((day, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <h4 className="font-semibold text-lg mb-3 text-primary">{day.title}</h4>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <h5 className="font-medium mb-2">방문 장소</h5>
                                <div className="space-y-2">
                                  {day.places.map((place, placeIndex) => (
                                    <div key={place.id} className="flex items-center space-x-2 text-sm">
                                      <div className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                                        {placeIndex + 1}
                                      </div>
                                      <span>{place.name}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <h5 className="font-medium mb-2">예상 경비</h5>
                                <div className="space-y-1">
                                  {day.budget.map((item) => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                      <span>{item.name}</span>
                                      <span>{item.planned.toLocaleString()}원</span>
                                    </div>
                                  ))}
                                  <div className="border-t pt-1 flex justify-between font-medium">
                                    <span>소계</span>
                                    <span className="text-primary">{day.totalBudget.toLocaleString()}원</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-4">
                {selectedPlace && (
                  <Card className="border-primary">
                    <CardHeader>
                      <CardTitle className="text-primary">선택된 장소</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start space-x-3">
                        <img
                          src={selectedPlace.image_url || selectedPlace.image || "/placeholder.svg"}
                          alt={selectedPlace.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold">{selectedPlace.name}</h4>
                          <p className="text-sm text-muted-foreground">{selectedPlace.description}</p>
                          <div className="flex items-center mt-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm ml-1">{selectedPlace.rating}</span>
                          </div>
                          {selectedPlace.address && (
                            <p className="text-xs text-muted-foreground mt-1">{selectedPlace.address}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>추천 장소</CardTitle>
                    <CardDescription>
                      {realPlaces.length > 0 ? "데이터베이스에서 불러온 실제 장소들" : "샘플 데이터"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {displayPlaces.map((place, index) => (
                      <div
                        key={place.id}
                        className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                          selectedPlace?.id === place.id ? "border-primary bg-primary/5" : ""
                        }`}
                        onClick={() => setSelectedPlace(place)}
                      >
                        <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <img
                          src={place.image_url || place.image || "/placeholder.svg"}
                          alt={place.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold">{place.name}</h4>
                          <p className="text-sm text-muted-foreground">{place.description}</p>
                          <div className="flex items-center mt-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm ml-1">{place.rating}</span>
                          </div>
                          {place.address && <p className="text-xs text-muted-foreground mt-1">{place.address}</p>}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Enhanced Budget Tab */}
          <TabsContent value="budget" className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">스마트 경비 관리</h3>
              <p className="text-muted-foreground">AI 기반 예산 분석과 실시간 지출 추적으로 완벽한 여행 경비 관리</p>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">총 예산</p>
                      <p className="text-2xl font-bold text-primary">{calculateTotalPlanned().toLocaleString()}원</p>
                    </div>
                    <Wallet className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">실제 지출</p>
                      <p className="text-2xl font-bold text-orange-500">{calculateTotalActual().toLocaleString()}원</p>
                    </div>
                    <Calculator className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">남은 예산</p>
                      <p
                        className={`text-2xl font-bold ${calculateTotalPlanned() - calculateTotalActual() >= 0 ? "text-green-500" : "text-red-500"}`}
                      >
                        {(calculateTotalPlanned() - calculateTotalActual()).toLocaleString()}원
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">예산 달성률</p>
                      <p className="text-2xl font-bold text-blue-500">
                        {calculateTotalPlanned() > 0
                          ? Math.round((calculateTotalActual() / calculateTotalPlanned()) * 100)
                          : 0}
                        %
                      </p>
                    </div>
                    <PieChart className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>예산 항목 관리</CardTitle>
                  <CardDescription>여행 경비를 카테고리별로 관리하세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add new budget item */}
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <h4 className="font-medium mb-3">새 항목 추가</h4>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <select
                        value={newBudgetItem.category}
                        onChange={(e) =>
                          setNewBudgetItem({ ...newBudgetItem, category: e.target.value as BudgetItem["category"] })
                        }
                        className="px-3 py-2 border rounded-md text-sm"
                      >
                        <option value="교통비">교통비</option>
                        <option value="숙박비">숙박비</option>
                        <option value="식비">식비</option>
                        <option value="액티비티">액티비티</option>
                        <option value="쇼핑">쇼핑</option>
                        <option value="기타">기타</option>
                      </select>
                      <Input
                        placeholder="항목명"
                        value={newBudgetItem.name}
                        onChange={(e) => setNewBudgetItem({ ...newBudgetItem, name: e.target.value })}
                        className="text-sm"
                      />
                      <Input
                        type="number"
                        placeholder="예산"
                        value={newBudgetItem.planned || ""}
                        onChange={(e) =>
                          setNewBudgetItem({ ...newBudgetItem, planned: Number.parseInt(e.target.value) || 0 })
                        }
                        className="text-sm"
                      />
                    </div>
                    <Button onClick={addBudgetItem} size="sm" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      추가
                    </Button>
                  </div>

                  {/* Budget items list */}
                  <div className="space-y-3">
                    {budgetItems.map((item) => (
                      <div key={item.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">{item.category}</Badge>
                            <span className="font-medium">{item.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteBudgetItem(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-muted-foreground">예산</label>
                            <Input
                              type="number"
                              value={item.planned}
                              onChange={(e) =>
                                updateBudgetItem(item.id, "planned", Number.parseInt(e.target.value) || 0)
                              }
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">실제 지출</label>
                            <Input
                              type="number"
                              value={item.actual}
                              onChange={(e) =>
                                updateBudgetItem(item.id, "actual", Number.parseInt(e.target.value) || 0)
                              }
                              className="text-sm"
                            />
                          </div>
                        </div>
                        <div className="mt-2 text-xs">
                          <div className="flex justify-between">
                            <span>차이:</span>
                            <span className={item.actual <= item.planned ? "text-green-600" : "text-red-600"}>
                              {(item.planned - item.actual).toLocaleString()}원
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                {/* Push Notification Settings Card */}
                <PushNotificationSettings />

                <Card>
                  <CardHeader>
                    <CardTitle>카테고리별 분석</CardTitle>
                    <CardDescription>지출 패턴을 한눈에 확인하세요</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(calculateBudgetByCategory()).map(([category, amounts]) => (
                        <div key={category} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{category}</span>
                            <span>
                              {amounts.actual.toLocaleString()} / {amounts.planned.toLocaleString()}원
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                amounts.actual <= amounts.planned ? "bg-green-500" : "bg-red-500"
                              }`}
                              style={{
                                width: `${Math.min((amounts.actual / amounts.planned) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>영수증 관리</CardTitle>
                    <CardDescription>영수증을 촬영하여 자동으로 지출을 기록하세요</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full" size="lg">
                      <Camera className="h-5 w-5 mr-2" />
                      영수증 촬영하기
                    </Button>
                    <div className="text-center text-sm text-muted-foreground">
                      AI가 영수증을 분석하여 자동으로 지출 내역을 추가합니다
                    </div>

                    {/* Sample receipt history */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">최근 영수증</h4>
                      <div className="text-sm text-muted-foreground">아직 등록된 영수증이 없습니다</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Heart className="h-6 w-6 text-primary fill-primary" />
              <span className="text-xl font-bold text-primary">LOVETRIP</span>
            </div>
            <p className="text-muted-foreground">커플을 위한 완벽한 여행 파트너</p>
          </div>
        </div>
      </footer>

      <PWAInstall />
    </div>
  )
}
