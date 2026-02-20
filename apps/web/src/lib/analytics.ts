/**
 * Google Analytics 4 이벤트 전송 유틸리티.
 * @next/third-parties의 sendGAEvent를 래핑하여 타입 안전한 헬퍼 제공.
 */

import { sendGAEvent as sendGAEventBase } from "@next/third-parties/google"

export function sendGAEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
): void {
  if (typeof window === "undefined") return
  sendGAEventBase("event", eventName, params ?? {})
}

export function trackLogin(method: string): void {
  sendGAEvent("login", { method })
}

export function trackSignUp(method: string): void {
  sendGAEvent("sign_up", { method })
}

export function trackCourseSave(courseType: "date" | "travel"): void {
  sendGAEvent("course_save", { course_type: courseType })
}

export function trackTravelPlanCreate(): void {
  sendGAEvent("travel_plan_create")
}
