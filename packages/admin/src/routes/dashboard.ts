import { Router, Request, Response } from "express"
import { supabase } from "../lib/supabase.js"

const router = Router()

// 대시보드 데이터 조회
router.get("/stats", async (req: Request, res: Response) => {
  try {
    // places 테이블이 삭제되어 통계를 제공할 수 없음
    const totalPlaces = 0
    const recentPlaces = 0

    res.json({
      success: true,
      data: {
        places: {
          total: totalPlaces || 0,
          recent24h: recentPlaces || 0,
        },
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
