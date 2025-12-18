# Styling Rules

## Tailwind CSS

### Basic Usage

- Apply styles via className prop
- Minimize inline styles
- Define custom styles in globals.css

### Class Order

- Layout → Style → State order
  ```tsx
  <div className="flex items-center gap-2 p-4 bg-primary text-white hover:bg-primary/90">
  ```

### Responsive Design

- Mobile-first approach
- Use sm:, md:, lg: breakpoints
  ```tsx
  <div className="w-full md:w-1/2 lg:w-1/3">
  ```

## Component Styling

### UI Component Usage

- Prefer components from @lovetrip/ui package
  ```tsx
  import { Button, Card, Input } from "@lovetrip/ui/components"
  ```

### Custom Styles

- Use Tailwind utility classes
- Use separate CSS modules or styled-components for complex styles (if needed)

### Conditional Styles

- Use clsx or cn utility

  ```tsx
  import { cn } from "@/lib/utils"

  <div className={cn(
    "base-classes",
    condition && "conditional-classes",
    className
  )}>
  ```

## Dark Mode

### Theme Provider

- Use theme-provider component
- Support system theme detection

### Dark Mode Styles

- Use dark: prefix
  ```tsx
  <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  ```

## Responsive Design

### Breakpoints

- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

### Mobile First

- Base styles for mobile
- Add larger screen styles with md:, lg:, etc.

### Touch Friendly

- Minimum button size: 44x44px
- Ensure sufficient touch area

## Animation

### Framer Motion

- Use for complex animations

  ```tsx
  import { motion } from "framer-motion"

  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
  ```

### CSS Transitions

- Use Tailwind transition for simple transitions
  ```tsx
  <div className="transition-all duration-200 hover:scale-105">
  ```

## Accessibility

### Color Contrast

- Follow WCAG AA standards (4.5:1 minimum)
- Verify text and background color contrast

### Focus Indicators

- All interactive elements must have focus styles
  ```tsx
  <button className="focus:outline-none focus:ring-2 focus:ring-primary">
  ```

### Semantic HTML

- Use appropriate HTML tags
- Use aria-label, aria-describedby when needed

## Images

### Next.js Image

- Use next/image
- Alt text required
- Specify appropriate size (width, height, or fill)

### Loading States

- Display skeleton UI while images load
- Use blur placeholder

## Icons

### Lucide React

- Use lucide-react package
- Consistent icon style

  ```tsx
  import { MapPin, Heart, Calendar } from "lucide-react"

  ;<MapPin className="h-4 w-4 text-primary" />
  ```

## Layout

### Flexbox & Grid

- Use Tailwind flex, grid utilities
- Use CSS Grid for complex layouts

### Spacing

- Maintain consistency in gap, padding, margin
- Use Tailwind spacing scale (0.5, 1, 2, 4, 8, 16...)

## Color System

### Primary Color

- Brand main color
- Used for buttons, links, emphasis elements

### Semantic Colors

- success, error, warning, info
- Used for status indicators

### Neutral Colors

- Text, background, borders
- Use gray scale
