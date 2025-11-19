import { config } from "../config.js"
import { TourApiResponseSchema, TourApiItemSchema, type TourApiItem } from "../types/tour-api.js"

export class TourApiClient {
  private baseUrl: string
  private apiKey: string
  private delayMs: number

  constructor() {
    this.baseUrl = config.TOUR_API_BASE_URL
    this.apiKey = config.TOUR_API_KEY
    this.delayMs = config.DELAY_MS
  }

  /**
   * API 호출 간 딜레이
   */
  private async delay(ms: number = this.delayMs): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * 관광지 목록 조회
   */
  async getAreaBasedList(params: {
    areaCode?: number
    sigunguCode?: number
    contentTypeId?: number
    numOfRows?: number
    pageNo?: number
  }): Promise<TourApiItem[]> {
    // 공공데이터포털 Tour API 요청 형식
    // serviceKey는 그대로 사용 (인코딩 불필요)
    
    // 파라미터 구성
    const queryParts: string[] = []
    
    // serviceKey를 첫 번째로 추가 (원본 그대로 사용)
    queryParts.push(`serviceKey=${this.apiKey}`)
    
    // 필수 파라미터
    queryParts.push(`numOfRows=${params.numOfRows || 100}`)
    queryParts.push(`pageNo=${params.pageNo || 1}`)
    queryParts.push(`MobileOS=ETC`)
    queryParts.push(`MobileApp=LoveTrip`)
    queryParts.push(`_type=json`)
    
    // 선택 파라미터
    if (params.areaCode) {
      queryParts.push(`areaCode=${params.areaCode}`)
    }
    if (params.sigunguCode) {
      queryParts.push(`sigunguCode=${params.sigunguCode}`)
    }
    if (params.contentTypeId) {
      queryParts.push(`contentTypeId=${params.contentTypeId}`)
    }
    
    // URL 구성
    const url = `${this.baseUrl}/areaBasedList1?${queryParts.join('&')}`
    
    // 디버깅: URL 확인 (serviceKey는 마스킹)
    const debugUrl = url.replace(/serviceKey=[^&]+/, "serviceKey=***")
    console.log(`🔍 Request URL: ${debugUrl}`)

    try {
      const response = await fetch(url)
      
      // 응답 본문을 한 번만 읽기 (body는 한 번만 읽을 수 있음)
      let data: any
      const responseText = await response.text()
      
      // 응답 상태와 본문 로깅
      console.log(`📥 Response status: ${response.status}`)
      console.log(`📥 Response preview: ${responseText.substring(0, 200)}`)
      
      try {
        data = JSON.parse(responseText)
      } catch (jsonError) {
        console.error(`❌ JSON parse error:`, jsonError)
        console.error(`❌ Full response: ${responseText}`)
        throw new Error(
          `HTTP ${response.status} error. Invalid JSON response: ${responseText.substring(0, 1000)}`
        )
      }

      // API 에러 응답 확인 (resultCode가 있는 경우)
      if (data?.response?.header) {
        const resultCode = data.response.header.resultCode
        const resultMsg = data.response.header.resultMsg
        
        if (resultCode !== "0000") {
          // API 에러 코드별 상세 메시지
          const errorMessages: Record<string, string> = {
            "0001": "필수 파라미터 누락",
            "0002": "파라미터 형식 오류",
            "0003": "인증키 오류 (API 키가 유효하지 않음)",
            "0004": "서비스 오류",
            "0005": "일일 트래픽 초과",
            "0006": "월간 트래픽 초과",
          }
          
          const errorMsg = errorMessages[resultCode] || resultMsg || "Unknown error"
          throw new Error(
            `API Error [${resultCode}]: ${errorMsg}${resultMsg ? ` (${resultMsg})` : ""}`
          )
        }
      }

      if (!response.ok) {
        // HTTP 에러인 경우 응답 본문 확인
        const errorMsg = typeof data === 'object' && data !== null 
          ? JSON.stringify(data).substring(0, 500)
          : responseText.substring(0, 500)
        throw new Error(
          `HTTP ${response.status} error. Response: ${errorMsg}`
        )
      }

      const parsed = TourApiResponseSchema.parse(data)

      const items = parsed.response.body.items?.item
      if (!items) {
        return []
      }

      // item이 배열인지 단일 객체인지 확인
      const itemArray = Array.isArray(items) ? items : [items]

      return itemArray
        .map((item) => {
          try {
            return TourApiItemSchema.parse(item)
          } catch (error) {
            console.warn("Failed to parse item:", item, error)
            return null
          }
        })
        .filter((item): item is TourApiItem => item !== null)
    } catch (error) {
      console.error("Tour API request failed:", error)
      throw error
    } finally {
      await this.delay()
    }
  }

  /**
   * 관광지 상세 정보 조회
   */
  async getDetailInfo(contentId: string, contentTypeId: number): Promise<TourApiItem | null> {
    // 공공데이터포털 Tour API 요청 형식
    const queryParts: string[] = []
    
    // serviceKey를 첫 번째로 추가 (원본 그대로 사용)
    queryParts.push(`serviceKey=${this.apiKey}`)
    
    // 필수 파라미터
    queryParts.push(`contentId=${contentId}`)
    queryParts.push(`contentTypeId=${contentTypeId}`)
    queryParts.push(`MobileOS=ETC`)
    queryParts.push(`MobileApp=LoveTrip`)
    queryParts.push(`_type=json`)
    
    const url = `${this.baseUrl}/detailInfo1?${queryParts.join('&')}`

    try {
      const response = await fetch(url)
      
      // 응답 본문을 한 번만 읽기 (body는 한 번만 읽을 수 있음)
      let data: any
      const responseText = await response.text()
      
      try {
        data = JSON.parse(responseText)
      } catch (jsonError) {
        throw new Error(
          `HTTP ${response.status} error. Invalid JSON response: ${responseText.substring(0, 500)}`
        )
      }

      if (data?.response?.header) {
        const resultCode = data.response.header.resultCode
        if (resultCode !== "0000") {
          throw new Error(
            `API Error: ${resultCode} - ${data.response.header.resultMsg || "Unknown error"}`
          )
        }
      }

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status}. Response: ${JSON.stringify(data).substring(0, 500)}`
        )
      }

      const parsed = TourApiResponseSchema.parse(data)

      const items = parsed.response.body.items?.item
      if (!items) {
        return null
      }

      const itemArray = Array.isArray(items) ? items : [items]
      const item = itemArray[0]

      if (!item) {
        return null
      }

      return TourApiItemSchema.parse(item)
    } catch (error) {
      console.error(`Failed to get detail info for ${contentId}:`, error)
      return null
    } finally {
      await this.delay()
    }
  }

  /**
   * 모든 페이지를 순회하며 데이터 수집
   */
  async getAllPages(params: {
    areaCode?: number
    sigunguCode?: number
    contentTypeId?: number
    maxPages?: number
  }): Promise<TourApiItem[]> {
    const allItems: TourApiItem[] = []
    let pageNo = 1
    let hasMore = true
    const maxPages = params.maxPages || 100

    while (hasMore && pageNo <= maxPages) {
      try {
        const items = await this.getAreaBasedList({
          ...params,
          pageNo,
          numOfRows: 100,
        })

        if (items.length === 0) {
          hasMore = false
        } else {
          allItems.push(...items)
          pageNo++
          console.log(`Fetched page ${pageNo - 1}: ${items.length} items (total: ${allItems.length})`)
        }
      } catch (error) {
        console.error(`Error fetching page ${pageNo}:`, error)
        hasMore = false
      }
    }

    return allItems
  }
}

