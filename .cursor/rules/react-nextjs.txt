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

### Memoization

- React.memo: For components with infrequently changing props
- useMemo: For expensive computed values
- useCallback: For functions passed to child components

### Code Splitting

- Use dynamic import
  ```typescript
  const NaverMapView = dynamic(() => import("@/components/shared/naver-map-view"), {
    ssr: false,
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
