#!/usr/bin/env node

/**
 * Tour API 테스트 스크립트
 * API 키가 올바른지 확인하기 위한 간단한 테스트
 */

import { config } from "./config.js"

async function testTourAPI() {
  console.log("🧪 Tour API 테스트 시작...\n")
  
  // API 키 확인
  console.log(`📋 API 키 길이: ${config.TOUR_API_KEY.length}`)
  console.log(`📋 API 키 시작: ${config.TOUR_API_KEY.substring(0, 20)}...`)
  console.log(`📋 API 키 인코딩 여부: ${config.TOUR_API_KEY.includes('%') ? 'Yes' : 'No'}\n`)
  
  // 공공데이터포털 Tour API 요청 형식
  // serviceKey는 그대로 사용 (인코딩 불필요)
  const queryParts: string[] = []
  
  queryParts.push(`serviceKey=${config.TOUR_API_KEY}`)
  queryParts.push(`numOfRows=5`)
  queryParts.push(`pageNo=1`)
  queryParts.push(`MobileOS=ETC`)
  queryParts.push(`MobileApp=LoveTrip`)
  queryParts.push(`_type=json`)
  queryParts.push(`areaCode=1`)
  queryParts.push(`contentTypeId=12`)
  
  const url = `${config.TOUR_API_BASE_URL}/areaBasedList1?${queryParts.join('&')}`
  
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
          const itemArray = Array.isArray(items) ? items : (items ? [items] : [])
          console.log(`📊 조회된 항목 수: ${itemArray.length}`)
          if (itemArray.length > 0) {
            console.log(`\n📌 첫 번째 항목:`)
            console.log(JSON.stringify(itemArray[0], null, 2))
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

testTourAPI().catch(console.error)

