"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import {
  useTravelCourses,
  useRecommendedPlaces,
  TravelSidebar,
  PlaceDetailCard,
  CourseInfoOverlay,
  type Place,
  type TravelCourse,
} from "@lovetrip/planner/components/travel"

const NaverMapViewDynamic = dynamic(() => import("@/components/shared/naver-map-view"), {
  ssr: false,
})

export default function TravelPage() {
  const [selectedCourse, setSelectedCourse] = useState<TravelCourse | null>(null)
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const { courses, isLoading, error } = useTravelCourses()
  const { recommendedPlaces } = useRecommendedPlaces()

  const handleCourseSelect = (course: TravelCourse) => {
    setSelectedCourse(course)
    setSelectedPlace(null)
  }

  const handlePlaceClick = (place: Place) => {
    setSelectedPlace(place)
  }

  const getMapPlaces = () => {
    if (selectedCourse) {
      return selectedCourse.places.map(p => ({
        id: p.id,
        name: p.name,
        lat: p.lat,
        lng: p.lng,
        type: p.type as "CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC",
        rating: p.rating ?? 0,
        priceLevel: p.price_level ?? 0,
        description: p.description || "",
        image: p.image_url || "",
      }))
    }
    // 코스가 선택되지 않았을 때 추천 장소 표시
    return recommendedPlaces.slice(0, 30).map(p => ({
      id: p.id,
      name: p.name,
      lat: p.lat,
      lng: p.lng,
      type: p.type as "CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC",
      rating: p.rating ?? 0,
      priceLevel: p.price_level ?? 0,
      description: p.description || "",
      image: p.image_url || "",
    }))
  }

  const getMapPath = () => {
    if (selectedCourse) {
      return selectedCourse.places.map(p => ({ lat: p.lat, lng: p.lng }))
    }
    return []
  }

  return (
    <div className="fixed inset-0 w-full h-full">
      {/* 지도 영역 - 전체 화면 */}
      <div className="absolute inset-0 w-full h-full">
        <div className="w-full h-full relative">
          <NaverMapViewDynamic
            places={getMapPlaces()}
            path={getMapPath()}
            onPlaceClick={place => {
              if (selectedCourse) {
                const foundPlace = selectedCourse.places.find(p => p.id === place.id)
                if (foundPlace) {
                  handlePlaceClick(foundPlace)
                }
              } else {
                const foundPlace = recommendedPlaces.find(p => p.id === place.id)
                if (foundPlace) {
                  handlePlaceClick(foundPlace)
                }
              }
            }}
          />
          <CourseInfoOverlay course={selectedCourse} onClose={() => setSelectedCourse(null)} />
        </div>
      </div>

      {/* 왼쪽 사이드바 */}
      <TravelSidebar
        courses={courses}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCourse={selectedCourse}
        onCourseSelect={handleCourseSelect}
        isLoading={isLoading}
        error={error}
      />

      {/* 선택된 장소 상세 정보 */}
      <PlaceDetailCard place={selectedPlace} onClose={() => setSelectedPlace(null)} />
    </div>
  )
}
