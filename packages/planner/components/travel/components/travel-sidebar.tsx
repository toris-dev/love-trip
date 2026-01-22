"use client"

import { useState, useEffect, useRef } from "react"
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
  ArrowLeft,
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
  isLoadingMore = false,
  error,
  hasMore = false,
  onLoadMore,
}: TravelSidebarProps) {
  const [viewMode, setViewMode] = useState<"list" | "detail">("list")
  const observerTarget = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [scrollPosition, setScrollPosition] = useState<number>(0)

  const filteredCourses = courses.filter(
    course =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // 무한 스크롤을 위한 Intersection Observer
  useEffect(() => {
    if (!observerTarget.current || !hasMore || isLoadingMore || isLoading) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && onLoadMore) {
          onLoadMore()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(observerTarget.current)

    return () => {
      observer.disconnect()
    }
  }, [hasMore, isLoadingMore, isLoading, onLoadMore])

  // selectedCourse가 변경되면 detail 모드로 전환
  useEffect(() => {
    if (selectedCourse) {
      setViewMode("detail")
    }
  }, [selectedCourse])

  const handleCourseClick = (course: TravelCourse) => {
    // 현재 스크롤 위치 저장
    if (scrollContainerRef.current) {
      setScrollPosition(scrollContainerRef.current.scrollTop)
    }
    onCourseSelect(course)
    setViewMode("detail")
  }

  const handleBackClick = () => {
    setViewMode("list")
    if (onClose) {
      onClose()
    }
    // 저장된 스크롤 위치로 복원
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollPosition
      }
    }, 0)
  }

  // 상세 뷰 모드
  if (viewMode === "detail" && selectedCourse) {
    return (
      <div className="h-full w-full bg-background border-r border-border shadow-xl pointer-events-auto flex flex-col overflow-hidden">
        {/* 뒤로가기 헤더 */}
        <div className="p-3 sm:p-4 border-b border-border bg-card flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackClick}
            className="h-9 w-9 sm:h-10 sm:w-10 p-0 flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <h2 className="text-base sm:text-lg font-semibold text-foreground truncate">코스 상세</h2>
        </div>

        {/* 상세 정보 */}
        <div className="flex-1 overflow-y-auto min-h-0" style={{ WebkitOverflowScrolling: "touch" }}>
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 pb-20 sm:pb-24">
            {/* 코스 이미지 */}
            {selectedCourse.image_url && (
              <div className="relative w-full h-48 sm:h-64 rounded-lg overflow-hidden">
                <Image
                  src={selectedCourse.image_url}
                  alt={selectedCourse.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <Badge className="bg-background/90 backdrop-blur-sm text-foreground border-0 text-sm">
                    {selectedCourse.region}
                  </Badge>
                </div>
              </div>
            )}

            {/* 코스 기본 정보 */}
            <div className="space-y-3 sm:space-y-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3">
                  {selectedCourse.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>{selectedCourse.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedCourse.place_count}개 장소</span>
                  </div>
                  <Badge variant="secondary">{selectedCourse.region}</Badge>
                </div>
                {selectedCourse.description && (
                  <p className="text-sm sm:text-base text-foreground leading-relaxed">
                    {selectedCourse.description}
                  </p>
                )}
              </div>

              {/* 장소 목록 */}
              {selectedCourse.places && selectedCourse.places.length > 0 && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg sm:text-xl font-semibold text-foreground">방문 장소</h2>
                    <Badge variant="outline" className="text-xs sm:text-sm">
                      총 {selectedCourse.places.length}개
                    </Badge>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    {selectedCourse.places.map((place, index) => {
                      const placeWithOrder = place as typeof place & {
                        order_index?: number
                        day_number?: number
                      }
                      const placeNumber =
                        placeWithOrder.order_index !== undefined
                          ? placeWithOrder.order_index + 1
                          : index + 1
                      const dayNumber = placeWithOrder.day_number

                      return (
                        <Card
                          key={
                            place.id
                              ? `${place.id}-${index}`
                              : `place-${index}-${place.lat}-${place.lng}`
                          }
                          className="border-border hover:border-primary/50 transition-colors"
                        >
                          <CardContent className="p-3 sm:p-4">
                            <div className="flex items-start gap-3 sm:gap-4">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs sm:text-sm font-bold">
                                  {placeNumber}
                                </div>
                                {dayNumber && (
                                  <div className="text-[10px] sm:text-xs text-muted-foreground text-center mt-1">
                                    {dayNumber}일차
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
                                <div>
                                  <h3 className="font-semibold text-sm sm:text-base text-foreground mb-1">
                                    {place.name}
                                  </h3>
                                  {place.address && (
                                    <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                                      <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                                      <span className="truncate">{place.address}</span>
                                    </div>
                                  )}
                                </div>
                                {place.description && (
                                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                                    {place.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 flex-wrap">
                                  {place.type && (
                                    <Badge variant="outline" className="text-[10px] sm:text-xs">
                                      {place.type}
                                    </Badge>
                                  )}
                                  {place.rating !== null && place.rating !== undefined && (
                                    <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                                      <span>⭐</span>
                                      <span>{place.rating.toFixed(1)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 리스트 뷰 모드
  return (
    <div className="h-full w-full bg-background border-r border-border shadow-xl pointer-events-auto flex flex-col">
      {/* 사이드바 헤더 */}
      <div className="p-4 sm:p-6 border-b border-border bg-card">
        <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Plane className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">여행 코스</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 line-clamp-1">
              1박2일 이상의 로맨틱한 여행 코스
            </p>
          </div>
        </div>
      </div>

      {/* 검색 바 */}
      <div className="p-3 sm:p-4 border-b border-border bg-muted/30">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="지역명으로 검색..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="pl-9 sm:pl-10 pr-3 sm:pr-4 h-10 sm:h-11 bg-background text-sm sm:text-base"
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

      {/* 코스 목록 */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto min-h-0"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="p-3 sm:p-4 pb-12 sm:pb-16">
          {isLoading ? (
            <div className="flex items-center justify-center h-full min-h-[300px] sm:min-h-[400px]">
              <div className="text-center">
                <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary mx-auto mb-2 sm:mb-3" />
                <p className="text-xs sm:text-sm text-muted-foreground">
                  여행 코스를 불러오는 중...
                </p>
              </div>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Plane className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
              </div>
              <p className="text-sm sm:text-base font-semibold text-foreground mb-1">
                검색 결과가 없습니다
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">다른 키워드로 검색해보세요</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              <AnimatePresence>
                {filteredCourses.map(course => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50 active:scale-[0.98] ${
                        selectedCourse?.id === course.id
                          ? "ring-2 ring-primary border-primary"
                          : "border-border hover:border-primary/30"
                      }`}
                      onClick={() => handleCourseClick(course)}
                    >
                      <CardContent className="p-3 sm:p-4">
                        {course.image_url && (
                          <div className="relative w-full h-28 sm:h-36 mb-2 sm:mb-3 rounded-lg overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10" />
                            <Image
                              src={course.image_url}
                              alt={course.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute bottom-1.5 sm:bottom-2 left-1.5 sm:left-2 right-1.5 sm:right-2 z-20">
                              <Badge className="bg-background/80 backdrop-blur-sm text-foreground border-0 text-[10px] sm:text-xs">
                                {course.region}
                              </Badge>
                            </div>
                          </div>
                        )}
                        <div className="space-y-1.5 sm:space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm sm:text-base line-clamp-1 text-foreground">
                              {course.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                              <span>{course.duration}</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                              <span>{course.place_count}개 장소</span>
                            </div>
                          </div>
                          {course.description && (
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                              {course.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-border">
                            <Badge variant="secondary" className="text-[10px] sm:text-xs">
                              {course.region}
                            </Badge>
                            <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* 무한 스크롤 트리거 */}
              {hasMore && (
                <div ref={observerTarget} className="h-4 sm:h-6 flex items-center justify-center">
                  {isLoadingMore && (
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-primary" />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
