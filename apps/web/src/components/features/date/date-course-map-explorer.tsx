"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { MapPin, Coffee, Utensils, Eye, Building2, Play, Pause } from "lucide-react"

// 데이트 코스 포인트 타입
type DateCoursePoint = {
  id: string
  name: string
  description: string
  type: "CAFE" | "FOOD" | "VIEW" | "MUSEUM"
  position: { top: string; left: string }
  color: string
}

// 타입별 색상 매핑
const getTypeColor = (type: "CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC"): string => {
  switch (type) {
    case "CAFE":
      return "#ff8fab"
    case "FOOD":
      return "#ff6b9d"
    case "VIEW":
      return "#4ecdc4"
    case "MUSEUM":
      return "#a8e6cf"
    default:
      return "#c4b5fd"
  }
}

// 모킹 데이터의 데이트 코스 장소들 (20개)
const dateCoursePlacesData = [
  {
    name: "한강공원 반포지구",
    description: "한강을 따라 산책하며 피크닉을 즐길 수 있는 로맨틱한 장소",
    type: "VIEW" as const,
  },
  {
    name: "남산서울타워",
    description: "서울의 전경을 한눈에 볼 수 있는 최고의 전망대",
    type: "VIEW" as const,
  },
  {
    name: "경복궁",
    description: "조선왕조의 대표 궁궐로 역사와 문화를 함께 즐길 수 있는 곳",
    type: "MUSEUM" as const,
  },
  {
    name: "북촌한옥마을",
    description: "전통 한옥의 아름다움을 느낄 수 있는 감성적인 마을",
    type: "VIEW" as const,
  },
  {
    name: "인사동",
    description: "전통 공예품과 갤러리를 둘러볼 수 있는 문화 거리",
    type: "MUSEUM" as const,
  },
  {
    name: "명동거리",
    description: "쇼핑과 맛집 탐방을 함께 즐길 수 있는 번화가",
    type: "FOOD" as const,
  },
  {
    name: "청계천",
    description: "도심 속 자연을 만날 수 있는 아름다운 하천",
    type: "VIEW" as const,
  },
  { name: "덕수궁", description: "서울의 역사를 간직한 아름다운 궁궐", type: "MUSEUM" as const },
  { name: "이화벽화마을", description: "컬러풀한 벽화로 유명한 사진 명소", type: "VIEW" as const },
  { name: "홍대거리", description: "젊은 감성과 문화가 살아있는 거리", type: "CAFE" as const },
  { name: "강남역", description: "트렌디한 쇼핑과 맛집이 가득한 상권", type: "FOOD" as const },
  {
    name: "압구정로데오거리",
    description: "고급스러운 쇼핑과 카페 문화를 즐길 수 있는 거리",
    type: "CAFE" as const,
  },
  { name: "잠실롯데타워", description: "서울의 랜드마크 타워와 쇼핑몰", type: "VIEW" as const },
  {
    name: "여의도한강공원",
    description: "넓은 공원과 한강 전망을 즐길 수 있는 곳",
    type: "VIEW" as const,
  },
  {
    name: "올림픽공원",
    description: "넓은 공원에서 산책과 운동을 즐길 수 있는 공간",
    type: "VIEW" as const,
  },
  { name: "서울숲", description: "도심 속 자연을 만날 수 있는 큰 공원", type: "VIEW" as const },
  {
    name: "북한산국립공원",
    description: "등산과 자연을 즐길 수 있는 국립공원",
    type: "VIEW" as const,
  },
  {
    name: "한강공원 뚝섬지구",
    description: "한강을 따라 자전거와 산책을 즐길 수 있는 공원",
    type: "VIEW" as const,
  },
  {
    name: "코엑스",
    description: "전시와 쇼핑을 함께 즐길 수 있는 복합 문화 공간",
    type: "MUSEUM" as const,
  },
  {
    name: "동대문디자인플라자",
    description: "현대적인 건축물과 전시를 즐길 수 있는 문화 공간",
    type: "MUSEUM" as const,
  },
]

// 결정적 랜덤 생성 함수 (시드 기반)
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

// 알록달록하게 랜덤 배치 (고정된 시드로 항상 같은 위치 생성)
const generatePositions = (count: number): Array<{ top: number; left: number }> => {
  const positions: Array<{ top: number; left: number }> = []

  for (let i = 0; i < count; i++) {
    // 각 인덱스를 시드로 사용하여 결정적 랜덤 생성
    const topSeed = seededRandom(i * 2)
    const leftSeed = seededRandom(i * 2 + 1)

    // 완전 랜덤 위치 (5% ~ 95% 범위) - 숫자로 반환
    const topPercent = 5 + topSeed * 90
    const leftPercent = 5 + leftSeed * 90

    positions.push({
      top: topPercent,
      left: leftPercent,
    })
  }

  return positions
}

// 데이트 코스 포인트 데이터 생성 함수 (클라이언트에서만 실행)
const createDateCoursePoints = (): DateCoursePoint[] => {
const positions = generatePositions(dateCoursePlacesData.length)
  return dateCoursePlacesData.map((place, index) => ({
  id: `date-course-${index + 1}`,
  name: place.name,
  description: place.description,
  type: place.type,
    position: {
      top: `${positions[index].top}%`,
      left: `${positions[index].left}%`,
    },
  color: getTypeColor(place.type),
}))
}

const getTypeIcon = (type: DateCoursePoint["type"]) => {
  switch (type) {
    case "CAFE":
      return Coffee
    case "FOOD":
      return Utensils
    case "VIEW":
      return Eye
    case "MUSEUM":
      return Building2
    default:
      return MapPin
  }
}

export function DateCourseMapExplorer() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isAutoMoving, setIsAutoMoving] = useState(false)
  const [isAutoMode, setIsAutoMode] = useState(true) // 기본값: 자동 모드 활성화
  const [isVisible, setIsVisible] = useState(false) // 화면에 보이는지 여부
  const [dateCoursePoints, setDateCoursePoints] = useState<DateCoursePoint[]>([])
  const [isMounted, setIsMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // 클라이언트에서만 포인트 데이터 생성 (Hydration 에러 방지)
  useEffect(() => {
    setIsMounted(true)
    const points = createDateCoursePoints()
    setDateCoursePoints(points)
    
    // activeIndex가 유효한 범위인지 확인하고 조정
    if (points.length > 0 && activeIndex >= points.length) {
      setActiveIndex(0)
    }
  }, [activeIndex])
  
  // dateCoursePoints가 변경되면 activeIndex 조정
  useEffect(() => {
    if (dateCoursePoints.length > 0 && activeIndex >= dateCoursePoints.length) {
      setActiveIndex(0)
    }
  }, [dateCoursePoints.length, activeIndex])

  // Intersection Observer로 화면에 보이는지 확인
  useEffect(() => {
    if (!containerRef.current) return

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          setIsVisible(entry.isIntersecting)
        })
      },
      {
        threshold: 0.3, // 30% 이상 보일 때 visible로 간주
      }
    )

    observer.observe(containerRef.current)

    const currentContainer = containerRef.current
    return () => {
      if (currentContainer) {
        observer.unobserve(currentContainer)
      }
    }
  }, [])

  // activeIndex 변경 시 카메라를 해당 위치로 부드럽게 이동 (auto 모드이고 화면에 보일 때만)
  useEffect(() => {
    if (!isAutoMode || !isVisible || isDragging || !containerRef.current || dateCoursePoints.length === 0) return

    const safeActiveIndex = Math.max(0, Math.min(activeIndex, dateCoursePoints.length - 1))
    const activePoint = dateCoursePoints[safeActiveIndex]
    if (!activePoint) return
    const container = containerRef.current
    const rect = container.getBoundingClientRect()

    // 포인트의 퍼센트 위치를 픽셀 좌표로 변환
    const pointTopPercent = parseFloat(activePoint.position.top)
    const pointLeftPercent = parseFloat(activePoint.position.left)

    // 배경이 200% 크기이고 left: -50%, top: -50%로 설정되어 있음
    // 배경의 실제 크기
    const backgroundWidth = rect.width * 2
    const backgroundHeight = rect.height * 2

    // 배경 내에서의 포인트 위치 (배경의 왼쪽 상단이 기준)
    const pointXInBackground = (pointLeftPercent / 100) * backgroundWidth
    const pointYInBackground = (pointTopPercent / 100) * backgroundHeight

    // 컨테이너 중심점
    const containerCenterX = rect.width / 2
    const containerCenterY = rect.height / 2

    // 배경의 시작 위치 (left: -50%, top: -50%)
    const backgroundStartX = -rect.width / 2
    const backgroundStartY = -rect.height / 2

    // 포인트가 화면 중심에 오도록 오프셋 계산
    // 배경의 시작 위치 + 포인트 위치를 고려하여 계산
    const targetX = containerCenterX - (backgroundStartX + pointXInBackground) * zoom
    const targetY = containerCenterY - (backgroundStartY + pointYInBackground) * zoom

    setIsAutoMoving(true)
    setPanOffset({
      x: targetX,
      y: targetY,
    })

    // 애니메이션 완료 후 플래그 해제
    const timer = setTimeout(() => {
      setIsAutoMoving(false)
    }, 1200)

    return () => clearTimeout(timer)
  }, [activeIndex, zoom, isDragging, isAutoMode, isVisible, dateCoursePoints])

  useEffect(() => {
    // 자동으로 다음 포인트로 이동 (auto 모드이고 화면에 보일 때만)
    if (!isAutoMode || !isVisible || dateCoursePoints.length === 0) return

    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % dateCoursePoints.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [isAutoMode, isVisible, dateCoursePoints.length])

  // auto 모드일 때 zoom을 1로 리셋
  useEffect(() => {
    if (isAutoMode && zoom !== 1) {
      setZoom(1)
    }
  }, [isAutoMode, zoom])

  // 확대/축소 핸들러 (마우스 휠)
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        return
      }

      // 버튼이나 포인트 위에서는 확대/축소 안 함
      if ((e.target as HTMLElement).closest("button, [role='button'], .absolute.z-10")) {
        return
      }

      // auto 모드일 때는 확대/축소 비활성화
      if (isAutoMode) {
        e.preventDefault()
        return
      }

      e.preventDefault()

      const delta = e.deltaY > 0 ? -0.1 : 0.1
      const newZoom = Math.max(0.5, Math.min(3, zoom + delta))

      // 마우스 위치를 기준으로 확대/축소
      const rect = containerRef.current.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      // 컨테이너 중심점 기준으로 변환
      const containerCenterX = rect.width / 2
      const containerCenterY = rect.height / 2

      // 마우스 위치를 중심점 기준 상대 좌표로 변환
      const relativeX = mouseX - containerCenterX
      const relativeY = mouseY - containerCenterY

      // 확대/축소에 따른 오프셋 조정
      const zoomFactor = newZoom / zoom
      setPanOffset(prev => ({
        x: prev.x - relativeX * (zoomFactor - 1),
        y: prev.y - relativeY * (zoomFactor - 1),
      }))

      setZoom(newZoom)
      setIsAutoMoving(false) // 확대/축소 시 자동 이동 플래그 해제
    }

    window.addEventListener("wheel", handleWheel, { passive: false })
    return () => window.removeEventListener("wheel", handleWheel)
  }, [zoom, isAutoMode])

  // 마우스 드래그 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, [role='button']")) {
      return // 버튼 클릭은 무시
    }
    setIsDragging(true)
    setDragStart({
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // 전역 마우스 이벤트 처리
  useEffect(() => {
    if (!isDragging) return

    const handleGlobalMouseMove = (e: MouseEvent) => {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }

    const handleGlobalMouseUp = () => {
      setIsDragging(false)
    }

    window.addEventListener("mousemove", handleGlobalMouseMove)
    window.addEventListener("mouseup", handleGlobalMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove)
      window.removeEventListener("mouseup", handleGlobalMouseUp)
    }
  }, [isDragging, dragStart])

  // 마운트 전이나 데이터가 없으면 빈 상태 반환
  if (!isMounted || dateCoursePoints.length === 0) {
    return (
      <div className="relative w-full h-[500px] md:h-[600px] rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    )
  }

  // activeIndex가 유효한 범위인지 확인
  const safeActiveIndex = Math.max(0, Math.min(activeIndex, dateCoursePoints.length - 1))
  const activePoint = dateCoursePoints[safeActiveIndex]

  // activePoint가 없으면 첫 번째 포인트 사용
  if (!activePoint) {
    return (
      <div className="relative w-full h-[500px] md:h-[600px] rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center">
        <div className="text-muted-foreground">데이터를 불러오는 중...</div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[500px] md:h-[600px] rounded-2xl overflow-hidden border border-primary/20 bg-gradient-to-br from-background/80 via-primary/5 to-accent/5 backdrop-blur-xl shadow-2xl"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
      }}
    >
      {/* WEB3 스타일 배경 효과 */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,141,171,0.1),transparent_50%)]" />
      
      {/* 회전하는 지도 배경 - 확장된 크기로 드래그 가능하게 */}
      <motion.div
        className="absolute rounded-lg"
        style={{
          width: "200%",
          height: "200%",
          left: "-50%",
          top: "-50%",
          x: panOffset.x,
          y: panOffset.y,
          scale: zoom,
          transformOrigin: "center center",
          willChange: isDragging ? "transform" : "auto",
          background: `
            radial-gradient(circle at 30% 30%, hsl(var(--primary) / 0.15) 0%, transparent 50%),
            radial-gradient(circle at 70% 70%, hsl(var(--accent) / 0.15) 0%, transparent 50%),
            linear-gradient(135deg, hsl(var(--primary) / 0.08) 0%, hsl(var(--accent) / 0.05) 50%, hsl(var(--primary) / 0.08) 100%)
          `,
          backgroundSize: "100% 100%",
        }}
        transition={
          isDragging
            ? { duration: 0 }
            : isAutoMoving
              ? { type: "spring", stiffness: 100, damping: 20, mass: 1 }
              : { type: "spring", stiffness: 300, damping: 30 }
        }
      >
        {/* WEB3 스타일 그리드 패턴 - 네온 효과 */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255, 141, 171, 0.2) 1px, transparent 1px),
                linear-gradient(90deg, rgba(78, 205, 196, 0.2) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
              backgroundRepeat: "repeat",
              width: "100%",
              height: "100%",
              animation: "rotateGrid 20s linear infinite",
              filter: "blur(0.5px)",
            }}
          />
        </div>
        
        {/* 추가 네온 그리드 레이어 */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255, 141, 171, 0.3) 2px, transparent 2px),
                linear-gradient(90deg, rgba(78, 205, 196, 0.3) 2px, transparent 2px)
              `,
              backgroundSize: "100px 100px",
              backgroundRepeat: "repeat",
              width: "100%",
              height: "100%",
              animation: "rotateGrid 30s linear infinite reverse",
            }}
          />
        </div>

        {/* 회전하는 지도 원형 요소 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="relative w-64 h-64 md:w-80 md:h-80"
            animate={{ rotate: 360 }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {/* WEB3 스타일 원형 경로 - 네온 효과 */}
            <svg
              className="w-full h-full"
              viewBox="0 0 200 200"
              style={{ 
                filter: "drop-shadow(0 0 30px rgba(255, 141, 171, 0.5)) drop-shadow(0 0 60px rgba(78, 205, 196, 0.3))",
              }}
            >
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff8fab" stopOpacity="1" />
                  <stop offset="50%" stopColor="#4ecdc4" stopOpacity="1" />
                  <stop offset="100%" stopColor="#ff8fab" stopOpacity="1" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.8"
                filter="url(#glow)"
              />
              {/* 추가 원형 레이어 */}
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="1"
                opacity="0.4"
              />
            </svg>

            {/* WEB3 스타일 중심 마커 - 네온 펄스 효과 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <motion.div
                className="w-4 h-4 bg-primary rounded-full"
                style={{
                  boxShadow: "0 0 20px rgba(255, 141, 171, 0.8), 0 0 40px rgba(78, 205, 196, 0.5)",
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              {/* 펄스 링 */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary rounded-full"
                animate={{
                  scale: [1, 3, 1],
                  opacity: [0.8, 0, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* 데이트 코스 포인트들 */}
        {dateCoursePoints.map((point, index) => {
          const Icon = getTypeIcon(point.type)
          const isActive = safeActiveIndex === index
          const isHovered = hoveredPoint === point.id

          return (
            <motion.div
              key={point.id}
              className="absolute z-10"
              style={{
                top: point.position.top,
                left: point.position.left,
                pointerEvents: "auto" as const,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: 1,
                scale: isActive || isHovered ? 1.2 : 1,
              }}
              transition={{ duration: 0.3 }}
              onMouseEnter={() => setHoveredPoint(point.id)}
              onMouseLeave={() => setHoveredPoint(null)}
              onClick={e => {
                if (!isDragging) {
                  setIsAutoMode(false) // 포인트 클릭 시 auto 모드 해제
                  setActiveIndex(index)
                }
                e.stopPropagation()
              }}
            >
              {/* 펄스 효과 */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: point.color }}
                  animate={{
                    scale: [1, 2, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}

              {/* WEB3 스타일 마커 아이콘 - 글래스모피즘 & 네온 */}
              <motion.div
                className="relative cursor-pointer group"
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.9 }}
              >
                <div
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center backdrop-blur-xl border-2 transition-all relative overflow-hidden"
                  style={{
                    backgroundColor:
                      isActive || isHovered
                        ? `${point.color}E6`
                        : "rgba(255, 255, 255, 0.15)",
                    borderColor: point.color,
                    boxShadow:
                      isActive || isHovered
                        ? `0 0 30px ${point.color}CC, 0 0 60px ${point.color}80, inset 0 0 20px rgba(255, 255, 255, 0.2)`
                        : "0 4px 20px rgba(0, 0, 0, 0.15), inset 0 0 10px rgba(255, 255, 255, 0.1)",
                  }}
                >
                  {/* 글래스 효과 오버레이 */}
                  <div
                    className="absolute inset-0 rounded-full opacity-50"
                    style={{
                      background: "linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 50%)",
                    }}
                  />
                  <Icon
                    className={`w-6 h-6 md:w-7 md:h-7 transition-colors relative z-10 ${
                      isActive || isHovered ? "text-white" : ""
                    }`}
                    style={{
                      color: isActive || isHovered ? "white" : point.color,
                      filter: isActive || isHovered ? "drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))" : "none",
                    }}
                  />
                </div>

                {/* WEB3 스타일 툴팁 - 글래스모피즘 */}
                {(isActive || isHovered) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-3 rounded-xl bg-background/80 backdrop-blur-xl border-2 border-primary/30 shadow-2xl whitespace-nowrap z-20"
                    style={{
                      boxShadow: `0 0 30px ${point.color}40, 0 10px 40px rgba(0, 0, 0, 0.2)`,
                      background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
                    }}
                  >
                    <p className="text-sm font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {point.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">{point.description}</p>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )
        })}

        {/* WEB3 스타일 연결선 애니메이션 - 네온 글로우 */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
          <defs>
            <filter id="lineGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          {dateCoursePoints.map((point, index) => {
            const nextPoint = dateCoursePoints[(index + 1) % dateCoursePoints.length]
            const currentPos = point.position
            const nextPos = nextPoint.position
            const isActive = safeActiveIndex === index

            return (
              <motion.line
                key={`line-${index}`}
                x1={`${parseFloat(currentPos.left)}%`}
                y1={`${parseFloat(currentPos.top)}%`}
                x2={`${parseFloat(nextPos.left)}%`}
                y2={`${parseFloat(nextPos.top)}%`}
                stroke={point.color}
                strokeWidth={isActive ? "3" : "2"}
                strokeDasharray="5,5"
                filter={isActive ? "url(#lineGlow)" : "none"}
                initial={{ pathLength: 0 }}
                animate={{
                  pathLength: isActive ? 1 : 0.3,
                  opacity: isActive ? 1 : 0.2,
                }}
                transition={{ duration: 1 }}
                style={{
                  filter: isActive ? `drop-shadow(0 0 10px ${point.color}80)` : "none",
                }}
              />
            )
          })}
        </svg>
      </motion.div>

      {/* WEB3 스타일 하단 정보 카드 - 글래스모피즘 */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background/95 via-background/70 to-transparent backdrop-blur-xl">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center relative"
        >
          <div
            className="absolute inset-0 rounded-2xl opacity-50"
            style={{
              background: `linear-gradient(135deg, ${activePoint.color}20 0%, transparent 100%)`,
              filter: "blur(20px)",
            }}
          />
          <div className="relative z-10">
          <div className="flex items-center justify-center gap-2 mb-2">
            {(() => {
              const Icon = getTypeIcon(activePoint.type)
                return (
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{
                        color: activePoint.color,
                        filter: `drop-shadow(0 0 10px ${activePoint.color}80)`,
                      }}
                    />
                  </motion.div>
                )
            })()}
              <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              {activePoint.name}
            </h3>
          </div>
          <p className="text-sm md:text-base text-muted-foreground">{activePoint.description}</p>
          </div>
        </motion.div>
      </div>

      {/* WEB3 스타일 진행 표시기 - 네온 효과 */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2 z-20 items-center px-4 py-2 rounded-full bg-background/60 backdrop-blur-xl border border-primary/20 shadow-lg">
        {dateCoursePoints.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsAutoMode(false) // 수동 클릭 시 auto 모드 해제
              setActiveIndex(index)
            }}
            className={`h-2 rounded-full transition-all relative ${
              activeIndex === index
                ? "bg-primary w-8"
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50 w-2"
            }`}
            style={{
              boxShadow:
                safeActiveIndex === index
                  ? `0 0 10px ${dateCoursePoints[safeActiveIndex]?.color || "#ff8fab"}80, 0 0 20px ${dateCoursePoints[safeActiveIndex]?.color || "#ff8fab"}40`
                  : "none",
            }}
            aria-label={`포인트 ${index + 1}로 이동`}
          />
        ))}
      </div>

      {/* WEB3 스타일 Auto 모드 토글 버튼 - 글래스모피즘 & 네온 */}
      <div className="absolute top-4 right-4 z-20">
        <motion.button
          onClick={() => setIsAutoMode(!isAutoMode)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl border-2 transition-all relative overflow-hidden ${
            isAutoMode
              ? "bg-primary/30 border-primary text-primary hover:bg-primary/40"
              : "bg-background/60 border-muted-foreground/30 text-muted-foreground hover:bg-background/80"
          }`}
          style={{
            boxShadow: isAutoMode
              ? "0 0 20px rgba(255, 141, 171, 0.5), 0 0 40px rgba(78, 205, 196, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1)"
              : "0 4px 20px rgba(0, 0, 0, 0.15), inset 0 0 10px rgba(255, 255, 255, 0.05)",
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={isAutoMode ? "자동 모드 끄기" : "자동 모드 켜기"}
        >
          {/* 글래스 효과 오버레이 */}
          <div
            className="absolute inset-0 opacity-50"
            style={{
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%)",
            }}
          />
          {isAutoMode ? (
            <>
              <Pause className="w-4 h-4 relative z-10" style={{ filter: "drop-shadow(0 0 5px currentColor)" }} />
              <span className="text-sm font-bold relative z-10">Auto</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 relative z-10" />
              <span className="text-sm font-medium relative z-10">Manual</span>
            </>
          )}
        </motion.button>
      </div>

      <style jsx>{`
        @keyframes rotateGrid {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
