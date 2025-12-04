import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"
import type { Database } from "@lovetrip/shared/types/database"

/**
 * POST /api/travel-plans
 * 여행 계획 생성
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

    const body = await request.json()
    const {
      title,
      destination,
      start_date,
      end_date,
      total_budget,
      description,
      course_type = "travel",
      places,
      budget_items,
    } = body

    // 1. travel_plan 생성
    const { data: plan, error: planError } = await supabase
      .from("travel_plans")
      .insert({
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
      .select()
      .single()

    if (planError || !plan) {
      throw planError || new Error("여행 계획 생성에 실패했습니다")
    }

    // 2. travel_days 생성
    const start = new Date(start_date)
    const end = new Date(end_date)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

    const days = []
    for (let i = 0; i < diffDays; i++) {
      const dayDate = new Date(start)
      dayDate.setDate(start.getDate() + i)

      const { data: day, error: dayError } = await supabase
        .from("travel_days")
        .insert({
          travel_plan_id: plan.id,
          day_number: i + 1,
          date: dayDate.toISOString().split("T")[0],
          title: `${i + 1}일차`,
        })
        .select()
        .single()

      if (dayError) throw dayError
      days.push(day)
    }

    // 3. travel_day_places 생성
    if (places && places.length > 0) {
      const placesToInsert = places.map((p: { place_id: string; day_number: number; order_index: number }) => {
        const day = days.find((d) => d.day_number === p.day_number)
        if (!day) return null

        return {
          travel_day_id: day.id,
          place_id: p.place_id,
          order_index: p.order_index,
        }
      }).filter(Boolean)

      if (placesToInsert.length > 0) {
        const { error: placesError } = await supabase
          .from("travel_day_places")
          .insert(placesToInsert)

        if (placesError) throw placesError
      }
    }

    // 4. budget_items 생성
    if (budget_items && budget_items.length > 0) {
      const budgetItemsToInsert = budget_items.map(
        (item: { category: string; name: string; planned_amount: number }, index: number) => {
          // 첫 번째 일차에 연결 (또는 전체 계획에)
          const firstDay = days[0]
          return {
            travel_plan_id: plan.id,
            travel_day_id: firstDay?.id || null,
            category: item.category,
            name: item.name,
            planned_amount: item.planned_amount,
          }
        }
      )

      const { error: budgetError } = await supabase
        .from("budget_items")
        .insert(budgetItemsToInsert)

      if (budgetError) throw budgetError
    }

    // 5. 캘린더에 자동으로 일정 추가
    try {
      // 커플 정보 가져오기
      const { data: couple } = await supabase
        .from("couples")
        .select("id")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .single()

      if (couple) {
        // 공유 캘린더 가져오기 (없으면 생성)
        let { data: calendar } = await supabase
          .from("shared_calendars")
          .select("*")
          .eq("couple_id", couple.id)
          .eq("name", "여행 일정")
          .single()

        if (!calendar) {
          // 기본 캘린더 생성
          const { data: newCalendar, error: calendarError } = await supabase
            .from("shared_calendars")
            .insert({
              couple_id: couple.id,
              name: "여행 일정",
              color: "#3b82f6",
              description: "여행 계획이 자동으로 추가됩니다",
            })
            .select()
            .single()

          if (!calendarError && newCalendar) {
            calendar = newCalendar
          }
        }

        if (calendar) {
          // 캘린더 이벤트 생성
          const startDateTime = new Date(start_date)
          startDateTime.setHours(9, 0, 0, 0) // 오전 9시로 설정

          const endDateTime = new Date(end_date)
          endDateTime.setHours(23, 59, 59, 999) // 오후 11시 59분으로 설정

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
      // 캘린더 추가 실패해도 여행 계획 생성은 성공으로 처리
      console.error("Failed to add to calendar:", calendarError)
    }

    return NextResponse.json({ plan })
  } catch (error) {
    console.error("Error creating travel plan:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "여행 계획 생성 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/travel-plans
 * 내 여행 계획 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const { data: plans, error } = await supabase
      .from("travel_plans")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ plans: plans || [] })
  } catch (error) {
    console.error("Error fetching travel plans:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "여행 계획을 불러오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

