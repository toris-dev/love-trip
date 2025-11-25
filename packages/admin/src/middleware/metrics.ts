import { Request, Response, NextFunction } from "express"
import { httpRequestDuration, httpRequestsTotal } from "../lib/metrics.js"

/**
 * HTTP 요청 메트릭 수집 미들웨어
 */
export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now()

  res.on("finish", () => {
    const duration = (Date.now() - startTime) / 1000
    const route = req.route?.path || req.path
    const method = req.method
    const status = res.statusCode.toString()

    httpRequestDuration.observe({ method, route, status }, duration)
    httpRequestsTotal.inc({ method, route, status })
  })

  next()
}

