/**
 * 데이트 코스 생성 스크립트
 * Supabase DB의 places 데이터를 기반으로 거리 계산을 통해 데이트 코스를 생성합니다.
 */

import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dyomownljgsbwaxnljau.supabase.co"
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

if (!SUPABASE_SERVICE_KEY) {
  console.error("SUPABASE_SERVICE_ROLE_KEY 환경 변수가 필요합니다.")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// 지역 코드 매핑
const AREA_CODE_MAP: Record<number, string> = {
  1: "서울",
  2: "인천",
  3: "대전",
  4: "대구",
  5: "광주",
  6: "부산",
  7: "울산",
  8: "세종",
  31: "경기",
  32: "강원",
  33: "충북",
  34: "충남",
  35: "경북",
  36: "경남",
  37: "전북",
  38: "전남",
  39: "제주",
}

/**
 * 두 지점 간의 거리를 계산 (Haversine 공식)
 * @returns 거리 (km)
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // 지구 반경 (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * 데이트 코스에 적합한 장소 필터링
 */
function filterDatePlaces(places: any[]): any[] {
  return places.filter((place) => {
    // course_type에 'date'가 포함되어 있거나
    // CAFE, FOOD 타입이거나
    // MUSEUM 타입이면서 평점이 4.0 이상인 경우
    return (
      (place.course_type && place.course_type.includes("date")) ||
      place.type === "CAFE" ||
      place.type === "FOOD" ||
      (place.type === "MUSEUM" && parseFloat(place.rating || "0") >= 4.0)
    )
  })
}

/**
 * 거리 기반으로 최적의 코스 경로 생성 (Nearest Neighbor 알고리즘)
 */
function createOptimalRoute(places: any[], maxDistance: number = 5): any[] {
  if (places.length === 0) return []

  const route: any[] = []
  const visited = new Set<string>()
  let currentPlace = places[0] // 시작점

  route.push(currentPlace)
  visited.add(currentPlace.id)

  while (route.length < places.length) {
    let nearestPlace: any = null
    let nearestDistance = Infinity

    for (const place of places) {
      if (visited.has(place.id)) continue

      const distance = calculateDistance(
        parseFloat(currentPlace.lat),
        parseFloat(currentPlace.lng),
        parseFloat(place.lat),
        parseFloat(place.lng)
      )

      if (distance < nearestDistance && distance <= maxDistance) {
        nearestDistance = distance
        nearestPlace = place
      }
    }

    if (!nearestPlace) {
      // 더 이상 가까운 장소가 없으면 종료
      break
    }

    route.push(nearestPlace)
    visited.add(nearestPlace.id)
    currentPlace = nearestPlace
  }

  return route
}

/**
 * 지역별 데이트 코스 생성
 */
async function generateDateCourses() {
  console.log("데이트 코스 생성 시작...")

  // 지역별로 places 조회
  const { data: placesData, error: placesError } = await supabase
    .from("places")
    .select("id, name, lat, lng, type, rating, price_level, address, area_code, sigungu_code, course_type, image_url")
    .not("lat", "is", null)
    .not("lng", "is", null)
    .order("area_code")
    .order("sigungu_code")
    .order("rating", { ascending: false, nullsFirst: false })

  if (placesError) {
    console.error("Places 조회 오류:", placesError)
    return
  }

  if (!placesData || placesData.length === 0) {
    console.error("Places 데이터가 없습니다.")
    return
  }

  console.log(`총 ${placesData.length}개의 장소를 조회했습니다.`)

  // 데이트 코스에 적합한 장소 필터링
  const datePlaces = filterDatePlaces(placesData)
  console.log(`데이트 코스에 적합한 장소: ${datePlaces.length}개`)

  // 지역별로 그룹화
  const placesByRegion: Record<string, any[]> = {}

  for (const place of datePlaces) {
    const region = AREA_CODE_MAP[place.area_code] || "기타"
    if (!placesByRegion[region]) {
      placesByRegion[region] = []
    }
    placesByRegion[region].push(place)
  }

  console.log(`\n지역별 장소 수:`)
  for (const [region, places] of Object.entries(placesByRegion)) {
    console.log(`  ${region}: ${places.length}개`)
  }

  // 지역별로 코스 생성
  const courses: any[] = []

  for (const [region, places] of Object.entries(placesByRegion)) {
    if (places.length < 3) {
      console.log(`\n${region}: 장소가 너무 적어 코스를 생성하지 않습니다. (${places.length}개)`)
      continue
    }

    // 시군구별로 세분화하여 코스 생성
    const placesBySigungu: Record<number, any[]> = {}
    for (const place of places) {
      const sigungu = place.sigungu_code || 0
      if (!placesBySigungu[sigungu]) {
        placesBySigungu[sigungu] = []
      }
      placesBySigungu[sigungu].push(place)
    }

    for (const [sigungu, sigunguPlaces] of Object.entries(placesBySigungu)) {
      if (sigunguPlaces.length < 3) continue

      // 거리 기반으로 최적 경로 생성
      const route = createOptimalRoute(sigunguPlaces, 5) // 최대 5km 이내

      if (route.length >= 3) {
        // 코스 제목 생성
        const courseTitle = `${region} 데이트 코스 ${courses.filter((c) => c.region === region).length + 1}`

        courses.push({
          title: courseTitle,
          region,
          course_type: "date",
          description: `${region}의 다양한 데이트 장소를 포함한 코스입니다. 카페, 맛집, 문화시설 등이 포함되어 있습니다.`,
          image_url: route[0]?.image_url || null,
          place_count: route.length,
          area_code: places[0].area_code,
          sigungu_code: parseInt(sigungu),
          places: route,
        })

        console.log(`\n✓ ${courseTitle} 생성 완료 (${route.length}개 장소)`)
      }
    }
  }

  console.log(`\n총 ${courses.length}개의 데이트 코스를 생성했습니다.`)

  // DB에 저장
  console.log("\nDB에 저장 중...")

  for (const course of courses) {
    try {
      // 코스 생성
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .insert({
          title: course.title,
          region: course.region,
          course_type: course.course_type,
          description: course.description,
          image_url: course.image_url,
          place_count: course.place_count,
          area_code: course.area_code,
          sigungu_code: course.sigungu_code,
        })
        .select()
        .single()

      if (courseError) {
        console.error(`코스 생성 오류 (${course.title}):`, courseError)
        continue
      }

      // 코스에 장소 연결
      const coursePlaces = course.places.map((place: any, index: number) => ({
        course_id: courseData.id,
        place_id: place.id,
        order_index: index,
      }))

      const { error: coursePlacesError } = await supabase.from("course_places").insert(coursePlaces)

      if (coursePlacesError) {
        console.error(`코스 장소 연결 오류 (${course.title}):`, coursePlacesError)
        // 코스는 생성되었지만 장소 연결 실패 시 코스 삭제
        await supabase.from("courses").delete().eq("id", courseData.id)
        continue
      }

      console.log(`✓ ${course.title} 저장 완료`)
    } catch (error) {
      console.error(`코스 저장 중 오류 (${course.title}):`, error)
    }
  }

  console.log("\n데이트 코스 생성 완료!")
}

// 스크립트 실행
generateDateCourses()
  .then(() => {
    console.log("작업 완료")
    process.exit(0)
  })
  .catch((error) => {
    console.error("오류 발생:", error)
    process.exit(1)
  })

