# Refactor Service Guide

Use this command to refactor service functions following best practices.

## Service Pattern

### Structure

```typescript
// packages/{domain}/services/{domain}-service.ts
import { createClient } from "@lovetrip/api/supabase/client"
import type { Database } from "@lovetrip/shared/types/database"

type Entity = Database["public"]["Tables"]["{table}"]["Row"]

export const domainService = {
  async getEntity(id: string): Promise<Entity | null> {
    const supabase = createClient()
    const { data, error } = await supabase.from("{table}").select("*").eq("id", id).single()

    if (error) throw error
    return data
  },

  async createEntity(input: CreateEntityInput): Promise<Entity> {
    const supabase = createClient()
    const { data, error } = await supabase.from("{table}").insert(input).select().single()

    if (error) throw error
    return data
  },
}
```

## Principles

### 1. Pure Functions

- Minimize side effects
- Functions should be testable
- Same input → same output

### 2. Error Handling

- Throw errors, don't return error objects
- Let callers handle errors
- Use try-catch in API routes/components

### 3. Type Safety

- Use Database types
- Define input/output types explicitly
- Use generics for reusable functions

### 4. Single Responsibility

- Each function does one thing
- Break complex operations into smaller functions

## Refactoring Steps

### 1. Identify Issues

- Long functions → break into smaller ones
- Duplicated code → extract to shared function
- Missing types → add type definitions
- Poor error handling → improve error handling

### 2. Extract Types

```typescript
// types.ts
export interface CreateEntityInput {
  name: string
  description?: string
}

export interface UpdateEntityInput {
  id: string
  name?: string
  description?: string
}
```

### 3. Refactor Functions

- Extract common logic
- Use helper functions
- Improve error messages
- Add validation

### 4. Add Tests

- Test happy path
- Test error cases
- Test edge cases

## Supabase Client Usage

### Client-Side Service

```typescript
import { createClient } from "@lovetrip/api/supabase/client"

const supabase = createClient()
```

### Server-Side Service

```typescript
import { createClient } from "@lovetrip/api/supabase/server"

const supabase = await createClient()
```

## Transaction Handling

### Multiple Operations

```typescript
async function createWithRelations(input: CreateInput) {
  const supabase = createClient()

  // Use Supabase transactions or handle manually
  const { data: main, error: mainError } = await supabase
    .from("main_table")
    .insert(input.main)
    .select()
    .single()

  if (mainError) throw mainError

  const { error: relationError } = await supabase
    .from("relation_table")
    .insert(input.relations.map(r => ({ ...r, main_id: main.id })))

  if (relationError) throw relationError

  return main
}
```

## Validation

### Input Validation

```typescript
function validateCreateInput(input: unknown): CreateInput {
  if (!input || typeof input !== "object") {
    throw new Error("Invalid input")
  }

  if (!("name" in input) || typeof input.name !== "string") {
    throw new Error("Name is required")
  }

  return input as CreateInput
}
```

## Best Practices

1. **Type First**: Define types before implementation
2. **Error Messages**: Provide clear, actionable error messages
3. **Documentation**: Add JSDoc comments for complex functions
4. **Testing**: Write tests for all service functions
5. **Consistency**: Follow existing patterns in the codebase
