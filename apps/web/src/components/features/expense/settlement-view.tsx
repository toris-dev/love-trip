"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@lovetrip/ui/components/card"
import { Button } from "@lovetrip/ui/components/button"
import { Badge } from "@lovetrip/ui/components/badge"
import { Users, TrendingUp, TrendingDown, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"
import type { SettlementSummary } from "@lovetrip/expense/types"
import type { Database } from "@lovetrip/shared/types/database"

type ExpenseWithSplits = Database["public"]["Tables"]["expenses"]["Row"] & {
  expense_splits: Database["public"]["Tables"]["expense_splits"]["Row"][]
}

interface SettlementViewProps {
  travelPlanId: string
  userId: string
  partnerId?: string
  initialSettlement: SettlementSummary[]
}

export function SettlementView({
  travelPlanId,
  userId,
  partnerId,
  initialSettlement,
}: SettlementViewProps) {
  const [settlement, setSettlement] = useState(initialSettlement)
  const [expenses, setExpenses] = useState<ExpenseWithSplits[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 정산 데이터 불러오기
  const loadSettlement = async () => {
    try {
      setIsLoading(true)
      const userIds = partnerId ? [userId, partnerId] : [userId]
      const response = await fetch(
        `/api/travel-plans/${travelPlanId}/settlement?userIds=${userIds.join(",")}`
      )

      if (!response.ok) {
        throw new Error("정산 정보를 불러오는데 실패했습니다")
      }

      const { summaries } = await response.json()
      setSettlement(summaries || [])

      // 지출 내역도 함께 불러오기
      const expensesResponse = await fetch(`/api/travel-plans/${travelPlanId}/expenses`)
      if (expensesResponse.ok) {
        const { expenses: expensesData } = await expensesResponse.json()
        setExpenses(expensesData || [])
      }
    } catch (error) {
      console.error("Error loading settlement:", error)
      toast.error(error instanceof Error ? error.message : "정산 정보를 불러오는데 실패했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSettlement()
  }, [travelPlanId, userId, partnerId])

  // 지불 완료 처리
  const handleMarkAsPaid = async (splitId: string, isPaid: boolean) => {
    try {
      const response = await fetch(`/api/travel-plans/${travelPlanId}/settlement/${splitId}/pay`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_paid: isPaid }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "지불 상태 업데이트에 실패했습니다")
      }

      toast.success(isPaid ? "지불 완료로 표시되었습니다" : "지불 미완료로 표시되었습니다")
      loadSettlement()
    } catch (error) {
      console.error("Error updating payment status:", error)
      toast.error(error instanceof Error ? error.message : "오류가 발생했습니다")
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">로딩 중...</CardContent>
      </Card>
    )
  }

  if (!partnerId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            1/N 정산
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>커플 정보가 없습니다</p>
            <p className="text-sm mt-2">커플을 연결하면 정산 기능을 사용할 수 있습니다</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (settlement.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            1/N 정산
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>정산 정보가 없습니다</p>
            <p className="text-sm mt-2">지출을 기록하면 자동으로 정산됩니다</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* 정산 요약 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            1/N 정산 요약
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {settlement.map(summary => {
              const isCurrentUser = summary.userId === userId

              return (
                <div
                  key={summary.userId}
                  className={`p-4 border rounded-lg ${
                    isCurrentUser ? "bg-primary/5 border-primary/20" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{isCurrentUser ? "나" : "상대방"}</span>
                    {summary.netAmount > 0 ? (
                      <Badge variant="default" className="bg-green-500">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        받을 돈
                      </Badge>
                    ) : summary.netAmount < 0 ? (
                      <Badge variant="destructive">
                        <TrendingDown className="h-3 w-3 mr-1" />낼 돈
                      </Badge>
                    ) : (
                      <Badge variant="secondary">정산 완료</Badge>
                    )}
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">결제한 금액:</span>
                      <span>{summary.totalPaid.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">분담 금액:</span>
                      <span>{summary.totalOwed.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-2 border-t">
                      <span>정산 금액:</span>
                      <span
                        className={
                          summary.netAmount > 0
                            ? "text-green-600"
                            : summary.netAmount < 0
                              ? "text-destructive"
                              : ""
                        }
                      >
                        {summary.netAmount > 0 ? "+" : ""}
                        {summary.netAmount.toLocaleString()}원
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
            {settlement.length === 2 && (
              <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
                <p className="font-medium mb-1">정산 방법:</p>
                <p className="text-muted-foreground">
                  {settlement[0].netAmount > 0
                    ? `상대방이 ${Math.abs(settlement[0].netAmount).toLocaleString()}원을 받아야 합니다`
                    : settlement[0].netAmount < 0
                      ? `당신이 ${Math.abs(settlement[0].netAmount).toLocaleString()}원을 받아야 합니다`
                      : "정산이 완료되었습니다"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 지출별 분할 상세 */}
      {expenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>지출별 분할 내역</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expenses.map(expense => {
                if (!expense.expense_splits || expense.expense_splits.length === 0) return null

                return (
                  <div key={expense.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-medium">{expense.name}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {expense.amount.toLocaleString()}원
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 mt-2">
                      {expense.expense_splits.map(split => {
                        const isSplitUser = split.user_id === userId
                        const isPaid = split.is_paid

                        return (
                          <div
                            key={split.id}
                            className="flex items-center justify-between text-sm p-2 bg-muted rounded"
                          >
                            <div className="flex items-center gap-2">
                              <span>{isSplitUser ? "나" : "상대방"}</span>
                              <span className="text-muted-foreground">
                                {split.amount.toLocaleString()}원
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {isPaid ? (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  지불 완료
                                </Badge>
                              ) : (
                                <Badge variant="outline">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  미지불
                                </Badge>
                              )}
                              {isSplitUser && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleMarkAsPaid(split.id, !isPaid)}
                                  className="h-6 px-2"
                                >
                                  {isPaid ? "미지불로" : "지불 완료로"}
                                </Button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
