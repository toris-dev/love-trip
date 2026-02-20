"use client"

import { useState, useEffect } from "react"
import { Button } from "@lovetrip/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@lovetrip/ui/components/card"
import { Input } from "@lovetrip/ui/components/input"
import { Label } from "@lovetrip/ui/components/label"
import { Badge } from "@lovetrip/ui/components/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@lovetrip/ui/components/dialog"
import { Plus, Receipt, X, Upload, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"
import type { ExpenseCategory, ExpenseWithSplits, SettlementSummary, BudgetSummary } from "@lovetrip/expense/types"
import type { BudgetOptimizationSuggestion } from "@lovetrip/expense/services"
import type { Database } from "@lovetrip/shared/types/database"
import { BudgetPlanner } from "./budget-planner"
import { BudgetDashboard } from "./budget-dashboard"
import { BudgetVisualization } from "./budget-visualization"
import { BudgetOptimization } from "./budget-optimization"
import { BudgetProgress } from "@lovetrip/ui/components/budget-progress"
import { SettlementView } from "./settlement-view"

type TravelPlan = Database["public"]["Tables"]["travel_plans"]["Row"]

export interface TripExpenseSectionProps {
  plan: TravelPlan
  initialExpenses: ExpenseWithSplits[]
  initialSettlement: SettlementSummary[]
  userId: string
  partnerId?: string
  isPremium?: boolean
}

export function TripExpenseSection({
  plan,
  initialExpenses,
  initialSettlement,
  userId,
  partnerId,
}: TripExpenseSectionProps) {
  const [expenses, setExpenses] = useState(initialExpenses)
  const [settlement, setSettlement] = useState(initialSettlement)
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false)
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null)
  const [newExpense, setNewExpense] = useState({
    category: "식비" as ExpenseCategory,
    name: "",
    amount: "",
    expense_date: new Date().toISOString().split("T")[0],
    notes: "",
    receiptFile: null as File | null,
  })
  const [uploadingReceipt, setUploadingReceipt] = useState(false)

  const loadBudgetSummary = async () => {
    try {
      const response = await fetch(`/api/travel-plans/${plan.id}/budget`)
      if (response.ok) {
        const { summary } = await response.json()
        setBudgetSummary(summary)
      }
    } catch (error) {
      console.error("Failed to load budget summary:", error)
    }
  }

  useEffect(() => {
    loadBudgetSummary()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan.id])

  const handleAddExpense = async () => {
    if (!newExpense.name || !newExpense.amount) {
      toast.error("지출 항목명과 금액을 입력해주세요")
      return
    }

    try {
      if (newExpense.receiptFile) {
        setUploadingReceipt(true)
        const formData = new FormData()
        formData.append("file", newExpense.receiptFile)

        const createResponse = await fetch(`/api/travel-plans/${plan.id}/expenses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category: newExpense.category,
            name: newExpense.name,
            amount: parseFloat(newExpense.amount),
            expenseDate: newExpense.expense_date,
            paidByUserId: userId,
            notes: newExpense.notes || undefined,
          }),
        })

        if (!createResponse.ok) {
          const error = await createResponse.json()
          throw new Error(error.error || "지출 기록에 실패했습니다")
        }

        const { expense: createdExpense } = await createResponse.json()

        await fetch(
          `/api/travel-plans/${plan.id}/expenses/${createdExpense.id}/receipt`,
          { method: "POST", body: formData }
        ).then(r => r.ok && r.json().then((d: { receiptUrl?: string }) => d.receiptUrl))

        setUploadingReceipt(false)
      } else {
        const response = await fetch(`/api/travel-plans/${plan.id}/expenses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category: newExpense.category,
            name: newExpense.name,
            amount: parseFloat(newExpense.amount),
            expenseDate: newExpense.expense_date,
            paidByUserId: userId,
            notes: newExpense.notes || undefined,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "지출 기록에 실패했습니다")
        }
      }

      toast.success("지출이 기록되었습니다")
      setExpenseDialogOpen(false)
      setNewExpense({
        category: "식비",
        name: "",
        amount: "",
        expense_date: new Date().toISOString().split("T")[0],
        notes: "",
        receiptFile: null,
      })

      const expensesResponse = await fetch(`/api/travel-plans/${plan.id}/expenses`)
      if (expensesResponse.ok) {
        const { expenses: updatedExpenses } = await expensesResponse.json()
        setExpenses(updatedExpenses || [])
      }

      if (partnerId) {
        const settlementResponse = await fetch(
          `/api/travel-plans/${plan.id}/settlement?userIds=${userId},${partnerId}`
        )
        if (settlementResponse.ok) {
          const { summaries } = await settlementResponse.json()
          setSettlement(summaries || [])
        }
      }

      loadBudgetSummary()
    } catch (err) {
      setUploadingReceipt(false)
      toast.error(err instanceof Error ? err.message : "지출 기록에 실패했습니다")
      console.error(err)
    }
  }

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm("정말 이 지출을 삭제하시겠습니까?")) return

    try {
      const response = await fetch(`/api/travel-plans/${plan.id}/expenses/${expenseId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("지출 삭제에 실패했습니다")

      toast.success("지출이 삭제되었습니다")

      const expensesResponse = await fetch(`/api/travel-plans/${plan.id}/expenses`)
      if (expensesResponse.ok) {
        const { expenses: updatedExpenses } = await expensesResponse.json()
        setExpenses(updatedExpenses || [])
      }

      if (partnerId) {
        const settlementResponse = await fetch(
          `/api/travel-plans/${plan.id}/settlement?userIds=${userId},${partnerId}`
        )
        if (settlementResponse.ok) {
          const { summaries } = await settlementResponse.json()
          setSettlement(summaries || [])
        }
      }

      loadBudgetSummary()
    } catch {
      toast.error("지출 삭제에 실패했습니다")
    }
  }

  return (
    <>
      <div className="mb-6 space-y-4">
        {budgetSummary && (
          <BudgetProgress
            totalBudget={budgetSummary.totalPlanned}
            spentToday={budgetSummary.totalActual}
            totalSpent={budgetSummary.totalActual}
            onBreakdownClick={() => {}}
          />
        )}
        <BudgetPlanner travelPlanId={plan.id} initialBudget={plan.total_budget || 0} />
        {budgetSummary && (
          <>
            <BudgetVisualization summary={budgetSummary} travelPlanId={plan.id} />
            <BudgetDashboard summary={budgetSummary} />
            <BudgetOptimization
              travelPlanId={plan.id}
              onOptimize={async (suggestions: BudgetOptimizationSuggestion[]) => {
                for (const suggestion of suggestions) {
                  try {
                    const response = await fetch(`/api/travel-plans/${plan.id}/budget`)
                    if (!response.ok) throw new Error("예산 정보를 불러오는데 실패했습니다")

                    const { items } = await response.json()
                    const categoryItems = items.filter(
                      (item: { category: string }) => item.category === suggestion.category
                    )

                    const totalCategoryPlanned = categoryItems.reduce(
                      (sum: number, item: { planned_amount: number }) =>
                        sum + (item.planned_amount || 0),
                      0
                    )

                    if (totalCategoryPlanned > 0) {
                      const ratio = suggestion.suggestedPlanned / totalCategoryPlanned

                      for (const item of categoryItems) {
                        const newAmount = Math.round((item.planned_amount || 0) * ratio)
                        await fetch(`/api/travel-plans/${plan.id}/budget/${item.id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ planned_amount: newAmount }),
                        })
                      }
                    }
                  } catch (error) {
                    console.error(
                      `Failed to apply optimization for ${suggestion.category}:`,
                      error
                    )
                    throw error
                  }
                }
                await loadBudgetSummary()
              }}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              지출 내역
            </CardTitle>
            <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  지출 추가
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>지출 기록</DialogTitle>
                  <DialogDescription>여행 중 발생한 지출을 기록하세요</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>카테고리</Label>
                    <select
                      value={newExpense.category}
                      onChange={e =>
                        setNewExpense({
                          ...newExpense,
                          category: e.target.value as ExpenseCategory,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="교통비">교통비</option>
                      <option value="숙박비">숙박비</option>
                      <option value="식비">식비</option>
                      <option value="액티비티">액티비티</option>
                      <option value="쇼핑">쇼핑</option>
                      <option value="기타">기타</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>항목명</Label>
                    <Input
                      value={newExpense.name}
                      onChange={e => setNewExpense({ ...newExpense, name: e.target.value })}
                      placeholder="예: 저녁 식사"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>금액</Label>
                    <Input
                      type="number"
                      value={newExpense.amount}
                      onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>지출 날짜</Label>
                    <Input
                      type="date"
                      value={newExpense.expense_date}
                      onChange={e =>
                        setNewExpense({ ...newExpense, expense_date: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>메모 (선택)</Label>
                    <Input
                      value={newExpense.notes}
                      onChange={e => setNewExpense({ ...newExpense, notes: e.target.value })}
                      placeholder="메모를 입력하세요"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>영수증 (선택)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          const file = e.target.files?.[0]
                          if (file) setNewExpense({ ...newExpense, receiptFile: file })
                        }}
                        className="flex-1"
                      />
                      {newExpense.receiptFile && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setNewExpense({ ...newExpense, receiptFile: null })}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {newExpense.receiptFile && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ImageIcon className="h-4 w-4" />
                        <span>{newExpense.receiptFile.name}</span>
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={handleAddExpense}
                    className="w-full"
                    disabled={uploadingReceipt}
                  >
                    {uploadingReceipt ? (
                      <>
                        <Upload className="h-4 w-4 mr-2 animate-spin" />
                        업로드 중...
                      </>
                    ) : (
                      "저장"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>아직 기록된 지출이 없습니다</p>
                <p className="text-sm mt-2">지출 추가 버튼을 눌러 지출을 기록하세요</p>
              </div>
            ) : (
              <div className="space-y-3">
                {expenses.map(expense => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{expense.category}</Badge>
                        <span className="font-medium">{expense.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {expense.expense_date} • {expense.amount.toLocaleString()}원
                      </div>
                      {expense.notes && (
                        <div className="text-xs text-muted-foreground mt-1">{expense.notes}</div>
                      )}
                      {expense.receipt_url && (
                        <div className="mt-2">
                          <a
                            href={expense.receipt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            <ImageIcon className="h-3 w-3" />
                            영수증 보기
                          </a>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <SettlementView
          key={expenses.length}
          travelPlanId={plan.id}
          userId={userId}
          partnerId={partnerId}
          initialSettlement={settlement}
        />
      </div>
    </>
  )
}
