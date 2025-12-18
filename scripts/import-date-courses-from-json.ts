/**
 * JSON 파일에서 데이트 코스 데이터를 읽어서 Supabase DB에 삽입하는 스크립트
 *
 * 사용법:
 *   pnpm tsx scripts/import-date-courses-from-json.ts <json-file-path>
 *
 * 예시:
 *   pnpm tsx scripts/import-date-courses-from-json.ts ./date-courses.json
 */

import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"
import dotenv from "dotenv"

// .env 파일 로드 (여러 경로 시도)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 루트 프로젝트의 .env.local 파일 먼저 시도
try {
  dotenv.config({ path: resolve(__dirname, "../.env.local") })
} catch {
  // 파일이 없어도 계속 진행
}

// 루트 프로젝트의 .env 파일 시도
try {
  dotenv.config({ path: resolve(__dirname, "../.env") })
} catch {
  // 파일이 없어도 계속 진행
}

// 현재 작업 디렉토리 기준으로도 시도
try {
  dotenv.config({ path: resolve(process.cwd(), ".env.local") })
} catch {
  // 파일이 없어도 계속 진행
}

// 기본 .env 파일도 시도
dotenv.config()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ 환경 변수가 필요합니다:")
  console.error("   - NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_URL")
  console.error("   - SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// JSON 파일 형식 타입 정의
interface DateCoursePlace {
  name: string
  type: "CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC"
  order_index: number
  visit_duration_minutes: number
  distance_from_previous_km: number
  notes?: string
}

interface DateCourse {
  title: string
  region: string
  course_type: "date"
  description?: string
  duration?: string
  place_count: number
  area_code: number
  sigungu_code?: number
  sigungu_name?: string
  total_distance_km?: number
  max_distance_km?: number
  places: DateCoursePlace[]
}

interface DateCoursesJson {
  date_courses: DateCourse[]
}

/**
 * 네이버 Places API로 장소 좌표 검색
 */
async function searchPlaceCoordinates(
  placeName: string,
  region?: string
): Promise<{ lat: number; lng: number; address: string | null } | null> {
  const placesClientId = process.env.NEXT_PUBLIC_NAVER_DEV_CLIENT_ID
  const placesClientSecret = process.env.NEXT_PUBLIC_NAVER_DEV_CLIENT_SECRET

  if (!placesClientId || !placesClientSecret) {
    console.warn(`   ⚠️  네이버 API 키가 없어 좌표를 가져올 수 없습니다.`)
    return null
  }

  try {
    // 지역 정보가 있으면 함께 검색
    const query = region ? `${region} ${placeName}` : placeName

    const response = await fetch(
      `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=5&sort=sim`,
      {
        headers: {
          "X-Naver-Client-Id": placesClientId,
          "X-Naver-Client-Secret": placesClientSecret,
        },
      }
    )

    if (!response.ok) {
      console.warn(`   ⚠️  네이버 API 호출 실패: ${response.status}`)
      return null
    }

    const data = await response.json()

    if (data.items && data.items.length > 0) {
      const item = data.items[0]
      const cleanTitle = item.title?.replace(/<[^>]*>/g, "") || ""
      const address = item.address || item.roadAddress || ""

      // 좌표 변환 (네이버 Places API는 좌표를 10000000으로 나눠야 함)
      const lat = item.mapy ? parseFloat(String(item.mapy)) / 10000000 : 0
      const lng = item.mapx ? parseFloat(String(item.mapx)) / 10000000 : 0

      if (lat !== 0 && lng !== 0) {
        console.log(`   ✓ 네이버 API로 좌표 검색 성공: ${cleanTitle}`)
        return { lat, lng, address: address || null }
      }
    }

    console.warn(`   ⚠️  네이버 API에서 좌표를 찾을 수 없습니다.`)
    return null
  } catch (error: any) {
    console.warn(`   ⚠️  네이버 API 호출 중 오류: ${error.message}`)
    return null
  }
}

/**
 * 네이버 API로 장소 정보 검색 (places 테이블에 저장하지 않음)
 */
async function searchPlaceInfo(
  placeName: string,
  placeType: "CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC",
  region?: string
): Promise<{
  name: string
  lat: number
  lng: number
  address: string | null
  type: "CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC"
  rating: number | null
  price_level: number | null
  image_url: string | null
  description: string | null
} | null> {
  const coordinates = await searchPlaceCoordinates(placeName, region)

  if (!coordinates) {
    console.warn(`   ⚠️  좌표를 가져올 수 없습니다: ${placeName}`)
    return null
  }

  // 네이버 Places API에서 추가 정보 가져오기 (선택사항)
  // 현재는 기본 정보만 반환 (나중에 확장 가능)
  return {
    name: placeName,
    lat: coordinates.lat,
    lng: coordinates.lng,
    address: coordinates.address,
    type: placeType,
    rating: null,
    price_level: null,
    image_url: null,
    description: null,
  }
}

/**
 * 데이트 코스를 DB에 삽입
 */
async function insertDateCourse(course: DateCourse): Promise<boolean> {
  try {
    console.log(`\n📝 코스 삽입 중: ${course.title}`)

    // 1. date_courses 테이블에 코스 삽입
    const { data: courseData, error: courseError } = await supabase
      .from("date_courses")
      .insert({
        title: course.title,
        region: course.region,
        course_type: course.course_type,
        description: course.description || null,
        duration: course.duration || "당일 코스",
        place_count: course.place_count,
        area_code: course.area_code,
        sigungu_code: course.sigungu_code || null,
        sigungu_name: course.sigungu_name || null,
        total_distance_km: course.total_distance_km || null,
        max_distance_km: course.max_distance_km || null,
      })
      .select()
      .single()

    if (courseError) {
      console.error(`❌ 코스 삽입 실패 (${course.title}):`, courseError.message)
      return false
    }

    console.log(`   ✓ 코스 생성 완료 (ID: ${courseData.id})`)

    // 2. 각 장소의 정보를 네이버 API로 검색하여 date_course_places에 직접 저장
    const coursePlaces: Array<{
      date_course_id: string
      place_id: string | null
      place_name: string | null
      place_lat: number | null
      place_lng: number | null
      place_address: string | null
      place_type: string | null
      place_rating: number | null
      place_price_level: number | null
      place_image_url: string | null
      place_description: string | null
      order_index: number
      distance_from_previous_km: number | null
      visit_duration_minutes: number | null
      notes: string | null
    }> = []

    for (const place of course.places) {
      // 네이버 API로 장소 정보 검색
      const placeInfo = await searchPlaceInfo(place.name, place.type, course.region)

      if (!placeInfo) {
        console.warn(`   ⚠️  장소 "${place.name}"의 정보를 가져올 수 없어 건너뜁니다.`)
        continue
      }

      // API 부하 방지를 위한 짧은 딜레이
      await new Promise(resolve => setTimeout(resolve, 200))

      coursePlaces.push({
        date_course_id: courseData.id,
        place_id: null, // places 테이블에 저장하지 않음
        place_name: placeInfo.name,
        place_lat: placeInfo.lat,
        place_lng: placeInfo.lng,
        place_address: placeInfo.address,
        place_type: placeInfo.type,
        place_rating: placeInfo.rating,
        place_price_level: placeInfo.price_level,
        place_image_url: placeInfo.image_url,
        place_description: placeInfo.description,
        order_index: place.order_index,
        distance_from_previous_km: place.distance_from_previous_km || null,
        visit_duration_minutes: place.visit_duration_minutes || null,
        notes: place.notes || null,
      })
    }

    if (coursePlaces.length === 0) {
      console.error(`❌ 코스에 유효한 장소가 없습니다. 코스를 삭제합니다.`)
      await supabase.from("date_courses").delete().eq("id", courseData.id)
      return false
    }

    // 3. date_course_places 테이블에 장소들 삽입
    const { error: placesError } = await supabase.from("date_course_places").insert(coursePlaces)

    if (placesError) {
      console.error(`❌ 장소 삽입 실패 (${course.title}):`, placesError.message)
      // 코스 삭제
      await supabase.from("date_courses").delete().eq("id", courseData.id)
      return false
    }

    // 4. 실제 삽입된 장소 수로 place_count 업데이트
    if (coursePlaces.length !== course.place_count) {
      await supabase
        .from("date_courses")
        .update({ place_count: coursePlaces.length })
        .eq("id", courseData.id)
    }

    console.log(`   ✓ ${coursePlaces.length}개 장소 삽입 완료`)
    return true
  } catch (error: any) {
    console.error(`❌ 코스 삽입 중 오류 (${course.title}):`, error.message)
    return false
  }
}

/**
 * 메인 함수
 */
async function main() {
  const jsonFilePath = process.argv[2]

  if (!jsonFilePath) {
    console.error("❌ 사용법: pnpm tsx scripts/import-date-courses-from-json.ts <json-file-path>")
    console.error("   예시: pnpm tsx scripts/import-date-courses-from-json.ts ./date-courses.json")
    process.exit(1)
  }

  const resolvedPath = resolve(process.cwd(), jsonFilePath)

  console.log(`📂 JSON 파일 읽기: ${resolvedPath}`)

  let jsonData: DateCoursesJson
  try {
    const fileContent = readFileSync(resolvedPath, "utf-8")
    jsonData = JSON.parse(fileContent)
  } catch (error: any) {
    console.error(`❌ JSON 파일 읽기 실패:`, error.message)
    process.exit(1)
  }

  if (!jsonData.date_courses || !Array.isArray(jsonData.date_courses)) {
    console.error("❌ JSON 형식이 올바르지 않습니다. 'date_courses' 배열이 필요합니다.")
    process.exit(1)
  }

  console.log(`\n📊 총 ${jsonData.date_courses.length}개의 데이트 코스를 발견했습니다.`)
  console.log("=".repeat(60))

  let successCount = 0
  let failCount = 0

  // 각 코스를 순차적으로 삽입
  for (let i = 0; i < jsonData.date_courses.length; i++) {
    const course = jsonData.date_courses[i]
    console.log(`\n[${i + 1}/${jsonData.date_courses.length}]`)

    const success = await insertDateCourse(course)
    if (success) {
      successCount++
    } else {
      failCount++
    }

    // API 부하 방지를 위한 짧은 딜레이
    if (i < jsonData.date_courses.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  console.log("\n" + "=".repeat(60))
  console.log(`\n✅ 완료!`)
  console.log(`   성공: ${successCount}개`)
  console.log(`   실패: ${failCount}개`)
  console.log(`   총: ${jsonData.date_courses.length}개`)
}

// 스크립트 실행
main()
  .then(() => {
    process.exit(0)
  })
  .catch(error => {
    console.error("❌ 오류 발생:", error)
    process.exit(1)
  })
