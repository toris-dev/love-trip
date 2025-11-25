#!/usr/bin/env node

/**
 * Tour API 및 Supabase 저장 테스트 스크립트
 * API 키가 올바른지 확인하고 Supabase에 저장되는지 테스트
 */

import { config } from "./config.js"
import { transformTourItemToPlace, upsertPlace, supabase } from "./lib/supabase-client.js"

// 환경 변수 로드 확인
console.log("🔍 환경 변수 로드 확인:")
console.log(`   SUPABASE_URL: ${process.env.SUPABASE_URL ? "✅ 설정됨" : "❌ 없음"}`)
console.log(
  `   NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ 설정됨" : "❌ 없음"}`
)
console.log(
  `   SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ 설정됨" : "❌ 없음"}`
)
console.log("")

async function testTourAPI() {
  console.log("🧪 Tour API 테스트 시작...\n")

  // API 키 확인
  console.log(`📋 API 키 길이: ${config.TOUR_API_KEY.length}`)
  console.log(`📋 API 키 시작: ${config.TOUR_API_KEY.substring(0, 20)}...`)
  console.log(`📋 API 키 인코딩 여부: ${config.TOUR_API_KEY.includes("%") ? "Yes" : "No"}\n`)

  // 공공데이터포털 Tour API 요청 형식
  // serviceKey는 그대로 사용 (인코딩 불필요)
  const queryParts: string[] = []

  queryParts.push(`serviceKey=${config.TOUR_API_KEY}`)
  queryParts.push(`numOfRows=3`) // 테스트용으로 3개만
  queryParts.push(`pageNo=1`)
  queryParts.push(`MobileOS=ETC`)
  queryParts.push(`MobileApp=LoveTrip`)
  queryParts.push(`_type=json`)
  queryParts.push(`areaCode=1`) // 서울
  queryParts.push(`contentTypeId=12`) // 관광지

  // KorService2는 areaBasedList2 사용
  const url = `${config.TOUR_API_BASE_URL}/areaBasedList2?${queryParts.join("&")}`

  console.log(`🔗 요청 URL (serviceKey 마스킹):`)
  console.log(url.replace(/serviceKey=[^&]+/, "serviceKey=***"))
  console.log("\n⏳ API 요청 중...\n")

  try {
    const response = await fetch(url)
    const responseText = await response.text()

    console.log(`📥 HTTP 상태 코드: ${response.status}`)
    console.log(`📥 응답 본문 (처음 500자):`)
    console.log(responseText.substring(0, 500))
    console.log("\n")

    if (response.ok) {
      try {
        const data = JSON.parse(responseText)
        if (data?.response?.header?.resultCode === "0000") {
          console.log("✅ API 요청 성공!")
          const items = data?.response?.body?.items?.item
          const itemArray = Array.isArray(items) ? items : items ? [items] : []
          console.log(`📊 조회된 항목 수: ${itemArray.length}`)

          if (itemArray.length > 0) {
            console.log(`\n📌 첫 번째 항목:`)
            console.log(JSON.stringify(itemArray[0], null, 2))

            // Supabase 저장 테스트
            console.log("\n" + "=".repeat(60))
            console.log("🧪 Supabase 저장 테스트 시작...\n")

            await testSupabaseSave(itemArray)
          }
        } else {
          console.log("❌ API 에러:")
          console.log(`   코드: ${data?.response?.header?.resultCode}`)
          console.log(`   메시지: ${data?.response?.header?.resultMsg}`)
        }
      } catch (e) {
        console.log("❌ JSON 파싱 실패")
        console.log(`   응답이 JSON 형식이 아닙니다: ${responseText}`)
      }
    } else {
      console.log(`❌ HTTP 에러: ${response.status}`)
      console.log(`   응답: ${responseText}`)
    }
  } catch (error: any) {
    console.log("❌ 요청 실패:")
    console.error(error.message)
  }
}

async function testSupabaseSave(items: any[]) {
  try {
    // 환경 변수 확인
    console.log("📋 환경 변수 확인...")
    console.log(
      `   SUPABASE_URL: ${config.SUPABASE_URL ? config.SUPABASE_URL.substring(0, 30) + "..." : "❌ 없음"}`
    )
    console.log(
      `   SUPABASE_SERVICE_ROLE_KEY: ${config.SUPABASE_SERVICE_ROLE_KEY ? config.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + "..." : "❌ 없음"}`
    )

    if (!config.SUPABASE_URL || !config.SUPABASE_SERVICE_ROLE_KEY) {
      console.log("\n❌ Supabase 환경 변수가 설정되지 않았습니다!")
      console.log("   .env.local 파일에 다음 변수를 설정하세요:")
      console.log("   SUPABASE_URL=your_supabase_url")
      console.log("   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key")
      return
    }

    console.log("\n📋 Supabase 연결 테스트...")
    console.log(`   URL: ${config.SUPABASE_URL}`)

    // 간단한 연결 테스트 (health check)
    const { data: testData, error: testError } = await supabase.from("places").select("id").limit(1)

    if (testError) {
      console.log(`❌ Supabase 연결 실패:`)
      console.log(`   메시지: ${testError.message}`)
      console.log(`   코드: ${testError.code || "없음"}`)
      console.log(`   상세: ${JSON.stringify(testError, null, 2)}`)

      // 네트워크 오류인지 확인
      if (testError.message?.includes("fetch failed")) {
        console.log("\n💡 네트워크 연결 문제일 수 있습니다:")
        console.log("   1. 인터넷 연결을 확인하세요")
        console.log("   2. Supabase URL이 올바른지 확인하세요")
        console.log(`      현재 URL: ${config.SUPABASE_URL}`)
        console.log("   3. 방화벽이나 프록시 설정을 확인하세요")
        console.log("   4. Supabase 프로젝트가 활성화되어 있는지 확인하세요")
        console.log("   5. WSL 환경에서는 네트워크 설정을 확인하세요")

        // 추가 진단 정보
        console.log("\n🔍 추가 진단 정보:")
        try {
          const testUrl = new URL(config.SUPABASE_URL)
          console.log(`   - 호스트: ${testUrl.hostname}`)
          console.log(`   - 프로토콜: ${testUrl.protocol}`)
          console.log(`   - 포트: ${testUrl.port || "기본"}`)
        } catch (e) {
          console.log(`   - URL 파싱 실패: ${config.SUPABASE_URL}`)
        }
      }
      return
    }

    console.log("✅ Supabase 연결 성공!")
    console.log(`   테스트 쿼리 결과: ${testData ? "데이터 조회 성공" : "테이블 비어있음"}\n`)

    // 첫 번째 항목만 테스트 저장
    const testItem = items[0]
    console.log(`📝 테스트 저장할 항목:`)
    console.log(`   - ID: ${testItem.contentid}`)
    console.log(`   - 이름: ${testItem.title}`)
    console.log(`   - 타입: ${testItem.contenttypeid}`)
    console.log("\n⏳ 데이터 변환 중...")

    // Tour API 데이터를 PlaceInsertData로 변환
    const placeData = transformTourItemToPlace(testItem)

    console.log("✅ 데이터 변환 완료!")
    console.log(`\n📦 변환된 데이터 (일부):`)
    console.log(`   - tour_content_id: ${placeData.tour_content_id}`)
    console.log(`   - name: ${placeData.name}`)
    console.log(`   - lat: ${placeData.lat}, lng: ${placeData.lng}`)
    console.log(`   - type: ${placeData.type}`)
    console.log(`   - address: ${placeData.address || "없음"}`)
    console.log(`   - course_type: ${placeData.course_type?.join(", ") || "없음"}`)

    console.log("\n⏳ Supabase에 저장 중...")
    const startTime = Date.now()

    const result = await upsertPlace(placeData)

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)

    if (result.isNew) {
      console.log(`\n✅ 저장 성공! (새로 삽입됨)`)
      console.log(`   - ID: ${result.id}`)
      console.log(`   - 소요 시간: ${duration}초`)
    } else {
      console.log(`\n✅ 저장 성공! (기존 데이터 업데이트됨)`)
      console.log(`   - ID: ${result.id}`)
      console.log(`   - 소요 시간: ${duration}초`)
    }

    // 저장된 데이터 확인
    console.log("\n🔍 저장된 데이터 확인 중...")
    const { data: savedData, error: fetchError } = await supabase
      .from("places")
      .select("*")
      .eq("tour_content_id", placeData.tour_content_id)
      .single()

    if (fetchError) {
      console.log(`⚠️ 저장된 데이터 조회 실패: ${fetchError.message}`)
    } else {
      console.log("✅ 저장된 데이터 확인 완료!")
      console.log(`\n📊 저장된 데이터:`)
      console.log(`   - ID: ${savedData.id}`)
      console.log(`   - 이름: ${savedData.name}`)
      console.log(`   - 주소: ${savedData.address || "없음"}`)
      console.log(`   - 좌표: (${savedData.lat}, ${savedData.lng})`)
      console.log(`   - 타입: ${savedData.type}`)
      console.log(`   - 생성 시간: ${savedData.created_at || "없음"}`)
    }

    // 여러 항목 배치 테스트 (선택사항)
    if (items.length > 1) {
      console.log("\n" + "=".repeat(60))
      console.log("🧪 배치 저장 테스트 (선택사항)...\n")
      console.log(`📦 ${items.length}개 항목을 배치로 저장 테스트할까요? (현재는 스킵)`)
      console.log("   배치 저장 테스트를 원하면 sync-date-travel-places.ts를 실행하세요.")
    }

    console.log("\n" + "=".repeat(60))
    console.log("✅ 모든 테스트 완료!")
  } catch (error: any) {
    console.log("\n❌ Supabase 저장 테스트 실패:")
    console.error(error.message)
    if (error.stack) {
      console.error("\n스택 트레이스:")
      console.error(error.stack)
    }
  }
}

testTourAPI().catch(console.error)
