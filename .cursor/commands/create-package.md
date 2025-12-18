# Create Package Guide

Use this command to create a new package in the monorepo following project conventions.

## Package Structure

### Basic Package Structure

```
packages/{package-name}/
├── package.json
├── tsconfig.json
├── eslint.config.mjs
├── index.ts
├── services/
│   ├── index.ts
│   └── {package-name}-service.ts
├── components/
│   └── index.ts
├── hooks/
│   └── index.ts
└── types/
    └── index.ts
```

## Step-by-Step Process

### 1. Create Package Directory

```bash
mkdir -p packages/{package-name}
cd packages/{package-name}
```

### 2. Create package.json

```json
{
  "name": "@lovetrip/{package-name}",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./index.ts",
  "types": "./index.ts",
  "exports": {
    ".": "./index.ts",
    "./services": "./services/index.ts",
    "./components": "./components/index.ts",
    "./hooks": "./hooks/index.ts",
    "./types": "./types/index.ts"
  },
  "scripts": {
    "lint": "eslint .",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@lovetrip/shared": "workspace:*",
    "@lovetrip/api": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
```

### 3. Create tsconfig.json

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": ".",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.test.tsx"]
}
```

### 4. Create eslint.config.mjs

```javascript
import baseConfig from "../../eslint.config.mjs"

export default [
  ...baseConfig,
  {
    ignores: ["dist/**", "**/*.test.ts", "**/*.test.tsx"],
  },
]
```

### 5. Create index.ts

```typescript
// Main entry point
export * from "./services"
export * from "./components"
export * from "./hooks"
export * from "./types"
```

### 6. Create Services

```typescript
// services/{package-name}-service.ts
import { createClient } from "@lovetrip/api/supabase/client"
import type { Database } from "@lovetrip/shared/types/database"

type Entity = Database["public"]["Tables"]["{table}"]["Row"]

export const packageService = {
  async getEntity(id: string): Promise<Entity | null> {
    const supabase = createClient()
    const { data, error } = await supabase.from("{table}").select("*").eq("id", id).single()

    if (error) throw error
    return data
  },
}
```

```typescript
// services/index.ts
export * from "./{package-name}-service"
```

### 7. Create Types

```typescript
// types/index.ts
import type { Database } from "@lovetrip/shared/types/database"

export type Entity = Database["public"]["Tables"]["{table}"]["Row"]
export type EntityInsert = Database["public"]["Tables"]["{table}"]["Insert"]
export type EntityUpdate = Database["public"]["Tables"]["{table}"]["Update"]

export interface CustomType {
  id: string
  // ...
}
```

### 8. Create Components (if needed)

```typescript
// components/{component-name}.tsx
"use client"

import { Button } from "@lovetrip/ui/components"

interface ComponentProps {
  title: string
}

export function Component({ title }: ComponentProps) {
  return <div>{title}</div>
}
```

```typescript
// components/index.ts
export * from "./{component-name}"
```

### 9. Create Hooks (if needed)

```typescript
// hooks/use-{hook-name}.ts
"use client"

import { useState, useEffect } from "react"

export function useHook() {
  const [state, setState] = useState()

  useEffect(() => {
    // Hook logic
  }, [])

  return { state, setState }
}
```

```typescript
// hooks/index.ts
export * from "./use-{hook-name}"
```

## Package Naming

### Domain Packages

- `@lovetrip/user` - User authentication and profile
- `@lovetrip/couple` - Couple features
- `@lovetrip/planner` - Travel planning
- `@lovetrip/expense` - Budget and expenses
- `@lovetrip/recommendation` - Recommendation algorithms
- `@lovetrip/subscription` - Subscription management
- `@lovetrip/gamification` - Gamification features

### Shared Packages

- `@lovetrip/ui` - UI components
- `@lovetrip/api` - API clients
- `@lovetrip/shared` - Common types and utilities

## Dependencies

### Internal Dependencies

```json
{
  "dependencies": {
    "@lovetrip/shared": "workspace:*",
    "@lovetrip/api": "workspace:*",
    "@lovetrip/ui": "workspace:*"
  }
}
```

### External Dependencies

- Add only necessary dependencies
- Check if dependency is already in root package.json
- Use exact versions for critical dependencies

## Testing

### Test File Structure

```
packages/{package-name}/
├── services/
│   ├── __tests__/
│   │   └── {package-name}-service.test.ts
│   └── {package-name}-service.ts
```

### Test Example

```typescript
// services/__tests__/{package-name}-service.test.ts
import { describe, it, expect } from "vitest"
import { packageService } from "../{package-name}-service"

describe("packageService", () => {
  it("should get entity", async () => {
    // Test implementation
  })
})
```

## Usage in Apps

### Import in apps/web

```typescript
// In apps/web
import { packageService } from "@lovetrip/{package-name}"
import type { Entity } from "@lovetrip/{package-name}/types"
```

### Add to apps/web/package.json

```json
{
  "dependencies": {
    "@lovetrip/{package-name}": "workspace:*"
  }
}
```

## Checklist

- [ ] Package directory created
- [ ] package.json created with correct name
- [ ] tsconfig.json extends root config
- [ ] eslint.config.mjs created
- [ ] index.ts exports all modules
- [ ] Services created (if needed)
- [ ] Types defined
- [ ] Components created (if needed)
- [ ] Hooks created (if needed)
- [ ] Tests written
- [ ] Package added to apps/web dependencies
- [ ] Run `pnpm install` to link packages
- [ ] Verify imports work correctly

## Common Patterns

### Service-Only Package

```
packages/{package-name}/
├── services/
│   ├── index.ts
│   └── {package-name}-service.ts
└── types/
    └── index.ts
```

### Component Package

```
packages/{package-name}/
├── components/
│   ├── index.ts
│   └── {component-name}.tsx
└── hooks/
    └── index.ts
```

### Full-Featured Package

```
packages/{package-name}/
├── services/
├── components/
├── hooks/
└── types/
```
