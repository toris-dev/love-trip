"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@lovetrip/ui/components/dialog"
import { Card, CardContent } from "@lovetrip/ui/components/card"
import { Badge } from "@lovetrip/ui/components/badge"
import { Trophy, Star, Coins, Sparkles, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

interface RewardNotificationProps {
  rewards: {
    xp: number
    points: number
    badge?: { id: string; name: string }
    leveledUp: boolean
  } | null
  onClose?: () => void
}

export function RewardNotification({ rewards, onClose }: RewardNotificationProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (rewards) {
      setOpen(true)
      // 자동으로 5초 후 닫기
      const timer = setTimeout(() => {
        setOpen(false)
        onClose?.()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [rewards, onClose])

  if (!rewards) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
            보상 지급 완료!
          </DialogTitle>
          <DialogDescription>
            코스를 공개해주셔서 감사합니다. 보상이 지급되었습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* XP 보상 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-2 border-primary/50 bg-gradient-to-br from-primary/10 to-purple-500/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                      <Star className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">경험치 획득</p>
                      <p className="text-sm text-muted-foreground">XP +{rewards.xp}</p>
                    </div>
                  </div>
                  <Badge className="bg-primary text-primary-foreground text-lg px-3 py-1">
                    +{rewards.xp} XP
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 포인트 보상 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-2 border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                      <Coins className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">포인트 획득</p>
                      <p className="text-sm text-muted-foreground">포인트 +{rewards.points}</p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-500 text-white text-lg px-3 py-1">
                    +{rewards.points} P
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 배지 보상 */}
          {rewards.badge && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-2 border-primary/50 bg-gradient-to-br from-primary/10 to-indigo-500/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center">
                        <Trophy className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">배지 획득</p>
                        <p className="text-sm text-muted-foreground">{rewards.badge.name}</p>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-primary to-indigo-600 text-white text-lg px-3 py-1">
                      <Trophy className="h-4 w-4 mr-1" />
                      배지
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* 레벨 업 */}
          {rewards.leveledUp && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center p-4 rounded-lg bg-gradient-to-r from-primary/20 to-purple-500/20 border-2 border-primary/50"
            >
              <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2 animate-bounce" />
              <p className="font-bold text-lg">레벨 업!</p>
              <p className="text-sm text-muted-foreground">축하합니다! 레벨이 올라갔습니다.</p>
            </motion.div>
          )}

          <div className="flex justify-end pt-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setOpen(false)
                onClose?.()
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              닫기
            </motion.button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
