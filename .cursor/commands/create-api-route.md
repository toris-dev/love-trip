# Create API Route Guide

Use this command to scaffold a new Next.js API route following project patterns.

## Route Handler Structure

### Basic GET Route

```typescript
// app/api/{resource}/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const { data, error } = await supabase.from("table").select("*")

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

### POST Route with Body

```typescript
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const body = await request.json()

    // Validation
    if (!body.title) {
      return NextResponse.json({ error: "제목은 필수입니다" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("table")
      .insert({
        user_id: user.id,
        ...body,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

## Route Structure

### Single Resource

```
app/api/travel-plans/
└── route.ts
```

### Nested Resource

```
app/api/travel-plans/
└── [id]/
    ├── route.ts
    └── budget/
        └── route.ts
```

### Dynamic Segments

```typescript
// app/api/travel-plans/[id]/route.ts
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // Use id
}
```

## Authentication

### Check Authentication

```typescript
const supabase = await createClient()
const {
  data: { user },
} = await supabase.auth.getUser()

if (!user) {
  return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
}
```

## Request Handling

### Query Parameters

```typescript
const { searchParams } = new URL(request.url)
const page = searchParams.get("page") || "1"
const limit = searchParams.get("limit") || "10"
```

### Request Body

```typescript
const body = await request.json()
```

### Headers

```typescript
const contentType = request.headers.get("content-type")
```

## Response Patterns

### Success Response

```typescript
return NextResponse.json({
  success: true,
  data: result,
})
```

### Error Response

```typescript
return NextResponse.json({ error: "에러 메시지" }, { status: 400 })
```

### Status Codes

- 200: Success (GET, PUT, PATCH)
- 201: Created (POST)
- 204: No Content (DELETE)
- 400: Bad Request (validation errors)
- 401: Unauthorized (not authenticated)
- 403: Forbidden (not authorized)
- 404: Not Found
- 500: Internal Server Error

## Error Handling

### Try-Catch Pattern

```typescript
try {
  // Operation
} catch (error) {
  console.error("Error:", error)
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "오류가 발생했습니다" },
    { status: 500 }
  )
}
```

### Supabase Errors

```typescript
const { data, error } = await supabase.from("table").select("*")

if (error) {
  console.error("Supabase error:", error)
  return NextResponse.json({ error: "데이터를 불러오는 중 오류가 발생했습니다" }, { status: 500 })
}
```

## Validation

### Input Validation

```typescript
const body = await request.json()

if (!body.title || typeof body.title !== "string") {
  return NextResponse.json({ error: "제목은 필수이며 문자열이어야 합니다" }, { status: 400 })
}

if (body.title.length > 100) {
  return NextResponse.json({ error: "제목은 100자 이하여야 합니다" }, { status: 400 })
}
```

## Type Safety

### Request Types

```typescript
interface CreateRequest {
  title: string
  description?: string
}

const body = (await request.json()) as CreateRequest
```

### Response Types

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

return NextResponse.json<ApiResponse<Entity>>({
  success: true,
  data: result,
})
```

## Checklist

- [ ] Route file created in app/api/{resource}/route.ts
- [ ] Authentication check included (if needed)
- [ ] Input validation added
- [ ] Error handling with try-catch
- [ ] Proper HTTP status codes
- [ ] Error messages in Korean
- [ ] Type definitions for request/response
- [ ] Supabase server client used
- [ ] Success response format consistent
