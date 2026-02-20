"use client"

import * as React from "react"
import { BarChart3 } from "lucide-react"
import { cn } from "@lovetrip/shared"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Button } from "./button"
import { Progress } from "./progress"

export interface BudgetProgressProps {
  totalBudget: number
  spentToday: number
  totalSpent?: number
  onBreakdownClick?: () => void
  className?: string
}

export function BudgetProgress({
  totalBudget,
  spentToday,
  totalSpent,
  onBreakdownClick,
  className,
}: BudgetProgressProps) {
  const spentAmount = totalSpent ?? spentToday
  const progressPercentage = totalBudget > 0 ? (spentAmount / totalBudget) * 100 : 0
  const remaining = totalBudget - spentAmount
  const isOverBudget = remaining < 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount)
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">예산 관리</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 총 예산 */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>TOTAL BUDGET</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{formatCurrency(totalBudget)}</div>
        </div>

        {/* 오늘 지출 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">SPENT {totalSpent ? "TOTAL" : "TODAY"}</span>
            <span
              className={cn(
                "font-semibold",
                isOverBudget ? "text-destructive" : "text-foreground"
              )}
            >
              {formatCurrency(spentAmount)}
            </span>
          </div>
          <Progress
            value={Math.min(progressPercentage, 100)}
            className={cn("h-2", isOverBudget && "bg-destructive/20")}
          />
          {isOverBudget && (
            <p className="text-xs text-destructive">
              예산을 {formatCurrency(Math.abs(remaining))} 초과했습니다
            </p>
          )}
          {!isOverBudget && remaining > 0 && (
            <p className="text-xs text-muted-foreground">
              남은 예산: {formatCurrency(remaining)}
            </p>
          )}
        </div>

        {/* Breakdown 버튼 */}
        {onBreakdownClick && (
          <Button
            variant="outline"
            size="sm"
            onClick={onBreakdownClick}
            className="w-full"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Breakdown
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
