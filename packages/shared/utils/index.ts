// 공통 유틸리티 함수
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(amount)
}

export function calculateTotal(
  items: Array<{ planned?: number; actual?: number; amount?: number }>
): { planned: number; actual: number } {
  return {
    planned: items.reduce((sum, item) => sum + (item.planned || 0), 0),
    actual: items.reduce((sum, item) => sum + (item.actual || 0), 0),
  }
}
