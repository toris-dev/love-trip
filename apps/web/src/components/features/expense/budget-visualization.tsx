"use client"

import dynamic from "next/dynamic"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@lovetrip/ui/components/card"
import { Progress } from "@lovetrip/ui/components/progress"
import { Alert, AlertDescription } from "@lovetrip/ui/components/alert"
import { Skeleton } from "@lovetrip/ui/components/skeleton"
import { AlertCircle, TrendingUp, TrendingDown, Wallet } from "lucide-react"
import type { BudgetSummary } from "@lovetrip/expense/services"

const BudgetCharts = dynamic(() => import("./budget-charts").then((m) => ({ default: m.BudgetCharts })), {
  ssr: false,
  loading: () => (
    <Card>
      <CardHeader>
        <CardTitle>예산 차트</CardTitle>
        <CardDescription>로딩 중...</CardDescription>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[280px] w-full rounded-lg" />
      </CardContent>
    </Card>
  ),
})

interface BudgetVisualizationProps {
  summary: BudgetSummary
  travelPlanId?: string
}

export function BudgetVisualization({ summary }: BudgetVisualizationProps) {
  const { totalPlanned, totalActual, remaining, byCategory } = summary

  const percentageUsed = totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0
  const isOverBudget = remaining < 0
  const isNearBudget = percentageUsed >= 80 && percentageUsed < 100

  // 카테고리별 차트 데이터
  const categoryData = Object.entries(byCategory)
    .filter(([_, data]) => {
      const categoryData = data as { planned: number; actual: number }
      return categoryData.planned > 0 || categoryData.actual > 0
    })
    .map(([category, data]) => {
      const categoryData = data as { planned: number; actual: number }
      return {
        category,
        planned: categoryData.planned,
        actual: categoryData.actual,
        percentage:
          categoryData.planned > 0 ? (categoryData.actual / categoryData.planned) * 100 : 0,
        remaining: categoryData.planned - categoryData.actual,
      }
    })
    .sort((a, b) => b.planned - a.planned)

  return (
    <div className="space-y-6">
      {/* 전체 예산 요약 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            예산 현황
          </CardTitle>
          <CardDescription>계획된 예산 대비 실제 지출 현황</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 전체 예산 진행률 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">전체 예산</span>
              <span className="text-sm text-muted-foreground">
                {totalActual.toLocaleString()}원 / {totalPlanned.toLocaleString()}원
              </span>
            </div>
            <Progress
              value={Math.min(percentageUsed, 100)}
              className={isOverBudget ? "bg-destructive" : isNearBudget ? "bg-yellow-500" : ""}
            />
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>{percentageUsed.toFixed(1)}% 사용</span>
              <span className={isOverBudget ? "text-destructive font-semibold" : ""}>
                {remaining >= 0 ? (
                  <span className="flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" />
                    {remaining.toLocaleString()}원 남음
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-destructive">
                    <TrendingUp className="h-3 w-3" />
                    {Math.abs(remaining).toLocaleString()}원 초과
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* 예산 초과 경고 */}
          {isOverBudget && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                예산을 초과했습니다. 지출을 확인하고 조정해주세요.
              </AlertDescription>
            </Alert>
          )}

          {isNearBudget && !isOverBudget && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                예산의 80% 이상 사용되었습니다. 남은 예산을 확인해주세요.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 카테고리별 예산 */}
      <Card>
        <CardHeader>
          <CardTitle>카테고리별 예산</CardTitle>
          <CardDescription>카테고리별 계획 대비 실제 지출</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                카테고리별 예산 데이터가 없습니다.
              </p>
            ) : (
              categoryData.map(({ category, planned, actual, percentage, remaining }) => (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{category}</span>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">
                        {actual.toLocaleString()}원 / {planned.toLocaleString()}원
                      </span>
                      {remaining >= 0 ? (
                        <span className="text-success">{remaining.toLocaleString()}원 남음</span>
                      ) : (
                        <span className="text-destructive">
                          {Math.abs(remaining).toLocaleString()}원 초과
                        </span>
                      )}
                    </div>
                  </div>
                  <Progress
                    value={Math.min(percentage, 100)}
                    className={remaining < 0 ? "bg-destructive" : ""}
                  />
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* 차트 시각화 */}
      <BudgetCharts summary={summary} />
    </div>
  )
}
