"use client"

import { useState, useEffect } from "react"
import { Calendar as CalendarIcon, Plus, MapPin, Clock, User, Heart, Search, X, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { calendarService, type CalendarEvent, type SharedCalendar, type Couple } from "@/lib/services/calendar-service"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { motion } from "framer-motion"
import type { Database } from "@/lib/types/database"

type Place = Database["public"]["Tables"]["places"]["Row"]
type CalendarEventWithPlace = CalendarEvent & { place?: Place }

export default function CalendarPage() {
  const [couple, setCouple] = useState<Couple | null>(null)
  const [calendars, setCalendars] = useState<SharedCalendar[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedCalendar, setSelectedCalendar] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [partnerInfo, setPartnerInfo] = useState<{ id: string; email: string; name?: string; nickname?: string } | null>(null)
  const [currentUserInfo, setCurrentUserInfo] = useState<{ id: string; nickname?: string } | null>(null)

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    location: "",
    place_id: "",
  })
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [showPlaceSearch, setShowPlaceSearch] = useState(false)
  const [placeSearchQuery, setPlaceSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Place[]>([])
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<CalendarEventWithPlace | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedCalendar) {
      loadEvents()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCalendar, currentMonth])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const coupleData = await calendarService.getMyCouple()
      setCouple(coupleData)

      if (coupleData) {
        let calendarsData = await calendarService.getCalendars()
        
        // 캘린더가 없으면 기본 캘린더 생성
        if (calendarsData.length === 0) {
          console.log("[Calendar] No calendars found, creating default calendar")
          const createResult = await calendarService.createDefaultCalendar(coupleData.id)
          if (createResult.success) {
            calendarsData = await calendarService.getCalendars()
          }
        }
        
        setCalendars(calendarsData)
        if (calendarsData.length > 0) {
          setSelectedCalendar(calendarsData[0].id)
          console.log("[Calendar] Selected calendar:", calendarsData[0].id)
        } else {
          console.error("[Calendar] No calendars available after creation attempt")
          toast.error("캘린더를 불러올 수 없습니다")
        }

        // 사용자 및 파트너 정보 가져오기
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          // 현재 사용자 프로필 가져오기
          const { data: currentUserProfile } = await supabase
            .from("profiles")
            .select("nickname")
            .eq("id", user.id)
            .single()
          
          setCurrentUserInfo({
            id: user.id,
            nickname: currentUserProfile?.nickname || undefined,
          })

          const partnerId = coupleData.user1_id === user.id ? coupleData.user2_id : coupleData.user1_id
          
          // API를 통해 파트너 정보 가져오기
          const response = await fetch(`/api/users/find?id=${partnerId}`).catch(() => null)
          if (response && response.ok) {
            const partner = await response.json()
            
            // 파트너 프로필 가져오기
            const { data: partnerProfile } = await supabase
              .from("profiles")
              .select("nickname, display_name")
              .eq("id", partnerId)
              .single()
            
            setPartnerInfo({
              id: partnerId,
              email: partner.email || "",
              name: partnerProfile?.display_name || undefined,
              nickname: partnerProfile?.nickname || undefined,
            })
          }
        }
      }
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("데이터를 불러오는데 실패했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  const loadEvents = async () => {
    if (!selectedCalendar) return

    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

    const eventsData = await calendarService.getEvents(selectedCalendar, startOfMonth, endOfMonth)
    setEvents(eventsData)
  }

  const handleCreateEvent = async () => {
    // 디버깅을 위한 로그
    console.log("Creating event:", {
      selectedCalendar,
      title: newEvent.title,
      start_time: newEvent.start_time,
      titleLength: newEvent.title?.length,
      startTimeLength: newEvent.start_time?.length,
    })

    if (!selectedCalendar) {
      toast.error("캘린더를 선택해주세요")
      return
    }

    if (!newEvent.title || newEvent.title.trim() === "") {
      toast.error("제목을 입력해주세요")
      return
    }

    if (!newEvent.start_time || newEvent.start_time.trim() === "") {
      toast.error("시작 시간을 입력해주세요")
      return
    }

    try {
      // datetime-local 형식을 ISO 형식으로 변환
      const startTime = newEvent.start_time ? new Date(newEvent.start_time).toISOString() : undefined
      const endTime = newEvent.end_time ? new Date(newEvent.end_time).toISOString() : undefined

      const result = await calendarService.createEvent({
        calendar_id: selectedCalendar,
        title: newEvent.title,
        description: newEvent.description || undefined,
        start_time: startTime!,
        end_time: endTime || undefined,
        location: newEvent.location || undefined,
        place_id: newEvent.place_id || undefined,
      })

      if (result.success) {
        toast.success("일정이 추가되었습니다")
        setIsDialogOpen(false)
        setNewEvent({ title: "", description: "", start_time: "", end_time: "", location: "", place_id: "" })
        setSelectedPlace(null)
        setShowPlaceSearch(false)
        setPlaceSearchQuery("")
        setSearchResults([])
        loadEvents()
      } else {
        console.error("Event creation error:", result.error)
        toast.error(result.error || "일정 추가에 실패했습니다")
      }
    } catch (error) {
      console.error("Error creating event:", error)
      toast.error(error instanceof Error ? error.message : "일정 추가에 실패했습니다")
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("정말 이 일정을 삭제하시겠습니까?")) return

    const result = await calendarService.deleteEvent(eventId)
    if (result.success) {
      toast.success("일정이 삭제되었습니다")
      loadEvents()
    } else {
      toast.error(result.error || "일정 삭제에 실패했습니다")
    }
  }

  const handleDateClick = (date: Date) => {
    // 날짜를 datetime-local 형식으로 변환 (현재 날짜의 시간을 오늘 오후 2시로 설정)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const defaultTime = "14:00" // 오후 2시 기본값
    
    const dateTimeLocal = `${year}-${month}-${day}T${defaultTime}`
    
    setNewEvent({
      title: "",
      description: "",
      start_time: dateTimeLocal,
      end_time: "",
      location: "",
      place_id: "",
    })
    setSelectedPlace(null)
    setIsDialogOpen(true)
  }

  const searchPlaces = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("places")
        .select("*")
        .ilike("name", `%${query}%`)
        .limit(10)

      if (error) throw error
      setSearchResults((data || []) as Place[])
    } catch (error) {
      console.error("Error searching places:", error)
      toast.error("장소 검색에 실패했습니다")
    }
  }

  const handleSelectPlace = (place: Place) => {
    setSelectedPlace(place)
    setNewEvent({
      ...newEvent,
      title: place.name,
      location: place.address || place.name,
      place_id: place.id,
    })
    setShowPlaceSearch(false)
    setPlaceSearchQuery("")
    setSearchResults([])
  }

  const handleRemovePlace = () => {
    setSelectedPlace(null)
    setNewEvent({
      ...newEvent,
      place_id: "",
    })
  }

  const loadPlaceDetails = async (placeId: string) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("places")
        .select("*")
        .eq("id", placeId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error loading place details:", error)
      return null
    }
  }

  const handleEventClick = async (event: CalendarEvent) => {
    if (event.place_id) {
      const placeDetails = await loadPlaceDetails(event.place_id)
      if (placeDetails) {
        setSelectedEventForDetail({ ...event, place: placeDetails as Place })
      }
    }
  }

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    // 빈 칸 추가
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    // 날짜 추가
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    return days
  }

  const getEventsForDate = (date: Date | null) => {
    if (!date) return []
    const dateStr = date.toISOString().split("T")[0]
    return events.filter((event) => event.start_time.startsWith(dateStr))
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!couple) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              커플 연결이 필요합니다
            </CardTitle>
            <CardDescription>캘린더를 사용하려면 먼저 커플과 연결해주세요</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = "/profile"}>
              프로필로 이동
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const days = getDaysInMonth()
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"]

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          커플 캘린더
        </h1>
        {partnerInfo && (
          <p className="text-muted-foreground">
            <User className="h-4 w-4 inline mr-1" />
            {partnerInfo.nickname || partnerInfo.name || "파트너"}와 함께 일정을 공유하세요
          </p>
        )}
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* 사이드바 */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">캘린더</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {calendars.map((cal) => (
                <button
                  key={cal.id}
                  onClick={() => setSelectedCalendar(cal.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedCalendar === cal.id ? "bg-primary/10 border-2 border-primary" : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: cal.color }}
                    />
                    <span className="font-medium">{cal.name}</span>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" size="lg">
                <Plus className="h-4 w-4 mr-2" />
                일정 추가
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>새 일정 추가</DialogTitle>
                <DialogDescription>커플과 공유할 일정을 추가하세요</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">제목 *</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="일정 제목"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start_time">시작 시간 *</Label>
                  <Input
                    id="start_time"
                    type="datetime-local"
                    value={newEvent.start_time}
                    onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">종료 시간</Label>
                  <Input
                    id="end_time"
                    type="datetime-local"
                    value={newEvent.end_time}
                    onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>위시리스트에서 장소 선택</Label>
                  {selectedPlace ? (
                    <div className="border rounded-lg p-3 bg-muted/50 flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {selectedPlace.image_url && (
                          <img
                            src={selectedPlace.image_url}
                            alt={selectedPlace.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{selectedPlace.name}</p>
                          {selectedPlace.address && (
                            <p className="text-xs text-muted-foreground truncate">{selectedPlace.address}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemovePlace}
                        className="ml-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="장소 이름으로 검색..."
                          value={placeSearchQuery}
                          onChange={(e) => {
                            setPlaceSearchQuery(e.target.value)
                            searchPlaces(e.target.value)
                          }}
                          onFocus={() => setShowPlaceSearch(true)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowPlaceSearch(!showPlaceSearch)}
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>
                      {showPlaceSearch && searchResults.length > 0 && (
                        <div className="border rounded-lg max-h-48 overflow-y-auto">
                          {searchResults.map((place) => (
                            <button
                              key={place.id}
                              type="button"
                              onClick={() => handleSelectPlace(place)}
                              className="w-full p-3 hover:bg-muted/50 flex items-center gap-3 text-left border-b last:border-b-0"
                            >
                              {place.image_url && (
                                <img
                                  src={place.image_url}
                                  alt={place.name}
                                  className="w-12 h-12 rounded object-cover"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{place.name}</p>
                                {place.address && (
                                  <p className="text-xs text-muted-foreground truncate">{place.address}</p>
                                )}
                                {place.rating && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span className="text-xs text-muted-foreground">{place.rating.toFixed(1)}</span>
                                  </div>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">장소 (직접 입력)</Label>
                  <Input
                    id="location"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="장소를 입력하세요"
                    disabled={!!selectedPlace}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">설명</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="일정에 대한 설명을 입력하세요"
                    rows={3}
                  />
                </div>
                <Button onClick={handleCreateEvent} className="w-full mt-2">
                  일정 추가
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* 캘린더 뷰 */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
                  </CardTitle>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                    이전
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
                    오늘
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                    다음
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {weekDays.map((day) => (
                  <div key={day} className="text-center font-semibold text-sm py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {days.map((date, index) => {
                  const dayEvents = getEventsForDate(date)
                  const isToday = date && date.toDateString() === new Date().toDateString()

                  return (
                    <motion.div
                      key={index}
                      className={`min-h-[100px] p-2 border rounded-lg ${
                        isToday ? "bg-primary/10 border-primary" : "bg-card"
                      } ${date ? "cursor-pointer hover:bg-muted/50" : ""}`}
                      whileHover={date ? { scale: 1.02 } : {}}
                      onClick={() => {
                        if (date && dayEvents.length === 0) {
                          // 빈 날짜 클릭 시 일정 추가
                          handleDateClick(date)
                        }
                      }}
                    >
                      {date && (
                        <>
                          <div className={`text-sm font-medium mb-1 ${isToday ? "text-primary" : ""}`}>
                            {date.getDate()}
                          </div>
                          <div className="space-y-1">
                            {dayEvents.slice(0, 2).map((event) => {
                              const isMyEvent = currentUserInfo?.id === event.created_by
                              const eventColor = isMyEvent ? "bg-primary/20 border-primary/50" : "bg-accent/20 border-accent/50"
                              const eventNickname = isMyEvent 
                                ? (currentUserInfo?.nickname || "나")
                                : (partnerInfo?.nickname || "파트너")
                              
                              return (
                                <Badge
                                  key={event.id}
                                  variant="secondary"
                                  className={`w-full text-xs p-1 cursor-pointer hover:opacity-80 border ${eventColor}`}
                                  onClick={(e) => {
                                    e.stopPropagation() // 부모 클릭 이벤트 방지
                                    if (event.place_id) {
                                      handleEventClick(event)
                                    } else {
                                      if (confirm(`"${event.title}" 일정을 삭제하시겠습니까?`)) {
                                        handleDeleteEvent(event.id)
                                      }
                                    }
                                  }}
                                >
                                  <div className="truncate flex items-center gap-1">
                                    <span className="font-semibold text-[10px]">{eventNickname}</span>
                                    <span className="truncate">{event.title}</span>
                                  </div>
                                </Badge>
                              )
                            })}
                            {dayEvents.length > 2 && (
                              <div className="text-xs text-muted-foreground">+{dayEvents.length - 2}개 더</div>
                            )}
                            {dayEvents.length === 0 && (
                              <div className="flex items-center justify-center py-2">
                                <Plus className="h-4 w-4 text-muted-foreground/50" />
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* 이번 달 일정 목록 */}
          {events.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>이번 달 일정</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.map((event) => {
                    const isMyEvent = currentUserInfo?.id === event.created_by
                    const eventNickname = isMyEvent 
                      ? (currentUserInfo?.nickname || "나")
                      : (partnerInfo?.nickname || "파트너")
                    const eventColor = isMyEvent ? "border-primary/50 bg-primary/5" : "border-accent/50 bg-accent/5"
                    
                    return (
                      <motion.div
                        key={event.id}
                        className={`flex items-start gap-4 p-4 border-2 rounded-lg hover:opacity-80 transition-colors cursor-pointer ${eventColor}`}
                        whileHover={{ x: 4 }}
                        onClick={() => {
                          if (event.place_id) {
                            handleEventClick(event)
                          }
                        }}
                      >
                        <div className="flex-shrink-0">
                          <CalendarIcon className={`h-5 w-5 ${isMyEvent ? "text-primary" : "text-accent"}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{event.title}</h3>
                            <Badge 
                              variant={isMyEvent ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {eventNickname}
                            </Badge>
                          </div>
                          {event.description && <p className="text-sm text-muted-foreground mt-1">{event.description}</p>}
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {new Date(event.start_time).toLocaleString("ko-KR")}
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {event.location}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          삭제
                        </Button>
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 일정 상세 정보 모달 */}
      <Dialog open={!!selectedEventForDetail} onOpenChange={(open) => !open && setSelectedEventForDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedEventForDetail && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedEventForDetail.title}</DialogTitle>
                <DialogDescription>
                  {new Date(selectedEventForDetail.start_time).toLocaleString("ko-KR")}
                  {selectedEventForDetail.end_time && ` - ${new Date(selectedEventForDetail.end_time).toLocaleString("ko-KR")}`}
                </DialogDescription>
              </DialogHeader>
              {selectedEventForDetail.place && (
                <div className="space-y-4">
                  {selectedEventForDetail.place.image_url && (
                    <img
                      src={selectedEventForDetail.place.image_url}
                      alt={selectedEventForDetail.place.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{selectedEventForDetail.place.name}</h3>
                      {selectedEventForDetail.place.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{selectedEventForDetail.place.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    {selectedEventForDetail.place.address && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{selectedEventForDetail.place.address}</span>
                      </div>
                    )}
                    {selectedEventForDetail.place.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {selectedEventForDetail.place.description}
                      </p>
                    )}
                    {selectedEventForDetail.place.type && (
                      <Badge variant="secondary" className="mt-2">
                        {selectedEventForDetail.place.type}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              {selectedEventForDetail.description && (
                <div className="space-y-2">
                  <Label>일정 설명</Label>
                  <p className="text-sm text-muted-foreground">{selectedEventForDetail.description}</p>
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (confirm(`"${selectedEventForDetail.title}" 일정을 삭제하시겠습니까?`)) {
                      handleDeleteEvent(selectedEventForDetail.id)
                      setSelectedEventForDetail(null)
                    }
                  }}
                >
                  삭제
                </Button>
                <Button onClick={() => setSelectedEventForDetail(null)}>닫기</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

