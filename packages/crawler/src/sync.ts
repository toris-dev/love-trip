#!/usr/bin/env node

import { TourApiClient } from "./lib/tour-api-client.js"
import { transformTourItemToPlace, upsertPlacesBatch } from "./lib/supabase-client.js"
import { CONTENT_TYPE_IDS, AREA_CODES } from "./config.js"

/**
 * Tour API에서 데이터를 가져와서 Supabase에 동기화
 */
export async function syncTourData() {
  console.log("🚀 Starting Tour API sync...")
  const client = new TourApiClient()

  // 동기화할 지역 및 타입 조합
  const syncTasks = [
    // 서울 관광지
    { areaCode: AREA_CODES.SEOUL, contentTypeId: CONTENT_TYPE_IDS.TOURIST_SPOT },
    // 서울 문화시설
    { areaCode: AREA_CODES.SEOUL, contentTypeId: CONTENT_TYPE_IDS.CULTURAL_FACILITY },
    // 서울 음식점
    { areaCode: AREA_CODES.SEOUL, contentTypeId: CONTENT_TYPE_IDS.RESTAURANT },
    // 경기도 관광지
    { areaCode: AREA_CODES.GYEONGGI, contentTypeId: CONTENT_TYPE_IDS.TOURIST_SPOT },
    // 제주도 관광지
    { areaCode: AREA_CODES.JEJU, contentTypeId: CONTENT_TYPE_IDS.TOURIST_SPOT },
  ]

  let totalInserted = 0
  let totalUpdated = 0
  let totalErrors = 0

  for (const task of syncTasks) {
    console.log(
      `\n📦 Syncing area ${task.areaCode}, content type ${task.contentTypeId}...`
    )

    try {
      // 모든 페이지 가져오기
      const items = await client.getAllPages({
        areaCode: task.areaCode,
        contentTypeId: task.contentTypeId,
        maxPages: 50, // 최대 50페이지 (5000개 아이템)
      })

      console.log(`  Found ${items.length} items`)

      if (items.length === 0) {
        continue
      }

      // 변환 및 저장
      const places = items.map(transformTourItemToPlace)
      const batchSize = 50
      const batches = []

      for (let i = 0; i < places.length; i += batchSize) {
        batches.push(places.slice(i, i + batchSize))
      }

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i]
        console.log(`  Processing batch ${i + 1}/${batches.length} (${batch.length} items)...`)

        const result = await upsertPlacesBatch(batch)
        totalInserted += result.inserted
        totalUpdated += result.updated
        totalErrors += result.errors

        console.log(
          `    ✅ Inserted: ${result.inserted}, Updated: ${result.updated}, Errors: ${result.errors}`
        )
      }
    } catch (error) {
      console.error(`  ❌ Error syncing area ${task.areaCode}, type ${task.contentTypeId}:`, error)
      totalErrors++
    }
  }

  console.log("\n✨ Sync completed!")
  console.log(`  Total inserted: ${totalInserted}`)
  console.log(`  Total updated: ${totalUpdated}`)
  console.log(`  Total errors: ${totalErrors}`)
}

// 실행
syncTourData().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})

