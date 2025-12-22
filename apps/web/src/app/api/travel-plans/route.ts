import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"
import { createUserCourseFromTravelPlan } from "@lovetrip/planner/services"
import {
  withTransaction,
  transactionInsert,
  transactionInsertMany,
  createTravelPlanWithTransaction,
} from "@lovetrip/api/supabase/transaction-manager"
import { createTravelPlanSchema } from "@lovetrip/shared/schemas"
import { validateRequest } from "@/lib/validation/validate-request"
import type { Database } from "@lovetrip/shared/types/database"

type TravelPlan = Database["public"]["Tables"]["travel_plans"]["Row"]
type TravelDay = Database["public"]["Tables"]["travel_days"]["Row"]

/**
 * POST /api/travel-plans
 * 여행 계획 생성 (트랜잭션 적용, 입력 검증)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    // 입력 검증
    const validation = await validateRequest(request, createTravelPlanSchema)
    if (!validation.success) {
      return validation.error
    }

    const {
      title,
      destination,
      start_date,
      end_date,
      total_budget,
      description,
      course_type,
      places,
      budget_items,
    } = validation.data as {
      title: string
      destination: string
      start_date: string
      end_date: string
      total_budget?: number
      description?: string
      course_type: string
      places?: Array<{
        place_id: string
        day_number: number
        order_index?: number
      }>
      budget_items?: Array<{
        category: string
        name: string
        planned_amount: number
      }>
    }

    // PostgreSQL 함수를 통한 트랜잭션으로 여행 계획 생성
    // 더 강력한 트랜잭션 보장을 위해 PostgreSQL 함수 사용
    let planId: string
    try {
      planId = await createTravelPlanWithTransaction(supabase, {
        user_id: user.id,
        title,
        destination,
        start_date,
        end_date,
        total_budget: total_budget || 0,
        description: description || undefined,
        course_type: course_type || "travel",
        places: places?.map(p => ({
          place_id: p.place_id,
          day_number: p.day_number,
          order_index: p.order_index ?? 0,
        })),
        budget_items: budget_items?.map(item => ({
          category: item.category,
          name: item.name,
          planned_amount: item.planned_amount,
        })),
      })
    } catch (error) {
      // PostgreSQL 함수 실패 시 JavaScript 레벨 트랜잭션으로 폴백
      console.warn("PostgreSQL 함수 실패, JavaScript 트랜잭션으로 폴백:", error)
      const plan = await withTransaction(async (txSupabase, context) => {
        // 1. travel_plan 생성
        const plan = await transactionInsert<TravelPlan>(txSupabase, context, "travel_plans", {
          user_id: user.id,
          title,
          destination,
          start_date,
          end_date,
          total_budget: total_budget || 0,
          description,
          course_type,
          status: "planning",
        })

        // 2. travel_days 생성
        const start = new Date(start_date)
        const end = new Date(end_date)
        const diffTime = Math.abs(end.getTime() - start.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

        const daysToInsert = []
        for (let i = 0; i < diffDays; i++) {
          const dayDate = new Date(start)
          dayDate.setDate(start.getDate() + i)

          daysToInsert.push({
            travel_plan_id: plan.id,
            day_number: i + 1,
            date: dayDate.toISOString().split("T")[0],
            title: `${i + 1}일차`,
          })
        }

        const days = await transactionInsertMany<TravelDay>(
          txSupabase,
          context,
          "travel_days",
          daysToInsert
        )

        // 3. travel_day_places 생성
        if (places && places.length > 0) {
          const isValidUUID = (str: string): boolean => {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
            return uuidRegex.test(str)
          }

          const placesToInsert = places
            .map(p => {
              if (!p.place_id || !isValidUUID(p.place_id)) {
                return null
              }

              const day = days.find(d => d.day_number === p.day_number)
              if (!day) {
                return null
              }

              return {
                travel_day_id: day.id,
                place_id: p.place_id,
                order_index: p.order_index ?? 0,
              }
            })
            .filter((item): item is NonNullable<typeof item> => item !== null)

          if (placesToInsert.length > 0) {
            await transactionInsertMany(txSupabase, context, "travel_day_places", placesToInsert)
          }
        }

        // 4. budget_items 생성
        if (budget_items && budget_items.length > 0) {
          const firstDay = days[0]
          const budgetItemsToInsert = budget_items.map(
            (item: { category: string; name: string; planned_amount: number }) => ({
              travel_plan_id: plan.id,
              travel_day_id: firstDay?.id || null,
              category: item.category,
              name: item.name,
              planned_amount: item.planned_amount,
            })
          )

          await transactionInsertMany(txSupabase, context, "budget_items", budgetItemsToInsert)
        }

        return plan
      })
      planId = plan.id
    }

    // 생성된 여행 계획 조회
    const { data: plan, error: planError } = await supabase
      .from("travel_plans")
      .select("*")
      .eq("id", planId)
      .single()

    if (planError || !plan) {
      throw new Error("여행 계획을 조회하는데 실패했습니다")
    }

    // 5. 캘린더에 자동으로 일정 추가 (트랜잭션 외부 - 실패해도 무시)
    try {
      const { data: couple } = await supabase
        .from("couples")
        .select("id")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .single()

      if (couple) {
        let { data: calendar } = await supabase
          .from("shared_calendars")
          .select("*")
          .eq("couple_id", couple.id)
          .eq("name", "여행 일정")
          .single()

        if (!calendar) {
          const { data: newCalendar } = await supabase
            .from("shared_calendars")
            .insert({
              couple_id: couple.id,
              name: "여행 일정",
              color: "#3b82f6",
              created_by: user.id,
            })
            .select()
            .single()

          if (newCalendar) {
            calendar = newCalendar
          }
        }

        if (calendar) {
          const startDateTime = new Date(start_date)
          startDateTime.setHours(9, 0, 0, 0)

          const endDateTime = new Date(end_date)
          endDateTime.setHours(23, 59, 59, 999)

          await supabase.from("calendar_events").insert({
            calendar_id: calendar.id,
            title: title,
            description: description || `여행 계획: ${destination}\n\n여행 계획 ID: ${plan.id}`,
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString(),
            location: destination,
            created_by: user.id,
          })
        }
      }
    } catch (calendarError) {
      // 캘린더 추가 실패는 로그만 남기고 계속 진행
      console.error("Failed to add to calendar (non-critical):", calendarError)
    }

    // 6. 코스인 경우 user_courses에도 자동 저장 (트랜잭션 외부 - 실패해도 무시)
    if (course_type === "date" || course_type === "travel") {
      try {
        await createUserCourseFromTravelPlan(plan.id, user.id, {
          isPublic: false,
          title: title,
          description: description,
        })
      } catch (courseError) {
        // user_course 생성 실패는 로그만 남기고 계속 진행
        console.error("Failed to create user course (non-critical):", courseError)
      }
    }

    return NextResponse.json({ plan })
  } catch (error) {
    const { handleError, logError } = await import("@/lib/errors/error-handler")
    logError(error, "TravelPlan POST")
    return handleError(error)
  }
}

/**
 * GET /api/travel-plans
 * 내 여행 계획 목록 조회 (캐싱 적용)
 */
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    // 캐시 키 생성
    const cacheKey = `travel-plans:${user.id}`
    const { queryCache } = await import("@lovetrip/planner/services/query-cache")

    // 캐시 확인
    const cached = queryCache.get<Array<unknown>>(cacheKey)
    if (cached) {
      return NextResponse.json({ plans: cached })
    }

    const { data: plans, error } = await supabase
      .from("travel_plans")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error

    const plansData = plans || []

    // 캐시 저장 (3분)
    queryCache.set(cacheKey, plansData, 3 * 60 * 1000)

    return NextResponse.json({ plans: plansData })
  } catch (error) {
    const { handleError, logError } = await import("@/lib/errors/error-handler")
    logError(error, "TravelPlan GET")
    return handleError(error)
  }
}
