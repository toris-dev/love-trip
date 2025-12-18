# Write Tests Guide

Use this command to generate comprehensive test files following project conventions.

## Test File Structure

### Service Tests

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest"
import { travelService } from "../travel-service"

describe("travelService", () => {
  beforeEach(() => {
    // Setup
  })

  describe("getTravelPlans", () => {
    it("should return user's travel plans", async () => {
      // Arrange
      const userId = "user-123"

      // Act
      const result = await travelService.getTravelPlans(userId)

      // Assert
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })

    it("should handle errors gracefully", async () => {
      // Test error handling
    })
  })
})
```

### Component Tests

```typescript
import { describe, it, expect } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { TravelSidebar } from "../travel-sidebar"

describe("TravelSidebar", () => {
  it("should display course list", () => {
    const courses = [{ id: "1", title: "제주도 여행" }]
    render(<TravelSidebar courses={courses} />)
    expect(screen.getByText("제주도 여행")).toBeInTheDocument()
  })
})
```

## MSW Setup

### Handler Definition

```typescript
// mocks/handlers.ts
import { http, HttpResponse } from "msw"

export const handlers = [
  http.get("/api/travel-plans", () => {
    return HttpResponse.json({
      data: [{ id: "1", title: "제주도 여행" }],
    })
  }),
]
```

### Mock Supabase

```typescript
vi.mock("@lovetrip/api/supabase/client", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      data: [],
      error: null,
    })),
  })),
}))
```

## Test Cases to Include

### Service Functions

- Happy path: Normal operation
- Error cases: Database errors, network errors
- Edge cases: Empty results, null values
- Validation: Invalid input handling

### Components

- Rendering: Component renders correctly
- User interactions: Click, input, form submission
- Props: Different prop combinations
- States: Loading, error, success states

## Test Data

### Fixtures

Create reusable test data:

```typescript
// __tests__/fixtures/travel-plans.ts
export const mockTravelPlan = {
  id: "plan-1",
  title: "제주도 여행",
  destination: "제주",
  user_id: "user-1",
} as const
```

## Best Practices

1. **Arrange-Act-Assert**: Clear test structure
2. **Descriptive Names**: Test names explain what is being tested
3. **Isolation**: Each test is independent
4. **Mock External Dependencies**: Don't hit real APIs or databases
5. **Cover Edge Cases**: Test boundaries and error conditions
6. **Fast Tests**: Tests should run quickly

## Test Location

- Services: `packages/{domain}/services/__tests__/` or next to service file
- Components: `apps/web/src/components/**/__tests__/` or next to component
- API Routes: `apps/web/src/app/api/**/__tests__/`

## Running Tests

- `pnpm test`: Run all tests
- `pnpm test:ui`: Run with UI
- `pnpm test:watch`: Watch mode
