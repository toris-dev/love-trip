# Architecture Rules

## Feature-Sliced Design (FSD)

### Component Structure

```
apps/web/src/components/
├── features/          # Feature-specific components
│   ├── home/
│   ├── travel/
│   ├── calendar/
│   └── profile/
├── layout/            # Layout components
│   ├── header.tsx
│   └── footer.tsx
└── shared/            # Shared components
    ├── naver-map-view.tsx
    └── location-input.tsx
```

### Feature Component Structure

```
features/{feature}/
├── {feature}-page-client.tsx    # Page client component
├── components/                   # Feature-specific components
│   ├── {feature}-sidebar.tsx
│   └── {feature}-card.tsx
├── hooks/                        # Feature-specific hooks
│   └── use-{feature}.ts
└── types.ts                      # Feature types
```

## Domain-Driven Design (DDD)

### Domain Package Separation

- user: User authentication, profile
- couple: Couple features, calendar
- planner: Travel planning, courses
- expense: Budget, expenses, settlement
- recommendation: Recommendation algorithms
- subscription: Subscription management
- gamification: Gamification

### Layer Separation

#### Presentation Layer (apps/web)

- UI rendering
- User interaction handling
- Client-side state management
- Routing

#### Domain Layer (packages/\*/services)

- Business logic
- Domain rules
- Write as pure functions
- Minimize side effects

#### Data Layer (packages/api)

- Data access
- Supabase client
- API routes (Next.js)

### Service Pattern

#### Service Structure

```typescript
// packages/planner/services/travel-service.ts
import { createClient } from "@lovetrip/api/supabase/client"
import type { Database } from "@lovetrip/shared/types/database"

type TravelPlan = Database["public"]["Tables"]["travel_plans"]["Row"]

export const travelService = {
  async getTravelPlans(userId: string): Promise<TravelPlan[]> {
    const supabase = createClient()
    const { data, error } = await supabase.from("travel_plans").select("*").eq("user_id", userId)

    if (error) throw error
    return data || []
  },
}
```

#### Error Handling

- Service functions throw errors
- Callers handle with try-catch
- Convert to user-friendly error messages

#### Type Safety

- Use Database types
- Explicit type definitions in function signatures
- Explicit return types

## Component Design

### Component Separation Principles

- Single responsibility principle
- Reusable components in shared/ or packages/ui
- Feature-specific components in features/
- Layout components in layout/

### Props Design

- Pass only necessary props
- Define complex objects as types
- Use ? for optional props
- Use default parameters for default values

### State Management

- Local state: useState
- Server state: Fetch in Server Components
- Global state: Context API (only when necessary)
- Form state: useState or react-hook-form

## API Route Pattern

### Route Handler Structure

```typescript
// app/api/travel-plans/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"

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
    // implement logic

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

### Error Handling

- Authentication error: 401
- Authorization error: 403
- Validation error: 400
- Server error: 500
- Error messages in Korean

## Data Flow

### Client → Server

1. User action
2. React component
3. Custom Hook / Service
4. API Route (Next.js)
5. Supabase Client
6. Database

### Server → Client

1. Database
2. Supabase (Realtime)
3. API Route
4. React Component
5. UI Update

## File Structure Rules

### Page Files

- app/{route}/page.tsx: Server Component
- components/features/{feature}/{feature}-page-client.tsx: Client Component

### API Routes

- app/api/{route}/route.ts: Route Handler

### Components

- PascalCase file names
- Group by feature in features/ folder

### Services

- kebab-case file names
- packages/{domain}/services/ directory
