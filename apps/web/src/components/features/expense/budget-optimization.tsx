"use client"

import { useState, useEffect } from "react"
import { Button } from "@lovetrip/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@lovetrip/ui/components/card"
import { Alert, AlertDescription } from "@lovetrip/ui/components/alert"
import { AlertCircle, TrendingDown, Lightbulb, CheckCircle2, MapPin, Sparkles } from "lucide-react"
import { toast } from "sonner"
import type {
  BudgetOptimizationResult,
  BudgetOptimizationSuggestion,
} from "@lovetrip/expense/services"
import type { Place } from "@lovetrip/shared/types"

interface BudgetOptimizationProps {
  travelPlanId: string
  onOptimize?: (suggestions: BudgetOptimizationSuggestion[]) => Promise<void>
}

export function BudgetOptimization({ travelPlanId, onOptimize }: BudgetOptimizationProps) {
  const [optimization, setOptimization] = useState<BudgetOptimizationResult | null>(null)
  const [alternativePlaces, setAlternativePlaces] = useState<Place[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set())

  // 예산 최적화 제안 조회 (프리미엄 시 대안 장소 포함)
  const loadOptimization = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/travel-plans/${travelPlanId}/budget/optimize`)

      if (!response.ok) {
        throw new Error("예산 최적화 제안을 불러오는데 실패했습니다")
      }

      const data = await response.json()
      setOptimization(data.optimization ?? null)
      setAlternativePlaces(Array.isArray(data.alternativePlaces) ? data.alternativePlaces : [])
    } catch (error) {
      console.error("Error loading optimization:", error)
      toast.error(
        error instanceof Error ? error.message : "예산 최적화 제안을 불러오는데 실패했습니다"
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadOptimization()
  }, [travelPlanId])

  // 개별 제안 적용
  const handleApplySuggestion = async (suggestion: BudgetOptimizationSuggestion) => {
    if (!onOptimize) {
      toast.error("최적화 기능을 사용할 수 없습니다")
      return
    }

    try {
      await onOptimize([suggestion])
      setAppliedSuggestions(prev => new Set(prev).add(suggestion.category))
      toast.success(`${suggestion.category} 예산이 최적화되었습니다`)
      // 최적화 후 다시 로드
      await loadOptimization()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "예산 최적화 적용에 실패했습니다")
    }
  }

  // 전체 제안 적용
  const handleApplyAll = async () => {
    if (!optimization || !onOptimize) {
      return
    }

    try {
      await onOptimize(optimization.suggestions)
      setAppliedSuggestions(new Set(optimization.suggestions.map(s => s.category)))
      toast.success("모든 예산 최적화 제안이 적용되었습니다")
      // 최적화 후 다시 로드
      await loadOptimization()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "예산 최적화 적용에 실패했습니다")
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-center">
            <div className="text-sm text-muted-foreground">최적화 제안을 분석하는 중...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!optimization) {
    return null
  }

  // 예산 초과가 아니고 제안이 없는 경우 표시하지 않음
  if (!optimization.isOverBudget && optimization.suggestions.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          예산 최적화 제안
        </CardTitle>
        <CardDescription>
          {optimization.isOverBudget
            ? `예산을 ${optimization.overAmount.toLocaleString()}원 초과했습니다`
            : "예산을 더 효율적으로 관리할 수 있는 제안입니다"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {optimization.isOverBudget && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              예산을 {optimization.overAmount.toLocaleString()}원 초과했습니다. 아래 제안을 참고하여
              예산을 조정해주세요.
            </AlertDescription>
          </Alert>
        )}

        {optimization.suggestions.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p>현재 예산이 최적화되어 있습니다.</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {optimization.suggestions.map((suggestion, index) => {
                const isApplied = appliedSuggestions.has(suggestion.category)
                const reductionPercentage =
                  suggestion.currentPlanned > 0
                    ? ((suggestion.reduction / suggestion.currentPlanned) * 100).toFixed(1)
                    : "0"

                return (
                  <div
                    key={suggestion.category}
                    className="border rounded-lg p-4 space-y-2 bg-muted/30"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{suggestion.category}</span>
                          {isApplied && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{suggestion.reason}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">현재: </span>
                            <span className="font-medium">
                              {suggestion.currentPlanned.toLocaleString()}원
                            </span>
                          </div>
                          <TrendingDown className="h-4 w-4 text-green-600" />
                          <div>
                            <span className="text-muted-foreground">제안: </span>
                            <span className="font-medium text-green-600">
                              {suggestion.suggestedPlanned.toLocaleString()}원
                            </span>
                          </div>
                          <div className="ml-auto">
                            <span className="text-muted-foreground">절감: </span>
                            <span className="font-semibold text-green-600">
                              -{suggestion.reduction.toLocaleString()}원 ({reductionPercentage}%)
                            </span>
                          </div>
                        </div>
                      </div>
                      {!isApplied && onOptimize && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApplySuggestion(suggestion)}
                          className="ml-4"
                        >
                          적용
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {onOptimize && optimization.suggestions.length > 0 && (
              <div className="flex justify-end pt-2 border-t">
                <Button onClick={handleApplyAll} variant="default">
                  전체 적용
                </Button>
              </div>
            )}

            {/* 예산 맞춤 대안 장소 (프리미엄, API에서 반환된 경우만) */}
            {optimization.isOverBudget && alternativePlaces.length > 0 && (
              <div className="mt-4 p-4 border rounded-lg bg-primary/5 border-primary/20">
                <h4 className="font-semibold mb-2 text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  예산 맞춤 대안 장소
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  예산에 맞는 대안 장소입니다. 방문지를 바꿔 예산을 줄여보세요.
                </p>
                <ul className="space-y-2">
                  {alternativePlaces.slice(0, 8).map(place => (
                    <li
                      key={place.id}
                      className="flex items-start gap-2 text-sm py-1.5 border-b border-border/50 last:border-0"
                    >
                      <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                      <div>
                        <span className="font-medium">{place.name}</span>
                        {place.address && (
                          <p className="text-xs text-muted-foreground truncate">{place.address}</p>
                        )}
                        {place.price_level != null && (
                          <span className="text-xs text-muted-foreground">
                            가격대: {place.price_level === 1 ? "저렴" : place.price_level === 2 ? "보통" : "비쌈"}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 최적화된 분배 요약 */}
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 text-sm">최적화된 예산 분배</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                {Object.entries(optimization.optimizedDistribution)
                  .filter(([_, amount]) => amount > 0)
                  .map(([category, amount]) => (
                    <div key={category} className="flex justify-between">
                      <span className="text-muted-foreground">{category}:</span>
                      <span className="font-medium">{amount.toLocaleString()}원</span>
                    </div>
                  ))}
              </div>
              <div className="mt-2 pt-2 border-t flex justify-between items-center">
                <span className="font-semibold">총 예산:</span>
                <span className="font-bold text-lg">
                  {Object.values(optimization.optimizedDistribution)
                    .reduce((sum, amount) => sum + amount, 0)
                    .toLocaleString()}
                  원
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
