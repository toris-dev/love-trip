import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@lovetrip/shared"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
  text?: string
  fullScreen?: boolean
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
}

export function LoadingSpinner({
  size = "md",
  className,
  text,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const spinner = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        fullScreen && "min-h-screen",
        className
      )}
      role="status"
      aria-label={text || "로딩 중"}
    >
      <Loader2
        className={cn(
          "animate-spin text-primary",
          sizeClasses[size]
        )}
        aria-hidden="true"
      />
      {text && (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {text}
        </p>
      )}
      <span className="sr-only">{text || "로딩 중..."}</span>
    </div>
  )

  return spinner
}
