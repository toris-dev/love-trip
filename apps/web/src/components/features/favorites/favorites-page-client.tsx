"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@lovetrip/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@lovetrip/ui/components/card"
import { Input } from "@lovetrip/ui/components/input"
import { Badge } from "@lovetrip/ui/components/badge"
import { ArrowLeft, Heart, MapPin, Star, Search, X } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import type { Database } from "@lovetrip/shared/types/database"

type PlaceFavorite = Database["public"]["Tables"]["place_favorites"]["Row"] & {
  places: null // places 테이블이 삭제되어 항상 null
}

interface FavoritesPageClientProps {
  initialFavorites: PlaceFavorite[]
}

export function FavoritesPageClient({ initialFavorites }: FavoritesPageClientProps) {
  const router = useRouter()
  const [favorites, setFavorites] = useState(initialFavorites)
  const [searchQuery, setSearchQuery] = useState("")

  // places 테이블이 삭제되어 필터링 불가
  // 모든 즐겨찾기는 places 정보가 없으므로 빈 배열로 표시
  const filteredFavorites: PlaceFavorite[] = []

  const handleRemoveFavorite = async (placeId: string) => {
    try {
      const response = await fetch(`/api/places/${placeId}/favorite`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("즐겨찾기 제거에 실패했습니다")
      }

      setFavorites(prev => prev.filter(fav => fav.place_id !== placeId))
      toast.success("즐겨찾기에서 제거되었습니다")
    } catch (error) {
      console.error("Error removing favorite:", error)
      toast.error(error instanceof Error ? error.message : "오류가 발생했습니다")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 헤더 */}
          <div className="mb-6">
            <Button variant="ghost" asChild className="mb-4">
              <button onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                돌아가기
              </button>
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                  <Heart className="h-8 w-8 text-red-500 fill-red-500" />
                  즐겨찾기 장소
                </h1>
                <p className="text-muted-foreground">저장한 장소를 한눈에 확인하고 관리하세요</p>
              </div>
            </div>
          </div>

          {/* 검색 바 */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="장소명, 주소, 설명으로 검색..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* 즐겨찾기 목록 */}
          <Card>
            <CardContent className="py-16 text-center">
              <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">즐겨찾기 기능을 사용할 수 없습니다</h3>
              <p className="text-muted-foreground">
                places 테이블이 삭제되어 즐겨찾기 기능을 일시적으로 사용할 수 없습니다.
                <br />
                새로운 데이터 소스로 대체될 예정입니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
