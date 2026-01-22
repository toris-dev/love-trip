"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@lovetrip/ui/components/dialog"
import { Badge } from "@lovetrip/ui/components/badge"
import { Trophy, Star, Sparkles } from "lucide-react"

interface LevelInfoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentLevel: number
  currentXP: number
}

/**
 * 레벨 등급 시스템
 */
const LEVEL_TIERS = [
  { name: "브론즈", minLevel: 1, maxLevel: 10, color: "bg-amber-600", icon: Trophy },
  { name: "실버", minLevel: 11, maxLevel: 20, color: "bg-gray-400", icon: Star },
  { name: "골드", minLevel: 21, maxLevel: 30, color: "bg-yellow-500", icon: Trophy },
  { name: "플래티넘", minLevel: 31, maxLevel: 40, color: "bg-cyan-500", icon: Sparkles },
  { name: "다이아몬드", minLevel: 41, maxLevel: 50, color: "bg-blue-500", icon: Sparkles },
  { name: "마스터", minLevel: 51, maxLevel: 100, color: "bg-purple-600", icon: Trophy },
]

/**
 * 레벨별 필요 XP 계산
 */
function getXPForLevel(level: number): number {
  return (level - 1) * 1000
}

/**
 * 현재 레벨이 속한 등급 찾기
 */
function getCurrentTier(level: number) {
  return LEVEL_TIERS.find(tier => level >= tier.minLevel && level <= tier.maxLevel) || LEVEL_TIERS[0]
}

/**
 * 레벨 등급 및 기준표 다이얼로그
 */
export function LevelInfoDialog({ open, onOpenChange, currentLevel, currentXP }: LevelInfoDialogProps) {
  const currentTier = getCurrentTier(currentLevel)
  const xpPerLevel = 1000

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            레벨 등급 시스템
          </DialogTitle>
          <DialogDescription>
            현재 레벨: <span className="font-bold text-primary">레벨 {currentLevel}</span> (
            {currentTier.name})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 현재 레벨 정보 */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full ${currentTier.color} flex items-center justify-center text-white`}>
                  {React.createElement(currentTier.icon, { className: "h-6 w-6" })}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{currentTier.name}</h3>
                  <p className="text-sm text-muted-foreground">레벨 {currentLevel}</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {currentXP.toLocaleString()} / {currentLevel * xpPerLevel} XP
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              다음 레벨까지: {(currentLevel * xpPerLevel - currentXP).toLocaleString()} XP 남음
            </p>
          </div>

          {/* 레벨 등급 표 */}
          <div>
            <h4 className="font-bold text-lg mb-4">레벨 등급 기준표</h4>
            <div className="space-y-3">
              {LEVEL_TIERS.map((tier) => {
                const isCurrentTier = tier === currentTier
                const TierIcon = tier.icon

                return (
                  <div
                    key={tier.name}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isCurrentTier
                        ? "bg-gradient-to-r from-primary/10 to-accent/10 border-primary/40 shadow-md"
                        : "bg-card border-border hover:border-primary/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full ${tier.color} flex items-center justify-center text-white`}
                        >
                          <TierIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h5 className="font-bold">{tier.name}</h5>
                          <p className="text-sm text-muted-foreground">
                            레벨 {tier.minLevel} - {tier.maxLevel}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          {getXPForLevel(tier.minLevel).toLocaleString()} -{" "}
                          {getXPForLevel(tier.maxLevel + 1) - 1} XP
                        </p>
                        {isCurrentTier && (
                          <Badge variant="default" className="mt-1">
                            현재 등급
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 레벨 시스템 설명 */}
          <div className="p-4 rounded-lg bg-muted/50 border">
            <h4 className="font-bold mb-2">레벨 시스템 안내</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• 레벨당 1,000 XP가 필요합니다</li>
              <li>• 여행 계획 생성, 코스 등록, 여행 완료 등으로 XP를 획득할 수 있습니다</li>
              <li>• 레벨이 올라갈수록 더 높은 등급의 혜택을 받을 수 있습니다</li>
              <li>• 등급별로 특별한 배지와 혜택이 제공됩니다</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
