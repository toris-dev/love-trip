"use client"

import { Card, CardContent } from "@lovetrip/ui/components/card"
import { Input } from "@lovetrip/ui/components/input"
import { Alert, AlertDescription } from "@lovetrip/ui/components/alert"
import { Button } from "@lovetrip/ui/components/button"
import {
  Search,
  Plane,
  AlertCircle,
  Calendar,
  MapPin,
  ChevronRight,
  Loader2,
  X,
  Clock,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Badge } from "@lovetrip/ui/components/badge"
import type { TravelCourse } from "../types"

interface TravelSidebarProps {
  courses: TravelCourse[]
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedCourse: TravelCourse | null
  onCourseSelect: (course: TravelCourse) => void
  onClose?: () => void
  isLoading: boolean
  isLoadingMore?: boolean
  error: string | null
  hasMore?: boolean
  onLoadMore?: () => void
}

export function TravelSidebar({
  courses,
  searchQuery,
  onSearchChange,
  selectedCourse,
  onCourseSelect,
  onClose,
  isLoading,
  error,
}: TravelSidebarProps) {
  const filteredCourses = courses.filter(
    course =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-full w-full bg-background border-r border-border shadow-xl pointer-events-auto flex flex-col">
      {/* 사이드바 헤더 */}
      <div className="p-6 border-b border-border bg-card">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Plane className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">여행 코스</h1>
            <p className="text-sm text-muted-foreground mt-1">1박2일 이상의 로맨틱한 여행 코스</p>
          </div>
        </div>
      </div>

      {/* 검색 바 */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="지역명으로 검색..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="pl-10 pr-4 h-11 bg-background"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 border-b border-border">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* 선택된 코스 정보 */}
      {selectedCourse && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-4 border-b border-border bg-card"
        >
          <Card className="border-primary/50 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-2 text-foreground line-clamp-2">
                    {selectedCourse.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{selectedCourse.duration}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{selectedCourse.place_count}개 장소</span>
                    </div>
                    <span>•</span>
                    <Badge variant="secondary" className="text-xs">
                      {selectedCourse.region}
                    </Badge>
                  </div>
                  {selectedCourse.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {selectedCourse.description}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (onClose) {
                      onClose()
                    } else {
                      // fallback: onClose가 없으면 null을 전달할 수 있도록 처리
                      // 하지만 타입상 불가능하므로 onClose를 사용하는 것이 좋음
                    }
                  }}
                  className="h-8 w-8 p-0 flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* 장소 목록 */}
              {selectedCourse.places && selectedCourse.places.length > 0 && (
                <div className="mt-3 space-y-2 border-t border-border/50 pt-3 max-h-64 overflow-y-auto">
                  <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    방문 순서
                  </div>
                  {selectedCourse.places.map((place, index) => {
                    const placeWithOrder = place as typeof place & { order_index?: number }
                    const placeNumber =
                      placeWithOrder.order_index !== undefined
                        ? placeWithOrder.order_index + 1
                        : index + 1
                    return (
                      <div
                        key={place.id || index}
                        className="flex items-start gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                          {placeNumber}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-foreground truncate">
                            {place.name}
                          </div>
                          {place.address && (
                            <div className="text-xs text-muted-foreground truncate mt-0.5">
                              {place.address}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* 코스 목록 */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4 pb-16">
          {isLoading ? (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">여행 코스를 불러오는 중...</p>
              </div>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Plane className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-base font-semibold text-foreground mb-1">검색 결과가 없습니다</p>
              <p className="text-sm text-muted-foreground">다른 키워드로 검색해보세요</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredCourses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50 ${
                        selectedCourse?.id === course.id
                          ? "ring-2 ring-primary border-primary"
                          : "border-border hover:border-primary/30"
                      }`}
                      onClick={() => onCourseSelect(course)}
                    >
                      <CardContent className="p-4">
                        {course.image_url && (
                          <div className="relative w-full h-36 mb-3 rounded-lg overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10" />
                            <Image
                              src={course.image_url}
                              alt={course.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute bottom-2 left-2 right-2 z-20">
                              <Badge className="bg-background/80 backdrop-blur-sm text-foreground border-0">
                                {course.region}
                              </Badge>
                            </div>
                          </div>
                        )}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-base line-clamp-1 text-foreground">
                              {course.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{course.duration}</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{course.place_count}개 장소</span>
                            </div>
                          </div>
                          {course.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {course.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            <Badge variant="secondary" className="text-xs">
                              {course.region}
                            </Badge>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
              {/* 하단 여백 */}
              <div className="h-4" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
