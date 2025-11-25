#!/usr/bin/env node

import { TourApiClient } from "./lib/tour-api-client.js"
import {
  transformTourItemToPlace,
  upsertPlacesBatch,
  upsertCourseSummary,
} from "./lib/supabase-client.js"
import { CONTENT_TYPE_IDS, AREA_CODES, AREA_NAMES } from "./config.js"
import { logStream } from "./log-stream.js"

/**
 * 데이트 장소 및 여행 장소를 Tour API 4.0에서 가져와서 Supabase에 저장
 */
export async function syncDateAndTravelPlaces() {
  logStream.info("🚀 Starting Tour API 4.0 sync for date & travel places...")
  logStream.info("=".repeat(60))
  const client = new TourApiClient()

  // 전국 모든 지역 크롤링
  const allAreaCodes = Object.values(AREA_CODES) // 전국 모든 지역

  // 데이트 장소 타입: 음식점, 쇼핑, 문화시설
  const dateContentTypes = [
    CONTENT_TYPE_IDS.RESTAURANT, // 음식점
    CONTENT_TYPE_IDS.SHOPPING, // 쇼핑
    CONTENT_TYPE_IDS.CULTURAL_FACILITY, // 문화시설
  ]

  // 여행 장소 타입: 관광지, 문화시설, 레포츠, 숙박, 여행코스, 축제
  const travelContentTypes = [
    CONTENT_TYPE_IDS.TOURIST_SPOT, // 관광지
    CONTENT_TYPE_IDS.CULTURAL_FACILITY, // 문화시설
    CONTENT_TYPE_IDS.LEISURE_SPORTS, // 레포츠
    CONTENT_TYPE_IDS.ACCOMMODATION, // 숙박
    CONTENT_TYPE_IDS.TRAVEL_COURSE, // 여행코스
    CONTENT_TYPE_IDS.FESTIVAL, // 축제공연행사
  ]

  // 전국 모든 지역 × 데이트 장소 타입 조합 생성
  const datePlaceTasks = allAreaCodes.flatMap(areaCode =>
    dateContentTypes.map(contentTypeId => ({
      areaCode,
      contentTypeId,
      category: "date" as const,
    }))
  )

  // 전국 모든 지역 × 여행 장소 타입 조합 생성
  const travelPlaceTasks = allAreaCodes.flatMap(areaCode =>
    travelContentTypes.map(contentTypeId => ({
      areaCode,
      contentTypeId,
      category: "travel" as const,
    }))
  )

  // 모든 작업 통합
  const allTasks = [...datePlaceTasks, ...travelPlaceTasks]

  let totalInserted = 0
  let totalUpdated = 0
  let totalErrors = 0
  let datePlacesCount = 0
  let travelPlacesCount = 0

  // 타입명 매핑
  const contentTypeNames: Record<number, string> = {
    [CONTENT_TYPE_IDS.TOURIST_SPOT]: "관광지",
    [CONTENT_TYPE_IDS.CULTURAL_FACILITY]: "문화시설",
    [CONTENT_TYPE_IDS.FESTIVAL]: "축제공연행사",
    [CONTENT_TYPE_IDS.TRAVEL_COURSE]: "여행코스",
    [CONTENT_TYPE_IDS.LEISURE_SPORTS]: "레포츠",
    [CONTENT_TYPE_IDS.ACCOMMODATION]: "숙박",
    [CONTENT_TYPE_IDS.SHOPPING]: "쇼핑",
    [CONTENT_TYPE_IDS.RESTAURANT]: "음식점",
  }

  const startTime = Date.now()

  logStream.info(`📋 총 ${allTasks.length}개 작업 예정`)
  logStream.info(
    `   - 데이트 장소: ${datePlaceTasks.length}개 작업 (${allAreaCodes.length}개 지역 × ${dateContentTypes.length}개 타입)`
  )
  logStream.info(
    `   - 여행 장소: ${travelPlaceTasks.length}개 작업 (${allAreaCodes.length}개 지역 × ${travelContentTypes.length}개 타입)`
  )
  logStream.info(
    `   - 예상 소요 시간: 약 ${Math.ceil((allTasks.length * 2) / 60)}분 (API 호출 딜레이 포함)`
  )
  logStream.info(`   - 시작 시간: ${new Date().toLocaleString("ko-KR")}`)

  for (let taskIndex = 0; taskIndex < allTasks.length; taskIndex++) {
    const task = allTasks[taskIndex]
    const taskStartTime = Date.now()
    const progress = ((taskIndex + 1) / allTasks.length) * 100
    const categoryLabel = task.category === "date" ? "💕 데이트" : "✈️ 여행"
    const regionName = AREA_NAMES[task.areaCode] || `지역${task.areaCode}`
    const typeName = contentTypeNames[task.contentTypeId] || `타입${task.contentTypeId}`

    // 진행률 바 생성
    const progressBarLength = 30
    const filled = Math.round((progress / 100) * progressBarLength)
    const progressBar = "█".repeat(filled) + "░".repeat(progressBarLength - filled)

    logStream.progress(`\n${"=".repeat(60)}`)
    logStream.progress(
      `[${taskIndex + 1}/${allTasks.length}] ${progressBar} ${progress.toFixed(1)}%`
    )
    logStream.info(`${categoryLabel} 장소 수집 중...`)
    logStream.info(`   지역: ${regionName} (코드: ${task.areaCode})`)
    logStream.info(`   타입: ${typeName} (코드: ${task.contentTypeId})`)
    logStream.info(`   시작: ${new Date().toLocaleTimeString("ko-KR")}`)

    // 예상 남은 시간 계산
    if (taskIndex > 0) {
      const elapsedTime = (Date.now() - startTime) / 1000 // 초
      const avgTimePerTask = elapsedTime / taskIndex
      const remainingTasks = allTasks.length - taskIndex
      const estimatedRemaining = Math.ceil((avgTimePerTask * remainingTasks) / 60) // 분
      logStream.info(`   예상 남은 시간: 약 ${estimatedRemaining}분`)
    }
    logStream.info("-".repeat(60))

    try {
      // 모든 페이지 가져오기 (전국 데이터 수집을 위해 maxPages 증가)
      logStream.info(`  🔍 API 호출 시작...`)
      const items = await client.getAllPages({
        areaCode: task.areaCode,
        contentTypeId: task.contentTypeId,
        maxPages: 200, // 최대 200페이지 (20,000개 아이템) - 전국 데이터 수집
      })

      const fetchTime = ((Date.now() - taskStartTime) / 1000).toFixed(1)
      logStream.success(`  ✅ ${items.length}개 장소 발견 (소요 시간: ${fetchTime}초)`)

      if (items.length === 0) {
        logStream.warning(`  ⏭️  건너뜀 (데이터 없음)`)
        continue
      }

      // 변환 및 저장
      const places = items.map(transformTourItemToPlace)

      // course_type이 올바르게 설정되었는지 확인 및 보정
      const placesWithCategory = places.map(place => {
        // 이미 course_type이 설정되어 있으면 유지
        if (place.course_type && place.course_type.length > 0) {
          // 카테고리와 일치하는지 확인
          if (task.category === "date" && !place.course_type.includes("date")) {
            // 데이트 장소인데 course_type에 date가 없으면 추가
            place.course_type = [...place.course_type, "date"]
          } else if (task.category === "travel" && !place.course_type.includes("travel")) {
            // 여행 장소인데 course_type에 travel이 없으면 추가
            place.course_type = [...place.course_type, "travel"]
          }
        } else {
          // course_type이 없으면 카테고리에 맞게 설정
          place.course_type = [task.category]
        }
        return place
      })

      // 지역명 가져오기
      const regionName = AREA_NAMES[task.areaCode] || `지역${task.areaCode}`

      // 코스 요약 정보 저장
      await upsertCourseSummary(
        regionName,
        task.category as "travel" | "date",
        placesWithCategory,
        task.areaCode,
        null // sigunguCode는 나중에 추가 가능
      )

      // 배치 처리
      const batchSize = 50
      const batches = []

      for (let i = 0; i < placesWithCategory.length; i += batchSize) {
        batches.push(placesWithCategory.slice(i, i + batchSize))
      }

      logStream.info(`  💾 데이터베이스 저장 시작... (${batches.length}개 배치)`)
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i]
        const batchProgress = ((i + 1) / batches.length) * 100
        logStream.progress(
          `  📦 배치 ${i + 1}/${batches.length} 처리 중... [${batchProgress.toFixed(0)}%] (${batch.length}개 항목)`
        )

        const result = await upsertPlacesBatch(batch)
        totalInserted += result.inserted
        totalUpdated += result.updated
        totalErrors += result.errors

        if (task.category === "date") {
          datePlacesCount += result.inserted + result.updated
        } else {
          travelPlacesCount += result.inserted + result.updated
        }

        logStream.success(
          `    ✅ 삽입: ${result.inserted}, 업데이트: ${result.updated}, 오류: ${result.errors}`
        )
      }

      const taskTime = ((Date.now() - taskStartTime) / 1000).toFixed(1)
      logStream.success(`  ✨ 작업 완료! (총 소요 시간: ${taskTime}초)`)
      logStream.info(
        `  📊 누적 통계: 삽입 ${totalInserted}개, 업데이트 ${totalUpdated}개, 오류 ${totalErrors}개`
      )
    } catch (error) {
      logStream.error(
        `  ❌ 오류 발생 (지역: ${task.areaCode}, 타입: ${task.contentTypeId}):`,
        error instanceof Error ? error.message : error
      )
      totalErrors++
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1)

  logStream.success("\n" + "=".repeat(60))
  logStream.success("✨ 동기화 완료!")
  logStream.success("=".repeat(60))
  logStream.info(`⏱️  총 소요 시간: ${totalTime}분`)
  logStream.info(`📅 완료 시간: ${new Date().toLocaleString("ko-KR")}`)
  logStream.info(`\n📊 전체 통계:`)
  logStream.info(`   - 총 삽입: ${totalInserted.toLocaleString()}개`)
  logStream.info(`   - 총 업데이트: ${totalUpdated.toLocaleString()}개`)
  logStream.info(`   - 총 오류: ${totalErrors}개`)
  logStream.info(
    `   - 성공률: ${(((totalInserted + totalUpdated) / (totalInserted + totalUpdated + totalErrors)) * 100).toFixed(1)}%`
  )
  logStream.info(`\n💕 데이트 장소:`)
  logStream.info(`   - 총 ${datePlacesCount.toLocaleString()}개 장소 저장됨`)
  logStream.info(`\n✈️ 여행 장소:`)
  logStream.info(`   - 총 ${travelPlacesCount.toLocaleString()}개 장소 저장됨`)
  logStream.success("=".repeat(60))
}

// 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  syncDateAndTravelPlaces().catch(error => {
    logStream.error("❌ 치명적 오류:", error)
    process.exit(1)
  })
}
