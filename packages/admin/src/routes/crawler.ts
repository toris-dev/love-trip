import { Router, Request, Response } from "express"
import { runCrawler, getCrawlerRuns } from "../lib/crawler.js"

const router = Router()

// 크롤러 실행
router.post("/run", async (req: Request, res: Response) => {
  try {
    const result = await runCrawler()
    res.json({
      success: result.success,
      data: {
        inserted: result.inserted,
        updated: result.updated,
        errors: result.errors,
        duration: result.duration,
        logs: result.logs,
      },
      error: result.error,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to run crawler",
    })
  }
})

// 크롤러 실행 기록 조회
router.get("/runs", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10
    const runs = await getCrawlerRuns(limit)
    res.json({
      success: true,
      data: runs,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get crawler runs",
    })
  }
})

export default router

