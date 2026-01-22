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
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  "2xl": "3rem",
  "3xl": "4rem",
} as const

// Typography Tokens
export const typography = {
  fontFamily: {
    sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
    mono: ["var(--font-geist-mono)", "monospace"],
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
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
  sm: "calc(0.5rem - 4px)",
  md: "calc(0.5rem - 2px)",
  lg: "0.5rem",
  xl: "calc(0.5rem + 4px)",
  "2xl": "1rem",
  full: "9999px",
} as const

// Shadow Tokens
export const shadows = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
  none: "none",
} as const

// Transition Tokens
export const transitions = {
  fast: "150ms ease-in-out",
  normal: "200ms ease-in-out",
  slow: "300ms ease-in-out",
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

// Export all tokens
export const tokens = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  transitions,
  zIndex,
} as const

export type Tokens = typeof tokens
