"use client"

import type { ComponentType } from "react"
import { Button } from "@lovetrip/ui/components/button"
import Link from "next/link"
import { ArrowLeft, Calendar, MapPin } from "lucide-react"
import type { ExpenseWithSplits, SettlementSummary } from "@lovetrip/expense/types"
import type { Database } from "@lovetrip/shared/types/database"

type TravelPlan = Database["public"]["Tables"]["travel_plans"]["Row"]

export interface TravelPlanDaysSectionProps {
  planId: string
  isPremium?: boolean
}

export interface TripExpenseSectionProps {
  plan: TravelPlan
  initialExpenses: ExpenseWithSplits[]
  initialSettlement: SettlementSummary[]
  userId: string
  partnerId?: string
  isPremium?: boolean
}

interface TravelPlanDetailClientProps {
  plan: TravelPlan
  initialExpenses: ExpenseWithSplits[]
  initialSettlement: SettlementSummary[]
  userId: string
  partnerId?: string
  isPremium?: boolean
  DaysSection: ComponentType<TravelPlanDaysSectionProps>
  ExpenseSection: ComponentType<TripExpenseSectionProps>
}

export function TravelPlanDetailClient({
  plan,
  initialExpenses,
  initialSettlement,
  userId,
  partnerId,
  isPremium = false,
  DaysSection,
  ExpenseSection,
}: TravelPlanDetailClientProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 헤더 */}
          <div className="mb-6">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/my-trips">
                <ArrowLeft className="h-4 w-4 mr-2" />
                돌아가기
              </Link>
            </Button>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{plan.title}</h1>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{plan.destination}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {plan.start_date} ~ {plan.end_date}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DaysSection planId={plan.id} isPremium={isPremium} />

          <ExpenseSection
            plan={plan}
            initialExpenses={initialExpenses}
            initialSettlement={initialSettlement}
            userId={userId}
            partnerId={partnerId}
            isPremium={isPremium}
          />
        </div>
      </div>
    </div>
  )
}
