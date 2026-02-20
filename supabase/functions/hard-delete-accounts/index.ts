// Supabase Edge Function: Hard Delete Expired Accounts
// 90일이 지난 삭제된 계정을 영구적으로 삭제
// pg_cron을 통해 매일 실행되도록 설정

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // CORS preflight 요청 처리
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // Supabase 클라이언트 생성 (Service Role Key 사용)
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables")
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // 1. 90일이 지난 삭제된 계정 찾기
    // 주의: profiles.id가 auth.users.id를 직접 참조하므로 user_id 컬럼이 없음
    const { data: expiredAccounts, error: selectError } = await supabase
      .from("profiles")
      .select("id")
      .eq("is_deleted", true)
      .not("deleted_at", "is", null)
      .lt("deleted_at", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())

    if (selectError) {
      throw selectError
    }

    if (!expiredAccounts || expiredAccounts.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No expired accounts to delete",
          deletedCount: 0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      )
    }

    // profiles.id가 auth.users.id와 동일하므로 동일하게 사용
    const userIds = expiredAccounts.map((account) => account.id)
    const profileIds = expiredAccounts.map((account) => account.id)

    // 2. 사용자 관련 데이터 삭제 (순서 중요: 외래 키 의존성 고려)
    const deleteResults: Record<string, { success: number; failed: number; errors: string[] }> = {}

    // 삭제할 테이블 목록 (외래 키 의존성 순서)
    // 주의: 순서가 중요합니다. 자식 테이블을 먼저 삭제해야 합니다.
    const tablesToDelete = [
      // 좋아요/저장 (다른 사용자의 코스에 대한 액션)
      { table: "user_course_likes", where: "user_id" },
      { table: "user_course_saves", where: "user_id" },
      
      // 사용자가 만든 코스 관련 (user_course_places를 먼저 삭제)
      { table: "user_course_places", where: "user_course_id", subQuery: "user_courses", subWhere: "user_id" },
      { table: "user_courses", where: "user_id" },
      
      // 여행 계획 관련 (의존성 순서대로)
      { table: "expense_splits", where: "user_id" },
      { table: "expenses", where: "paid_by_user_id" },
      { table: "budget_items", where: "travel_plan_id", subQuery: "travel_plans", subWhere: "user_id" },
      { table: "travel_day_places", where: "travel_day_id", subQuery: "travel_days", subWhere: "travel_plan_id", subSubQuery: "travel_plans" },
      { table: "travel_days", where: "travel_plan_id", subQuery: "travel_plans", subWhere: "user_id" },
      { table: "travel_plans", where: "user_id" },
      
      // 여행 추억
      { table: "travel_memories", where: "user_id" },
      
      // 예약 리마인더
      { table: "reservation_reminders", where: "user_id" },
      // 기념일 알림
      { table: "anniversary_reminders", where: "user_id" },
      
      // 커플 관련 (calendar_events를 먼저 삭제)
      { table: "calendar_events", where: "calendar_id", subQuery: "shared_calendars", subWhere: "couple_id", subSubQuery: "couples" },
      { table: "shared_calendars", where: "couple_id", subQuery: "couples", subWhere: "user1_id", custom: true },
      { table: "couples", where: "user1_id OR user2_id", custom: true },
      
      // 게이미피케이션
      { table: "user_achievements", where: "user_id" },
      { table: "user_badges", where: "user_id" },
      { table: "user_gamification", where: "user_id" },
      
      // 구독 및 알림
      { table: "push_subscriptions", where: "user_id" },
      { table: "subscriptions", where: "user_id" },
      
      // 장소 즐겨찾기
      { table: "place_favorites", where: "user_id" },
      
      // 프로필 (마지막)
      { table: "profiles", where: "id", ids: profileIds },
    ]

    // 각 테이블 삭제 실행
    for (const tableConfig of tablesToDelete) {
      try {
        let deleteQuery = supabase.from(tableConfig.table).delete()

        if (tableConfig.custom) {
          // 커스텀 쿼리 (couples 같은 경우)
          if (tableConfig.table === "couples") {
            // couples는 user1_id 또는 user2_id로 삭제
            const { error, data } = await supabase
              .from("couples")
              .delete()
              .or(`user1_id.in.(${userIds.join(",")}),user2_id.in.(${userIds.join(",")})`)
              .select("id")
            
            if (error) {
              deleteResults[tableConfig.table] = {
                success: 0,
                failed: 1,
                errors: [error.message],
              }
            } else {
              const deletedCount = data ? data.length : 0
              deleteResults[tableConfig.table] = {
                success: deletedCount,
                failed: 0,
                errors: [],
              }
            }
            continue
          }
        } else if (tableConfig.ids) {
          // 특정 ID로 삭제 (profiles)
          deleteQuery = deleteQuery.in("id", tableConfig.ids)
        } else if (tableConfig.subSubQuery) {
          // 3단계 중첩
          if (tableConfig.table === "travel_day_places") {
            // travel_plans -> travel_days -> travel_day_places
            const { data: subSubIds } = await supabase
              .from(tableConfig.subSubQuery!)
              .select("id")
              .in("user_id", userIds)
            
            if (subSubIds && subSubIds.length > 0) {
              const subSubIdList = subSubIds.map((r: { id: string }) => r.id)
              const { data: subIds } = await supabase
                .from(tableConfig.subQuery!)
                .select("id")
                .in("travel_plan_id", subSubIdList)
              
              if (subIds && subIds.length > 0) {
                const subIdList = subIds.map((r: { id: string }) => r.id)
                deleteQuery = deleteQuery.in(tableConfig.where, subIdList)
              } else {
                deleteResults[tableConfig.table] = { success: 0, failed: 0, errors: [] }
                continue
              }
            } else {
              deleteResults[tableConfig.table] = { success: 0, failed: 0, errors: [] }
              continue
            }
          } else if (tableConfig.table === "calendar_events") {
            // couples -> shared_calendars -> calendar_events
            const { data: subSubIds } = await supabase
              .from(tableConfig.subSubQuery!)
              .select("id")
              .or(`user1_id.in.(${userIds.join(",")}),user2_id.in.(${userIds.join(",")})`)
            
            if (subSubIds && subSubIds.length > 0) {
              const subSubIdList = subSubIds.map((r: { id: string }) => r.id)
              const { data: subIds } = await supabase
                .from(tableConfig.subQuery!)
                .select("id")
                .in("couple_id", subSubIdList)
              
              if (subIds && subIds.length > 0) {
                const subIdList = subIds.map((r: { id: string }) => r.id)
                deleteQuery = deleteQuery.in(tableConfig.where, subIdList)
              } else {
                deleteResults[tableConfig.table] = { success: 0, failed: 0, errors: [] }
                continue
              }
            } else {
              deleteResults[tableConfig.table] = { success: 0, failed: 0, errors: [] }
              continue
            }
          }
        } else if (tableConfig.subQuery && tableConfig.custom) {
          // 커스텀 쿼리가 있는 2단계 중첩 (shared_calendars 같은 경우)
          const { data: subIds } = await supabase
            .from(tableConfig.subQuery)
            .select("id")
            .or(`user1_id.in.(${userIds.join(",")}),user2_id.in.(${userIds.join(",")})`)
          
          if (subIds && subIds.length > 0) {
            const subIdList = subIds.map((r: { id: string }) => r.id)
            deleteQuery = deleteQuery.in(tableConfig.where, subIdList)
          } else {
            deleteResults[tableConfig.table] = { success: 0, failed: 0, errors: [] }
            continue
          }
        } else if (tableConfig.subQuery) {
          // 2단계 중첩 (예: user_course_places -> user_courses)
          const { data: subIds } = await supabase
            .from(tableConfig.subQuery)
            .select("id")
            .in(tableConfig.subWhere, userIds)
          
          if (subIds && subIds.length > 0) {
            const subIdList = subIds.map((r: { id: string }) => r.id)
            deleteQuery = deleteQuery.in(tableConfig.where, subIdList)
          } else {
            deleteResults[tableConfig.table] = { success: 0, failed: 0, errors: [] }
            continue
          }
        } else {
          // 직접 user_id로 삭제
          deleteQuery = deleteQuery.in(tableConfig.where, userIds)
        }

        // 삭제 실행 (성능을 위해 select는 최소한만)
        const { error, data } = await deleteQuery.select("id")

        if (error) {
          deleteResults[tableConfig.table] = {
            success: 0,
            failed: 1,
            errors: [error.message],
          }
        } else {
          // 삭제된 행 수 계산 (data가 배열이므로 length 사용)
          const deletedCount = data ? data.length : 0
          deleteResults[tableConfig.table] = {
            success: deletedCount,
            failed: 0,
            errors: [],
          }
        }
      } catch (error) {
        deleteResults[tableConfig.table] = {
          success: 0,
          failed: 1,
          errors: [error instanceof Error ? error.message : "Unknown error"],
        }
      }
    }

    // 3. Supabase Auth에서 사용자 삭제 (Admin API 사용)
    const deleteAuthUsers = await Promise.allSettled(
      userIds.map(async (userId) => {
        const response = await fetch(
          `${supabaseUrl}/auth/v1/admin/users/${userId}`,
          {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${supabaseServiceKey}`,
              "apikey": supabaseServiceKey,
            },
          }
        )
        if (!response.ok) {
          throw new Error(`Failed to delete user ${userId}: ${response.statusText}`)
        }
        return { userId, success: true }
      })
    )

    const authDeleteResults = deleteAuthUsers.map((result, index) => ({
      userId: userIds[index],
      success: result.status === "fulfilled",
      error: result.status === "rejected" ? result.reason : null,
    }))

    // 4. 결과 집계
    const authSuccessCount = authDeleteResults.filter((r) => r.success).length
    const authFailedCount = authDeleteResults.filter((r) => !r.success).length
    
    const totalTableDeletes = Object.values(deleteResults).reduce(
      (sum, result) => sum + result.success,
      0
    )
    const totalTableFailures = Object.values(deleteResults).reduce(
      (sum, result) => sum + result.failed,
      0
    )

    return new Response(
      JSON.stringify({
        success: true,
        message: `Hard delete completed: ${authSuccessCount} users deleted, ${totalTableDeletes} records deleted from tables`,
        deletedUserCount: authSuccessCount,
        failedUserCount: authFailedCount,
        deletedTableRecords: totalTableDeletes,
        failedTableRecords: totalTableFailures,
        deletedUserIds: userIds,
        tableResults: deleteResults,
        authResults: authDeleteResults,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    )
  } catch (error) {
    console.error("Error in hard-delete-accounts function:", error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    )
  }
})
