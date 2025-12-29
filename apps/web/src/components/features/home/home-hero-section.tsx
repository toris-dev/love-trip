"use client"

import { motion } from "framer-motion"
import { Sparkles, Heart, Map, Calendar } from "lucide-react"
import { Button } from "@lovetrip/ui/components/button"
import Link from "next/link"

export function HomeHeroSection() {
  return (
    <div className="relative text-center mb-24 pt-10">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] sm:w-[500px] sm:h-[300px] md:w-[600px] md:h-[400px] lg:w-[800px] lg:h-[500px] bg-primary/20 blur-[50px] sm:blur-[70px] md:blur-[90px] lg:blur-[100px] rounded-full -z-10 opacity-50 animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full bg-white/50 dark:bg-black/50 backdrop-blur-sm border border-primary/20 text-primary mb-6 sm:mb-8 shadow-sm"
      >
        <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin-slow" />
        <span className="text-xs sm:text-sm font-medium">커플을 위한 UGC 데이트 코스 플랫폼</span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold mb-6 sm:mb-8 tracking-tight px-4"
      >
        <span className="bg-gradient-to-r from-primary via-indigo-600 to-blue-600 bg-clip-text text-transparent">
          우리만의 특별한
        </span>
        <br />
        <span className="text-foreground">여행을 디자인하다</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-4"
      >
        다른 커플들이 만든 코스를 탐색하고,
        <br className="hidden sm:block" />
        나만의 특별한 데이트 코스를 제작해보세요.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4"
      >
        <Link href="/date?type=date" className="w-full sm:w-auto">
          <Button
            size="lg"
            variant="glow"
            className="rounded-full px-6 sm:px-8 h-11 sm:h-12 text-base sm:text-lg w-full sm:w-auto touch-manipulation"
          >
            코스 구경하기
          </Button>
        </Link>
        <Link href="/planner" className="w-full sm:w-auto">
          <Button
            size="lg"
            variant="outline"
            className="rounded-full px-6 sm:px-8 h-11 sm:h-12 text-base sm:text-lg border-primary/20 hover:bg-primary/5 w-full sm:w-auto touch-manipulation"
          >
            여행 계획하기
          </Button>
        </Link>
      </motion.div>

      {/* Floating Icons */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-[10%] hidden lg:block text-primary/40"
      >
        <Heart className="w-12 h-12" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-40 right-[15%] hidden lg:block text-blue-500/40"
      >
        <Map className="w-16 h-16" />
      </motion.div>
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-0 left-[20%] hidden lg:block text-purple-500/40"
      >
        <Calendar className="w-10 h-10" />
      </motion.div>
    </div>
  )
}
