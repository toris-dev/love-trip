/**
 * Naver API Client
 * 네이버 Places API 및 Geocoding API 클라이언트
 */

export interface NaverPlace {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  type?: string
  tel?: string
  category?: string
  link?: string
}

class NaverAPIClient {
  private placesClientId?: string
  private placesClientSecret?: string
  private geocodeApiKeyId?: string
  private geocodeApiKey?: string

  constructor() {
    this.placesClientId = process.env.NEXT_PUBLIC_NAVER_DEV_CLIENT_ID
    this.placesClientSecret = process.env.NEXT_PUBLIC_NAVER_DEV_CLIENT_SECRET
    this.geocodeApiKeyId = process.env.NEXT_PUBLIC_NAVER_CLOUD_API_KEY_ID
    this.geocodeApiKey = process.env.NEXT_PUBLIC_NAVER_CLOUD_API_KEY
  }

  /**
   * 네이버 Places API로 장소 검색
   */
  async searchPlaces(query: string, limit: number = 10): Promise<NaverPlace[]> {
    if (!this.placesClientId || !this.placesClientSecret) {
      console.warn("Naver Places API credentials are not configured")
      return []
    }

    try {
      const response = await fetch(
        `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=${limit}&sort=sim`,
        {
          headers: {
            "X-Naver-Client-Id": this.placesClientId,
            "X-Naver-Client-Secret": this.placesClientSecret,
          },
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Naver Places API error:", response.status, errorText)
        return []
      }

      const data = await response.json()

      if (!data.items || data.items.length === 0) {
        return []
      }

      return data.items
        .map(
          (item: {
            title?: string
            address?: string
            roadAddress?: string
            mapy?: number | string
            mapx?: number | string
            telephone?: string
            category?: string
            link?: string
          }) => {
            const cleanTitle = item.title?.replace(/<[^>]*>/g, "") || ""
            const address = item.address || item.roadAddress || ""

            // 네이버 Places API 좌표 변환 (10000000으로 나눔)
            const lat = item.mapy ? parseFloat(String(item.mapy)) / 10000000 : 0
            const lng = item.mapx ? parseFloat(String(item.mapx)) / 10000000 : 0

            if (lat === 0 || lng === 0) {
              return null
            }

            return {
              id: `naver_${cleanTitle}_${lat}_${lng}`,
              name: cleanTitle,
              address: address || cleanTitle,
              lat,
              lng,
              tel: item.telephone?.replace(/<[^>]*>/g, ""),
              category: item.category?.replace(/<[^>]*>/g, ""),
              link: item.link,
            }
          }
        )
        .filter((place: NaverPlace | null): place is NaverPlace => place !== null)
    } catch (error) {
      console.error("Naver Places API exception:", error)
      return []
    }
  }

  /**
   * 네이버 Geocoding API로 주소 검색
   */
  async geocode(query: string, limit: number = 10): Promise<NaverPlace[]> {
    if (!this.geocodeApiKeyId || !this.geocodeApiKey) {
      console.warn("Naver Geocoding API credentials are not configured")
      return []
    }

    try {
      const response = await fetch(
        `https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(query)}&count=${limit}`,
        {
          headers: {
            "x-ncp-apigw-api-key-id": this.geocodeApiKeyId,
            "x-ncp-apigw-api-key": this.geocodeApiKey,
            Accept: "application/json",
          },
        }
      )

      if (!response.ok) {
        return []
      }

      const data = await response.json()

      if (data.status !== "OK" || !data.addresses || data.addresses.length === 0) {
        return []
      }

      return data.addresses
        .map(
          (item: {
            roadAddress?: string
            jibunAddress?: string
            x?: string
            y?: string
            addressElements?: Array<{
              types?: string[]
              longName?: string
            }>
          }) => {
            const address = item.roadAddress || item.jibunAddress || ""
            const lat = item.y ? parseFloat(item.y) : 0
            const lng = item.x ? parseFloat(item.x) : 0

            if (lat === 0 || lng === 0) {
              return null
            }

            const buildingName =
              item.addressElements?.find(el => el.types?.includes("BUILDING_NAME"))?.longName || ""

            return {
              id: `naver_geocode_${lat}_${lng}`,
              name: buildingName || address,
              address: address,
              lat,
              lng,
            }
          }
        )
        .filter((place: NaverPlace | null): place is NaverPlace => place !== null)
    } catch (error) {
      console.error("Naver Geocoding API exception:", error)
      return []
    }
  }
}

// 싱글톤 인스턴스
export const naverAPIClient = new NaverAPIClient()
