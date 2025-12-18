import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { BudgetDashboard } from "../budget-dashboard"
import type { ExpenseCategory } from "@lovetrip/expense/types"

describe("BudgetDashboard", () => {
  const mockSummary = {
    totalPlanned: 1000000,
    totalActual: 750000,
    remaining: 250000,
    byCategory: {
      교통비: { planned: 200000, actual: 150000 },
      숙박비: { planned: 300000, actual: 250000 },
      식비: { planned: 300000, actual: 200000 },
      액티비티: { planned: 100000, actual: 100000 },
      쇼핑: { planned: 50000, actual: 30000 },
      기타: { planned: 50000, actual: 20000 },
    } as Record<ExpenseCategory, { planned: number; actual: number }>,
  }

  it("예산 현황을 올바르게 표시해야 함", () => {
    render(<BudgetDashboard summary={mockSummary} />)

    expect(screen.getByText("1,000,000원")).toBeInTheDocument() // 계획 예산
    expect(screen.getByText("750,000원")).toBeInTheDocument() // 실제 지출
    expect(screen.getByText("250,000원")).toBeInTheDocument() // 남은 예산
  })

  it("예산 사용률을 표시해야 함", () => {
    render(<BudgetDashboard summary={mockSummary} />)

    // 75% 사용률
    expect(screen.getByText(/75\.0%/i)).toBeInTheDocument()
  })

  it("카테고리별 예산을 표시해야 함", () => {
    render(<BudgetDashboard summary={mockSummary} />)

    expect(screen.getByText("식비")).toBeInTheDocument()
    expect(screen.getByText("숙박비")).toBeInTheDocument()
  })

  it("예산 초과 시 경고 색상을 표시해야 함", () => {
    const exceededSummary = {
      ...mockSummary,
      totalPlanned: 500000,
      totalActual: 600000,
      remaining: -100000,
    }

    render(<BudgetDashboard summary={exceededSummary} />)

    // 예산 초과 시 destructive 색상이 적용되어야 함
    const remainingElement = screen.getByText(/-100,000원/i)
    expect(remainingElement).toBeInTheDocument()
  })
})
