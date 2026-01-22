# React & Next.js Rules

## Next.js App Router

### Server Components vs Client Components

- Use Server Components by default
- Use "use client" only when client-side interaction is needed:
  - Event handlers (onClick, onChange, etc.)
  - State management (useState, useReducer)
  - Browser API usage (localStorage, window, etc.)
  - useEffect, useLayoutEffect usage

### File Structure

- Pages: page.tsx in app/ directory
- Layout: layout.tsx
- Loading: loading.tsx
- Error: error.tsx
- API routes: route.ts in app/api/ directory

### Data Fetching

- Fetch data directly in Server Components

  ```typescript
  // app/travel/page.tsx
  export default async function TravelPage() {
    const courses = await getTravelCourses()
    return <TravelPageClient courses={courses} />
  }
  ```

- Client Components receive data via props
  ```typescript
  "use client"
  export function TravelPageClient({ courses }: { courses: TravelCourse[] }) {
    // client logic
  }
  ```

## React Components

### Component Structure

1. "use client" directive (if needed)
2. Import statements
3. Type definitions
4. Component function
5. Export

### Props Types

- Define Props types with interface

  ```typescript
  interface TravelSidebarProps {
    courses: TravelCourse[]
    selectedCourse: TravelCourse | null
    onCourseSelect: (course: TravelCourse) => void
  }

  export function TravelSidebar({ courses, selectedCourse, onCourseSelect }: TravelSidebarProps) {
    // implementation
  }
  ```

### Hook Usage Rules

- Hooks must be called at the top level of function components
- Never call hooks inside conditions, loops, or nested functions
- Custom hooks must use "use" prefix

### State Management

- Local state: useState
- Complex state: useReducer
- Server state: Direct fetch or SWR/React Query (if needed)
- Global state: Context API (only when necessary)

### Event Handlers

- Inline arrow functions are acceptable (when no performance issue)
- Extract complex logic to separate functions
  ```typescript
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // logic
  }
  ```

## Performance Optimization

### Server Component Optimization

- Use React.cache() for request-level deduplication
  ```typescript
  import { cache } from "react"
  
  const getCachedData = cache(async (id: string) => {
    // This will be deduplicated per request
    return await fetchData(id)
  })
  ```

- Parallel data fetching with Promise.all
  ```typescript
  const [data1, data2, data3] = await Promise.all([
    fetchData1(),
    fetchData2(),
    fetchData3(),
  ])
  ```

- Batch queries to avoid N+1 problem
  ```typescript
  // ❌ Bad: N+1 queries
  const results = await Promise.all(items.map(item => fetchItemDetails(item.id)))
  
  // ✅ Good: Single batch query
  const allDetails = await fetchBatchDetails(items.map(item => item.id))
  ```

### Memoization

- React.memo: For components with infrequently changing props
  ```typescript
  export const MyComponent = memo(function MyComponent({ data }: Props) {
    // Component implementation
  })
  ```

- useMemo: For expensive computed values
  ```typescript
  const filteredItems = useMemo(() => {
    return items.filter(item => item.category === selectedCategory)
  }, [items, selectedCategory])
  ```

- useCallback: For functions passed to child components
  ```typescript
  const handleClick = useCallback((id: string) => {
    // Handler logic
  }, [dependencies])
  ```

### Code Splitting

- Use dynamic import for heavy components
  ```typescript
  const NaverMapView = dynamic(() => import("@/components/shared/naver-map-view"), {
    ssr: false,
  })
  ```

- Conditional module loading
  ```typescript
  const HeavyComponent = dynamic(() => import("./heavy-component"), {
    loading: () => <Skeleton />,
  })
  ```

### Image Optimization

- Use next/image

  ```typescript
  import Image from "next/image"

  <Image src={url} alt={alt} fill className="object-cover" />
  ```

## Form Handling

### Controlled Components

- Manage form state with useState
- Update state with onChange handlers
- Validate and submit in onSubmit

### Error Handling

- Distinguish between form-level and field-level errors
- Display user-friendly error messages

## Routing

### Navigation

- Use useRouter, usePathname from next/navigation

  ```typescript
  import { useRouter } from "next/navigation"

  const router = useRouter()
  router.push("/travel")
  ```

### Dynamic Routes

- Use [id] folder structure
- Receive params as async (Next.js 15+)
  ```typescript
  export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    // implementation
  }
  ```
