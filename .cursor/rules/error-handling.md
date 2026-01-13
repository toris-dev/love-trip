# Error Handling Rules

## Error Handling Principles

### 1. Fail Fast
- Validate input early
- Throw errors immediately when conditions aren't met
- Don't continue with invalid state

### 2. Clear Error Messages
- Provide actionable error messages
- Use Korean for user-facing messages
- Include context when helpful

### 3. Error Propagation
- Services throw errors
- API routes catch and convert to HTTP responses
- Components catch and display user-friendly messages

## Service Layer Error Handling

### Pattern: Throw Errors

```typescript
// packages/{domain}/services/{domain}-service.ts
export const domainService = {
  async getEntity(id: string): Promise<Entity> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("table")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      console.error("Service error:", error)
      throw error // Let caller handle
    }

    if (!data) {
      throw new Error("Entity not found")
    }

    return data
  },
}
```

### Error Types

```typescript
// Custom error classes (optional)
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "NotFoundError"
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ValidationError"
  }
}
```

### Validation Before Operations

```typescript
function validateInput(input: unknown): CreateInput {
  if (!input || typeof input !== "object") {
    throw new ValidationError("Invalid input")
  }

  if (!("title" in input) || typeof input.title !== "string") {
    throw new ValidationError("Title is required")
  }

  if (input.title.length > 100) {
    throw new ValidationError("Title must be 100 characters or less")
  }

  return input as CreateInput
}
```

## API Route Error Handling

### Pattern: Try-Catch with HTTP Status Codes

```typescript
// app/api/{resource}/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Operation
    const result = await service.getData()

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("API error:", error)

    // Handle specific error types
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { error: "요청한 데이터를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Generic error
    return NextResponse.json(
      { error: "오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

### HTTP Status Codes

- **200**: Success (GET, PUT, PATCH)
- **201**: Created (POST)
- **204**: No Content (DELETE)
- **400**: Bad Request (validation errors, invalid input)
- **401**: Unauthorized (not authenticated)
- **403**: Forbidden (not authorized, RLS violation)
- **404**: Not Found (resource doesn't exist)
- **409**: Conflict (duplicate, constraint violation)
- **500**: Internal Server Error (unexpected errors)

### Authentication Errors

```typescript
const supabase = await createClient()
const {
  data: { user },
} = await supabase.auth.getUser()

if (!user) {
  return NextResponse.json(
    { error: "로그인이 필요합니다" },
    { status: 401 }
  )
}
```

### Authorization Errors

```typescript
// Check if user owns the resource
const resource = await service.getResource(id)

if (resource.user_id !== user.id) {
  return NextResponse.json(
    { error: "권한이 없습니다" },
    { status: 403 }
  )
}
```

## Component Error Handling

### Pattern: Try-Catch with User Feedback

```typescript
"use client"

import { useState } from "react"
import { toast } from "sonner"

export function Component() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAction = async () => {
    try {
      setIsLoading(true)
      setError(null)

      await api.createResource(data)

      toast.success("성공적으로 생성되었습니다")
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "오류가 발생했습니다"

      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }
}
```

### Error Boundary (React)

```typescript
// app/error.tsx
"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>오류가 발생했습니다</h2>
      <button onClick={reset}>다시 시도</button>
    </div>
  )
}
```

### Loading and Error States

```typescript
if (isLoading) {
  return <LoadingSpinner />
}

if (error) {
  return <ErrorMessage message={error} />
}

return <Content />
```

## Form Error Handling

### Field-Level Errors

```typescript
const [errors, setErrors] = useState<Record<string, string>>({})

const validate = (data: FormData) => {
  const newErrors: Record<string, string> = {}

  if (!data.title) {
    newErrors.title = "제목은 필수입니다"
  }

  if (data.title && data.title.length > 100) {
    newErrors.title = "제목은 100자 이하여야 합니다"
  }

  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}
```

### Display Errors

```typescript
<Input
  value={title}
  onChange={(e) => setTitle(e.target.value)}
  error={errors.title}
/>
```

## Error Logging

### Server-Side Logging

```typescript
console.error("Error details:", {
  message: error.message,
  stack: error.stack,
  context: {
    userId,
    resourceId,
    // Additional context
  },
})
```

### Client-Side Logging

```typescript
// Only log in development
if (process.env.NODE_ENV === "development") {
  console.error("Error:", error)
}
```

## Best Practices

1. **Throw in services**, catch in API routes/components
2. **Use appropriate HTTP status codes**
3. **Provide user-friendly messages** in Korean
4. **Log detailed errors** server-side
5. **Don't expose internal details** to clients
6. **Handle async errors** with try-catch
7. **Validate input** before operations
8. **Use error boundaries** for React components
9. **Show loading states** during operations
10. **Provide retry mechanisms** when appropriate
