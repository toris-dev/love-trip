// 공통 유틸리티 함수
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function formatCurrency(amount: number): string {
  return amount.toLocaleString("ko-KR") + "원"
}

export function calculateTotal(items: Array<{ planned: number; actual: number }>) {
  return {
    planned: items.reduce((sum, item) => sum + item.planned, 0),
    actual: items.reduce((sum, item) => sum + item.actual, 0),
  }
}

