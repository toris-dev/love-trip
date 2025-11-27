"use client"

import { useState } from "react"
import { Calendar, MapPin, Wallet, Plus, Search, Star, Trash2, Edit } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Footer } from "@/components/footer"
import Link from "next/link"

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

export default function MyTripsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const trips: Trip[] = [
    {
      id: "1",
      title: "서울 로맨틱 데이트",
      destination: "서울",
      startDate: "2024-02-14",
      endDate: "2024-02-15",
      budget: 230000,
      status: "completed",
      places: 5,
      score: 95,
    },
    {
      id: "2",
      title: "부산 바다 여행",
      destination: "부산",
      startDate: "2024-03-01",
      endDate: "2024-03-03",
      budget: 350000,
      status: "planning",
      places: 8,
    },
    {
      id: "3",
      title: "제주 힐링 여행",
      destination: "제주",
      startDate: "2024-04-10",
      endDate: "2024-04-13",
      budget: 500000,
      status: "planning",
      places: 12,
    },
    {
      id: "4",
      title: "강릉 커피 투어",
      destination: "강릉",
      startDate: "2024-01-20",
      endDate: "2024-01-21",
      budget: 150000,
      status: "completed",
      places: 6,
      score: 88,
    },
  ]

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="relative py-16 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  내 여행
                </h1>
                <p className="text-lg text-muted-foreground">
                  계획한 여행들을 한눈에 확인하고 관리하세요
                </p>
              </div>
              <Button asChild size="lg" className="group">
                <Link href="/">
                  <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" />
                  새 여행 만들기
                </Link>
              </Button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="여행 제목이나 목적지로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                {["all", "planning", "ongoing", "completed"].map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? "default" : "outline"}
                    onClick={() => setFilterStatus(status)}
                    className="capitalize"
                  >
                    {status === "all" ? "전체" : status === "planning" ? "계획 중" : status === "ongoing" ? "여행 중" : "완료"}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
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
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

