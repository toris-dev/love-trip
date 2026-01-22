"use client"

import * as React from "react"
import { cn } from "@lovetrip/utils"

export interface TimelineItem {
  id: string
  time: string
  title: string
  description?: string
  icon?: React.ReactNode
  status?: "completed" | "current" | "upcoming"
}

export interface TimelineProps {
  items: TimelineItem[]
  className?: string
  orientation?: "horizontal" | "vertical"
}

export function Timeline({ items, className, orientation = "horizontal" }: TimelineProps) {
  if (orientation === "horizontal") {
    return (
      <div className={cn("relative", className)}>
        {/* 타임라인 라인 */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2" />

        {/* 타임라인 아이템들 */}
        <div className="relative flex items-center justify-between">
          {items.map((item, index) => (
            <div key={item.id} className="relative flex flex-col items-center gap-2 flex-1">
              {/* 아이콘/원 */}
              <div
                className={cn(
                  "relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                  item.status === "completed"
                    ? "bg-primary border-primary text-primary-foreground"
                    : item.status === "current"
                      ? "bg-primary border-primary text-primary-foreground ring-4 ring-primary/20"
                      : "bg-background border-border text-muted-foreground"
                )}
              >
                {item.icon || (
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      item.status === "completed" || item.status === "current"
                        ? "bg-primary-foreground"
                        : "bg-muted-foreground"
                    )}
                  />
                )}
              </div>

              {/* 시간 및 제목 */}
              <div className="text-center space-y-1">
                <div className="text-xs font-medium text-muted-foreground">{item.time}</div>
                <div className="text-sm font-semibold text-foreground">{item.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Vertical timeline
  return (
    <div className={cn("relative", className)}>
      {items.map((item, index) => (
        <div key={item.id} className="relative flex gap-4 pb-8 last:pb-0">
          {/* 타임라인 라인 */}
          {index < items.length - 1 && (
            <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-border" />
          )}

          {/* 아이콘 */}
          <div
            className={cn(
              "relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200",
              item.status === "completed"
                ? "bg-primary border-primary text-primary-foreground"
                : item.status === "current"
                  ? "bg-primary border-primary text-primary-foreground ring-4 ring-primary/20"
                  : "bg-background border-border text-muted-foreground"
            )}
          >
            {item.icon || (
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  item.status === "completed" || item.status === "current"
                    ? "bg-primary-foreground"
                    : "bg-muted-foreground"
                )}
              />
            )}
          </div>

          {/* 콘텐츠 */}
          <div className="flex-1 space-y-1">
            <div className="text-xs font-medium text-muted-foreground">{item.time}</div>
            <div className="text-sm font-semibold text-foreground">{item.title}</div>
            {item.description && (
              <div className="text-sm text-muted-foreground">{item.description}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
