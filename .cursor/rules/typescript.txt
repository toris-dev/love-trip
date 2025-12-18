# TypeScript Rules

## Type Safety

### Basic Principles
- Define types explicitly
- Minimize use of `any` (ESLint warns on usage)
- Omit types only when inference is clear
- Use `unknown` instead of `any` when type guards are needed

### Type Definition Patterns

#### Interface vs Type Alias
- Interface: For object type definitions
  ```typescript
  interface UserProfile {
    id: string
    email: string
    nickname?: string
  }
  ```

- Type alias: For union, intersection, and complex types
  ```typescript
  type Status = "pending" | "completed" | "failed"
  type UserWithProfile = User & { profile: UserProfile }
  ```

#### Generics
- Use generics for reusable type definitions
  ```typescript
  interface ApiResponse<T> {
    data: T
    error?: string
  }
  ```

#### Type Guards
- Write type guard functions for type narrowing
  ```typescript
  function isUser(obj: unknown): obj is User {
    return typeof obj === "object" && obj !== null && "id" in obj
  }
  ```

## Database Types

### Supabase Type Usage
- Import Database types from @lovetrip/shared/types/database
  ```typescript
  import type { Database } from "@lovetrip/shared/types/database"
  
  type Place = Database["public"]["Tables"]["places"]["Row"]
  type TravelPlan = Database["public"]["Tables"]["travel_plans"]["Row"]
  ```

### Type Extensions
- Use intersection types when extending Database types
  ```typescript
  type PlaceWithDistance = Place & { distance: number }
  ```

## Function Types

### Function Signatures
- Define explicit parameter and return types
  ```typescript
  function calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    // implementation
  }
  ```

### Async Functions
- Explicitly specify Promise return types
  ```typescript
  async function fetchPlaces(): Promise<Place[]> {
    // implementation
  }
  ```

## Error Handling

### Error Types
- Use custom error classes or define error object types
  ```typescript
  type ApiError = {
    message: string
    code: string
    statusCode: number
  }
  ```

## Utility Types

### Commonly Used Utility Types
- `Partial<T>`: Make all properties optional
- `Pick<T, K>`: Select specific properties
- `Omit<T, K>`: Exclude specific properties
- `Required<T>`: Make all properties required

## Type Imports

### Internal Packages
- Use @lovetrip/* format for imports
  ```typescript
  import type { Place } from "@lovetrip/shared/types"
  import { Button } from "@lovetrip/ui/components"
  ```

### External Libraries
- Use `import type` when only types are needed
  ```typescript
  import type { NextRequest } from "next/server"
  ```
