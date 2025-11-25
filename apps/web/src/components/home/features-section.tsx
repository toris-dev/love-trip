"use client"

import { Sparkles, MapPin, Wallet, Users, Calendar, Heart, Zap, Shield } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const features = [
  {
    icon: Sparkles,
    title: "AI 기반 맞춤 추천",
    description: "커플의 취향과 예산에 맞는 최적의 여행 코스를 AI가 자동으로 추천해드립니다",
    color: "text-yellow-500",
    gradient: "from-yellow-500/20 to-yellow-600/10",
  },
  {
    icon: MapPin,
    title: "실시간 지도 연동",
    description: "네이버 지도와 연동하여 실제 위치 기반으로 정확한 여행 계획을 세울 수 있습니다",
    color: "text-green-500",
    gradient: "from-green-500/20 to-green-600/10",
  },
  {
    icon: Wallet,
    title: "스마트 예산 관리",
    description: "실시간 지출 추적과 예산 분석으로 여행 경비를 완벽하게 관리하세요",
    color: "text-blue-500",
    gradient: "from-blue-500/20 to-blue-600/10",
  },
  {
    icon: Users,
    title: "커플 협업 기능",
    description: "파트너와 함께 실시간으로 여행 계획을 공유하고 수정할 수 있습니다",
    color: "text-pink-500",
    gradient: "from-pink-500/20 to-pink-600/10",
  },
  {
    icon: Calendar,
    title: "공유 캘린더",
    description: "커플 전용 캘린더로 일정을 공유하고 특별한 날을 함께 기념하세요",
    color: "text-purple-500",
    gradient: "from-purple-500/20 to-purple-600/10",
  },
  {
    icon: Zap,
    title: "빠른 계획 생성",
    description: "몇 번의 클릭만으로 완벽한 여행 계획을 자동으로 생성할 수 있습니다",
    color: "text-orange-500",
    gradient: "from-orange-500/20 to-orange-600/10",
  },
  {
    icon: Heart,
    title: "로맨틱 코스 큐레이션",
    description: "데이트 코스부터 기념일 여행까지, 로맨틱한 순간을 위한 특별한 장소를 추천합니다",
    color: "text-red-500",
    gradient: "from-red-500/20 to-red-600/10",
  },
  {
    icon: Shield,
    title: "안전한 정보 보호",
    description: "개인정보를 안전하게 보호하며, 모든 데이터는 암호화되어 저장됩니다",
    color: "text-cyan-500",
    gradient: "from-cyan-500/20 to-cyan-600/10",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-20 md:py-24 flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />

      <div className="container mx-auto px-4 relative z-10 w-full py-8">
        <div className="max-w-7xl mx-auto h-full flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              모든 것이 한 곳에
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              LOVETRIP이 제공하는 특별한 기능들로 완벽한 여행을 계획하세요
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full group hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50 hover:-translate-y-2 bg-background/60 backdrop-blur-xl relative overflow-hidden">
                  {/* WEB3 스타일 배경 효과 */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,141,171,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <CardHeader className="relative z-10">
                    <div
                      className={`mb-4 p-3 rounded-xl bg-gradient-to-br ${feature.gradient} w-fit backdrop-blur-sm border border-primary/20 group-hover:border-primary/40 transition-all`}
                      style={{
                        boxShadow: "0 0 20px rgba(0, 0, 0, 0.1), inset 0 0 10px rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <feature.icon
                        className={`h-6 w-6 ${feature.color} group-hover:scale-110 transition-transform`}
                        style={{
                          filter: "drop-shadow(0 0 8px currentColor)",
                        }}
                      />
                    </div>
                    <CardTitle className="text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                  
                  {/* 네온 글로우 효과 */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      boxShadow: "inset 0 0 30px rgba(255, 141, 171, 0.1)",
                    }}
                  />
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-6"
          >
            <Button asChild size="lg" variant="outline" className="text-lg">
              <Link href="/about">모든 기능 보기</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
