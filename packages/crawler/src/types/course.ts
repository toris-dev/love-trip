// 코스 데이터 타입 정의
export interface CourseData {
  id: string
  title: string // 코스 제목 (예: "서울 데이트 코스", "제주도 여행 코스")
  region: string // 지역명 (예: "서울", "제주도", "전주")
  course_type: "travel" | "date" // 코스 타입
  description: string | null // 코스 설명
  image_url: string | null // 대표 이미지
  place_count: number // 포함된 장소 개수
  area_code: number | null // 지역 코드
  sigungu_code: number | null // 시군구 코드
  created_at?: string
  updated_at?: string
}

// Supabase에 저장할 코스 데이터
export interface CourseInsertData {
  id: string
  title: string
  region: string
  course_type: "travel" | "date"
  description: string | null
  image_url: string | null
  place_count: number
  area_code: number | null
  sigungu_code: number | null
}

