"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@lovetrip/ui/components/card"
import { Progress } from "@lovetrip/ui/components/progress"
import { Wallet, TrendingUp, TrendingDown } from "lucide-react"
import type { ExpenseCategory } from "@lovetrip/expense/types"

type BudgetSummary = {
  totalPlanned: number
  totalActual: number
  remaining: number
  byCategory: Record<ExpenseCategory, { planned: number; actual: number }>
}

interface BudgetDashboardProps {
  summary: BudgetSummary
}

export function BudgetDashboard({ summary }: BudgetDashboardProps) {
  const usagePercentage =
    summary.totalPlanned > 0 ? (summary.totalActual / summary.totalPlanned) * 100 : 0

  const categories: ExpenseCategory[] = ["교통비", "숙박비", "식비", "액티비티", "쇼핑", "기타"]

  return (
    <div className="space-y-4">
      {/* 전체 예산 요약 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            예산 현황
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">예산 사용률</span>
                <span className="font-medium">{usagePercentage.toFixed(1)}%</span>
              </div>
              <Progress
                value={usagePercentage}
                className={usagePercentage > 100 ? "bg-destructive" : ""}
              />
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground mb-1">계획 예산</p>
                <p className="text-2xl font-bold">{summary.totalPlanned.toLocaleString()}원</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">실제 지출</p>
                <p className="text-2xl font-bold text-primary">
                  {summary.totalActual.toLocaleString()}원
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">남은 예산</p>
                <p
                  className={`text-2xl font-bold flex items-center gap-1 ${
                    summary.remaining < 0 ? "text-destructive" : "text-green-600"
                  }`}
                >
                  {summary.remaining < 0 ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : (
                    <TrendingDown className="h-5 w-5" />
                  )}
                  {summary.remaining.toLocaleString()}원
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 카테고리별 예산 분배 */}
      <Card>
        <CardHeader>
          <CardTitle>카테고리별 예산</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map(category => {
              const categoryData = summary.byCategory[category]
              if (!categoryData || categoryData.planned === 0) return null

              const categoryUsage =
                categoryData.planned > 0 ? (categoryData.actual / categoryData.planned) * 100 : 0

              return (
                <div key={category}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{category}</span>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        {categoryData.actual.toLocaleString()}원 /{" "}
                        {categoryData.planned.toLocaleString()}원
                      </span>
                      <span
                        className={`font-medium ${
                          categoryUsage > 100 ? "text-destructive" : "text-muted-foreground"
                        }`}
                      >
                        {categoryUsage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={Math.min(categoryUsage, 100)}
                    className={categoryUsage > 100 ? "bg-destructive" : ""}
                  />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
