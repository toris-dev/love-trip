# Create Component Guide

Use this command to scaffold a new React component following project conventions.

## Component Structure

### Basic Component

```typescript
"use client" // Only if needed

import { useState } from "react"
import { Button } from "@lovetrip/ui/components"
import type { ComponentProps } from "./types"

interface ComponentProps {
  title: string
  description?: string
  onAction?: () => void
}

export function Component({
  title,
  description,
  onAction,
}: ComponentProps) {
  const [state, setState] = useState(false)

  return (
    <div className="p-4">
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {onAction && <Button onClick={onAction}>Action</Button>}
    </div>
  )
}
```

## Component Location

### Feature Component

- Location: `apps/web/src/components/features/{feature}/components/`
- Use when: Component is specific to a feature

### Shared Component

- Location: `apps/web/src/components/shared/`
- Use when: Component is used across multiple features

### UI Component

- Location: `packages/ui/components/`
- Use when: Component is reusable across projects

## Props Design

### Interface Definition

```typescript
interface ComponentProps {
  // Required props
  id: string
  title: string

  // Optional props
  description?: string
  className?: string

  // Event handlers
  onClick?: () => void
  onChange?: (value: string) => void

  // Children
  children?: React.ReactNode
}
```

### Default Values

```typescript
export function Component({
  title,
  description = "Default description",
  variant = "default",
}: ComponentProps) {
  // Implementation
}
```

## State Management

### Local State

```typescript
const [isOpen, setIsOpen] = useState(false)
const [value, setValue] = useState("")
```

### Derived State

```typescript
const isDisabled = !value || isLoading
```

## Event Handlers

### Inline Handlers

```typescript
<Button onClick={() => handleClick(id)}>Click</Button>
```

### Extracted Handlers

```typescript
const handleClick = (id: string) => {
  // Complex logic
}

<Button onClick={() => handleClick(id)}>Click</Button>
```

## Styling

### Tailwind Classes

```typescript
<div className="flex items-center gap-2 p-4 bg-primary text-white">
```

### Conditional Classes

```typescript
import { cn } from "@/lib/utils"

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  className
)}>
```

## Accessibility

### Semantic HTML

```typescript
<button type="button" onClick={handleClick}>
  Click me
</button>
```

### ARIA Attributes

```typescript
<button
  aria-label="Close dialog"
  aria-expanded={isOpen}
  onClick={handleToggle}
>
```

### Keyboard Navigation

```typescript
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === "Enter" || e.key === " ") {
    handleClick()
  }
}
```

## Storybook Story (for UI components)

```typescript
// packages/ui/components/component.stories.tsx
import type { Meta, StoryObj } from "@storybook/react"
import { Component } from "./component"

const meta: Meta<typeof Component> = {
  title: "Components/Component",
  component: Component,
}

export default meta
type Story = StoryObj<typeof Component>

export const Default: Story = {
  args: {
    title: "Example Title",
    description: "Example description",
  },
}
```

## Checklist

- [ ] Component file created with PascalCase name
- [ ] Props interface defined
- [ ] "use client" added if needed
- [ ] Imports from @lovetrip/ui/components
- [ ] Tailwind classes used for styling
- [ ] Accessibility considerations (semantic HTML, ARIA)
- [ ] Error handling (if needed)
- [ ] Loading states (if needed)
- [ ] Storybook story (for UI components)
- [ ] Exported from index.ts (if in package)
