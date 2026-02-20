import * as React from "react"
import { cn } from "@lovetrip/shared"
import { Label } from "./label"
import { Input } from "./input"
import { Textarea } from "./textarea"
import { AlertCircle } from "lucide-react"

interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  hint?: string
  children: React.ReactNode
  className?: string
  htmlFor?: string
}

export function FormField({
  label,
  error,
  required,
  hint,
  children,
  className,
  htmlFor,
}: FormFieldProps) {
  const fieldId = htmlFor || React.useId()

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={fieldId} className={cn(required && "after:content-['*'] after:ml-0.5 after:text-destructive")}>
        {label}
      </Label>
      {React.isValidElement(children) &&
        React.cloneElement(children, {
          id: fieldId,
          "aria-invalid": error ? "true" : "false",
          "aria-describedby": error
            ? `${fieldId}-error`
            : hint
              ? `${fieldId}-hint`
              : undefined,
          ...children.props,
        })}
      {hint && !error && (
        <p id={`${fieldId}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <div
          id={`${fieldId}-error`}
          role="alert"
          aria-live="polite"
          className="flex items-center gap-1.5 text-sm text-destructive"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
