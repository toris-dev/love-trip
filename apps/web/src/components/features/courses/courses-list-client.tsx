"use client"

import { useState, useEffect } from "react"
import { Button } from "@lovetrip/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@lovetrip/ui/components/card"
import { Input } from "@lovetrip/ui/components/input"
import { Badge } from "@lovetrip/ui/components/badge"
import {
  Search,
  MapPin,
  Heart,
  Bookmark,
  Eye,
  Clock,
  Filter,
  X,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@lovetrip/api/supabase/client"
import { toast } from "sonner"
import { ShareButton } from "@/components/shared/share-button"
import type { UserCourseWithAuthor } from "@lovetrip/shared/types"

interface CoursesListClientProps {
  initialCourses: UserCourseWithAuthor[]
  userId?: string
}

export function CoursesListClient({ initialCourses, userId }: CoursesListClientProps) {
  const [courses, setCourses] = useState(initialCourses)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRegion, setSelectedRegion] = useState<string>("")
  const [selectedType, setSelectedType] = useState<"travel" | "date" | "">("")
  const [sortBy, setSortBy] = useState<"popular" | "recent" | "views" | "likes">("popular")

  const regions = ["서울", "제주", "부산", "경주", "전주", "여수", "강릉", "속초", "춘천"]

  useEffect(() => {
    loadCourses()
  }, [selectedRegion, selectedType, sortBy])

  const loadCourses = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedRegion) params.append("region", selectedRegion)
      if (selectedType) params.append("courseType", selectedType)
      params.append("sort", sortBy)

      const response = await fetch(`/api/user-courses?${params.toString()}`)
      if (!response.ok) throw new Error("코스를 불러오는 중 오류가 발생했습니다")

      const { courses: data } = await response.json()
      setCourses(data || [])
    } catch (error) {
      console.error("Failed to load courses:", error)
      toast.error("코스를 불러오는 중 오류가 발생했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async (courseId: string) => {
    if (!userId) {
      toast.error("로그인이 필요합니다")
      return
    }

    try {
      const response = await fetch(`/api/user-courses/${courseId}/like`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("좋아요 처리에 실패했습니다")

      const { liked } = await response.json()

      // 로컬 상태 업데이트
      setCourses(prev =>
        prev.map(c =>
          c.id === courseId
            ? {
                ...c,
                isLiked: liked,
                like_count: liked ? c.like_count + 1 : c.like_count - 1,
              }
            : c
        )
      )

      if (liked) {
        toast.success("좋아요를 눌렀습니다", {
          description: "코스 작성자에게 XP 5 + 포인트 2가 지급됩니다",
          duration: 3000,
        })
      } else {
        toast.success("좋아요를 취소했습니다")
      }
    } catch (error) {
      toast.error("좋아요 처리에 실패했습니다")
    }
  }

  const handleSave = async (courseId: string) => {
    if (!userId) {
      toast.error("로그인이 필요합니다")
      return
    }

    try {
      const response = await fetch(`/api/user-courses/${courseId}/save`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("저장 처리에 실패했습니다")

      const { saved } = await response.json()

      // 로컬 상태 업데이트
      setCourses(prev =>
        prev.map(c =>
          c.id === courseId
            ? {
                ...c,
                isSaved: saved,
                save_count: saved ? c.save_count + 1 : c.save_count - 1,
              }
            : c
        )
      )

      if (saved) {
        toast.success("저장되었습니다", {
          description: "코스 작성자에게 XP 10 + 포인트 5가 지급됩니다",
          duration: 3000,
        })
      } else {
        toast.success("저장이 취소되었습니다")
      }
    } catch (error) {
      toast.error("저장 처리에 실패했습니다")
    }
  }

  const filteredCourses = courses.filter(course => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        course.title.toLowerCase().includes(query) ||
        course.region.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query)
      )
    }
    return true
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">공개 코스 탐색</h1>
            <p className="text-muted-foreground">
              다른 커플들이 만든 여행 코스를 탐색하고 영감을 받아보세요
            </p>
          </div>

          {/* 검색 및 필터 */}
          <div className="mb-6 space-y-4">
            {/* 검색 바 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="코스 제목, 지역으로 검색..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 필터 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">필터</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* 지역 필터 - Badge 스타일 */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">지역:</span>
                  <Badge
                    variant={selectedRegion === "" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedRegion("")}
                  >
                    전체
                  </Badge>
                  {regions.map(region => (
                    <Badge
                      key={region}
                      variant={selectedRegion === region ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedRegion(region)}
                    >
                      {region}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* 타입 필터 - Badge 스타일 */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">타입:</span>
                  <Badge
                    variant={selectedType === "" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedType("")}
                  >
                    전체
                  </Badge>
                  <Badge
                    variant={selectedType === "travel" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedType("travel")}
                  >
                    여행 코스
                  </Badge>
                  <Badge
                    variant={selectedType === "date" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedType("date")}
                  >
                    데이트 코스
                  </Badge>
                </div>

                {/* 정렬 */}
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs text-muted-foreground">정렬:</span>
                  <select
                    value={sortBy}
                    onChange={e =>
                      setSortBy(e.target.value as "popular" | "recent" | "views" | "likes")
                    }
                    className="px-3 py-1.5 text-sm border rounded-md bg-background"
                  >
                    <option value="popular">인기순</option>
                    <option value="recent">최신순</option>
                    <option value="views">조회수순</option>
                    <option value="likes">좋아요순</option>
                  </select>
                </div>
              </div>

              {/* 활성 필터 표시 */}
              {(selectedRegion || selectedType) && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">적용된 필터:</span>
                  {selectedRegion && (
                    <Badge variant="secondary" className="gap-1">
                      지역: {selectedRegion}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setSelectedRegion("")}
                      />
                    </Badge>
                  )}
                  {selectedType && (
                    <Badge variant="secondary" className="gap-1">
                      타입: {selectedType === "travel" ? "여행 코스" : "데이트 코스"}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setSelectedType("")}
                      />
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 코스 목록 */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">로딩 중...</p>
              </div>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">표시할 코스가 없습니다</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || selectedRegion || selectedType
                  ? "다른 필터를 시도해보세요"
                  : "아직 공개된 코스가 없습니다"}
              </p>
              {(searchQuery || selectedRegion || selectedType) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedRegion("")
                    setSelectedType("")
                  }}
                >
                  필터 초기화
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-muted-foreground">
                총 {filteredCourses.length}개의 코스가 있습니다
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map(course => (
                  <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {course.image_url && (
                      <div className="relative w-full h-48">
                        <Image
                          src={course.image_url}
                          alt={course.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <CardHeader className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg line-clamp-2 flex-1">{course.title}</CardTitle>
                        <Badge variant={course.course_type === "travel" ? "default" : "secondary"}>
                          {course.course_type === "travel" ? "여행" : "데이트"}
                        </Badge>
                      </div>
                      {course.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                          {course.description}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-3">
                      {/* 작성자 정보 */}
                      {course.author && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>
                            {course.author.display_name || course.author.nickname || "익명"}
                          </span>
                        </div>
                      )}

                      {/* 메타 정보 */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{course.region}</span>
                        </div>
                        {course.duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{course.duration}</span>
                          </div>
                        )}
                        <span>{course.place_count}개 장소</span>
                      </div>

                      {/* 통계 */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground" title="조회수">
                          <Eye className="h-4 w-4" />
                          <span>{course.view_count || 0}</span>
                        </div>
                        <div
                          className="flex items-center gap-1 text-muted-foreground"
                          title="좋아요 (작성자에게 XP 5 + 포인트 2 지급)"
                        >
                          <Heart className="h-4 w-4" />
                          <span>{course.like_count || 0}</span>
                        </div>
                        <div
                          className="flex items-center gap-1 text-muted-foreground"
                          title="저장 (작성자에게 XP 10 + 포인트 5 지급)"
                        >
                          <Bookmark className="h-4 w-4" />
                          <span>{course.save_count || 0}</span>
                        </div>
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Button
                          variant={course.isLiked ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleLike(course.id)}
                          className="flex-1"
                        >
                          <Heart
                            className={`h-4 w-4 mr-1 ${course.isLiked ? "fill-current" : ""}`}
                          />
                          좋아요
                        </Button>
                        <Button
                          variant={course.isSaved ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleSave(course.id)}
                          className="flex-1"
                        >
                          <Bookmark
                            className={`h-4 w-4 mr-1 ${course.isSaved ? "fill-current" : ""}`}
                          />
                          저장
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/courses/${course.id}`}>보기</Link>
                        </Button>
                      </div>
                      {/* 공유 버튼 */}
                      <div className="pt-2 border-t">
                        <ShareButton
                          title={course.title}
                          description={course.description || undefined}
                          url={`/courses/${course.id}`}
                          imageUrl={course.image_url || undefined}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

