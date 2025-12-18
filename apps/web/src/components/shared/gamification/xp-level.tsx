"use client"

import { motion } from "framer-motion"
import { Progress } from "@lovetrip/ui/components/progress"
import { Badge } from "@lovetrip/ui/components/badge"
import { Trophy, Star } from "lucide-react"
import { Card, CardContent } from "@lovetrip/ui/components/card"

interface XPLevelProps {
  currentXP: number
  level: number
  xpToNextLevel: number
  totalXP: number
}

export function XPLevel({ currentXP, level, xpToNextLevel, totalXP }: XPLevelProps) {
  const progressPercentage = (currentXP / xpToNextLevel) * 100

  return (
    <Card className="border-2 border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-white shadow-lg"
              >
                {level}
              </motion.div>
              <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-white border-2 border-white">
                <Trophy className="h-3 w-3 mr-1" />
                Lv.{level}
              </Badge>
            </div>
            <div>
              <h3 className="font-bold text-lg">레벨 {level}</h3>
              <p className="text-sm text-muted-foreground">
                {currentXP.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="h-5 w-5 fill-yellow-500" />
              <span className="font-bold text-lg">{totalXP.toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground">총 경험치</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">다음 레벨까지</span>
            <span className="font-semibold text-primary">
              {(xpToNextLevel - currentXP).toLocaleString()} XP 남음
            </span>
          </div>
          <div className="relative">
            <Progress value={progressPercentage} className="h-3" />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full"
              style={{
                backgroundSize: "200% 100%",
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

