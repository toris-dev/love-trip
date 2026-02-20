"use client"

import { useState, useEffect } from "react"
import { Button } from "@lovetrip/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@lovetrip/ui/components/card"
import { Input } from "@lovetrip/ui/components/input"
import { Badge } from "@lovetrip/ui/components/badge"
import { Search, MapPin, Heart, Bookmark, Eye, Clock, Filter, X, Crown } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@lovetrip/api/supabase/client"
import { toast } from "sonner"
import { ShareButton } from "@/components/shared/share-button"
import type { UserCourseWithAuthor } from "@lovetrip/shared/types"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles } from "lucide-react"
import { formatPriceRange } from "@/lib/format-price"
import { Wallet } from "lucide-react"

interface CoursesListClientProps {
  initialCourses: UserCourseWithAuthor[]
  userId?: string
  isPremium?: boolean
}

export function CoursesListClient({
  initialCourses,
  userId,
  isPremium = false,
}: CoursesListClientProps) {
  const [courses, setCourses] = useState(initialCourses)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRegion, setSelectedRegion] = useState<string>("")
  const [selectedType, setSelectedType] = useState<"travel" | "date" | "">("")
  const [sortBy, setSortBy] = useState<"popular" | "recent" | "views" | "likes">("popular")

  // 프리미엄 고급 필터
  const [minViews, setMinViews] = useState<number>(0)
  const [minLikes, setMinLikes] = useState<number>(0)
  const [premiumOnly, setPremiumOnly] = useState<boolean>(false)

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

  // 필터링 로직을 useMemo로 최적화
  const filteredCourses = useMemo(() => {
    if (!searchQuery && minViews === 0 && minLikes === 0 && !premiumOnly) {
      return courses
    }

    const query = searchQuery.toLowerCase()
    const hasSearchQuery = query.length > 0

    return courses.filter(course => {
      // 프리미엄 고급 필터
      if (isPremium) {
        if (minViews > 0 && (course.view_count || 0) < minViews) return false
        if (minLikes > 0 && (course.like_count || 0) < minLikes) return false
        if (premiumOnly && !course.author?.isPremium) return false
      }

      // 검색어 필터
      if (hasSearchQuery) {
        return (
          course.title.toLowerCase().includes(query) ||
          course.region.toLowerCase().includes(query) ||
          course.description?.toLowerCase().includes(query)
        )
      }

      return true
    })
  }, [courses, searchQuery, isPremium, minViews, minLikes, premiumOnly])

  return (
    <div className="min-h-screen bg-background/50 backdrop-blur-3xl">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center relative"
          >
            <motion.div
              className="absolute -top-4 left-1/2 -translate-x-1/2"
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <Sparkles className="h-8 w-8 text-primary/30" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-primary via-primary/90 to-accent bg-clip-text text-transparent animate-gradient">
              트렌디한 여행 코스
            </h1>
            <p className="text-lg text-muted-foreground">
              다른 커플들의 특별한 순간을 발견하세요 ✨
            </p>
          </motion.div>

          {/* 검색 및 필터 */}
          <div className="mb-10 space-y-6">
            {/* 검색 바 */}
            <motion.div
              className="relative max-w-2xl mx-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
              <Input
                placeholder="어디로 떠나고 싶으신가요? 💕"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-lg rounded-full shadow-lg border-2 border-primary/30 focus-visible:ring-primary/50 focus-visible:border-primary bg-white/90 dark:bg-black/90 backdrop-blur-md hover:border-primary/50 transition-all duration-300"
              />
              {searchQuery && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </motion.div>

            {/* 필터 */}
            <div className="flex flex-col gap-4 items-center justify-center">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Badge
                  variant={selectedRegion === "" ? "default" : "outline"}
                  className="cursor-pointer px-4 py-2 rounded-full text-sm transition-all hover:scale-105"
                  onClick={() => setSelectedRegion("")}
                >
                  전체 지역
                </Badge>
                {regions.map(region => (
                  <Badge
                    key={region}
                    variant={selectedRegion === region ? "default" : "outline"}
                    className="cursor-pointer px-4 py-2 rounded-full text-sm transition-all hover:scale-105"
                    onClick={() => setSelectedRegion(region)}
                  >
                    {region}
                  </Badge>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-full">
                  <Button
                    variant={selectedType === "" ? "default" : "ghost"}
                    size="sm"
                    className="rounded-full"
                    onClick={() => setSelectedType("")}
                  >
                    전체
                  </Button>
                  <Button
                    variant={selectedType === "travel" ? "default" : "ghost"}
                    size="sm"
                    className="rounded-full"
                    onClick={() => setSelectedType("travel")}
                  >
                    여행
                  </Button>
                  <Button
                    variant={selectedType === "date" ? "default" : "ghost"}
                    size="sm"
                    className="rounded-full"
                    onClick={() => setSelectedType("date")}
                  >
                    데이트
                  </Button>
                </div>

                <select
                  value={sortBy}
                  onChange={e =>
                    setSortBy(e.target.value as "popular" | "recent" | "views" | "likes")
                  }
                  className="px-4 py-2 text-sm border rounded-full bg-background hover:bg-accent transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="popular">🔥 인기순</option>
                  <option value="recent">✨ 최신순</option>
                  <option value="views">👀 조회수순</option>
                  <option value="likes">❤️ 좋아요순</option>
                </select>
              </div>

              {/* 프리미엄 고급 필터 */}
              {isPremium && (
                <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-yellow-50/50 to-orange-50/50 dark:from-yellow-950/20 dark:to-orange-950/20 border border-yellow-500/30">
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
                      id="premium-only"
                      checked={premiumOnly}
                      onChange={e => setPremiumOnly(e.target.checked)}
                      className="w-4 h-4 rounded border-primary"
                    />
                    <label htmlFor="premium-only" className="text-xs cursor-pointer">
                      프리미엄 코스만
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 코스 목록 */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-muted-foreground">특별한 코스를 불러오는 중...</p>
              </div>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 mb-6">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">원하는 코스를 찾지 못했어요</h3>
              <p className="text-muted-foreground mb-6">다른 검색어나 필터를 사용해보세요</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedRegion("")
                  setSelectedType("")
                }}
                className="rounded-full"
              >
                필터 초기화
              </Button>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence>
                {filteredCourses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card
                      variant="glass"
                      className="h-full overflow-hidden group relative bg-gradient-to-br from-card via-card to-primary/5 border-2 border-transparent hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2"
                    >
                      {/* 그라데이션 오버레이 */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                      {course.image_url && (
                        <div className="relative w-full h-56 overflow-hidden rounded-t-xl">
                          <Image
                            src={course.image_url}
                            alt={course.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-125"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <div className="absolute top-4 right-4 flex items-center gap-2">
                            {course.author?.isPremium && (
                              <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white backdrop-blur-md shadow-lg border-0 font-semibold px-3 py-1.5 flex items-center gap-1">
                                <Crown className="h-3.5 w-3.5" />
                                프리미엄
                              </Badge>
                            )}
                            <Badge className="bg-white/95 dark:bg-black/95 text-black dark:text-white backdrop-blur-md shadow-lg border-0 font-semibold px-3 py-1.5">
                              {course.course_type === "travel" ? "✈️ 여행" : "💑 데이트"}
                            </Badge>
                          </div>
                          {/* 호버 시 하트 아이콘 */}
                          <motion.div
                            className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity"
                            initial={{ scale: 0 }}
                            whileHover={{ scale: 1.2 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            <Heart className="h-8 w-8 text-white drop-shadow-lg fill-white/50" />
                          </motion.div>
                        </div>
                      )}
                      <CardHeader className="p-5 pb-2 relative z-10">
                        <CardTitle className="text-xl font-bold line-clamp-1 group-hover:text-primary transition-colors duration-300 bg-gradient-to-r from-foreground to-foreground group-hover:from-primary group-hover:to-purple-600 bg-clip-text">
                          {course.title}
                        </CardTitle>
                        {course.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-2 group-hover:text-foreground/80 transition-colors">
                            {course.description}
                          </p>
                        )}
                      </CardHeader>
                      <CardContent className="p-5 pt-2 space-y-4 relative z-10">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-primary/10 text-primary font-medium">
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{course.region}</span>
                            </div>
                            {course.author?.isPremium && (
                              <Badge
                                variant="outline"
                                className="flex items-center gap-1 px-2 py-1 border-yellow-500/50 text-yellow-600 dark:text-yellow-400"
                              >
                                <Crown className="h-3 w-3" />
                                프리미엄
                              </Badge>
                            )}
                            {formatPriceRange(course.min_price, course.max_price) && (
                              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-success/10 text-success font-medium border border-success/20">
                                <Wallet className="h-3.5 w-3.5" />
                                <span>{formatPriceRange(course.min_price, course.max_price)}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <motion.span
                              className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/50 text-muted-foreground"
                              whileHover={{ scale: 1.1 }}
                            >
                              <Eye className="h-3.5 w-3.5" /> {course.view_count || 0}
                            </motion.span>
                            <motion.span
                              className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/50 text-muted-foreground"
                              whileHover={{ scale: 1.1 }}
                            >
                              <Heart className="h-3.5 w-3.5" /> {course.like_count || 0}
                            </motion.span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            variant={course.isLiked ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleLike(course.id)}
                            className={`flex-1 rounded-full transition-all duration-300 ${
                              course.isLiked
                                ? "bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-700 text-white border-0 shadow-lg shadow-primary/30"
                                : "hover:bg-primary/10 hover:border-primary/50"
                            }`}
                          >
                            <Heart
                              className={`h-4 w-4 mr-1 transition-all ${
                                course.isLiked ? "fill-current animate-pulse" : ""
                              }`}
                            />
                            좋아요
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="flex-1 rounded-full border-primary/30 hover:bg-gradient-to-r hover:from-primary hover:to-purple-600 hover:text-white hover:border-0 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30"
                          >
                            <Link href={`/date/${course.id}`}>상세보기</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
