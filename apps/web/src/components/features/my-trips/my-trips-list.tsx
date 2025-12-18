"use client"

import { useState } from "react"
import { Calendar, MapPin, Wallet, Plus, Star, Trash2, Edit } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@lovetrip/ui/components/card"
import { Button } from "@lovetrip/ui/components/button"
import { Badge } from "@lovetrip/ui/components/badge"
import Link from "next/link"
import { MyTripsClient } from "./my-trips-client"
import { ShareButton } from "@/components/shared/share-button"

type Trip = {
  id: string
  title: string
  destination: string
  startDate: string
  endDate: string
  budget: number
  status: "planning" | "ongoing" | "completed"
  places: number
  score?: number
}

interface MyTripsListProps {
  trips: Trip[]
}

export function MyTripsList({ trips }: MyTripsListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const filteredTrips = trips.filter(trip => {
    const matchesSearch =
      trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === "all" || trip.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusBadge = (status: Trip["status"]) => {
    const variants = {
      planning: { label: "계획 중", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
      ongoing: { label: "여행 중", color: "bg-green-500/10 text-green-500 border-green-500/20" },
      completed: { label: "완료", color: "bg-muted text-muted-foreground border-border" },
    }
    return variants[status]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <>
      <MyTripsClient
        onSearchChange={setSearchQuery}
        onFilterChange={setFilterStatus}
        filterStatus={filterStatus}
      />

      {filteredTrips.length === 0 ? (
        <Card className="text-center py-16 md:py-20">
          <CardContent>
            <div className="inline-flex items-center justify-center mb-6">
              <div className="rounded-full bg-muted p-6">
                <MapPin className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground/50" />
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-semibold mb-3">여행 계획이 없습니다</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              새로운 여행 계획을 만들어보세요!
            </p>
            <Button asChild size="lg">
              <Link href="/">
                <Plus className="mr-2 h-4 w-4" />
                여행 계획 시작하기
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredTrips.map(trip => (
            <Card
              key={trip.id}
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border hover:border-primary/50 overflow-hidden"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <CardTitle className="text-lg md:text-xl group-hover:text-primary transition-colors line-clamp-2 flex-1">
                    {trip.title}
                  </CardTitle>
                  <Badge className={`${getStatusBadge(trip.status).color} shrink-0`}>
                    {getStatusBadge(trip.status).label}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-1.5 text-sm">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{trip.destination}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2.5 mb-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2 shrink-0" />
                    <span className="truncate">
                      {formatDate(trip.startDate)} ~ {formatDate(trip.endDate)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Wallet className="h-4 w-4 mr-2 shrink-0" />
                    <span>예산: {trip.budget.toLocaleString()}원</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2 shrink-0" />
                    <span>방문 장소: {trip.places}곳</span>
                  </div>
                  {trip.score && (
                    <div className="flex items-center text-sm">
                      <Star className="h-4 w-4 mr-2 text-yellow-500 fill-yellow-500 shrink-0" />
                      <span>만족도: {trip.score}점</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 pt-4 border-t">
                  <div className="flex gap-2">
                    <Button asChild variant="default" size="sm" className="flex-1">
                      <Link href={`/my-trips/${trip.id}`}>
                        <Edit className="h-4 w-4 mr-2" />
                        상세보기
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      삭제
                    </Button>
                  </div>
                  {/* 공유 버튼 */}
                  <ShareButton
                    title={trip.title}
                    description={`${trip.destination} 여행 코스`}
                    url={`/my-trips/${trip.id}`}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats */}
      {trips.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 md:mt-12">
          <Card className="border-2">
            <CardContent className="pt-6 pb-6 text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary mb-2">
                {trips.length}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">총 여행 계획</div>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardContent className="pt-6 pb-6 text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-500 mb-2">
                {trips.filter(t => t.status === "planning").length}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">계획 중</div>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardContent className="pt-6 pb-6 text-center">
              <div className="text-2xl md:text-3xl font-bold text-green-500 mb-2">
                {trips.filter(t => t.status === "ongoing").length}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">여행 중</div>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardContent className="pt-6 pb-6 text-center">
              <div className="text-2xl md:text-3xl font-bold text-accent mb-2">
                {trips.filter(t => t.status === "completed").length}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">완료된 여행</div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
