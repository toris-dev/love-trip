"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent } from "@lovetrip/ui/components/card"
import { Input } from "@lovetrip/ui/components/input"
import { Alert, AlertDescription } from "@lovetrip/ui/components/alert"
import { Search, Plane, AlertCircle, Calendar, MapPin, ChevronRight, Loader2 } from "lucide-react"
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
    <div className="absolute top-16 left-0 bottom-0 w-full md:w-96 z-50 pointer-events-none">
      <div className="h-full w-full md:w-96 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-r border-black/10 dark:border-white/10 shadow-xl pointer-events-auto overflow-hidden flex flex-col">
        {/* 사이드바 헤더 */}
        <div className="p-4 border-b border-black/10 dark:border-white/10">
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
            <Plane className="h-6 w-6 text-primary" />
            여행 코스
          </h1>
          <p className="text-sm text-muted-foreground">
            1박2일 이상의 여행 코스를 탐색하고 계획해보세요
          </p>
        </div>

        {/* 검색 바 */}
        <div className="p-4 border-b border-black/10 dark:border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="지역명으로 검색..."
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 border-b border-black/10 dark:border-white/10">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* 코스 목록 */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">로딩 중...</p>
              </div>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>검색 결과가 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
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
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedCourse?.id === course.id ? "ring-2 ring-primary shadow-md" : ""
                      }`}
                      onClick={() => onCourseSelect(course)}
                    >
                      <CardContent className="p-4">
                        {course.image_url && (
                          <div className="relative w-full h-32 mb-3 rounded-lg overflow-hidden">
                            <Image
                              src={course.image_url}
                              alt={course.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <h3 className="font-semibold mb-1 line-clamp-1">{course.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <Calendar className="h-3 w-3" />
                          <span>{course.duration}</span>
                          <span>•</span>
                          <MapPin className="h-3 w-3" />
                          <span>{course.place_count}개 장소</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {course.description}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">
                            {course.region}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

