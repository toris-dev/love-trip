import type { Database } from "@lovetrip/shared/types/database"

export type BudgetItem = Database["public"]["Tables"]["budget_items"]["Row"]
export type BudgetItemInsert = Database["public"]["Tables"]["budget_items"]["Insert"]
export type BudgetItemUpdate = Database["public"]["Tables"]["budget_items"]["Update"]

export type Expense = Database["public"]["Tables"]["expenses"]["Row"]
export type ExpenseInsert = Database["public"]["Tables"]["expenses"]["Insert"]
export type ExpenseUpdate = Database["public"]["Tables"]["expenses"]["Update"]

export type ExpenseSplit = Database["public"]["Tables"]["expense_splits"]["Row"]
export type ExpenseSplitInsert = Database["public"]["Tables"]["expense_splits"]["Insert"]
export type ExpenseSplitUpdate = Database["public"]["Tables"]["expense_splits"]["Update"]

export type ExpenseCategory =
  | "교통비"
  | "숙박비"
  | "식비"
  | "액티비티"
  | "쇼핑"
  | "기타"

export interface BudgetSummary {
  totalPlanned: number
  totalActual: number
  remaining: number
  byCategory: Record<ExpenseCategory, { planned: number; actual: number }>
}

export interface SettlementSummary {
  userId: string
  totalPaid: number
  totalOwed: number
  netAmount: number // 양수면 받을 돈, 음수면 낼 돈
}

export interface ExpenseWithSplits extends Expense {
  splits: ExpenseSplit[]
}

