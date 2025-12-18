import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { TravelDayPlaces } from "../travel-day-places"
import type { Database } from "@lovetrip/shared/types/database"

// Mock fetch before any imports
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock @supabase/ssr before any imports
vi.mock("@supabase/ssr", () => ({
  createBrowserClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        data: [],
        error: null,
      })),
    })),
  })),
}))

// Mock dependencies
vi.mock("@lovetrip/api/supabase/client", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        or: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              data: [],
              error: null,
            })),
          })),
        })),
      })),
    })),
  })),
}))

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock @radix-ui/react-dialog for Portal support
// 실제 Radix UI Dialog의 동작을 시뮬레이션
vi.mock("@radix-ui/react-dialog", () => {
  const React = require("react")

  // 상태를 관리하는 컨텍스트
  const DialogContext = React.createContext<{
    open: boolean
    onOpenChange: (open: boolean) => void
  }>({ open: false, onOpenChange: () => {} })

  const Root = ({ children, open: controlledOpen, onOpenChange }: any) => {
    const [internalOpen, setInternalOpen] = React.useState(false)
    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : internalOpen

    // controlledOpen이 변경되면 내부 상태도 업데이트
    React.useEffect(() => {
      if (isControlled && controlledOpen !== undefined) {
        // controlledOpen이 변경되면 그대로 사용
      } else if (!isControlled) {
        // uncontrolled 모드에서는 내부 상태 사용
      }
    }, [controlledOpen, isControlled])

    const handleOpenChange = (newOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(newOpen)
      }
      // controlled 모드에서도 onOpenChange는 항상 호출
      onOpenChange?.(newOpen)
    }

    return (
      <DialogContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
        <div data-testid="dialog-root" data-state={open ? "open" : "closed"}>
          {children}
        </div>
      </DialogContext.Provider>
    )
  }

  const Trigger = React.forwardRef(({ children, asChild, ...props }: any, ref: any) => {
    const { onOpenChange } = React.useContext(DialogContext)
    const Component = asChild ? React.Fragment : "button"

    const handleClick = (e: React.MouseEvent) => {
      // Radix UI는 Trigger 클릭 시 자동으로 onOpenChange(true)를 호출
      // 이는 controlled 모드에서도 동작함
      onOpenChange(true)
      props.onClick?.(e)
    }

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...props,
        onClick: (e: React.MouseEvent) => {
          handleClick(e)
          children.props?.onClick?.(e)
        },
        "data-testid": "dialog-trigger",
      })
    }

    return (
      <Component ref={ref} {...props} onClick={handleClick} data-testid="dialog-trigger">
        {children}
      </Component>
    )
  })
  Trigger.displayName = "DialogTrigger"

  const Content = React.forwardRef(({ children, ...props }: any, ref: any) => {
    const { open } = React.useContext(DialogContext)
    if (!open) return null

    return (
      <div ref={ref} data-testid="dialog-content" {...props}>
        {children}
      </div>
    )
  })
  Content.displayName = "DialogContent"

  return {
    Root,
    Trigger,
    Portal: ({ children }: any) => <div data-testid="dialog-portal">{children}</div>,
    Overlay: () => <div data-testid="dialog-overlay" />,
    Content,
    Title: ({ children, ...props }: any) => (
      <div data-testid="dialog-title" {...props}>
        {children}
      </div>
    ),
    Description: ({ children, ...props }: any) => (
      <div data-testid="dialog-description" {...props}>
        {children}
      </div>
    ),
    Close: ({ children, ...props }: any) => (
      <button data-testid="dialog-close" {...props}>
        {children}
      </button>
    ),
  }
})

const mockTravelDay: Database["public"]["Tables"]["travel_days"]["Row"] = {
  id: "day-1",
  travel_plan_id: "plan-1",
  day_number: 1,
  date: null,
  title: null,
  created_at: new Date().toISOString(),
}

describe("TravelDayPlaces", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // fetch mock을 기본적으로 빈 배열 반환하도록 설정
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ data: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    )
  })

  it("초기 로딩 상태를 표시해야 함", async () => {
    // fetch를 지연시켜서 로딩 상태를 확인할 수 있도록 함
    let resolveFetch: (value: Response) => void
    const fetchPromise = new Promise<Response>(resolve => {
      resolveFetch = resolve
    })
    mockFetch.mockReturnValueOnce(fetchPromise)

    await act(async () => {
      render(<TravelDayPlaces travelPlanId="plan-1" travelDay={mockTravelDay} />)
    })

    // 로딩 상태가 표시되는지 확인
    expect(screen.getByText(/로딩 중/i)).toBeInTheDocument()

    // fetch 완료
    await act(async () => {
      resolveFetch!(
        new Response(JSON.stringify({ data: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
      await fetchPromise
    })
  })

  it("장소 목록을 불러와서 표시해야 함", async () => {
    const mockPlaces = [
      {
        id: "place-1",
        travel_day_id: "day-1",
        place_id: "p1",
        order_index: 0,
        visit_time: null,
        notes: null,
        created_at: new Date().toISOString(),
        places: {
          id: "p1",
          name: "테스트 장소",
          address: "서울시 강남구",
          lat: 37.5665,
          lng: 126.978,
          type: "VIEW",
          rating: 4.5,
          price_level: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      },
    ]

    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ data: mockPlaces }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    )

    await act(async () => {
      render(<TravelDayPlaces travelPlanId="plan-1" travelDay={mockTravelDay} />)
    })

    await waitFor(() => {
      expect(screen.getByText("테스트 장소")).toBeInTheDocument()
    })
  })

  it("장소가 없을 때 빈 상태 메시지를 표시해야 함", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ data: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    )

    await act(async () => {
      render(<TravelDayPlaces travelPlanId="plan-1" travelDay={mockTravelDay} />)
    })

    await waitFor(() => {
      expect(screen.getByText(/추가된 장소가 없습니다/i)).toBeInTheDocument()
    })
  })

  it("장소 추가 버튼을 클릭하면 검색 다이얼로그가 열려야 함", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ data: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    )

    await act(async () => {
      render(<TravelDayPlaces travelPlanId="plan-1" travelDay={mockTravelDay} />)
    })

    await waitFor(() => {
      expect(screen.getByText(/추가된 장소가 없습니다/i)).toBeInTheDocument()
    })

    // DialogTrigger 버튼 찾기
    const addButton = screen.getByRole("button", { name: /장소 추가/i })
    expect(addButton).toBeInTheDocument()

    // 버튼 클릭
    await act(async () => {
      await userEvent.click(addButton)
    })

    // Dialog가 열릴 때까지 대기
    await waitFor(
      () => {
        // Dialog root가 open 상태인지 확인
        const dialogRoot = screen.getByTestId("dialog-root")
        expect(dialogRoot).toHaveAttribute("data-state", "open")
        // DialogTitle 텍스트 확인
        expect(screen.getByText(/장소 검색 및 추가/i)).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })
})
