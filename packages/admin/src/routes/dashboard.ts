import { Router, Request, Response } from "express"
import { supabase } from "../lib/supabase.js"

const router = Router()

// 대시보드 데이터 조회
router.get("/stats", async (req: Request, res: Response) => {
  try {
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
