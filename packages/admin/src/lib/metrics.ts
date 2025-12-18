import { Registry, Counter, Histogram, Gauge } from "prom-client"

// Prometheus 메트릭 레지스트리 생성
export const register = new Registry()

// 기본 메트릭 수집 (CPU, 메모리 등)
register.setDefaultLabels({
  app: "love-trip-admin",
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
