"use client"

import { useState, useEffect } from "react"
import { Button } from "@lovetrip/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@lovetrip/ui/components/card"
import { Input } from "@lovetrip/ui/components/input"
import { Label } from "@lovetrip/ui/components/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@lovetrip/ui/components/dialog"
import { Plus, Wallet, X, Edit2 } from "lucide-react"
import { toast } from "sonner"
import type { Database } from "@lovetrip/shared/types/database"
import type { ExpenseCategory } from "@lovetrip/expense/types"

type BudgetItem = Database["public"]["Tables"]["budget_items"]["Row"]
type BudgetSummary = {
  totalPlanned: number
  totalActual: number
  remaining: number
  byCategory: Record<ExpenseCategory, { planned: number; actual: number }>
}

interface BudgetPlannerProps {
  travelPlanId: string
  initialBudget?: number
}

export function BudgetPlanner({ travelPlanId, initialBudget }: BudgetPlannerProps) {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([])
  const [summary, setSummary] = useState<BudgetSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null)

  const [formData, setFormData] = useState({
    category: "식비" as ExpenseCategory,
    name: "",
    planned_amount: "",
    travel_day_id: "",
  })

  // 예산 데이터 불러오기
  const loadBudget = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/travel-plans/${travelPlanId}/budget`)

      if (!response.ok) {
        throw new Error("예산 정보를 불러오는데 실패했습니다")
      }

      const { summary: budgetSummary, items } = await response.json()
      setSummary(budgetSummary)
      setBudgetItems(items || [])
    } catch (error) {
      console.error("Error loading budget:", error)
      toast.error(error instanceof Error ? error.message : "예산 정보를 불러오는데 실패했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadBudget()
  }, [travelPlanId])

  // 예산 항목 추가/수정
  const handleSubmit = async () => {
    if (!formData.name || !formData.planned_amount) {
      toast.error("항목명과 예산 금액을 입력해주세요")
      return
    }

    try {
      if (editingItem) {
        // 수정
        const response = await fetch(`/api/travel-plans/${travelPlanId}/budget/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category: formData.category,
            name: formData.name,
            planned_amount: Number(formData.planned_amount),
            travel_day_id: formData.travel_day_id || null,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "예산 항목 수정에 실패했습니다")
        }

        toast.success("예산 항목이 수정되었습니다")
      } else {
        // 추가
        const response = await fetch(`/api/travel-plans/${travelPlanId}/budget`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category: formData.category,
            name: formData.name,
            planned_amount: Number(formData.planned_amount),
            travel_day_id: formData.travel_day_id || null,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "예산 항목 추가에 실패했습니다")
        }

        toast.success("예산 항목이 추가되었습니다")
      }

      setDialogOpen(false)
      setEditingItem(null)
      setFormData({
        category: "식비",
        name: "",
        planned_amount: "",
        travel_day_id: "",
      })
      loadBudget()
    } catch (error) {
      console.error("Error saving budget item:", error)
      toast.error(error instanceof Error ? error.message : "오류가 발생했습니다")
    }
  }

  // 예산 항목 삭제
  const handleDelete = async (itemId: string) => {
    if (!confirm("정말 이 예산 항목을 삭제하시겠습니까?")) return

    try {
      const response = await fetch(`/api/travel-plans/${travelPlanId}/budget/${itemId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("예산 항목 삭제에 실패했습니다")
      }

      toast.success("예산 항목이 삭제되었습니다")
      loadBudget()
    } catch (error) {
      console.error("Error deleting budget item:", error)
      toast.error(error instanceof Error ? error.message : "오류가 발생했습니다")
    }
  }

  // 수정 모드로 전환
  const handleEdit = (item: BudgetItem) => {
    setEditingItem(item)
    setFormData({
      category: item.category as ExpenseCategory,
      name: item.name,
      planned_amount: item.planned_amount.toString(),
      travel_day_id: item.travel_day_id || "",
    })
    setDialogOpen(true)
  }

  const categories: ExpenseCategory[] = ["교통비", "숙박비", "식비", "액티비티", "쇼핑", "기타"]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            예산 계획
          </CardTitle>
          <Dialog
            open={dialogOpen}
            onOpenChange={open => {
              setDialogOpen(open)
              if (!open) {
                setEditingItem(null)
                setFormData({
                  category: "식비",
                  name: "",
                  planned_amount: "",
                  travel_day_id: "",
                })
              }
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                예산 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingItem ? "예산 항목 수정" : "예산 항목 추가"}</DialogTitle>
                <DialogDescription>여행 계획에 맞는 예산을 설정하세요</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>카테고리</Label>
                  <select
                    value={formData.category}
                    onChange={e =>
                      setFormData({ ...formData, category: e.target.value as ExpenseCategory })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>항목명</Label>
                  <Input
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="예: 저녁 식사"
                  />
                </div>
                <div className="space-y-2">
                  <Label>예산 금액 (원)</Label>
                  <Input
                    type="number"
                    value={formData.planned_amount}
                    onChange={e => setFormData({ ...formData, planned_amount: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <Button onClick={handleSubmit} className="w-full">
                  {editingItem ? "수정" : "추가"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
        ) : (
          <>
            {/* 예산 요약 */}
            {summary && (
              <div className="mb-6 p-4 bg-muted rounded-lg">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">계획 예산</p>
                    <p className="text-xl font-bold">{summary.totalPlanned.toLocaleString()}원</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">실제 지출</p>
                    <p className="text-xl font-bold text-primary">
                      {summary.totalActual.toLocaleString()}원
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">남은 예산</p>
                    <p
                      className={`text-xl font-bold ${
                        summary.remaining < 0 ? "text-destructive" : "text-green-600"
                      }`}
                    >
                      {summary.remaining.toLocaleString()}원
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 예산 항목 목록 */}
            {budgetItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                예산 항목이 없습니다. 예산을 추가해주세요.
              </div>
            ) : (
              <div className="space-y-2">
                {budgetItems.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                          {item.category}
                        </span>
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.planned_amount.toLocaleString()}원
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        className="h-8 w-8 p-0 text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
