"use client"

import styled, { css } from "styled-components"
import { ButtonHTMLAttributes } from "react"

interface StyledButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  $variant?: "default" | "outline" | "ghost" | "destructive"
  $size?: "sm" | "md" | "lg"
}

const variantStyles = {
  default: css`
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primaryForeground};
    border: none;

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.primary};
      opacity: 0.9;
    }
  `,
  outline: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.foreground};
    border: 1px solid ${({ theme }) => theme.colors.border};

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.muted};
    }
  `,
  ghost: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.foreground};
    border: none;

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.muted};
    }
  `,
  destructive: css`
    background: ${({ theme }) => theme.colors.destructive};
    color: ${({ theme }) => theme.colors.destructiveForeground};
    border: none;

    &:hover:not(:disabled) {
      opacity: 0.9;
    }
  `,
}

const sizeStyles = {
  sm: css`
    height: 2rem;
    padding: 0 ${({ theme }) => theme.spacing.sm};
    font-size: 0.875rem;
  `,
  md: css`
    height: 2.5rem;
    padding: 0 ${({ theme }) => theme.spacing.md};
    font-size: 1rem;
  `,
  lg: css`
    height: 3rem;
    padding: 0 ${({ theme }) => theme.spacing.lg};
    font-size: 1.125rem;
  `,
}

export const StyledButton = styled.button<StyledButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 500;
  transition: all ${({ theme }) => theme.transitions.fast};
  cursor: pointer;
  white-space: nowrap;

  ${({ $variant = "default" }) => variantStyles[$variant]}
  ${({ $size = "md" }) => sizeStyles[$size]}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`

