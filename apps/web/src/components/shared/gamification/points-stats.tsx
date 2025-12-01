"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@lovetrip/ui/components/card"
import { Coins, Flame, TrendingUp, Target } from "lucide-react"

interface PointsStatsProps {
  points: number
  streak: number
  completedTrips: number
  visitedPlaces: number
}

export function PointsStats({ points, streak, completedTrips, visitedPlaces }: PointsStatsProps) {
  const stats = [
    {
      label: "포인트",
      value: points,
      icon: Coins,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      label: "연속 기록",
      value: streak,
      icon: Flame,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      label: "완료한 여행",
      value: completedTrips,
      icon: Target,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "방문한 장소",
      value: visitedPlaces,
      icon: TrendingUp,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <motion.p
                      className="text-2xl font-bold"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                    >
                      {stat.value.toLocaleString()}
                    </motion.p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

