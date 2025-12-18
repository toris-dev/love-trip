import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { BudgetPlanner } from "../budget-planner"

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe("BudgetPlanner", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  it("초기 로딩 상태를 표시해야 함", () => {
    mockFetch.mockImplementation(() => new Promise(() => {})) // 무한 대기

    render(<BudgetPlanner travelPlanId="plan-1" initialBudget={1000000} />)

    expect(screen.getByText(/로딩 중/i)).toBeInTheDocument()
  })

  it("예산 항목 목록을 표시해야 함", async () => {
    const mockData = {
      summary: {
        totalPlanned: 500000,
        totalActual: 300000,
        remaining: 200000,
        byCategory: {
          식비: { planned: 200000, actual: 150000 },
          숙박비: { planned: 300000, actual: 150000 },
        },
      },
      items: [
        {
          id: "item-1",
          category: "식비",
          name: "저녁 식사",
          planned_amount: 50000,
        },
      ],
    }

    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify(mockData), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    )

    render(<BudgetPlanner travelPlanId="plan-1" initialBudget={1000000} />)

    await waitFor(() => {
      expect(screen.getByText("저녁 식사")).toBeInTheDocument()
    })
  })

  it("예산 추가 버튼을 클릭하면 다이얼로그가 열려야 함", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ summary: null, items: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    )

    render(<BudgetPlanner travelPlanId="plan-1" initialBudget={1000000} />)

    await waitFor(() => {
      expect(screen.queryByText(/로딩 중/i)).not.toBeInTheDocument()
    })

    const addButton = screen.getByText(/예산 추가/i)
    await userEvent.click(addButton)

    expect(screen.getByText(/예산 항목 추가/i)).toBeInTheDocument()
  })
})
