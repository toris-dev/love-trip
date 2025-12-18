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
  places: Database["public"]["Tables"]["places"]["Row"] | null
}

interface FavoritesPageClientProps {
  initialFavorites: PlaceFavorite[]
}

export function FavoritesPageClient({ initialFavorites }: FavoritesPageClientProps) {
  const router = useRouter()
  const [favorites, setFavorites] = useState(initialFavorites)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredFavorites = favorites.filter(fav => {
    if (!fav.places) return false
    const place = fav.places
    const query = searchQuery.toLowerCase()
    return (
      place.name.toLowerCase().includes(query) ||
      place.address?.toLowerCase().includes(query) ||
      place.description?.toLowerCase().includes(query)
    )
  })

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
          {filteredFavorites.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? "검색 결과가 없습니다" : "즐겨찾기한 장소가 없습니다"}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "다른 검색어를 시도해보세요"
                    : "장소를 즐겨찾기에 추가하면 여기서 확인할 수 있습니다"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFavorites.map(favorite => {
                const place = favorite.places
                if (!place) return null

                return (
                  <Card key={favorite.id} className="hover:shadow-lg transition-shadow">
                    {place.image_url && (
                      <div className="relative w-full h-48 rounded-t-lg overflow-hidden">
                        <Image
                          src={place.image_url}
                          alt={place.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-1">{place.name}</CardTitle>
                          {place.address && (
                            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span className="line-clamp-1">{place.address}</span>
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFavorite(place.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                        >
                          <Heart className="h-4 w-4 fill-red-500" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{place.type}</Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{(place.rating ?? 0).toFixed(1)}</span>
                        </div>
                      </div>
                      {place.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {place.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
