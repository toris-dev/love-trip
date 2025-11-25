#!/usr/bin/env node

/**
 * 크롤러 로그 시각화 웹 서버
 */

import express, { type Request, type Response } from "express"
import { logStream, type LogMessage } from "./log-stream.js"
import { syncDateAndTravelPlaces } from "./sync-date-travel-places.js"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3002

// 정적 파일 서빙
app.use(express.static(path.join(__dirname, "../public")))

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

// Server-Sent Events 엔드포인트
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

// 통계 조회
app.get("/api/stats", (req: Request, res: Response) => {
  const stats = {
    totalLogs: logs.length,
    errors: logs.filter(l => l.level === "error").length,
    warnings: logs.filter(l => l.level === "warning").length,
    lastLog: logs[logs.length - 1] || null,
  }
  res.json(stats)
})

// 크롤러 시작 엔드포인트
app.post("/api/start", async (req: Request, res: Response) => {
  res.json({ message: "크롤러 시작됨" })

  // 비동기로 크롤러 실행
  syncDateAndTravelPlaces().catch(error => {
    logStream.error("크롤러 실행 중 오류 발생", { error: error.message })
  })
})

app.listen(PORT, () => {
  console.log(`🚀 크롤러 로그 시각화 서버가 시작되었습니다!`)
  console.log(`📊 웹 인터페이스: http://localhost:${PORT}`)
  console.log(`📡 API 엔드포인트: http://localhost:${PORT}/api/logs/stream`)
})
