"use client"

import * as React from "react"
import { TrendingUp, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@lovetrip/ui/components/card"
import { Button } from "@lovetrip/ui/components/button"
import { Badge } from "@lovetrip/ui/components/badge"
import Image from "next/image"
import Link from "next/link"

export interface TrendingDestination {
  id: string
  country: string
  destination: string
  price: string
  imageUrl: string
}

interface TrendingDestinationsSectionProps {
  destinations: TrendingDestination[]
  onSeeMore?: () => void
}

export function TrendingDestinationsSection({
  destinations,
  onSeeMore,
}: TrendingDestinationsSectionProps) {
  return (
    <section className="mb-8 sm:mb-12" aria-labelledby="trending-destinations-heading">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 id="trending-destinations-heading" className="text-xl sm:text-2xl font-bold">인기 목적지</h2>
        </div>
        {onSeeMore && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSeeMore}
            className="text-primary hover:text-primary/80"
          >
            더 보기
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>

      {destinations.length === 0 ? (
        <div className="text-center py-12 px-4">
          <TrendingUp className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground text-lg mb-2">인기 목적지가 없습니다</p>
          <p className="text-sm text-muted-foreground">곧 새로운 목적지를 추가할 예정입니다</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {destinations.map((destination) => (
            <Card
              key={destination.id}
              className="group cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden border hover:border-primary/20 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
              tabIndex={0}
              role="article"
              aria-label={`${destination.destination} - ${destination.country}`}
            >
            <div className="relative aspect-video overflow-hidden bg-muted">
              {destination.imageUrl ? (
                <Image
                  src={destination.imageUrl}
                  alt={destination.destination}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <TrendingUp className="h-12 w-12 text-primary/40" />
                </div>
              )}
              {/* 국가 배지 */}
              <Badge className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm text-foreground border-0 text-xs font-semibold">
                {destination.country}
              </Badge>
            </div>

            <CardContent className="p-4 space-y-2">
              <h3 className="font-semibold text-base sm:text-lg line-clamp-1">
                {destination.destination}
              </h3>
              <p className="text-sm text-muted-foreground font-medium">{destination.price}</p>
            </CardContent>
          </Card>
          ))}
        </div>
      )}
    </section>
  )
}
