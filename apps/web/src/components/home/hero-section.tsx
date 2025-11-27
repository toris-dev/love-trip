"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Heart, MapPin, Calendar, Users } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { PointsStats } from "@/components/gamification"

export function HeroSection() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [gamificationData] = useState({
    points: 12500,
    streak: 7,
    completedTrips: 12,
    visitedPlaces: 48,
  })

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    loadUser()
  }, [])

  return (
    <section className="py-20 md:py-24 flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/20 via-background to-accent/20">
      {/* 배경 효과 */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

      <div className="container mx-auto px-4 relative z-10 w-full py-8">
        <div className="max-w-7xl mx-auto h-full flex flex-col justify-center">
          {/* 메인 헤드라인 */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Sparkles className="h-4 w-4 text-primary" />
              </motion.div>
              <span className="text-sm font-medium text-primary">AI 기반 맞춤 추천</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight"
            >
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                완벽한 커플 여행을
              </span>
              <br />
              <span className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                함께 계획해보세요
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground mb-6 max-w-3xl mx-auto leading-relaxed"
            >
              AI가 추천하는 맞춤형 데이트 코스와 예산 관리로
              <br />
              <span className="text-primary font-semibold">특별한 추억</span>을 만들어보세요
            </motion.p>

            {/* CTA 버튼 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  asChild
                  size="lg"
                    className="group text-lg px-8 py-6 h-auto bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-2xl transition-all backdrop-blur-xl border-2 border-primary/30 relative overflow-hidden"
                    style={{
                      boxShadow: "0 0 30px rgba(255, 141, 171, 0.5), 0 0 60px rgba(78, 205, 196, 0.3)",
                    }}
                >
                    <Link href="#explore" className="relative z-10 flex items-center">
                    여행 계획 시작하기
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" style={{ filter: "drop-shadow(0 0 5px currentColor)" }} />
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                    className="text-lg px-8 py-6 h-auto backdrop-blur-xl border-2 border-primary/30 hover:bg-primary/20 hover:border-primary/50 transition-all relative overflow-hidden"
                    style={{
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1), inset 0 0 10px rgba(255, 255, 255, 0.05)",
                    }}
                >
                    <Link href="/courses?tab=date" className="relative z-10 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-semibold">
                      데이트 코스 둘러보기
                    </Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* 게이미피케이션 통계 - 로그인한 사용자만 */}
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="max-w-3xl mx-auto mb-4"
            >
              <PointsStats
                points={gamificationData.points}
                streak={gamificationData.streak}
                completedTrips={gamificationData.completedTrips}
                visitedPlaces={gamificationData.visitedPlaces}
              />
            </motion.div>
          )}

          {/* 빠른 통계 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto"
          >
            {[
              { icon: Users, label: "활성 커플", value: "10,000+" },
              { icon: MapPin, label: "추천 장소", value: "50,000+" },
              { icon: Calendar, label: "완성된 여행", value: "100,000+" },
              { icon: Heart, label: "만족도", value: "4.8/5" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                className="text-center p-4 rounded-xl bg-background/60 backdrop-blur-xl border-2 border-primary/20 hover:border-primary/40 transition-all hover:shadow-2xl relative overflow-hidden group"
                style={{
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1), inset 0 0 10px rgba(255, 255, 255, 0.05)",
                }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                {/* WEB3 스타일 배경 효과 */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,141,171,0.15),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                  className="relative z-10"
                >
                  <stat.icon
                    className="h-6 w-6 text-primary mx-auto mb-2"
                    style={{
                      filter: "drop-shadow(0 0 10px currentColor)",
                    }}
                  />
                </motion.div>
                <div className="text-xl md:text-2xl font-bold mb-1 relative z-10 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground relative z-10 font-medium">{stat.label}</div>
                
                {/* 네온 글로우 효과 */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    boxShadow: "inset 0 0 30px rgba(255, 141, 171, 0.2)",
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* 스크롤 인디케이터 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-3 bg-primary rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  )
}
