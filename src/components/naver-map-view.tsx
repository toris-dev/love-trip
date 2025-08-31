"use client"

import { useMemo } from "react"
import { NavermapsProvider, Container, NaverMap, Marker, Polyline, useNavermaps } from "react-naver-maps"

type Place = {
  id: string
  name: string
  lat: number
  lng: number
  type: "CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC"
  rating: number
  priceLevel: number
  description: string
  image: string
}

interface NaverMapViewProps {
  places?: Place[]
  path?: { lat: number; lng: number }[]
  onPlaceClick?: (place: Place) => void
}

export default function NaverMapView({ places = [], path = [], onPlaceClick }: NaverMapViewProps) {
  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID
  const center = useMemo(() => {
    if (places.length > 0) {
      return { lat: places[0].lat, lng: places[0].lng }
    }
    return { lat: 37.5665, lng: 126.978 }
  }, [places])

  if (!clientId) {
    return (
      <div className="w-full h-[70vh] rounded-2xl bg-muted flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">지도 로딩 오류</p>
          <p className="text-sm text-red-500">Naver Map Client ID가 설정되지 않았습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-[70vh] rounded-2xl overflow-hidden" data-testid="naver-map">
      <NavermapsProvider ncpClientId={clientId}>
        <Container style={{ width: "100%", height: "100%" }}>
          <MapContent center={center} places={places} path={path} onPlaceClick={onPlaceClick} />
        </Container>
      </NavermapsProvider>
    </div>
  )
}

function MapContent({
  center,
  places,
  path,
  onPlaceClick,
}: {
  center: { lat: number; lng: number }
  places: Place[]
  path: { lat: number; lng: number }[]
  onPlaceClick?: (place: Place) => void
}) {
  const navermaps = useNavermaps()

  if (!navermaps) {
    return (
      <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
        지도를 불러오는 중...
      </div>
    )
  }

  return (
    <NaverMap
      defaultCenter={center}
      defaultZoom={11}
      mapTypeControl={false}
      logoControl={true}
      scaleControl={true}
      zoomControl={true}
    >
      {places.map((place, index) => (
        <Marker
          key={place.id}
          position={{ lat: place.lat, lng: place.lng }}
          title={`${index + 1}. ${place.name}`}
          onClick={() => onPlaceClick?.(place)}
        />
      ))}

      {path.length > 1 ? (
        <Polyline
          path={path.map((p) => ({ lat: p.lat, lng: p.lng }))}
          strokeColor="#10b981"
          strokeOpacity={0.8}
          strokeStyle="solid"
          strokeWeight={4}
        />
      ) : null}
    </NaverMap>
  )
}
