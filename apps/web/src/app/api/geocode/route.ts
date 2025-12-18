import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/geocode
 * 네이버 클라우드 플랫폼 Geocoding API를 사용하여 주소/장소 검색
 * 참고: https://api.ncloud-docs.com/docs/ko/application-maps-geocoding
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("query")

  if (!query || query.trim().length < 2) {
    return NextResponse.json(
      { error: "query parameter is required (min 2 characters)" },
      { status: 400 }
    )
  }

  // 1. 네이버 Places API (검색 API) 인증 정보 - 네이버 개발자 센터에서 발급
  // .env.local의 NEXT_PUBLIC_NAVER_CLOUD_API_KEY_ID를 fallback으로 사용
  const placesClientId = process.env.NEXT_PUBLIC_NAVER_DEV_CLIENT_ID
  const placesClientSecret = process.env.NEXT_PUBLIC_NAVER_DEV_CLIENT_SECRET

  // 2. 네이버 클라우드 플랫폼 Geocoding API 인증 정보 - 네이버 클라우드 플랫폼에서 발급
  // .env.local의 NEXT_PUBLIC_NAVER_CLOUD_API_KEY_ID와 NEXT_PUBLIC_NAVER_CLOUD_API_KEY 사용
  const geocodeApiKeyId = process.env.NEXT_PUBLIC_NAVER_CLOUD_API_KEY_ID
  const geocodeApiKey = process.env.NEXT_PUBLIC_NAVER_CLOUD_API_KEY

  // 최소한 하나의 API 인증 정보는 필요함
  const hasPlacesApi = placesClientId && placesClientSecret
  const hasGeocodeApi = geocodeApiKeyId && geocodeApiKey

  if (!hasPlacesApi && !hasGeocodeApi) {
    return NextResponse.json(
      {
        error:
          "Naver API credentials are not configured. Please set either Places API or Geocoding API credentials.",
      },
      { status: 500 }
    )
  }

  try {
    const allLocations: Location[] = []

    // 1. 네이버 Places API (Local Search) - 장소명 검색에 적합
    if (hasPlacesApi) {
      try {
        const placesResponse = await fetch(
          `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=10&sort=sim`,
          {
            headers: {
              "X-Naver-Client-Id": placesClientId!,
              "X-Naver-Client-Secret": placesClientSecret!,
            },
          }
        )

        if (placesResponse.ok) {
          const placesData = await placesResponse.json()

          if (placesData.items && placesData.items.length > 0) {
            const placesLocations = placesData.items
              .map(
                (item: {
                  title?: string
                  address?: string
                  roadAddress?: string
                  mapy?: number | string
                  mapx?: number | string
                }) => {
                  // HTML 태그 제거
                  const cleanTitle = item.title?.replace(/<[^>]*>/g, "") || ""
                  const address = item.address || item.roadAddress || ""

                  // 좌표 변환 (네이버 Places API는 좌표를 10000000으로 나눠야 함)
                  const lat = item.mapy ? parseFloat(String(item.mapy)) / 10000000 : 0
                  const lng = item.mapx ? parseFloat(String(item.mapx)) / 10000000 : 0

                  return {
                    address: address || cleanTitle,
                    lat,
                    lng,
                    name: cleanTitle,
                  }
                }
              )
              .filter((loc: Location) => loc.lat !== 0 && loc.lng !== 0)

            allLocations.push(...placesLocations)
            console.log(`Found ${placesLocations.length} places from Places API`)
          } else {
            console.log("Places API returned no items")
          }
        } else {
          const errorText = await placesResponse.text()
          console.error("Places API error:", placesResponse.status, errorText)
        }
      } catch (placesError) {
        console.error("Places API exception:", placesError)
      }
    }

    // 2. 네이버 클라우드 플랫폼 Geocoding API - 주소 검색에 적합
    // Places API에서 결과가 없거나 충분하지 않을 때 사용
    if (allLocations.length === 0 && hasGeocodeApi) {
      try {
        const geocodeResponse = await fetch(
          `https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(query)}&count=10`,
          {
            headers: {
              "x-ncp-apigw-api-key-id": geocodeApiKeyId!,
              "x-ncp-apigw-api-key": geocodeApiKey!,
              Accept: "application/json",
            },
          }
        )

        if (geocodeResponse.ok) {
          const geocodeData = await geocodeResponse.json()
          if (
            geocodeData.status === "OK" &&
            geocodeData.addresses &&
            geocodeData.addresses.length > 0
          ) {
            const geocodeLocations = geocodeData.addresses
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
                  // 도로명 주소 우선, 없으면 지번 주소 사용
                  const address = item.roadAddress || item.jibunAddress || ""
                  const lat = item.y ? parseFloat(item.y) : 0
                  const lng = item.x ? parseFloat(item.x) : 0

                  // 주소 구성 요소에서 건물명 추출
                  const buildingName =
                    item.addressElements?.find(el => el.types?.includes("BUILDING_NAME"))
                      ?.longName || ""

                  // 장소명은 건물명이 있으면 건물명, 없으면 주소
                  const name = buildingName || address

                  return {
                    address: address,
                    lat,
                    lng,
                    name: name,
                  }
                }
              )
              .filter((loc: Location) => loc.lat !== 0 && loc.lng !== 0)

            // 중복 제거 (같은 좌표나 이름이 있는 경우)
            const uniqueGeocodeLocations = geocodeLocations.filter(
              (geocodeLoc: Location) =>
                !allLocations.some(
                  existingLoc =>
                    (Math.abs(existingLoc.lat - geocodeLoc.lat) < 0.0001 &&
                      Math.abs(existingLoc.lng - geocodeLoc.lng) < 0.0001) ||
                    existingLoc.name === geocodeLoc.name
                )
            )

            allLocations.push(...uniqueGeocodeLocations)
          }
        }
      } catch (geocodeError) {
        console.warn("Geocoding API error:", geocodeError)
      }
    }

    // 결과 반환 (최대 10개)
    return NextResponse.json({ locations: allLocations.slice(0, 10) })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ locations: [] })
  }
}

interface Location {
  address: string
  lat: number
  lng: number
  name?: string
}
