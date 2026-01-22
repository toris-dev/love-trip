import * as React from "react"
import { AlertCircle, X } from "lucide-react"
import { cn } from "@lovetrip/utils"
import { Alert, AlertDescription, AlertTitle } from "./alert"
import { Button } from "./button"

interface ErrorMessageProps {
  title?: string
  message: string
  onDismiss?: () => void
  className?: string
  variant?: "default" | "destructive" | "warning"
}

export function ErrorMessage({
  title,
  message,
  onDismiss,
  className,
  variant = "destructive",
}: ErrorMessageProps) {
  return (
    <Alert
      variant={variant}
      className={cn("relative", className)}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <AlertCircle className="h-4 w-4" aria-hidden="true" />
      <div className="flex-1">
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertDescription>{message}</AlertDescription>
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={onDismiss}
          aria-label="에러 메시지 닫기"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </Alert>
  )
}
