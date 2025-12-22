"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { X, Filter, MapPin, Star, Wallet } from "lucide-react"

export interface CourseFilters {
  region?: string
  minRating?: number
  maxPrice?: number
  placeTypes?: string[]
  duration?: string
}

interface CourseFiltersProps {
  filters: CourseFilters
  onFiltersChange: (filters: CourseFilters) => void
  onReset: () => void
}

export function CourseFilters({ filters, onFiltersChange, onReset }: CourseFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleFilterChange = (key: keyof CourseFilters, value: unknown) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const handlePlaceTypeToggle = (type: string) => {
    const currentTypes = filters.placeTypes || []
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type]
    handleFilterChange("placeTypes", newTypes)
  }

  const activeFiltersCount =
    (filters.region ? 1 : 0) +
    (filters.minRating ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.placeTypes?.length || 0) +
    (filters.duration ? 1 : 0)

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          필터
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X className="h-4 w-4 mr-1" />
            초기화
          </Button>
        )}
      </div>

      {isOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">필터 옵션</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 지역 필터 */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                지역
              </Label>
              <Input
                placeholder="지역명 입력 (예: 서울, 부산)"
                value={filters.region || ""}
                onChange={e => handleFilterChange("region", e.target.value)}
              />
            </div>

            {/* 평점 필터 */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                최소 평점
              </Label>
              <Slider
                value={[filters.minRating || 0]}
                onValueChange={([value]) => handleFilterChange("minRating", value)}
                min={0}
                max={5}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>{filters.minRating?.toFixed(1) || 0}</span>
                <span>5.0</span>
              </div>
            </div>

            {/* 가격 필터 */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                최대 예산
              </Label>
              <Input
                type="number"
                placeholder="최대 예산 (원)"
                value={filters.maxPrice || ""}
                onChange={e =>
                  handleFilterChange(
                    "maxPrice",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
            </div>

            {/* 장소 타입 필터 */}
            <div className="space-y-2">
              <Label>장소 타입</Label>
              <div className="flex flex-wrap gap-2">
                {["CAFE", "FOOD", "VIEW", "MUSEUM", "ETC"].map(type => (
                  <Badge
                    key={type}
                    variant={filters.placeTypes?.includes(type) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handlePlaceTypeToggle(type)}
                  >
                    {type === "CAFE" && "카페"}
                    {type === "FOOD" && "식당"}
                    {type === "VIEW" && "관광지"}
                    {type === "MUSEUM" && "박물관"}
                    {type === "ETC" && "기타"}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 소요 시간 필터 */}
            <div className="space-y-2">
              <Label>소요 시간</Label>
              <Select
                value={filters.duration || ""}
                onValueChange={value => handleFilterChange("duration", value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="소요 시간 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">전체</SelectItem>
                  <SelectItem value="1">1시간 이하</SelectItem>
                  <SelectItem value="2">2시간 이하</SelectItem>
                  <SelectItem value="4">4시간 이하</SelectItem>
                  <SelectItem value="6">6시간 이하</SelectItem>
                  <SelectItem value="8">8시간 이상</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
