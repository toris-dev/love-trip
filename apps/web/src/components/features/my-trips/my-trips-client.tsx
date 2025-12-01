"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@lovetrip/ui/components/button"
import { Input } from "@lovetrip/ui/components/input"

interface MyTripsClientProps {
  onSearchChange: (query: string) => void
  onFilterChange: (status: string) => void
  filterStatus: string
}

export function MyTripsClient({ onSearchChange, onFilterChange, filterStatus }: MyTripsClientProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    onSearchChange(value)
  }

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="여행 제목이나 목적지로 검색..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="pl-10"
        />
      </div>
      <div className="flex gap-2">
        {["all", "planning", "ongoing", "completed"].map((status) => (
          <Button
            key={status}
            variant={filterStatus === status ? "default" : "outline"}
            onClick={() => onFilterChange(status)}
            className="capitalize"
          >
            {status === "all" ? "전체" : status === "planning" ? "계획 중" : status === "ongoing" ? "여행 중" : "완료"}
          </Button>
        ))}
      </div>
    </div>
  )
}

