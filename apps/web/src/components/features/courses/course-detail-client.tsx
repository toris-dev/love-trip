"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@lovetrip/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@lovetrip/ui/components/card"
import { Badge } from "@lovetrip/ui/components/badge"
import {
  MapPin,
  Heart,
  Bookmark,
  Eye,
  Clock,
  ArrowLeft,
  User,
  Sparkles,
  Star,
  Crown,
  Wallet,
} from "lucide-react"
import { ShareButton } from "@/components/shared/share-button"
import Image from "next/image"
import { toast } from "sonner"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import type { UserCourseWithPlaces } from "@lovetrip/shared/types"

const NaverMapView = dynamic(() => import("@/components/shared/naver-map-view"), { ssr: false })

interface CourseDetailClientProps {
  course: UserCourseWithPlaces
  userId?: string
}

export function CourseDetailClient({ course, userId }: CourseDetailClientProps) {
  const router = useRouter()
  const [isLiked, setIsLiked] = useState(course.isLiked || false)
  const [isSaved, setIsSaved] = useState(course.isSaved || false)
  const [likeCount, setLikeCount] = useState(course.like_count || 0)
  const [saveCount, setSaveCount] = useState(course.save_count || 0)

  const handleLike = async () => {
    if (!userId) {
      toast.error("로그인이 필요합니다")
      return
    }

    // 자신의 코스는 좋아요 불가
    if (course.user_id === userId) {
      toast.error("자신의 코스는 좋아요할 수 없습니다")
      return
    }

    try {
      const response = await fetch(`/api/user-courses/${course.id}/like`, {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "좋아요 처리에 실패했습니다")
      }

      const { liked } = await response.json()

      setIsLiked(liked)
      setLikeCount(prev => (liked ? prev + 1 : prev - 1))

      if (liked) {
        toast.success("좋아요를 눌렀습니다", {
          description: "코스 작성자에게 XP 5 + 포인트 2가 지급됩니다",
          duration: 3000,
        })
      } else {
        toast.success("좋아요를 취소했습니다")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "좋아요 처리에 실패했습니다")
    }
  }

  const handleSave = async () => {
    if (!userId) {
      toast.error("로그인이 필요합니다")
      return
    }

    try {
      const response = await fetch(`/api/user-courses/${course.id}/save`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("저장 처리에 실패했습니다")

      const { saved } = await response.json()

      setIsSaved(saved)
      setSaveCount(prev => (saved ? prev + 1 : prev - 1))

      if (saved) {
        toast.success("저장되었습니다", {
          description: "코스 작성자에게 XP 10 + 포인트 5가 지급됩니다",
          duration: 3000,
        })
      } else {
        toast.success("저장이 취소되었습니다")
      }
    } catch {
      toast.error("저장 처리에 실패했습니다")
    }
  }

  // 하이브리드 방식: place가 null일 수 있으므로 필터링
  const mapPlaces = course.places
    .filter(p => p.place !== null)
    .map(p => ({
      id: p.place!.id,
      name: p.place!.name,
      lat: p.place!.lat,
      lng: p.place!.lng,
      type: p.place!.type as "CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC",
      rating: p.place!.rating ?? 0,
      priceLevel: p.place!.price_level ?? 0,
      description: p.place!.description || "",
      image: p.place!.image_url || "",
    }))

  const mapPath = course.places
    .filter(p => p.place !== null)
    .map(p => ({ lat: p.place!.lat, lng: p.place!.lng }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 뒤로가기 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-6 group hover:bg-primary/10 transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              뒤로가기
            </Button>
          </motion.div>

          {/* 코스 헤더 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="mb-6 border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 shadow-xl">
              <CardHeader className="p-6">
                <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      <Badge
                        variant={course.course_type === "travel" ? "default" : "secondary"}
                        className="px-3 py-1.5 text-sm font-semibold shadow-lg"
                      >
                        {course.course_type === "travel" ? "✈️ 여행 코스" : "💑 데이트 코스"}
                      </Badge>
                      <Badge variant="outline" className="px-3 py-1.5 text-sm font-semibold">
                        <MapPin className="h-3.5 w-3.5 mr-1" />
                        {course.region}
                      </Badge>
                    </div>
                    <CardTitle className="text-3xl md:text-4xl mb-3 font-extrabold bg-gradient-to-r from-foreground via-primary to-purple-600 bg-clip-text text-transparent">
                      {course.title}
                    </CardTitle>
                    {course.description && (
                      <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                        {course.description}
                      </p>
                    )}

                    {/* 작성자 정보 */}
                    {course.author && (
                      <motion.div
                        className="flex items-center gap-3 text-sm mb-6 p-3 rounded-lg bg-muted/50 w-fit"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                          {course.author.isPremium ? (
                            <Crown className="h-5 w-5 text-yellow-400" />
                          ) : (
                            <User className="h-5 w-5 text-white" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">
                              {course.author.display_name || course.author.nickname || "익명"}
                            </p>
                            {course.author.isPremium && (
                              <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white flex items-center gap-1 px-2 py-0.5">
                                <Crown className="h-3 w-3" />
                                프리미엄
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">코스 작성자</p>
                        </div>
                      </motion.div>
                    )}

                    {/* 통계 */}
                    <div className="flex items-center gap-6 text-sm flex-wrap">
                      <motion.div
                        className="flex items-center gap-2 px-3 py-2 rounded-full bg-muted/50"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Eye className="h-4 w-4 text-primary" />
                        <span className="font-semibold">{course.view_count || 0}</span>
                        <span className="text-muted-foreground text-xs">조회</span>
                      </motion.div>
                      <motion.div
                        className="flex items-center gap-2 px-3 py-2 rounded-full bg-muted/50"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Heart className="h-4 w-4 text-primary" />
                        <span className="font-semibold">{likeCount}</span>
                        <span className="text-muted-foreground text-xs">좋아요</span>
                      </motion.div>
                      <motion.div
                        className="flex items-center gap-2 px-3 py-2 rounded-full bg-muted/50"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Bookmark className="h-4 w-4 text-yellow-500" />
                        <span className="font-semibold">{saveCount}</span>
                        <span className="text-muted-foreground text-xs">저장</span>
                      </motion.div>
                      {course.duration && (
                        <motion.div
                          className="flex items-center gap-2 px-3 py-2 rounded-full bg-muted/50"
                          whileHover={{ scale: 1.05 }}
                        >
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span className="font-semibold">{course.duration}</span>
                        </motion.div>
                      )}
                      {course.estimated_budget && (
                        <motion.div
                          className="flex items-center gap-2 px-3 py-2 rounded-full bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30"
                          whileHover={{ scale: 1.05 }}
                        >
                          <Wallet className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <span className="font-semibold text-green-700 dark:text-green-300">
                            예산: {course.estimated_budget.toLocaleString()}원
                          </span>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex flex-col gap-3 w-full md:w-auto md:min-w-[200px]">
                    <ShareButton
                      title={course.title}
                      description={course.description || undefined}
                      url={`/date/${course.id}`}
                      imageUrl={course.image_url || undefined}
                      variant="default"
                      className="w-full"
                    />
                    <Button
                      variant={isLiked ? "default" : "outline"}
                      onClick={handleLike}
                      className={`w-full transition-all duration-300 ${
                        isLiked
                          ? "bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-700 text-white border-0 shadow-lg shadow-primary/30"
                          : "hover:bg-primary/10 hover:border-primary/50"
                      }`}
                      disabled={!userId || course.user_id === userId}
                      title={
                        !userId
                          ? "로그인이 필요합니다"
                          : course.user_id === userId
                            ? "자신의 코스는 좋아요할 수 없습니다"
                            : undefined
                      }
                    >
                      <Heart
                        className={`h-4 w-4 mr-2 transition-all ${
                          isLiked ? "fill-current animate-pulse" : ""
                        }`}
                      />
                      좋아요
                    </Button>
                    <Button
                      variant={isSaved ? "default" : "outline"}
                      onClick={handleSave}
                      className={`w-full transition-all duration-300 ${
                        isSaved
                          ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0 shadow-lg shadow-yellow-500/30"
                          : "hover:bg-primary/10 hover:border-primary/50"
                      }`}
                      disabled={!userId}
                    >
                      <Bookmark
                        className={`h-4 w-4 mr-2 transition-all ${isSaved ? "fill-current" : ""}`}
                      />
                      저장
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </motion.div>

          {/* 지도 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="mb-6 border-2 border-primary/20 shadow-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-purple-500/10">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  코스 지도
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="w-full h-96 rounded-b-lg overflow-hidden">
                  <NaverMapView places={mapPlaces} path={mapPath} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 장소 목록 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-2 border-primary/20 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-purple-500/10">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  방문 장소 ({course.place_count}개)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {course.places && course.places.filter(cp => cp.place !== null).length > 0 ? (
                  <div className="space-y-4">
                    {course.places
                      .filter(cp => cp.place !== null)
                      .map((coursePlace, index) => {
                        const place = coursePlace.place!
                        const placeNumber =
                          coursePlace.order_index !== undefined
                            ? coursePlace.order_index + 1
                            : index + 1
                        return (
                          <motion.div
                            key={coursePlace.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group"
                          >
                            <Card className="border-2 border-transparent hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
                              <CardContent className="p-5">
                                <div className="flex items-start gap-4">
                                  <motion.div
                                    className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-lg font-bold text-white shadow-lg"
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ type: "spring", stiffness: 400 }}
                                  >
                                    {placeNumber}
                                  </motion.div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                      <div className="flex-1">
                                        <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">
                                          {place.name}
                                        </h3>
                                        {place.address && (
                                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 p-2 rounded-lg bg-muted/50 w-fit">
                                            <MapPin className="h-4 w-4 text-primary" />
                                            <span>{place.address}</span>
                                          </div>
                                        )}
                                        {place.description && (
                                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                            {place.description}
                                          </p>
                                        )}
                                      </div>
                                      {place.image_url && (
                                        <motion.div
                                          className="relative w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 shadow-lg"
                                          whileHover={{ scale: 1.05 }}
                                        >
                                          <Image
                                            src={place.image_url}
                                            alt={place.name}
                                            fill
                                            className="object-cover"
                                          />
                                        </motion.div>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                                      {place.rating && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs px-3 py-1.5 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-300"
                                        >
                                          <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
                                          {place.rating.toFixed(1)}
                                        </Badge>
                                      )}
                                      {place.price_level && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs px-3 py-1.5 bg-green-50 dark:bg-green-950/30 border-green-300"
                                        >
                                          💰 {"💰".repeat(place.price_level)}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )
                      })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">장소 정보가 없습니다</p>
                    <p className="text-sm mt-2">이 코스에는 등록된 장소가 없습니다.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
