"use client"

import { MapPin } from "lucide-react"
import { motion } from "framer-motion"
import { DateCourseMapExplorer } from "@/components/date-course-map-explorer"

export function ExploreMapSection() {
  return (
    <section
      id="explore"
      className="relative py-32 md:py-40 overflow-hidden"
    >
      {/* 배경 그라데이션 효과 */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background via-accent/5 to-background" />
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
      
      {/* 애니메이션 원형 배경 요소 */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 섹션 */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 backdrop-blur-sm"
            >
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Interactive Map</span>
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient"
            >
              데이트 코스를 지도로
              <br />
              <span className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">
                탐험해보세요
              </span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            >
              3D 인터랙티브 지도에서 로맨틱한 데이트 코스를 시각적으로 확인하고,
              <br className="hidden md:block" />
              <span className="text-primary font-semibold">각 장소를 클릭하여</span> 상세 정보를 탐험할 수 있습니다
            </motion.p>
          </div>

          {/* 지도 컨테이너 - 카드 스타일 */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            {/* WEB3 스타일 카드 컨테이너 - 글래스모피즘 & 네온 */}
            <div className="relative rounded-3xl overflow-hidden bg-background/60 backdrop-blur-2xl border-2 border-primary/30 shadow-2xl">
              {/* 네온 글로우 효과 */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 opacity-50" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,141,171,0.15),transparent_70%)]" />
              
              {/* 카드 상단 그라데이션 바 - 네온 효과 */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary shadow-[0_0_20px_rgba(255,141,171,0.6)]" />
              
              {/* 지도 영역 */}
              <div className="relative p-6 md:p-8">
                <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-transparent to-accent/10 border border-primary/20 backdrop-blur-xl">
                  <DateCourseMapExplorer />
                </div>
              </div>

              {/* 하단 데코레이션 - 네온 라인 */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent shadow-[0_0_10px_rgba(78,205,196,0.5)]" />
            </div>

            {/* 플로팅 요소들 */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-xl animate-pulse" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '0.5s' }} />
          </motion.div>

          {/* 하단 설명 카드들 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12"
          >
            {[
              { icon: "🎯", text: "인터랙티브 탐험" },
              { icon: "🗺️", text: "3D 지도 시각화" },
              { icon: "💝", text: "로맨틱 코스 추천" },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-background/50 backdrop-blur-xl border-2 border-primary/20 hover:border-primary/40 transition-all cursor-default relative overflow-hidden group"
                style={{
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1), inset 0 0 10px rgba(255, 255, 255, 0.05)",
                }}
              >
                {/* 글래스 효과 오버레이 */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: "linear-gradient(135deg, rgba(255, 141, 171, 0.1) 0%, rgba(78, 205, 196, 0.1) 100%)",
                  }}
                />
                <span className="text-2xl relative z-10">{item.icon}</span>
                <span className="text-sm font-semibold text-foreground relative z-10 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {item.text}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

