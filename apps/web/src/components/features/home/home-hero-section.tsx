"use client"

import { motion } from "framer-motion"
import { Sparkles, Heart, Map, Calendar, ArrowRight } from "lucide-react"
import { Button } from "@lovetrip/ui/components/button"
import Link from "next/link"

export function HomeHeroSection() {
  return (
    <div className="relative text-center min-h-screen flex flex-col items-center justify-center py-20" aria-labelledby="hero-heading">
      {/* 배경 오브: 부드럽게 움직이는 포커스 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <motion.div
          animate={{
            x: [0, 60, 0],
            y: [0, 40, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/6 w-64 h-64 bg-primary/15 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -50, 0],
            y: [0, -40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute bottom-1/4 right-1/6 w-80 h-80 bg-accent/15 rounded-full blur-3xl"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-6"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-8 backdrop-blur-sm"
          >
            ✨ 특별한 순간을 만들어보세요
          </motion.span>
        </motion.div>

        <motion.h1
          id="hero-heading"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold mb-6 sm:mb-8 tracking-tight leading-tight"
        >
          <span className="block mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
            데이트, 이제 더
          </span>
          <span className="block bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
            특별하게 ✨
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-10 sm:mb-12 max-w-3xl mx-auto leading-relaxed font-light"
        >
          당신의 기분에 맞는 손으로 골라낸 장소를 발견하고,
          <br className="hidden sm:block" />
          특별한 추억을 만들어보세요
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
        >
          <Link href="/date?surprise=true" className="w-full sm:w-auto group">
            <Button
              size="lg"
              className="w-full sm:w-auto h-14 sm:h-16 px-8 sm:px-10 text-base sm:text-lg rounded-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105 active:scale-95"
              aria-label="놀라운 추천 받기"
            >
              <Sparkles className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" aria-hidden="true" />
              놀라운 추천 받기
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Button>
          </Link>
          <Link href="/date?type=date" className="w-full sm:w-auto group">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto h-14 sm:h-16 px-8 sm:px-10 text-base sm:text-lg rounded-full border-2 border-primary/30 hover:border-primary/50 bg-background/80 backdrop-blur-sm hover:bg-primary/5 transition-all duration-300 hover:scale-105 active:scale-95"
              aria-label="코스 구경하기"
            >
              코스 구경하기
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Button>
          </Link>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-12 sm:mt-16 flex flex-wrap items-center justify-center gap-4 sm:gap-6"
        >
          {[
            { icon: Heart, text: "로맨틱한 장소" },
            { icon: Map, text: "실시간 지도" },
            { icon: Calendar, text: "일정 관리" },
          ].map((item, index) => (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 1 + index * 0.1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/60 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-colors"
            >
              <item.icon className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{item.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 rounded-full border-2 border-primary/30 flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-1.5 h-1.5 rounded-full bg-primary/50"
          />
        </motion.div>
      </motion.div>
    </div>
  )
}
