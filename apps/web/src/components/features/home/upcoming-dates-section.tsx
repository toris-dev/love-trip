"use client"

import * as React from "react"
import { Calendar, MapPin, Heart, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@lovetrip/ui/components/card"
import { Button } from "@lovetrip/ui/components/button"
import { Badge } from "@lovetrip/ui/components/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@lovetrip/ui/components/avatar"
import Image from "next/image"
import Link from "next/link"

export interface UpcomingDate {
  id: string
  title: string
  location: string
  date: Date
  imageUrl?: string
  participants?: Array<{ id: string; name: string; avatarUrl?: string }>
  isLiked?: boolean
}

interface UpcomingDatesSectionProps {
  dates: UpcomingDate[]
  onViewAll?: () => void
}

export function UpcomingDatesSection({ dates, onViewAll }: UpcomingDatesSectionProps) {
  const formatDateLabel = (date: Date) => {
    const now = new Date()
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "오늘"
    if (diffDays === 1) return "내일"
    if (diffDays === 2) return "모레"
    if (diffDays < 7) return `${diffDays}일 후`
    if (date.getDay() === 6) return "토요일"
    if (date.getDay() === 0) return "일요일"
    return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
  }

  return (
    <section className="mb-8 sm:mb-12" aria-labelledby="upcoming-dates-heading">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 id="upcoming-dates-heading" className="text-xl sm:text-2xl font-bold">다가오는 일정</h2>
        </div>
        {onViewAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAll}
            className="text-primary hover:text-primary/80"
          >
            전체 보기
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>

      {dates.length === 0 ? (
        <div className="text-center py-12 px-4">
          <Calendar className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground text-lg mb-2">다가오는 일정이 없습니다</p>
          <p className="text-sm text-muted-foreground">캘린더에 일정을 추가해보세요</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {dates.slice(0, 3).map((date) => (
            <Card
              key={date.id}
              className="group cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden border hover:border-primary/20 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
              tabIndex={0}
              role="article"
              aria-label={`${date.title} - ${date.location}`}
            >
            <div className="relative aspect-video overflow-hidden bg-muted">
              {date.imageUrl ? (
                <Image
                  src={date.imageUrl}
                  alt={date.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Calendar className="h-12 w-12 text-primary/40" />
                </div>
              )}
              {/* 날짜 라벨 */}
              <Badge className="absolute top-2 right-2 bg-primary/90 backdrop-blur-sm text-primary-foreground border-0">
                {formatDateLabel(date.date)}
              </Badge>
              {/* 좋아요 아이콘 */}
              {date.isLiked && (
                <div className="absolute top-2 left-2">
                  <Heart className="h-5 w-5 fill-primary text-primary" />
                </div>
              )}
            </div>

            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-base sm:text-lg mb-1 line-clamp-1">
                  {date.title}
                </h3>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="line-clamp-1">{date.location}</span>
                </div>
              </div>

              {/* 참가자 아바타 */}
              {date.participants && date.participants.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {date.participants.slice(0, 2).map((participant) => (
                      <Avatar key={participant.id} className="h-8 w-8 border-2 border-background">
                        <AvatarImage src={participant.avatarUrl} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {participant.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  {date.participants.length > 2 && (
                    <span className="text-xs text-muted-foreground">
                      +{date.participants.length - 2}
                    </span>
                  )}
                </div>
              )}

              <Button
                variant="default"
                size="sm"
                className="w-full bg-primary hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label={`${date.title} 상세보기`}
              >
                상세보기
              </Button>
            </CardContent>
          </Card>
          ))}
        </div>
      )}
    </section>
  )
}
