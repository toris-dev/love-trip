"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@lovetrip/ui/components/card"
import { Button } from "@lovetrip/ui/components/button"
import { Badge } from "@lovetrip/ui/components/badge"
import { Star, Heart } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { createClient } from "@lovetrip/api/supabase/client"
import type { Place } from "../types"

interface PlaceDetailCardProps {
  place: Place | null
  onClose: () => void
}

export function PlaceDetailCard({ place, onClose }: PlaceDetailCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const checkFavorite = async () => {
      if (!place) return

      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setIsFavorite(false)
          return
        }

        const { data } = await supabase
          .from("place_favorites")
          .select("id")
          .eq("user_id", user.id)
          .eq("place_id", place.id)
          .single()

        setIsFavorite(!!data)
      } catch (error) {
        setIsFavorite(false)
      }
    }

    checkFavorite()
  }, [place])

  const handleToggleFavorite = async () => {
    if (!place || isLoading) return

    try {
      setIsLoading(true)
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error("로그인이 필요합니다")
        return
      }

      if (isFavorite) {
        // 즐겨찾기 제거
        const response = await fetch(`/api/places/${place.id}/favorite`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("즐겨찾기 제거에 실패했습니다")
        }

        setIsFavorite(false)
        toast.success("즐겨찾기에서 제거되었습니다")
      } else {
        // 즐겨찾기 추가
        const response = await fetch(`/api/places/${place.id}/favorite`, {
          method: "POST",
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "즐겨찾기 추가에 실패했습니다")
        }

        setIsFavorite(true)
        toast.success("즐겨찾기에 추가되었습니다")
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast.error(error instanceof Error ? error.message : "오류가 발생했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  if (!place) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-0 left-0 right-0 md:absolute md:bottom-6 md:right-6 md:left-auto md:w-96 z-50"
    >
      <Card className="m-4 lg:m-0 shadow-2xl">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{place.name}</CardTitle>
              <CardDescription className="mt-1">
                {place.address || "주소 정보 없음"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleFavorite}
                disabled={isLoading}
                className="h-8 w-8 p-0"
              >
                <Heart
                  className={`h-4 w-4 ${
                    isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
                  }`}
                />
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                ×
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {place.image_url && (
            <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
              <Image src={place.image_url} alt={place.name} fill className="object-cover" />
            </div>
          )}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{place.type}</Badge>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">{(place.rating ?? 0).toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm">💰</span>
                <span className="text-sm">{"💰".repeat(place.price_level ?? 0)}</span>
              </div>
            </div>
            {place.description && (
              <p className="text-sm text-muted-foreground line-clamp-3">{place.description}</p>
            )}
            {place.phone && (
              <p className="text-sm">
                <span className="font-medium">전화:</span> {place.phone}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
