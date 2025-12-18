import { createClient } from "@lovetrip/api/supabase/client"
import { createClient as createServerClient } from "@lovetrip/api/supabase/server"
import type { Database } from "@lovetrip/shared/types/database"

type Place = Database["public"]["Tables"]["places"]["Row"]
type TravelPlan = Database["public"]["Tables"]["travel_plans"]["Row"]
type BudgetItem = Database["public"]["Tables"]["budget_items"]["Row"]

const FALLBACK_PLACES = [
  {
    id: "fallback-1",
    name: "서울타워",
    description: "서울의 대표적인 랜드마크로 아름다운 야경을 감상할 수 있습니다.",
    address: "서울특별시 용산구 남산공원길 105",
    latitude: 37.5512,
    longitude: 126.9882,
    category: "attraction",
    rating: 4.5,
    price_range: "medium",
    image_url: "/seoul-tower-romantic-night-view.png",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "fallback-2",
    name: "홍대 카페거리",
    description: "연인과 함께 즐길 수 있는 다양한 카페들이 모여있는 거리입니다.",
    address: "서울특별시 마포구 홍익로",
    latitude: 37.5563,
    longitude: 126.9236,
    category: "cafe",
    rating: 4.3,
    price_range: "medium",
    image_url: "/hongdae-cafe-street-couples.png",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "fallback-3",
    name: "한강공원",
    description: "피크닉과 산책을 즐길 수 있는 로맨틱한 공간입니다.",
    address: "서울특별시 영등포구 여의도동",
    latitude: 37.5219,
    longitude: 126.9316,
    category: "park",
    rating: 4.7,
    price_range: "free",
    image_url: "/han-river-park-picnic-couples.png",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
] as const

// Client-side functions
export const travelService = {
  // Places
  async getPlaces(): Promise<Place[]> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("places")
        .select("*")
        .order("rating", { ascending: false })

      if (error) {
        console.log("[v0] Database error, using fallback data:", error.message)
        return FALLBACK_PLACES as unknown as Place[]
      }
      return data || (FALLBACK_PLACES as unknown as Place[])
    } catch (error) {
      console.log("[v0] Service error, using fallback data:", error)
      return FALLBACK_PLACES as unknown as Place[]
    }
  },

  async searchPlaces(query: string): Promise<Place[]> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("places")
        .select("*")
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,address.ilike.%${query}%`)
        .order("rating", { ascending: false })

      if (error) {
        console.log("[v0] Database search error, using fallback search:", error.message)
        return (FALLBACK_PLACES as unknown as Place[]).filter(
          place =>
            place.name.toLowerCase().includes(query.toLowerCase()) ||
            (place.description && place.description.toLowerCase().includes(query.toLowerCase())) ||
            (place.address && place.address.toLowerCase().includes(query.toLowerCase()))
        )
      }
      return data || []
    } catch (error) {
      console.log("[v0] Search service error, using fallback search:", error)
      return (FALLBACK_PLACES as unknown as Place[]).filter(
        place =>
          place.name.toLowerCase().includes(query.toLowerCase()) ||
          (place.description && place.description.toLowerCase().includes(query.toLowerCase())) ||
          (place.address && place.address.toLowerCase().includes(query.toLowerCase()))
      )
    }
  },

  // Travel Plans
  async getTravelPlans(): Promise<TravelPlan[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("travel_plans")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  async createTravelPlan(
    plan: Database["public"]["Tables"]["travel_plans"]["Insert"]
  ): Promise<TravelPlan> {
    const supabase = createClient()
    const { data, error } = await supabase.from("travel_plans").insert(plan).select().single()

    if (error) throw error
    return data
  },

  async updateTravelPlan(
    id: string,
    updates: Database["public"]["Tables"]["travel_plans"]["Update"]
  ): Promise<TravelPlan> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("travel_plans")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Budget Items
  async getBudgetItems(travelPlanId: string): Promise<BudgetItem[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("budget_items")
      .select("*")
      .eq("travel_plan_id", travelPlanId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  async createBudgetItem(
    item: Database["public"]["Tables"]["budget_items"]["Insert"]
  ): Promise<BudgetItem> {
    const supabase = createClient()
    const { data, error } = await supabase.from("budget_items").insert(item).select().single()

    if (error) throw error
    return data
  },

  async updateBudgetItem(
    id: string,
    updates: Database["public"]["Tables"]["budget_items"]["Update"]
  ): Promise<BudgetItem> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("budget_items")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteBudgetItem(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase.from("budget_items").delete().eq("id", id)

    if (error) throw error
  },

  // Travel Plan Places (travel_days와 travel_day_places 사용)
  async getTravelPlanPlaces(travelPlanId: string) {
    const supabase = createClient()
    // travel_days를 통해 travel_day_places 조회
    const { data: days, error: daysError } = await supabase
      .from("travel_days")
      .select("id, day_number")
      .eq("travel_plan_id", travelPlanId)
      .order("day_number")

    if (daysError) throw daysError
    if (!days || days.length === 0) return []

    type TravelDay = { id: string; day_number: number }
    const dayIds = (days as TravelDay[]).map(d => d.id)
    const { data, error } = await supabase
      .from("travel_day_places")
      .select(
        `
        *,
        places (*),
        travel_days!inner(day_number)
      `
      )
      .in("travel_day_id", dayIds)
      .order("travel_days.day_number")
      .order("order_index")

    if (error) throw error
    return data || []
  },

  async addPlaceToTravelPlan(travelPlanId: string, placeId: string, dayNumber = 1, orderInDay = 1) {
    const supabase = createClient()
    // travel_days에서 해당 day_number의 travel_day_id 찾기
    const { data: day, error: dayError } = await supabase
      .from("travel_days")
      .select("id")
      .eq("travel_plan_id", travelPlanId)
      .eq("day_number", dayNumber)
      .single()

    if (dayError) {
      // travel_day가 없으면 생성
      const { data: newDay, error: createDayError } = await supabase
        .from("travel_days")
        .insert({
          travel_plan_id: travelPlanId,
          day_number: dayNumber,
        })
        .select()
        .single()

      if (createDayError) throw createDayError

      const { data, error } = await supabase
        .from("travel_day_places")
        .insert({
          travel_day_id: newDay.id,
          place_id: placeId,
          order_index: orderInDay,
        })
        .select()
        .single()

      if (error) throw error
      return data
    }

    // travel_day가 이미 존재하는 경우
    const { data, error } = await supabase
      .from("travel_day_places")
      .insert({
        travel_day_id: day.id,
        place_id: placeId,
        order_index: orderInDay,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * 기존 장소의 최대 order_index 조회
   * @param travelDayId - 여행 일차 ID
   * @returns 최대 order_index + 1 (없으면 0)
   */
  async getNextOrderIndex(travelDayId: string): Promise<number> {
    const supabase = createClient()

    const { data: existingPlaces } = await supabase
      .from("travel_day_places")
      .select("order_index")
      .eq("travel_day_id", travelDayId)
      .order("order_index", { ascending: false })
      .limit(1)

    if (!existingPlaces || existingPlaces.length === 0) {
      return 0
    }

    const maxOrderIndex = existingPlaces[0]?.order_index ?? 0
    return maxOrderIndex + 1
  },

  /**
   * 여행 일차에 장소 추가
   *
   * @param travelDayId - 여행 일차 ID
   * @param placeId - 장소 ID
   * @param orderIndex - 순서 (선택사항, 제공되지 않으면 자동 계산)
   * @param visitTime - 방문 시간 (선택사항)
   * @param notes - 메모 (선택사항)
   * @returns 추가된 travel_day_places 레코드 (places 관계 포함)
   *
   * @throws {Error} 장소 추가 실패 시
   */
  async addPlaceToDay(
    travelDayId: string,
    placeId: string,
    orderIndex?: number,
    visitTime?: string,
    notes?: string
  ) {
    const supabase = createClient()

    // order_index가 제공되지 않으면 자동 계산
    const finalOrderIndex =
      orderIndex !== undefined && orderIndex !== null
        ? orderIndex
        : await this.getNextOrderIndex(travelDayId)

    const { data, error } = await supabase
      .from("travel_day_places")
      .insert({
        travel_day_id: travelDayId,
        place_id: placeId,
        order_index: finalOrderIndex,
        visit_time: visitTime || null,
        notes: notes || null,
      })
      .select(
        `
        *,
        places (*)
      `
      )
      .single()

    if (error) {
      throw new Error(`장소 추가 실패: ${error.message}`)
    }

    return data
  },

  /**
   * 여행 일차에서 장소 제거
   *
   * @param travelDayPlaceId - travel_day_places 레코드 ID
   * @throws {Error} 장소 제거 실패 시
   */
  async removePlaceFromDay(travelDayPlaceId: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase.from("travel_day_places").delete().eq("id", travelDayPlaceId)

    if (error) {
      throw new Error(`장소 제거 실패: ${error.message}`)
    }
  },

  /**
   * 여행 일차의 장소 순서 변경
   *
   * @param travelDayPlaceId - travel_day_places 레코드 ID
   * @param newOrderIndex - 새로운 순서 (0부터 시작)
   * @returns 업데이트된 travel_day_places 레코드 (places 관계 포함)
   * @throws {Error} 순서 변경 실패 시
   */
  async updatePlaceOrder(travelDayPlaceId: string, newOrderIndex: number) {
    if (newOrderIndex < 0) {
      throw new Error("순서는 0 이상이어야 합니다")
    }

    const supabase = createClient()
    const { data, error } = await supabase
      .from("travel_day_places")
      .update({ order_index: newOrderIndex })
      .eq("id", travelDayPlaceId)
      .select(
        `
        *,
        places (*)
      `
      )
      .single()

    if (error) {
      throw new Error(`순서 변경 실패: ${error.message}`)
    }

    return data
  },
}

// Server-side functions
export const serverTravelService = {
  async getPlaces(): Promise<Place[]> {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from("places")
      .select("*")
      .order("rating", { ascending: false })

    if (error) throw error
    return data || []
  },

  async getTravelPlansForUser(userId: string): Promise<TravelPlan[]> {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from("travel_plans")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },
}
