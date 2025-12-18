# Supabase Rules

## Client Usage Patterns

### Client-Side Client

```typescript
// For client components and hooks
import { createClient } from "@lovetrip/api/supabase/client"

const supabase = createClient()
```

**When to use:**
- Client Components ("use client")
- Custom hooks
- Browser-only operations
- Uses browser cookies for authentication

### Server-Side Client

```typescript
// For API routes and Server Components
import { createClient } from "@lovetrip/api/supabase/server"

const supabase = await createClient()
```

**When to use:**
- API routes (route.ts)
- Server Components
- Server-side operations
- Uses server-side session

### Service Role Client

```typescript
// For admin operations that bypass RLS
import { createServiceClient } from "@lovetrip/api/supabase/server"

const supabase = createServiceClient()
```

**When to use:**
- Server-side operations that need to bypass RLS
- Admin operations
- Background jobs
- System-level operations

**⚠️ Warning:** Only use when absolutely necessary. Prefer RLS policies for security.

## Row Level Security (RLS)

### RLS Policy Patterns

#### SELECT Policy (Read)

```sql
-- Users can read their own data
CREATE POLICY "Users can read own data"
ON public.table_name
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can read public data
CREATE POLICY "Public data is readable"
ON public.table_name
FOR SELECT
TO authenticated
USING (is_public = true);
```

#### INSERT Policy (Create)

```sql
-- Users can create their own records
CREATE POLICY "Users can create own records"
ON public.table_name
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

#### UPDATE Policy

```sql
-- Users can update their own data
CREATE POLICY "Users can update own data"
ON public.table_name
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

#### DELETE Policy

```sql
-- Users can delete their own data
CREATE POLICY "Users can delete own data"
ON public.table_name
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

### RLS Best Practices

1. **Always enable RLS** on tables with user data
2. **Test policies** with different user roles
3. **Use service role client** only when necessary
4. **Document policy logic** in migration files
5. **Review policies** during security audits

## Authentication Patterns

### Check Authentication

```typescript
// In API routes
const supabase = await createClient()
const {
  data: { user },
} = await supabase.auth.getUser()

if (!user) {
  return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
}
```

### Get User ID

```typescript
const {
  data: { user },
} = await supabase.auth.getUser()

const userId = user?.id
```

### Session Management

```typescript
// Client-side session check
const {
  data: { session },
} = await supabase.auth.getSession()

if (!session) {
  // Redirect to login
}
```

## Real-time Subscriptions

### Subscribe to Changes

```typescript
"use client"

import { useEffect } from "react"
import { createClient } from "@lovetrip/api/supabase/client"

const supabase = createClient()

useEffect(() => {
  const channel = supabase
    .channel("table-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "table_name",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        console.log("Change received!", payload)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [userId])
```

### Cleanup Subscriptions

- Always unsubscribe in useEffect cleanup
- Remove channels when component unmounts
- Avoid memory leaks

## Query Patterns

### Basic Select

```typescript
const { data, error } = await supabase
  .from("table_name")
  .select("*")
  .eq("user_id", userId)
```

### Select with Relations

```typescript
const { data, error } = await supabase
  .from("travel_plans")
  .select(`
    *,
    places:travel_plan_places(
      place:places(*)
    )
  `)
```

### Insert with Return

```typescript
const { data, error } = await supabase
  .from("table_name")
  .insert({ ...input })
  .select()
  .single()
```

### Update

```typescript
const { data, error } = await supabase
  .from("table_name")
  .update({ ...updates })
  .eq("id", id)
  .select()
  .single()
```

### Delete

```typescript
const { error } = await supabase
  .from("table_name")
  .delete()
  .eq("id", id)
```

## Error Handling

### Supabase Error Pattern

```typescript
const { data, error } = await supabase.from("table").select("*")

if (error) {
  console.error("Supabase error:", error)
  throw error // Let caller handle
}
```

### Common Error Codes

- `PGRST116`: Not found
- `23505`: Unique constraint violation
- `23503`: Foreign key violation
- `42501`: RLS policy violation

### Error Messages

- Always provide user-friendly error messages in Korean
- Log detailed errors server-side
- Don't expose internal error details to clients

## Type Safety

### Database Types

```typescript
import type { Database } from "@lovetrip/shared/types/database"

type TravelPlan = Database["public"]["Tables"]["travel_plans"]["Row"]
type TravelPlanInsert = Database["public"]["Tables"]["travel_plans"]["Insert"]
type TravelPlanUpdate = Database["public"]["Tables"]["travel_plans"]["Update"]
```

### Type-Safe Queries

```typescript
const { data, error } = await supabase
  .from("travel_plans")
  .select("*")
  .eq("user_id", userId)
  .returns<TravelPlan[]>()
```

## Best Practices

1. **Use appropriate client** (client vs server vs service)
2. **Enable RLS** on all user tables
3. **Handle errors** consistently
4. **Use types** from Database schema
5. **Clean up subscriptions** properly
6. **Validate input** before database operations
7. **Use transactions** for related operations
8. **Index frequently queried columns**
9. **Monitor query performance**
10. **Document complex queries**
