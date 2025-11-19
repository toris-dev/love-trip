"use client"

import styled from "styled-components"

export const StyledContainer = styled.div<{ $maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full" }>`
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: ${({ theme }) => theme.spacing.md};
  padding-right: ${({ theme }) => theme.spacing.md};

  ${({ $maxWidth = "xl" }) => {
    const maxWidths = {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      full: "100%",
    }
    return `max-width: ${maxWidths[$maxWidth]};`
  }}
`

export const StyledSection = styled.section<{ $variant?: "default" | "gradient" }>`
  padding: ${({ theme }) => theme.spacing["2xl"]} 0;
  position: relative;

  ${({ $variant, theme }) => {
    if ($variant === "gradient") {
      return `
        background: linear-gradient(
          to bottom right,
          ${theme.colors.primary}10,
          ${theme.colors.background},
          ${theme.colors.accent}10
        );
      `
    }
    return `background: ${theme.colors.background};`
  }}
`

export const StyledGrid = styled.div<{ $cols?: number; $gap?: string }>`
  display: grid;
  grid-template-columns: repeat(${({ $cols = 1 }) => $cols}, minmax(0, 1fr));
  gap: ${({ $gap, theme }) => $gap || theme.spacing.md};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

