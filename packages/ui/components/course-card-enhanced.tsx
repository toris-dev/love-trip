"use client"

import * as React from "react"
import { memo } from "react"
import Image from "next/image"
import { MapPin, Calendar, Heart } from "lucide-react"
import { cn } from "@lovetrip/utils"
import { Card, CardContent } from "./card"
import { Badge } from "./badge"

export interface CourseCardEnhancedProps {
  id: string
  title: string
  description?: string
  imageUrl?: string
  region: string
  placeCount: number
  duration?: string
  distance?: string
  category?: string
  matchPercentage?: number
  rating?: number
  priceLevel?: number
  onClick?: () => void
  className?: string
}

export const CourseCardEnhanced = memo(function CourseCardEnhanced({
  id,
  title,
  description,
  imageUrl,
  region,
  placeCount,
  duration,
  distance,
  category,
  matchPercentage,
  rating,
  priceLevel,
  onClick,
  className,
}: CourseCardEnhancedProps) {
  const priceLevelSymbols = ["$", "$$", "$$$", "$$$$"]
  const priceSymbol = priceLevel ? priceLevelSymbols[priceLevel - 1] || "$" : undefined

  return (
    <div className={cn("w-full animate-in fade-in slide-in-from-bottom-4 duration-300", className)}>
      <Card
        variant="image"
        className={cn(
          "cursor-pointer group overflow-hidden",
          onClick && "hover:shadow-xl hover:border-primary/30"
        )}
        onClick={onClick}
      >
        <div className="relative w-full aspect-video overflow-hidden bg-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <MapPin className="h-12 w-12 text-primary/40" />
            </div>
          )}
          {/* 이미지 오버레이 그라데이션 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* 지역 배지 */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
            <Badge className="bg-background/90 backdrop-blur-sm text-foreground border-0 text-xs">
              {region}
            </Badge>
            {matchPercentage !== undefined && (
              <Badge className="bg-primary/90 backdrop-blur-sm text-primary-foreground border-0 text-xs flex items-center gap-1">
                <Heart className="h-3 w-3 fill-current" />
                {matchPercentage}% Match
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          {/* 제목 */}
          <div>
            <h3 className="font-semibold text-base sm:text-lg line-clamp-1 text-foreground mb-1">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
            )}
          </div>

          {/* 메타 정보 */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
            {duration && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{duration}</span>
              </div>
            )}
            {placeCount > 0 && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{placeCount}개 장소</span>
                </div>
              </>
            )}
            {distance && (
              <>
                <span>•</span>
                <span>{distance}</span>
              </>
            )}
          </div>

          {/* 카테고리 및 가격 */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-2 flex-wrap">
              {category && (
                <Badge variant="secondary" className="text-xs">
                  {category}
                </Badge>
              )}
              {rating !== undefined && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>⭐</span>
                  <span>{rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            {priceSymbol && (
              <Badge variant="outline" className="text-xs">
                {priceSymbol}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
})
