/**
 * 로그 스트리밍 유틸리티
 * 크롤러 로그를 웹 서버로 전송하기 위한 이벤트 기반 시스템
 */

export type LogLevel = "info" | "success" | "warning" | "error" | "progress"

export interface LogMessage {
  timestamp: string
  level: LogLevel
  message: string
  data?: any
}

class LogStream {
  private listeners: Set<(log: LogMessage) => void> = new Set()

  /**
   * 로그 리스너 추가
   */
  subscribe(listener: (log: LogMessage) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * 로그 전송
   */
  emit(level: LogLevel, message: string, data?: any) {
    const log: LogMessage = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    }

    // 모든 리스너에 전송
    this.listeners.forEach(listener => {
      try {
        listener(log)
      } catch (error) {
        console.error("Error in log listener:", error)
      }
    })

    // 콘솔에도 출력 (기존 동작 유지)
    const emoji = {
      info: "ℹ️",
      success: "✅",
      warning: "⚠️",
      error: "❌",
      progress: "📊",
    }[level]

    if (level === "error") {
      console.error(`${emoji} ${message}`, data || "")
    } else {
      console.log(`${emoji} ${message}`, data || "")
    }
  }

  info(message: string, data?: any) {
    this.emit("info", message, data)
  }

  success(message: string, data?: any) {
    this.emit("success", message, data)
  }

  warning(message: string, data?: any) {
    this.emit("warning", message, data)
  }

  error(message: string, data?: any) {
    this.emit("error", message, data)
  }

  progress(message: string, data?: any) {
    this.emit("progress", message, data)
  }
}

// 싱글톤 인스턴스
export const logStream = new LogStream()
