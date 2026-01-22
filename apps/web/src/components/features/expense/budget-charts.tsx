"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@lovetrip/ui/components/card"
import type { BudgetSummary, ExpenseCategory } from "@lovetrip/expense/services"

interface BudgetChartsProps {
  summary: BudgetSummary
}

const COLORS = {
  planned: "#3b82f6", // blue
  actual: "#10b981", // green
  over: "#ef4444", // red
}

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"]

export function BudgetCharts({ summary }: BudgetChartsProps) {
  const { byCategory, totalPlanned } = summary

  // 막대 그래프 데이터 준비
  const barChartData = Object.entries(byCategory)
    .filter(([_, data]) => {
      const categoryData = data as { planned: number; actual: number }
      return categoryData.planned > 0 || categoryData.actual > 0
    })
    .map(([category, data]) => {
      const categoryData = data as { planned: number; actual: number }
      return {
        category,
        계획: categoryData.planned,
        실제: categoryData.actual,
        초과:
          categoryData.actual > categoryData.planned
            ? categoryData.actual - categoryData.planned
            : 0,
      }
    })
    .sort((a, b) => b.계획 - a.계획)

  // 파이 차트 데이터 준비 (예산 분배 비율)
  const pieChartData = Object.entries(byCategory)
    .filter(([_, data]) => {
      const categoryData = data as { planned: number; actual: number }
      return categoryData.planned > 0
    })
    .map(([category, data], index) => {
      const categoryData = data as { planned: number; actual: number }
      const percentage = totalPlanned > 0 ? (categoryData.planned / totalPlanned) * 100 : 0
      return {
        name: category,
        value: categoryData.planned,
        percentage: percentage.toFixed(1),
        color: PIE_COLORS[index % PIE_COLORS.length],
      }
    })
    .sort((a, b) => b.value - a.value)

  // 커스텀 툴팁
  interface TooltipProps {
    active?: boolean
    payload?: Array<{
      name: string
      value: number
      color: string
      payload: {
        category: string
        [key: string]: unknown
      }
    }>
  }

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-2">{payload[0]?.payload.category}</p>
          {payload.map((entry, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}원
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // 파이 차트 커스텀 레이블
  interface LabelProps {
    cx: number
    cy: number
    midAngle: number
    innerRadius: number
    outerRadius: number
    percentage: number
  }

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: LabelProps) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {percentage > 5 ? `${percentage}%` : ""}
      </text>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 카테고리별 계획 vs 실제 막대 그래프 */}
      <Card>
        <CardHeader>
          <CardTitle>카테고리별 예산 비교</CardTitle>
          <CardDescription>계획된 예산과 실제 지출 비교</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="category"
                className="text-xs"
                tick={{ fill: "currentColor" }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "currentColor" }}
                tickFormatter={value => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="계획" fill={COLORS.planned} name="계획 예산" radius={[4, 4, 0, 0]} />
              <Bar dataKey="실제" fill={COLORS.actual} name="실제 지출" radius={[4, 4, 0, 0]} />
              {barChartData.some(d => d.초과 > 0) && (
                <Bar dataKey="초과" fill={COLORS.over} name="초과분" radius={[4, 4, 0, 0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 예산 분배 비율 파이 차트 */}
      <Card>
        <CardHeader>
          <CardTitle>예산 분배 비율</CardTitle>
          <CardDescription>카테고리별 예산 분배 현황</CardDescription>
        </CardHeader>
        <CardContent>
          {pieChartData.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              <p>예산 데이터가 없습니다</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                          <p className="font-semibold">{data.name}</p>
                          <p className="text-sm">
                            {data.value.toLocaleString()}원 ({data.percentage}%)
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend
                  formatter={(value: string, entry: { payload: { percentage: number } }) => {
                    const data = entry.payload
                    return `${value} (${data.percentage}%)`
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
