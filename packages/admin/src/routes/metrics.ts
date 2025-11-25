import { Router, Request, Response } from "express"
import { register } from "../lib/metrics.js"

const router = Router()

// Prometheus 메트릭 엔드포인트
router.get("/", async (req: Request, res: Response) => {
  try {
    res.set("Content-Type", register.contentType)
    const metrics = await register.metrics()
    res.end(metrics)
  } catch (error: any) {
    res.status(500).end(error.message)
  }
})

export default router

