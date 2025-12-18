# Testing Rules

## Testing Tools

### Vitest

- Use Jest-compatible API
- Test files: _.test.ts, _.test.tsx
- Configuration: vitest.config.ts

### MSW (Mock Service Worker)

- Use for API mocking
- Supports both browser and Node.js environments
- Define handlers in handlers.ts

## Test File Location

### Option 1: **tests** Folder

```
services/
├── __tests__/
│   └── travel-service.test.ts
└── travel-service.ts
```

### Option 2: Next to File

```
services/
├── travel-service.ts
└── travel-service.test.ts
```

## Test Structure

### Basic Structure

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest"
import { travelService } from "../travel-service"

describe("travelService", () => {
  beforeEach(() => {
    // Initialize before each test
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

    it("should handle errors appropriately", async () => {
      // test implementation
    })
  })
})
```

### Test Case Naming

- Write clearly in Korean
- Use "~해야 함" format
- Given-When-Then pattern (Arrange-Act-Assert)

## Mock Usage

### Supabase Mock

```typescript
import { vi } from "vitest"

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

### MSW Handlers

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

## Test Coverage

### Priority

1. Service logic (packages/\*/services)
2. Utility functions
3. Complex component logic
4. API routes

### Coverage Goals

- Service functions: 80%+
- Utility functions: 90%+
- Components: Focus on main logic

## Component Testing

### React Testing Library

```typescript
import { render, screen, fireEvent } from "@testing-library/react"
import { TravelSidebar } from "../travel-sidebar"

describe("TravelSidebar", () => {
  it("should display course list", () => {
    const courses = [
      { id: "1", title: "제주도 여행" },
    ]

    render(<TravelSidebar courses={courses} />)

    expect(screen.getByText("제주도 여행")).toBeInTheDocument()
  })
})
```

### User Interaction Testing

- Test from user perspective
- Find elements by text, role, label
- Simulate actual user behavior

## E2E Testing

### Cypress

- Test files in e2e/ directory
- Test actual user scenarios
- Use API mocking or test data

## Test Data

### Fixture Usage

- Manage test data as fixtures
- Create reusable mock data
- Match actual data structure

### Example

```typescript
// __tests__/fixtures/travel-plans.ts
export const mockTravelPlan = {
  id: "plan-1",
  title: "제주도 여행",
  destination: "제주",
  user_id: "user-1",
  // ...
} as const
```

## Test Execution

### Commands

- `pnpm test`: Run all tests
- `pnpm test:ui`: Run in UI mode
- `pnpm test:watch`: Watch mode

### CI/CD

- All tests must pass before deployment
- Stop build on test failure
