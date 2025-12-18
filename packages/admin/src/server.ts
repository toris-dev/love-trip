import express, { type Request, type Response } from "express"
import cors from "cors"
import { config } from "./config.js"
import { metricsMiddleware } from "./middleware/metrics.js"
import metricsRouter from "./routes/metrics.js"
import dashboardRouter from "./routes/dashboard.js"
import { logStream, type LogMessage } from "./lib/log-stream.js"

const app = express()

// 미들웨어
app.use(cors())
app.use(express.json())
app.use(metricsMiddleware)

// 정적 파일 서빙 (관리자 페이지 UI)
app.use(express.static("public"))

// 로그 저장소 (최근 1000개)
const logs: LogMessage[] = []
const MAX_LOGS = 1000

// 로그 스트림 구독
logStream.subscribe(log => {
  logs.push(log)
  if (logs.length > MAX_LOGS) {
    logs.shift()
  }
})

// Server-Sent Events 엔드포인트 (실시간 로그 스트리밍)
app.get("/api/logs/stream", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream")
  res.setHeader("Cache-Control", "no-cache")
  res.setHeader("Connection", "keep-alive")
  res.setHeader("Access-Control-Allow-Origin", "*")

  // 연결 유지용 하트비트
  const heartbeat = setInterval(() => {
    res.write(": heartbeat\n\n")
  }, 30000)

  // 기존 로그 전송
  logs.forEach(log => {
    res.write(`data: ${JSON.stringify(log)}\n\n`)
  })

  // 새 로그 구독
  const unsubscribe = logStream.subscribe(log => {
    res.write(`data: ${JSON.stringify(log)}\n\n`)
  })

  // 연결 종료 처리
  req.on("close", () => {
    clearInterval(heartbeat)
    unsubscribe()
    res.end()
  })
})

// 로그 히스토리 조회
app.get("/api/logs", (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 100
  res.json(logs.slice(-limit))
})

// API 라우트
app.use("/api/metrics", metricsRouter)
app.use("/api/dashboard", dashboardRouter)

// 루트 경로 - 관리자 페이지
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "public" })
})

// 헬스 체크
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// 서버 시작
const PORT = config.PORT

app.listen(PORT, () => {
  console.log(`🚀 Admin server running on http://localhost:${PORT}`)
  console.log(`📊 Metrics endpoint: http://localhost:${PORT}/api/metrics`)
  console.log(`🎯 Dashboard API: http://localhost:${PORT}/api/dashboard/stats`)
})
