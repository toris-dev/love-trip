/**
 * Design Tokens
 * 
 * 중앙 집중식 디자인 토큰 정의
 * CDD(Component-Driven Development) 패턴을 위한 기초 토큰
 */

// Color Tokens
export const colors = {
  // Semantic Colors
  primary: {
    DEFAULT: "oklch(0.65 0.18 330)", // 핑크 계열
    foreground: "oklch(1 0 0)",
    light: "oklch(0.72 0.15 330)",
    dark: "oklch(0.58 0.18 330)",
  },
  secondary: {
    DEFAULT: "oklch(0.95 0.05 330)", // 연한 핑크
    foreground: "oklch(0.25 0.05 330)",
  },
  accent: {
    DEFAULT: "oklch(0.65 0.18 280)", // 퍼플 계열
    foreground: "oklch(1 0 0)",
  },
  destructive: {
    DEFAULT: "oklch(0.577 0.245 27.325)",
    foreground: "oklch(1 0 0)",
  },
  muted: {
    DEFAULT: "oklch(0.96 0.01 258)",
    foreground: "oklch(0.45 0.02 258)",
  },
  background: {
    DEFAULT: "oklch(1 0 0)",
    card: "oklch(0.98 0.01 258)",
  },
  foreground: {
    DEFAULT: "oklch(0.35 0.02 258)",
  },
  border: {
    DEFAULT: "oklch(0.92 0.01 258)",
  },
  // Dark mode colors
  dark: {
    background: "oklch(0.08 0.01 258)",
    foreground: "oklch(0.95 0.01 258)",
    card: "oklch(0.12 0.01 258)",
    border: "oklch(0.18 0.02 258)",
  },
} as const

// Spacing Tokens
export const spacing = {
  xs: "0.25rem", // 4px
  sm: "0.5rem", // 8px
  md: "1rem", // 16px
  lg: "1.5rem", // 24px
  xl: "2rem", // 32px
  "2xl": "3rem", // 48px
  "3xl": "4rem", // 64px
} as const

// Typography Tokens
export const typography = {
  fontFamily: {
    sans: "var(--font-geist-sans)",
    mono: "var(--font-geist-mono)",
  },
  fontSize: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem", // 48px
    "6xl": "3.75rem", // 60px
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  lineHeight: {
    tight: "1.25",
    normal: "1.5",
    relaxed: "1.75",
  },
} as const

// Border Radius Tokens
export const borderRadius = {
  none: "0",
  sm: "0.25rem", // 4px
  md: "0.5rem", // 8px
  lg: "0.75rem", // 12px
  xl: "1rem", // 16px
  full: "9999px",
} as const

// Shadow Tokens
export const shadows = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
  none: "none",
} as const

// Z-Index Tokens
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const

// Breakpoint Tokens
export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const

// Animation Tokens
export const animations = {
  duration: {
    fast: "150ms",
    normal: "200ms",
    slow: "300ms",
  },
  easing: {
    default: "cubic-bezier(0.4, 0, 0.2, 1)",
    in: "cubic-bezier(0.4, 0, 1, 1)",
    out: "cubic-bezier(0, 0, 0.2, 1)",
    inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
} as const

// Export all tokens
export const tokens = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  zIndex,
  breakpoints,
  animations,
} as const

export type ColorToken = typeof colors
export type SpacingToken = typeof spacing
export type TypographyToken = typeof typography

