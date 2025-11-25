import { spawn } from "child_process"
import { fileURLToPath } from "url"
import { dirname, resolve } from "path"
import {
  crawlerRunsTotal,
  crawlerItemsProcessed,
  crawlerDuration,
  crawlerItemsInProgress,
  crawlerLastRunTime,
} from "./metrics.js"
import { supabase } from "./supabase.js"
import { logStream } from "./log-stream.js"

// ESM에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

interface CrawlerRunResult {
  success: boolean
  inserted: number
  updated: number
  errors: number
  duration: number
  error?: string
  logs: string[]
}

/**
 * Crawler 실행 및 모니터링
 */
export async function runCrawler(): Promise<CrawlerRunResult> {
  const startTime = Date.now()
  const logs: string[] = []
  let inserted = 0
  let updated = 0
  let errors = 0
  let success = false

  // 크롤러 실행 시작 로그 저장
  const runId = await logCrawlerStart()

  logStream.info(`🚀 크롤러 시작 - ${new Date().toLocaleString("ko-KR")}`)
  logs.push(`Starting crawler at ${new Date().toISOString()}`)

  try {
    // 크롤러 패키지 경로
    const crawlerPath = resolve(__dirname, "../../../crawler")

    // 크롤러를 spawn으로 실행하여 실시간 로그 캡처
    await new Promise<void>((resolve, reject) => {
      const child = spawn("pnpm", ["sync:date-travel"], {
        cwd: crawlerPath,
        env: process.env,
        shell: true,
        stdio: ["inherit", "pipe", "pipe"],
      })

      let output = ""

      // stdout 처리
      child.stdout?.on("data", (data: Buffer) => {
        const text = data.toString()
        output += text
        logs.push(...text.split("\n").filter(line => line.trim()))

        // 실시간 로그 스트리밍
        text.split("\n").forEach(line => {
          const trimmed = line.trim()
          if (trimmed) {
            if (trimmed.includes("✅") || trimmed.includes("✨")) {
              logStream.success(trimmed)
            } else if (trimmed.includes("❌") || trimmed.includes("오류")) {
              logStream.error(trimmed)
            } else if (trimmed.includes("⚠️") || trimmed.includes("경고")) {
              logStream.warning(trimmed)
            } else if (trimmed.includes("📊") || trimmed.includes("%")) {
              logStream.progress(trimmed)
            } else {
              logStream.info(trimmed)
            }
          }
        })
      })

      // stderr 처리
      child.stderr?.on("data", (data: Buffer) => {
        const text = data.toString()
        output += text
        logs.push(...text.split("\n").filter(line => line.trim()))
        logStream.error(text.trim())
      })

      child.on("close", code => {
        // 결과 파싱
        const insertedMatch = output.match(/총 삽입:\s*([\d,]+)/i) || output.match(/삽입\s+(\d+)/i)
        const updatedMatch =
          output.match(/총 업데이트:\s*([\d,]+)/i) || output.match(/업데이트\s+(\d+)/i)
        const errorsMatch = output.match(/총 오류:\s*(\d+)/i) || output.match(/오류\s+(\d+)/i)

        if (insertedMatch) inserted = parseInt(insertedMatch[1].replace(/,/g, ""), 10)
        if (updatedMatch) updated = parseInt(updatedMatch[1].replace(/,/g, ""), 10)
        if (errorsMatch) errors = parseInt(errorsMatch[1], 10)

        if (code === 0) {
          success = errors === 0 || inserted > 0 || updated > 0
          resolve()
        } else {
          reject(new Error(`크롤러가 종료 코드 ${code}로 종료되었습니다`))
        }
      })

      child.on("error", error => {
        reject(error)
      })
    })

    // 메트릭 업데이트
    crawlerRunsTotal.inc({ status: success ? "success" : "error" })
    crawlerItemsProcessed.inc({ action: "inserted" }, inserted)
    crawlerItemsProcessed.inc({ action: "updated" }, updated)
    crawlerItemsProcessed.inc({ action: "error" }, errors)

    const duration = (Date.now() - startTime) / 1000
    crawlerDuration.observe(duration)
    crawlerLastRunTime.set(Date.now() / 1000)

    // 크롤러 실행 완료 로그 저장
    await logCrawlerEnd(runId, {
      success,
      inserted,
      updated,
      errors,
      duration,
      logs: logs.slice(-100), // 최근 100줄만 저장
    })

    return {
      success,
      inserted,
      updated,
      errors,
      duration,
      logs: logs.slice(-50), // 최근 50줄만 반환
    }
  } catch (error: any) {
    const duration = (Date.now() - startTime) / 1000
    const errorMessage = error.message || String(error)

    logs.push(`Error: ${errorMessage}`)
    logs.push(error.stack || "")

    crawlerRunsTotal.inc({ status: "error" })
    crawlerDuration.observe(duration)
    crawlerLastRunTime.set(Date.now() / 1000)

    // 크롤러 실행 실패 로그 저장
    await logCrawlerEnd(runId, {
      success: false,
      inserted,
      updated,
      errors: errors + 1,
      duration,
      error: errorMessage,
      logs: logs.slice(-100),
    })

    return {
      success: false,
      inserted,
      updated,
      errors: errors + 1,
      duration,
      error: errorMessage,
      logs: logs.slice(-50),
    }
  }
}

/**
 * 크롤러 실행 시작 로그 저장
 */
async function logCrawlerStart(): Promise<string> {
  try {
    const { data, error } = await supabase
      .from("crawler_runs")
      .insert({
        started_at: new Date().toISOString(),
        status: "running",
      })
      .select("id")
      .single()

    if (error) {
      console.error("Failed to log crawler start:", error)
      return ""
    }

    return data.id
  } catch (error) {
    console.error("Failed to log crawler start:", error)
    return ""
  }
}

/**
 * 크롤러 실행 완료 로그 저장
 */
async function logCrawlerEnd(
  runId: string,
  result: {
    success: boolean
    inserted: number
    updated: number
    errors: number
    duration: number
    error?: string
    logs: string[]
  }
): Promise<void> {
  if (!runId) return

  try {
    const { error } = await supabase
      .from("crawler_runs")
      .update({
        completed_at: new Date().toISOString(),
        status: result.success ? "completed" : "failed",
        items_inserted: result.inserted,
        items_updated: result.updated,
        items_errors: result.errors,
        duration_seconds: result.duration,
        error_message: result.error || null,
        logs: result.logs,
      })
      .eq("id", runId)

    if (error) {
      // 네트워크 오류는 조용히 처리
      if (error.message?.includes("fetch failed") || error.message?.includes("ENOTFOUND")) {
        return // 조용히 실패
      }
      console.error("Failed to log crawler end:", error)
    }
  } catch (error: any) {
    // 네트워크 오류는 조용히 처리
    if (error?.message?.includes("fetch failed") || error?.message?.includes("ENOTFOUND")) {
      return // 조용히 실패
    }
    console.error("Failed to log crawler end:", error)
  }
}

/**
 * 최근 크롤러 실행 기록 조회
 */
export async function getCrawlerRuns(limit: number = 10) {
  try {
    const { data, error } = await supabase
      .from("crawler_runs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(limit)

    if (error) {
      // 네트워크 오류는 조용히 처리 (Supabase 연결 불가 시)
      if (error.message?.includes("fetch failed") || error.message?.includes("ENOTFOUND")) {
        logStream.warning("Supabase 연결 불가 - 실행 기록을 불러올 수 없습니다")
        return []
      }
      console.error("Failed to get crawler runs:", error)
      return []
    }

    return data || []
  } catch (error: any) {
    // 네트워크 오류는 조용히 처리
    if (error?.message?.includes("fetch failed") || error?.message?.includes("ENOTFOUND")) {
      logStream.warning("Supabase 연결 불가 - 실행 기록을 불러올 수 없습니다")
      return []
    }
    console.error("Failed to get crawler runs:", error)
    return []
  }
}
