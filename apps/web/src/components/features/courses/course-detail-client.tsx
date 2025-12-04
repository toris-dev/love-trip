"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@lovetrip/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@lovetrip/ui/components/card"
import { Badge } from "@lovetrip/ui/components/badge"
import { MapPin, Heart, Bookmark, Eye, Clock, ArrowLeft, User } from "lucide-react"
import { ShareButton } from "@/components/shared/share-button"
import Image from "next/image"
import { toast } from "sonner"
import dynamic from "next/dynamic"
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

    try {
      const response = await fetch(`/api/user-courses/${course.id}/like`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("좋아요 처리에 실패했습니다")

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
    } catch {
      toast.error("좋아요 처리에 실패했습니다")
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

  const mapPlaces = course.places.map(p => ({
    id: p.place.id,
    name: p.place.name,
    lat: p.place.lat,
    lng: p.place.lng,
    type: p.place.type as "CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC",
    rating: p.place.rating ?? 0,
    priceLevel: p.place.price_level ?? 0,
    description: p.place.description || "",
    image: p.place.image_url || "",
  }))

  const mapPath = course.places.map(p => ({ lat: p.place.lat, lng: p.place.lng }))

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 뒤로가기 */}
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            뒤로가기
          </Button>

          {/* 코스 헤더 */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={course.course_type === "travel" ? "default" : "secondary"}>
                      {course.course_type === "travel" ? "여행 코스" : "데이트 코스"}
                    </Badge>
                    <Badge variant="outline">{course.region}</Badge>
                  </div>
                  <CardTitle className="text-2xl mb-2">{course.title}</CardTitle>
                  {course.description && (
                    <p className="text-muted-foreground mb-4">{course.description}</p>
                  )}

                  {/* 작성자 정보 */}
                  {course.author && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <User className="h-4 w-4" />
                      <span>{course.author.display_name || course.author.nickname || "익명"}</span>
                    </div>
                  )}

                  {/* 통계 */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{course.view_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{likeCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bookmark className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{saveCount}</span>
                    </div>
                    {course.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{course.duration}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex flex-col gap-2">
                  <ShareButton
                    title={course.title}
                    description={course.description || undefined}
                    url={`/courses/${course.id}`}
                    imageUrl={course.image_url || undefined}
                    variant="outline"
                    className="w-full"
                  />
                  <Button
                    variant={isLiked ? "default" : "outline"}
                    onClick={handleLike}
                    className="w-full"
                    disabled={!userId}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
                    좋아요
                  </Button>
                  <Button
                    variant={isSaved ? "default" : "outline"}
                    onClick={handleSave}
                    className="w-full"
                    disabled={!userId}
                  >
                    <Bookmark className={`h-4 w-4 mr-2 ${isSaved ? "fill-current" : ""}`} />
                    저장
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* 지도 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>코스 지도</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-96 rounded-lg overflow-hidden">
                <NaverMapView places={mapPlaces} path={mapPath} />
              </div>
            </CardContent>
          </Card>

          {/* 장소 목록 */}
          <Card>
            <CardHeader>
              <CardTitle>방문 장소 ({course.place_count}개)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {course.places.map((coursePlace, index) => (
                  <div
                    key={coursePlace.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{coursePlace.place.name}</h3>
                          {coursePlace.place.address && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                              <MapPin className="h-3 w-3" />
                              <span>{coursePlace.place.address}</span>
                            </div>
                          )}
                          {coursePlace.place.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {coursePlace.place.description}
                            </p>
                          )}
                        </div>
                        {coursePlace.place.image_url && (
                          <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={coursePlace.place.image_url}
                              alt={coursePlace.place.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {coursePlace.place.rating && (
                          <Badge variant="outline" className="text-xs">
                            ⭐ {coursePlace.place.rating.toFixed(1)}
                          </Badge>
                        )}
                        {coursePlace.place.price_level && (
                          <Badge variant="outline" className="text-xs">
                            💰 {"💰".repeat(coursePlace.place.price_level)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

