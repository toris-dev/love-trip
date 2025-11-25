import { Router, Request, Response } from "express"
import { getCrawlerRuns } from "../lib/crawler.js"
import { supabase } from "../lib/supabase.js"

const router = Router()

// 대시보드 데이터 조회
router.get("/stats", async (req: Request, res: Response) => {
  try {
    // 크롤러 실행 기록
    const runs = await getCrawlerRuns(10)

    // 전체 장소 수
    let totalPlaces = 0
    try {
      const { count, error } = await supabase
        .from("places")
        .select("*", { count: "exact", head: true })
      if (!error) totalPlaces = count || 0
    } catch (error) {
      console.error("Failed to get total places:", error)
    }

    // 최근 24시간 내 추가된 장소 수
    let recentPlaces = 0
    try {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const { count, error } = await supabase
        .from("places")
        .select("*", { count: "exact", head: true })
        .gte("created_at", yesterday.toISOString())
      if (!error) recentPlaces = count || 0
    } catch (error) {
      console.error("Failed to get recent places:", error)
    }

    // 크롤러 실행 통계
    const totalRuns = runs.length
    const successfulRuns = runs.filter((r: any) => r.status === "completed").length
    const failedRuns = runs.filter((r: any) => r.status === "failed").length

    // 최근 실행 통계
    const lastRun = runs[0]
    const totalInserted = runs.reduce((sum: number, r: any) => sum + (r.items_inserted || 0), 0)
    const totalUpdated = runs.reduce((sum: number, r: any) => sum + (r.items_updated || 0), 0)

    res.json({
      success: true,
      data: {
        places: {
          total: totalPlaces || 0,
          recent24h: recentPlaces || 0,
        },
        crawler: {
          totalRuns,
          successfulRuns,
          failedRuns,
          successRate: totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0,
          totalInserted,
          totalUpdated,
          lastRun: lastRun
            ? {
                id: lastRun.id,
                status: lastRun.status,
                startedAt: lastRun.started_at,
                completedAt: lastRun.completed_at,
                duration: lastRun.duration_seconds,
                inserted: lastRun.items_inserted,
                updated: lastRun.items_updated,
                errors: lastRun.items_errors,
              }
            : null,
        },
        recentRuns: runs.slice(0, 5).map((run: any) => ({
          id: run.id,
          status: run.status,
          startedAt: run.started_at,
          completedAt: run.completed_at,
          duration: run.duration_seconds,
          inserted: run.items_inserted,
          updated: run.items_updated,
          errors: run.items_errors,
        })),
      },
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get dashboard stats",
    })
  }
})

export default router

