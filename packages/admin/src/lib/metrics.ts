import { Registry, Counter, Histogram, Gauge } from "prom-client"

// Prometheus 메트릭 레지스트리 생성
export const register = new Registry()

// 기본 메트릭 수집 (CPU, 메모리 등)
register.setDefaultLabels({
  app: "love-trip-admin",
})

// Crawler 실행 관련 메트릭
export const crawlerRunsTotal = new Counter({
  name: "crawler_runs_total",
  help: "Total number of crawler runs",
  labelNames: ["status"], // success, error
  registers: [register],
})

export const crawlerItemsProcessed = new Counter({
  name: "crawler_items_processed_total",
  help: "Total number of items processed by crawler",
  labelNames: ["action"], // inserted, updated, error
  registers: [register],
})

export const crawlerDuration = new Histogram({
  name: "crawler_duration_seconds",
  help: "Duration of crawler runs in seconds",
  buckets: [1, 5, 10, 30, 60, 120, 300, 600],
  registers: [register],
})

export const crawlerItemsInProgress = new Gauge({
  name: "crawler_items_in_progress",
  help: "Number of items currently being processed",
  registers: [register],
})

export const crawlerLastRunTime = new Gauge({
  name: "crawler_last_run_timestamp",
  help: "Timestamp of the last crawler run",
  registers: [register],
})

// API 요청 메트릭
export const httpRequestDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status"],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register],
})

export const httpRequestsTotal = new Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
  registers: [register],
})

