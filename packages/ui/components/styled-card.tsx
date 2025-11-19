"use client"

import styled from "styled-components"

// Radix UI Dialog를 Card로 활용
export const StyledCard = styled.div<{ $variant?: "default" | "outlined" | "elevated" }>`
  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.cardForeground};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.lg};
  transition: all ${({ theme }) => theme.transitions.normal};

  ${({ $variant, theme }) => {
    switch ($variant) {
      case "outlined":
        return `
          border: 2px solid ${theme.colors.border};
        `
      case "elevated":
        return `
          box-shadow: ${theme.shadows.lg};
          border: none;
        `
      default:
        return ""
    }
  }}

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.md};
    transform: translateY(-2px);
  }
`

export const StyledCardHeader = styled.div`
  display: flex;
  flex-direction: column;
  space-y: ${({ theme }) => theme.spacing.sm};
  padding-bottom: ${({ theme }) => theme.spacing.md};
`

export const StyledCardTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.2;
  color: ${({ theme }) => theme.colors.foreground};
  margin: 0;
`

export const StyledCardDescription = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
  margin: 0;
`

export const StyledCardContent = styled.div`
  padding-top: ${({ theme }) => theme.spacing.md};
`

export const StyledCardFooter = styled.div`
  display: flex;
  align-items: center;
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`

