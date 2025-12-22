"use client"

import { useState, useEffect } from "react"
import { Input } from "@lovetrip/ui/components/input"
import { Button } from "@lovetrip/ui/components/button"
import { Search } from "lucide-react"
import Image from "next/image"
import { Star } from "lucide-react"
import { createClient } from "@lovetrip/api/supabase/client"
import { toast } from "sonner"
import type { Place } from "../types"

interface PlaceSearchProps {
  query: string
  onQueryChange: (query: string) => void
  results: Place[]
  showResults: boolean
  onShowResultsChange: (show: boolean) => void
  onSelectPlace: (place: Place) => void
}

export function PlaceSearch({
  query,
  onQueryChange,
  results,
  showResults,
  onShowResultsChange,
  onSelectPlace,
}: PlaceSearchProps) {
  const [searchResults, setSearchResults] = useState<Place[]>([])

  const searchPlaces = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    // places 테이블이 삭제되어 빈 배열 반환
    setSearchResults([])
  }

  useEffect(() => {
    if (query) {
      searchPlaces(query)
    } else {
      setSearchResults([])
    }
  }, [query])

  const displayResults = results.length > 0 ? results : searchResults

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="장소 이름으로 검색..."
          value={query}
          onChange={e => {
            onQueryChange(e.target.value)
            searchPlaces(e.target.value)
          }}
          onFocus={() => onShowResultsChange(true)}
        />
        <Button type="button" variant="outline" onClick={() => onShowResultsChange(!showResults)}>
          <Search className="h-4 w-4" />
        </Button>
      </div>
      {showResults && displayResults.length > 0 && (
        <div className="border rounded-lg max-h-48 overflow-y-auto">
          {displayResults.map(place => (
            <button
              key={place.id}
              type="button"
              onClick={() => onSelectPlace(place)}
              className="w-full p-3 hover:bg-muted/50 flex items-center gap-3 text-left border-b last:border-b-0"
            >
              {place.image_url && (
                <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                  <Image src={place.image_url} alt={place.name} fill className="object-cover" />
                </div>
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
  )
}
