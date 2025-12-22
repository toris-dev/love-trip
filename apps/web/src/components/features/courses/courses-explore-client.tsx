"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@lovetrip/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@lovetrip/ui/components/card"
import { Input } from "@lovetrip/ui/components/input"
import { Badge } from "@lovetrip/ui/components/badge"
import { Search, Heart, Bookmark, Eye, MapPin, Clock, ArrowLeft, Crown } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import Link from "next/link"
import type { UserCourseWithAuthor } from "@lovetrip/shared/types"

interface CoursesExploreClientProps {
  initialCourses: UserCourseWithAuthor[]
  initialFilters: {
    type?: "travel" | "date"
    region?: string
    sort?: "popular" | "recent" | "views" | "likes"
  }
  initialPage: number
  userId?: string
  isPremium?: boolean
}

export function CoursesExploreClient({
  initialCourses,
  initialFilters,
  userId,
  isPremium = false,
}: CoursesExploreClientProps) {
  const router = useRouter()
  const [courses, setCourses] = useState(initialCourses)
  const [filters, setFilters] = useState(initialFilters)
  const [searchQuery, setSearchQuery] = useState("")

  // 프리미엄 고급 필터
  const [minViews, setMinViews] = useState<number>(0)
  const [minLikes, setMinLikes] = useState<number>(0)
  const [premiumOnly, setPremiumOnly] = useState<boolean>(false)

  const filteredCourses = courses.filter(course => {
    // 프리미엄 고급 필터
    if (isPremium) {
      if (minViews > 0 && (course.view_count || 0) < minViews) return false
      if (minLikes > 0 && (course.like_count || 0) < minLikes) return false
      if (premiumOnly && !course.author?.isPremium) return false
    }

    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      course.title.toLowerCase().includes(query) ||
      course.region.toLowerCase().includes(query) ||
      course.description?.toLowerCase().includes(query)
    )
  })

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

      setCourses(prev =>
        prev.map(course =>
          course.id === courseId
            ? {
                ...course,
                isLiked: liked,
                like_count: liked
                  ? (course.like_count || 0) + 1
                  : Math.max(0, (course.like_count || 0) - 1),
              }
            : course
        )
      )

      toast.success(liked ? "좋아요를 눌렀습니다" : "좋아요를 취소했습니다")
    } catch (error) {
      console.error("Error toggling like:", error)
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

      setCourses(prev =>
        prev.map(course =>
          course.id === courseId
            ? {
                ...course,
                isSaved: saved,
                save_count: saved
                  ? (course.save_count || 0) + 1
                  : Math.max(0, (course.save_count || 0) - 1),
              }
            : course
        )
      )

      toast.success(saved ? "저장되었습니다" : "저장이 취소되었습니다")
    } catch (error) {
      console.error("Error toggling save:", error)
      toast.error("저장 처리에 실패했습니다")
    }
  }

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)

    const params = new URLSearchParams()
    if (updated.type) params.set("type", updated.type)
    if (updated.region) params.set("region", updated.region)
    if (updated.sort) params.set("sort", updated.sort)

    router.push(`/courses?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 */}
          <div className="mb-6">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                돌아가기
              </Link>
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">코스 탐색</h1>
                <p className="text-muted-foreground">
                  다른 커플들이 만든 여행 코스를 탐색하고 공유하세요
                </p>
              </div>
            </div>
          </div>

          {/* 필터 및 검색 */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="코스명, 지역, 설명으로 검색..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={filters.type || "all"}
                    onChange={e =>
                      updateFilters({
                        type:
                          e.target.value === "all"
                            ? undefined
                            : (e.target.value as "travel" | "date"),
                      })
                    }
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="all">전체</option>
                    <option value="date">데이트 코스</option>
                    <option value="travel">여행 코스</option>
                  </select>
                  <select
                    value={filters.sort || "popular"}
                    onChange={e => updateFilters({ sort: e.target.value as typeof filters.sort })}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="popular">인기순</option>
                    <option value="recent">최신순</option>
                    <option value="views">조회수순</option>
                    <option value="likes">좋아요순</option>
                  </select>
                </div>
              </div>

              {/* 프리미엄 고급 필터 */}
              {isPremium && (
                <div className="mt-4 pt-4 border-t flex flex-wrap items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-yellow-50/50 to-orange-50/50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-500/30">
                  <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    프리미엄 필터
                  </Badge>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-muted-foreground">최소 조회수:</label>
                    <Input
                      type="number"
                      min="0"
                      value={minViews}
                      onChange={e => setMinViews(parseInt(e.target.value) || 0)}
                      className="w-20 h-8 text-sm"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-muted-foreground">최소 좋아요:</label>
                    <Input
                      type="number"
                      min="0"
                      value={minLikes}
                      onChange={e => setMinLikes(parseInt(e.target.value) || 0)}
                      className="w-20 h-8 text-sm"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="premium-only-explore"
                      checked={premiumOnly}
                      onChange={e => setPremiumOnly(e.target.checked)}
                      className="w-4 h-4 rounded border-primary"
                    />
                    <label htmlFor="premium-only-explore" className="text-xs cursor-pointer">
                      프리미엄 코스만
                    </label>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 코스 목록 */}
          {filteredCourses.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <p className="text-muted-foreground">
                  {searchQuery ? "검색 결과가 없습니다" : "공개된 코스가 없습니다"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map(course => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  {course.image_url && (
                    <div className="relative w-full h-48 rounded-t-lg overflow-hidden">
                      <Image
                        src={course.image_url}
                        alt={course.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2 mb-2">{course.title}</CardTitle>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {course.author?.isPremium && (
                            <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white flex items-center gap-1">
                              <Crown className="h-3 w-3" />
                              프리미엄
                            </Badge>
                          )}
                          <Badge variant="outline">
                            {course.course_type === "travel" ? "여행" : "데이트"}
                          </Badge>
                          <Badge variant="secondary">
                            <MapPin className="h-3 w-3 mr-1" />
                            {course.region}
                          </Badge>
                          {formatPriceRange(course.min_price, course.max_price) && (
                            <Badge
                              variant="secondary"
                              className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-900/30"
                            >
                              <Wallet className="h-3 w-3 mr-1" />
                              {formatPriceRange(course.min_price, course.max_price)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {course.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {course.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{course.view_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          <span>{course.like_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bookmark className="h-4 w-4" />
                          <span>{course.save_count || 0}</span>
                        </div>
                      </div>
                      {course.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{course.duration}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button asChild variant="default" className="flex-1">
                        <Link href={`/date/${course.id}`}>상세보기</Link>
                      </Button>
                      {userId && (
                        <>
                          <Button
                            variant={course.isLiked ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleLike(course.id)}
                            className="px-3"
                          >
                            <Heart className={`h-4 w-4 ${course.isLiked ? "fill-current" : ""}`} />
                          </Button>
                          <Button
                            variant={course.isSaved ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleSave(course.id)}
                            className="px-3"
                          >
                            <Bookmark
                              className={`h-4 w-4 ${course.isSaved ? "fill-current" : ""}`}
                            />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
