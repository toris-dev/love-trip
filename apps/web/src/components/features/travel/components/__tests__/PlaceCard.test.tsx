import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { PlaceCard } from "../PlaceCard"
import type { Database } from "@lovetrip/shared/types/database"

const mockPlace: Database["public"]["Tables"]["places"]["Row"] = {
  id: "place-1",
  name: "테스트 장소",
  address: "서울시 강남구",
  lat: 37.5665,
  lng: 126.978,
  type: "VIEW",
  rating: 4.5,
  price_level: 2,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

describe("PlaceCard", () => {
  it("장소 정보를 올바르게 표시해야 함", () => {
    render(<PlaceCard place={mockPlace} />)

    expect(screen.getByText("테스트 장소")).toBeInTheDocument()
    expect(screen.getByText("서울시 강남구")).toBeInTheDocument()
  })

  it("순서 번호를 표시해야 함", () => {
    render(<PlaceCard place={mockPlace} orderIndex={0} showOrder={true} />)

    expect(screen.getByText("1")).toBeInTheDocument()
  })

  it("방문 시간을 표시해야 함", () => {
    render(<PlaceCard place={mockPlace} visitTime="14:00" />)

    expect(screen.getByText("14:00")).toBeInTheDocument()
  })

  it("메모를 표시해야 함", () => {
    render(<PlaceCard place={mockPlace} notes="특별 메모" />)

    expect(screen.getByText("특별 메모")).toBeInTheDocument()
  })

  it("제거 버튼이 있으면 클릭 가능해야 함", () => {
    const onRemove = vi.fn()
    render(<PlaceCard place={mockPlace} onRemove={onRemove} />)

    const removeButton = screen.getByLabelText("장소 제거")
    expect(removeButton).toBeInTheDocument()
  })
})
