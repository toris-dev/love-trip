# Create Feature Guide

Use this command to scaffold a new feature following the project's architecture.

## Feature Structure

### Files to Create

```
apps/web/src/
├── app/
│   └── {feature}/
│       └── page.tsx                    # Server Component page
└── components/
    └── features/
        └── {feature}/
            ├── {feature}-page-client.tsx    # Client Component
            ├── components/
            │   ├── {feature}-sidebar.tsx
            │   └── {feature}-card.tsx
            ├── hooks/
            │   └── use-{feature}.ts
            └── types.ts
```

### If Domain Package Needed

```
packages/{domain}/
├── services/
│   ├── index.ts
│   └── {domain}-service.ts
├── components/
│   └── index.ts
├── hooks/
│   └── index.ts
├── types/
│   └── index.ts
└── index.ts
```

## Step-by-Step Process

### 1. Determine Feature Scope

- Is it a UI-only feature? → Only in apps/web
- Does it need business logic? → Create domain package
- Does it need API routes? → Create app/api/{feature}/

### 2. Create Page (Server Component)

```typescript
// app/{feature}/page.tsx
import { getFeatureData } from "@/lib/{feature}"
import { FeaturePageClient } from "@/components/features/{feature}/{feature}-page-client"

export default async function FeaturePage() {
  const data = await getFeatureData()
  return <FeaturePageClient initialData={data} />
}
```

### 3. Create Client Component

```typescript
// components/features/{feature}/{feature}-page-client.tsx
"use client"

import { useState } from "react"
import type { FeatureData } from "./types"

interface FeaturePageClientProps {
  initialData: FeatureData
}

export function FeaturePageClient({ initialData }: FeaturePageClientProps) {
  // Client logic
}
```

### 4. Create Types

```typescript
// components/features/{feature}/types.ts
export interface FeatureData {
  id: string
  // ...
}
```

### 5. Create Hooks (if needed)

```typescript
// components/features/{feature}/hooks/use-{feature}.ts
export function useFeature() {
  // Hook logic
}
```

### 6. Create API Route (if needed)

```typescript
// app/api/{feature}/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"

export async function GET(request: NextRequest) {
  // Implementation
}
```

### 7. Create Service (if domain package)

```typescript
// packages/{domain}/services/{domain}-service.ts
import { createClient } from "@lovetrip/api/supabase/client"

export const domainService = {
  async getData(): Promise<Data[]> {
    // Implementation
  },
}
```

## Package Decision Guide

### Create New Package When:

- Feature has complex business logic
- Logic can be reused across features
- Feature is a distinct domain (user, couple, planner, etc.)

### Keep in apps/web When:

- Feature is UI-only
- Feature is specific to web app
- No reusable business logic

## Checklist

- [ ] Page created (app/{feature}/page.tsx)
- [ ] Client component created
- [ ] Types defined
- [ ] Hooks created (if needed)
- [ ] API routes created (if needed)
- [ ] Service created (if domain package)
- [ ] Exports added to index.ts files
- [ ] Imports use @lovetrip/\* format
- [ ] Follows FSD structure
- [ ] Error handling included
