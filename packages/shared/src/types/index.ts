// 공통 타입 정의
export type Place = {
  id: string
  name: string
  lat: number
  lng: number
  type: "CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC"
  rating: number
  priceLevel: number
  description: string
  image: string
  image_url?: string
  address?: string
  area_code?: number | null
  sigungu_code?: number | null
  place_id?: string | null // places 테이블의 id (하이브리드 방식 지원)
}

export type TravelPlan = {
  id: string
  title: string
  destination: string
  duration: string
  budget: string
  score: number
  places: Place[]
  path: { lat: number; lng: number }[]
}

export type BudgetItem = {
  id: string
  category: "교통비" | "숙박비" | "식비" | "액티비티" | "쇼핑" | "기타"
  name: string
  planned: number
  actual: number
  date?: string
}

export type DetailedTravelPlan = TravelPlan & {
  detailedItinerary: {
    day: number
    title: string
    places: Place[]
    budget: BudgetItem[]
    totalBudget: number
  }[]
}

export type TripStatus = "planning" | "ongoing" | "completed"

export type Trip = {
  id: string
  title: string
  destination: string
  startDate: string
  endDate: string
  budget: number
  status: TripStatus
  places: number
  score?: number
}
