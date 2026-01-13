# Security Rules

## Authentication

### Always Check Authentication

```typescript
// In API routes
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

### Client-Side Auth Check

```typescript
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@lovetrip/api/supabase/client"

export function ProtectedComponent() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])
}
```

## Authorization

### Resource Ownership Check

```typescript
// In API routes
const resource = await service.getResource(id)

if (resource.user_id !== user.id) {
  return NextResponse.json(
    { error: "권한이 없습니다" },
    { status: 403 }
  )
}
```

### Role-Based Access

```typescript
// Check user role
const {
  data: { user },
} = await supabase.auth.getUser()

const userRole = user?.user_metadata?.role

if (userRole !== "admin") {
  return NextResponse.json(
    { error: "관리자 권한이 필요합니다" },
    { status: 403 }
  )
}
```

## Input Validation

### Validate All User Input

```typescript
function validateInput(input: unknown): ValidInput {
  if (!input || typeof input !== "object") {
    throw new ValidationError("Invalid input")
  }

  const obj = input as Record<string, unknown>

  // Type checks
  if (typeof obj.title !== "string") {
    throw new ValidationError("Title must be a string")
  }

  // Length checks
  if (obj.title.length > 100) {
    throw new ValidationError("Title must be 100 characters or less")
  }

  // Format checks
  if (!/^[a-zA-Z0-9\s]+$/.test(obj.title)) {
    throw new ValidationError("Title contains invalid characters")
  }

  return obj as ValidInput
}
```

### Sanitize User Input

```typescript
// Remove potentially dangerous characters
function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove HTML brackets
    .slice(0, 1000) // Limit length
}
```

## SQL Injection Prevention

### Use Supabase Client (Automatic Protection)

```typescript
// ✅ Safe - Supabase handles parameterization
const { data } = await supabase
  .from("table")
  .select("*")
  .eq("id", userId) // Automatically parameterized
```

### Never Use Raw SQL with User Input

```typescript
// ❌ NEVER DO THIS
const query = `SELECT * FROM table WHERE id = '${userId}'`

// ✅ Use Supabase client methods
const { data } = await supabase
  .from("table")
  .select("*")
  .eq("id", userId)
```

## XSS Prevention

### Sanitize HTML Content

```typescript
// Use libraries like DOMPurify for HTML content
import DOMPurify from "isomorphic-dompurify"

const sanitized = DOMPurify.sanitize(userInput)
```

### React's Built-in Protection

```typescript
// React automatically escapes content
<div>{userInput}</div> // Safe

// ⚠️ Dangerous - only use with sanitized content
<div dangerouslySetInnerHTML={{ __html: sanitized }} />
```

## CSRF Protection

### Next.js Built-in Protection

- Next.js API routes are protected by default
- Use SameSite cookies for authentication
- Verify origin for sensitive operations

## Environment Variables

### Never Commit Secrets

```typescript
// ✅ Use environment variables
const apiKey = process.env.NEXT_PUBLIC_API_KEY

// ❌ Never hardcode secrets
const apiKey = "secret-key-123"
```

### Environment Variable Naming

- `NEXT_PUBLIC_*`: Exposed to client (safe for public keys)
- No prefix: Server-only (never exposed to client)

### Access Control

```typescript
// Server-only variables
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Public variables (safe to expose)
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## Row Level Security (RLS)

### Always Enable RLS

```sql
-- Enable RLS on all user tables
ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;
```

### Write Secure Policies

```sql
-- Users can only access their own data
CREATE POLICY "Users access own data"
ON public.table_name
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### Test RLS Policies

- Test with different user accounts
- Verify policies work as expected
- Don't rely on client-side checks alone

## Sensitive Data

### Never Expose Sensitive Data

```typescript
// ❌ Don't expose service role key
const response = {
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY, // NEVER
}

// ✅ Only return necessary data
const response = {
  id: resource.id,
  title: resource.title,
  // Don't include sensitive fields
}
```

### Hash Passwords

- Supabase handles password hashing automatically
- Never store plain text passwords
- Use secure password requirements

## API Security

### Rate Limiting

```typescript
// Implement rate limiting for API routes
// Use middleware or external service
```

### CORS Configuration

```typescript
// Configure CORS in next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "https://yourdomain.com" },
        ],
      },
    ]
  },
}
```

## Error Messages

### Don't Expose Internal Details

```typescript
// ❌ Exposes internal structure
return NextResponse.json(
  { error: `Database error: ${error.code} at ${error.file}:${error.line}` },
  { status: 500 }
)

// ✅ Generic user-friendly message
return NextResponse.json(
  { error: "오류가 발생했습니다" },
  { status: 500 }
)

// Log detailed error server-side
console.error("Internal error:", error)
```

## Best Practices

1. **Always authenticate** before sensitive operations
2. **Check authorization** for resource access
3. **Validate all input** from users
4. **Use RLS policies** for database security
5. **Never expose secrets** in client code
6. **Sanitize user input** before display
7. **Use HTTPS** in production
8. **Keep dependencies updated** (security patches)
9. **Review code** for security vulnerabilities
10. **Test security** regularly
