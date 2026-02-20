"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@lovetrip/ui/components/card"
import { Badge } from "@lovetrip/ui/components/badge"
import {
  Trophy,
  Star,
} from "lucide-react"

interface Achievement {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  unlocked: boolean
  progress?: number
  maxProgress?: number
  rarity: "common" | "rare" | "epic" | "legendary"
}

interface AchievementsProps {
  achievements: Achievement[]
}

const rarityColors = {
  common: "bg-muted-foreground",
  rare: "bg-accent",
  epic: "bg-purple-500",
  legendary: "bg-yellow-500",
}

const rarityLabels = {
  common: "일반",
  rare: "희귀",
  epic: "영웅",
  legendary: "전설",
}

export function Achievements({ achievements }: AchievementsProps) {
  const unlockedCount = achievements.filter((a) => a.unlocked).length
  const totalCount = achievements.length

  return (
    <Card className="border-2">
      <CardHeader className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            업적
          </CardTitle>
          <Badge variant="secondary">
            {unlockedCount} / {totalCount}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-6 sm:px-8 pb-6 sm:pb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {achievements.map((achievement, index) => {
            const Icon = achievement.icon
            const isUnlocked = achievement.unlocked
            const progress = achievement.progress || 0
            const maxProgress = achievement.maxProgress || 1
            const progressPercentage = (progress / maxProgress) * 100

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <Card
                  className={`cursor-pointer transition-all ${
                    isUnlocked
                      ? "border-2 border-primary shadow-lg"
                      : "opacity-60 border border-muted"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isUnlocked
                            ? `bg-gradient-to-br ${rarityColors[achievement.rarity]} text-white`
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-sm">{achievement.name}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {achievement.description}
                        </p>
                        {!isUnlocked && achievement.maxProgress && (
                          <div className="mt-2">
                            <div className="w-full bg-muted rounded-full h-1.5">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                className={`h-1.5 rounded-full ${rarityColors[achievement.rarity]}`}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {progress} / {maxProgress}
                            </p>
                          </div>
                        )}
                        {isUnlocked && (
                          <Badge
                            className={`mt-1 text-xs ${rarityColors[achievement.rarity]} text-white`}
                          >
                            {rarityLabels[achievement.rarity]}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {isUnlocked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2"
                  >
                    <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center">
                      <Star className="h-4 w-4 text-white fill-white" />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

