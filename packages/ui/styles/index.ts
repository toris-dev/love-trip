// styled-components 테마 및 스타일
import { DefaultTheme } from "styled-components"

export const theme: DefaultTheme = {
  colors: {
    primary: "oklch(0.55 0.15 162)",
    primaryForeground: "oklch(1 0 0)",
    secondary: "oklch(0.62 0.12 162)",
    secondaryForeground: "oklch(1 0 0)",
    accent: "oklch(0.62 0.12 162)",
    accentForeground: "oklch(1 0 0)",
    background: "oklch(1 0 0)",
    foreground: "oklch(0.35 0.02 258)",
    card: "oklch(0.98 0.01 258)",
    cardForeground: "oklch(0.35 0.02 258)",
    border: "oklch(0.92 0.01 258)",
    muted: "oklch(0.96 0.01 258)",
    mutedForeground: "oklch(0.45 0.02 258)",
    destructive: "oklch(0.577 0.245 27.325)",
    destructiveForeground: "oklch(1 0 0)",
  },
  borderRadius: {
    sm: "calc(0.5rem - 4px)",
    md: "calc(0.5rem - 2px)",
    lg: "0.5rem",
    xl: "calc(0.5rem + 4px)",
    full: "9999px",
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
  },
  transitions: {
    fast: "150ms ease-in-out",
    normal: "200ms ease-in-out",
    slow: "300ms ease-in-out",
  },
}

declare module "styled-components" {
  export interface DefaultTheme {
    colors: {
      primary: string
      primaryForeground: string
      secondary: string
      secondaryForeground: string
      accent: string
      accentForeground: string
      background: string
      foreground: string
      card: string
      cardForeground: string
      border: string
      muted: string
      mutedForeground: string
      destructive: string
      destructiveForeground: string
    }
    borderRadius: {
      sm: string
      md: string
      lg: string
      xl: string
      full: string
    }
    spacing: {
      xs: string
      sm: string
      md: string
      lg: string
      xl: string
      "2xl": string
    }
    shadows: {
      sm: string
      md: string
      lg: string
      xl: string
    }
    transitions: {
      fast: string
      normal: string
      slow: string
    }
  }
}

