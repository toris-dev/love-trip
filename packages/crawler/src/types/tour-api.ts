import { z } from "zod"

// Tour API 응답 스키마
export const TourApiResponseSchema = z.object({
  response: z.object({
    header: z.object({
      resultCode: z.string(),
      resultMsg: z.string(),
    }),
    body: z.object({
      items: z.object({
        item: z.union([
          z.array(z.record(z.any())),
          z.record(z.any()),
        ]).optional(),
      }).optional(),
      numOfRows: z.number().optional(),
      pageNo: z.number().optional(),
      totalCount: z.number().optional(),
    }),
  }),
})

export type TourApiResponse = z.infer<typeof TourApiResponseSchema>

// Tour API 관광지 아이템 스키마
export const TourApiItemSchema = z.object({
  contentid: z.string(),
  contenttypeid: z.string(),
  title: z.string(),
  addr1: z.string().optional(),
  addr2: z.string().optional(),
  areacode: z.string().optional(),
  sigungucode: z.string().optional(),
  mapx: z.string().optional(),
  mapy: z.string().optional(),
  tel: z.string().optional(),
  firstimage: z.string().optional(),
  firstimage2: z.string().optional(),
  homepage: z.string().optional(),
  zipcode: z.string().optional(),
  overview: z.string().optional(),
  cat1: z.string().optional(),
  cat2: z.string().optional(),
  cat3: z.string().optional(),
  mlevel: z.string().optional(),
  createdtime: z.string().optional(),
  modifiedtime: z.string().optional(),
  // 상세 정보 API에서 추가되는 필드들
  usetime: z.string().optional(),
  restdate: z.string().optional(),
  expguide: z.string().optional(),
  parking: z.string().optional(),
  infocenter: z.string().optional(),
})

export type TourApiItem = z.infer<typeof TourApiItemSchema>

// Supabase places 테이블에 저장할 데이터 타입
export interface PlaceInsertData {
  tour_content_id: string
  tour_content_type_id: number
  name: string
  lat: number
  lng: number
  type: "CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC"
  rating: number
  price_level: number
  description: string | null
  image_url: string | null
  image_url2: string | null
  address: string | null
  phone: string | null
  opening_hours: string | null
  homepage: string | null
  zipcode: string | null
  overview: string | null
  area_code: number | null
  sigungu_code: number | null
  category1: string | null
  category2: string | null
  category3: string | null
  map_level: number | null
  created_time: string | null
  modified_time: string | null
  course_type?: ("date" | "travel")[] // 코스 타입 (데이트/여행)
}

