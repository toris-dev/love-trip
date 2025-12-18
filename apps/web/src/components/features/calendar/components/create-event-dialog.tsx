"use client"

import { useState } from "react"
import { Button } from "@lovetrip/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@lovetrip/ui/components/dialog"
import { Input } from "@lovetrip/ui/components/input"
import { Label } from "@lovetrip/ui/components/label"
import { Textarea } from "@lovetrip/ui/components/textarea"
import { Plus, X } from "lucide-react"
import Image from "next/image"
import { useEventForm } from "../hooks/use-event-form"
import { useEventActions } from "../hooks/use-event-actions"
import { PlaceSearch } from "./place-search"

interface CreateEventDialogProps {
  selectedCalendar: string | null
  onSuccess?: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CreateEventDialog({
  selectedCalendar,
  onSuccess,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: CreateEventDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isDialogOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setIsDialogOpen = controlledOnOpenChange || setInternalOpen
  const {
    newEvent,
    setNewEvent,
    selectedPlace,
    setSelectedPlace,
    showPlaceSearch,
    setShowPlaceSearch,
    placeSearchQuery,
    setPlaceSearchQuery,
    searchResults,
    setSearchResults,
    resetForm,
  } = useEventForm()

  const { handleCreateEvent } = useEventActions(selectedCalendar || null, onSuccess)

  const handleSubmit = async () => {
    if (!selectedCalendar) {
      return
    }

    await handleCreateEvent(newEvent, () => {
      resetForm()
      setIsDialogOpen(false)
      onSuccess?.()
    })
  }

  const handleSelectPlace = (place: typeof selectedPlace) => {
    if (!place) return
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

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      {controlledOpen === undefined && (
      <DialogTrigger asChild>
        <Button className="w-full" size="lg">
          <Plus className="h-4 w-4 mr-2" />
          일정 추가
        </Button>
      </DialogTrigger>
      )}
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
              onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
              placeholder="일정 제목"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="start_time">시작 시간 *</Label>
            <Input
              id="start_time"
              type="datetime-local"
              value={newEvent.start_time}
              onChange={e => setNewEvent({ ...newEvent, start_time: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_time">종료 시간</Label>
            <Input
              id="end_time"
              type="datetime-local"
              value={newEvent.end_time}
              onChange={e => setNewEvent({ ...newEvent, end_time: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>위시리스트에서 장소 선택</Label>
            {selectedPlace ? (
              <div className="border rounded-lg p-3 bg-muted/50 flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {selectedPlace.image_url && (
                    <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={selectedPlace.image_url}
                        alt={selectedPlace.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{selectedPlace.name}</p>
                    {selectedPlace.address && (
                      <p className="text-xs text-muted-foreground truncate">
                        {selectedPlace.address}
                      </p>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleRemovePlace} className="ml-2">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <PlaceSearch
                query={placeSearchQuery}
                onQueryChange={setPlaceSearchQuery}
                results={searchResults}
                showResults={showPlaceSearch}
                onShowResultsChange={setShowPlaceSearch}
                onSelectPlace={handleSelectPlace}
              />
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">장소 (직접 입력)</Label>
            <Input
              id="location"
              value={newEvent.location}
              onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
              placeholder="장소를 입력하세요"
              disabled={!!selectedPlace}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              value={newEvent.description}
              onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
              placeholder="일정에 대한 설명을 입력하세요"
              rows={3}
            />
          </div>
          <Button onClick={handleSubmit} className="w-full mt-2">
            일정 추가
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

