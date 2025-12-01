"use client"

import { useState } from "react"
import { Calendar, MapPin, Wallet, Plus, Star, Trash2, Edit } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@lovetrip/ui/components/card"
import { Button } from "@lovetrip/ui/components/button"
import { Badge } from "@lovetrip/ui/components/badge"
import Link from "next/link"
import { MyTripsClient } from "./my-trips-client"

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

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch = trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
        <Card className="text-center py-12">
          <CardContent>
            <div className="inline-flex items-center justify-center mb-4">
              <MapPin className="h-16 w-16 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">여행 계획이 없습니다</h3>
            <p className="text-muted-foreground mb-6">
              새로운 여행 계획을 만들어보세요!
            </p>
            <Button asChild>
              <Link href="/">
                <Plus className="mr-2 h-4 w-4" />
                여행 계획 시작하기
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredTrips.map((trip) => (
            <Card 
              key={trip.id} 
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50 cursor-pointer"
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {trip.title}
                  </CardTitle>
                  <Badge className={getStatusBadge(trip.status).color}>
                    {getStatusBadge(trip.status).label}
                  </Badge>
                </div>
                <CardDescription className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {trip.destination}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(trip.startDate)} ~ {formatDate(trip.endDate)}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Wallet className="h-4 w-4 mr-2" />
                    예산: {trip.budget.toLocaleString()}원
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    방문 장소: {trip.places}곳
                  </div>
                  {trip.score && (
                    <div className="flex items-center text-sm">
                      <Star className="h-4 w-4 mr-2 text-yellow-500 fill-yellow-500" />
                      만족도: {trip.score}점
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-4 border-t">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/?plan=${trip.id}`}>
                      <Edit className="h-4 w-4 mr-2" />
                      수정
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    삭제
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mt-12">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">{trips.length}</div>
            <div className="text-sm text-muted-foreground">총 여행 계획</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-blue-500 mb-2">
              {trips.filter((t) => t.status === "planning").length}
            </div>
            <div className="text-sm text-muted-foreground">계획 중</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-green-500 mb-2">
              {trips.filter((t) => t.status === "completed").length}
            </div>
            <div className="text-sm text-muted-foreground">완료된 여행</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-accent mb-2">
              {trips.reduce((sum, t) => sum + t.budget, 0).toLocaleString()}원
            </div>
            <div className="text-sm text-muted-foreground">총 예산</div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

