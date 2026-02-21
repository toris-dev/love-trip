"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@lovetrip/ui/components/card"
import { Sparkles, MapPin, Heart, CheckCircle2 } from "lucide-react"

export function HomeInfoSection() {
  return (
    <div className="space-y-12 sm:space-y-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          서비스 안내
        </h2>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          LOVETRIP과 함께 특별한 순간을 만들어보세요
        </p>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-8 sm:gap-10">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <Card className="border-2 hover:border-primary/30 transition-colors bg-gradient-to-br from-background to-primary/5 h-full">
          <CardHeader className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6">
            <CardTitle className="text-2xl sm:text-3xl font-bold">왜 LOVETRIP인가요?</CardTitle>
          </CardHeader>
          <CardContent className="px-6 sm:px-8 pb-6 sm:pb-8 space-y-6">
            {[
              {
                icon: Sparkles,
                title: "UGC 데이트 코스 플랫폼",
                description: "다른 사용자들이 만든 데이트 코스를 탐색하고, 나만의 코스를 제작해 공유할 수 있습니다",
              },
              {
                icon: MapPin,
                title: "실시간 지도 탐색",
                description: "네이버 지도 기반으로 장소를 확인하고 코스를 계획할 수 있습니다",
              },
              {
                icon: Heart,
                title: "협업 기능",
                description: "공유 캘린더와 일정 관리를 통해 함께 여행을 계획하세요",
              },
            ].map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold mb-2 text-lg">{item.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <Card className="border-2 hover:border-accent/30 transition-colors bg-gradient-to-br from-background to-accent/5 h-full">
          <CardHeader className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6">
            <CardTitle className="text-2xl sm:text-3xl font-bold">시작하기</CardTitle>
          </CardHeader>
          <CardContent className="px-6 sm:px-8 pb-6 sm:pb-8 space-y-6">
            {[
              {
                step: "1",
                title: "원하는 코스 선택",
                description: "여행 코스 또는 데이트 코스 중 선택하세요",
              },
              {
                step: "2",
                title: "지도에서 코스 탐색",
                description: "지도에서 장소를 확인하고 상세 정보를 살펴보세요",
              },
              {
                step: "3",
                title: "일정 저장 및 공유",
                description: "캘린더에 일정을 저장하고 함께 공유하세요",
              },
            ].map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent/80 text-white flex items-center justify-center text-lg font-bold shadow-lg shadow-accent/25">
                    {item.step}
                  </div>
                  <span className="font-bold text-lg">{item.title}</span>
                </div>
                <p className="text-sm text-muted-foreground pl-[3.25rem] leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
      </div>
    </div>
  )
}
