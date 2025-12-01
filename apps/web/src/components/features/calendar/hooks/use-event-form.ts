"use client"

import { useState } from "react"
import type { NewEventForm, Place } from "../types"

export function useEventForm() {
  const [newEvent, setNewEvent] = useState<NewEventForm>({
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

  const resetForm = () => {
    setNewEvent({
      title: "",
      description: "",
      start_time: "",
      end_time: "",
      location: "",
      place_id: "",
    })
    setSelectedPlace(null)
    setShowPlaceSearch(false)
    setPlaceSearchQuery("")
    setSearchResults([])
  }

  return {
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
  }
}

