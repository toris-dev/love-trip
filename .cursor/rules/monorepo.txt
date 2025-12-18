# Monorepo Structure Rules

## Package Structure

### Inter-package Dependencies

- Only unidirectional dependencies allowed: apps/web → packages/\*
- Minimize dependencies between packages/\*
- Circular dependencies are prohibited
- packages/shared can be used by all other packages

### Package Exports

- Explicit exports through index.ts
  ```typescript
  // packages/planner/index.ts
  export * from "./services"
  export * from "./components"
  export * from "./types"
  ```

### Internal Package Imports

- Use @lovetrip/\* format
  ```typescript
  import { Button } from "@lovetrip/ui/components"
  import type { Place } from "@lovetrip/shared/types"
  import { createClient } from "@lovetrip/api/supabase/client"
  ```

### Package Versions

- Use pnpm workspace
- Use workspace:\* in package.json
  ```json
  {
    "dependencies": {
      "@lovetrip/ui": "workspace:*",
      "@lovetrip/shared": "workspace:*"
    }
  }
  ```

## Package Roles

### apps/web

- Next.js application
- Uses packages/\* to implement features
- Minimize direct business logic

### packages/ui

- Reusable UI components
- No dependencies on other packages
- Radix UI based components

### packages/shared

- Common types, utilities, constants
- No dependencies on other packages
- Includes Database types

### packages/api

- Supabase client
- External API clients
- Only depends on packages/shared

### packages/\* (Domain Packages)

- Business logic (services/)
- Domain-specific components (components/)
- Domain-specific hooks (hooks/)
- Domain types (types/)
- Can depend on packages/shared, packages/api

## Package Creation Guide

### When Creating New Package

1. Create new folder in packages/ directory
2. Create package.json (name: @lovetrip/{package-name})
3. Create tsconfig.json (extends root tsconfig.json)
4. Create index.ts for exports
5. Automatically included in pnpm-workspace.yaml

### Package Structure Example

```
packages/{domain}/
├── package.json
├── tsconfig.json
├── eslint.config.mjs
├── index.ts
├── services/
│   ├── index.ts
│   └── {domain}-service.ts
├── components/
│   └── index.ts
├── hooks/
│   └── index.ts
└── types/
    └── index.ts
```

## Dependency Management

### External Dependencies

- Add only necessary dependencies to each package's package.json
- Common dependencies in root package.json devDependencies

### Internal Dependencies

- Add only necessary packages as dependencies
- Avoid unnecessary dependencies

## Build and Deployment

### Build Order

- Build packages/\* first
- Build apps/web last

### Type Checking

- Run pnpm type-check from root
- Verify types are correctly linked across packages
