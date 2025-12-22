import { createClient } from "@lovetrip/api/supabase/client"
import type { Database } from "@lovetrip/shared/types/database"
import type { Place } from "@lovetrip/shared/types/course"

type TravelPlan = Database["public"]["Tables"]["travel_plans"]["Row"]
type BudgetItem = Database["public"]["Tables"]["budget_items"]["Row"]

export const travelServiceClient = {
  /**
   * 장소 목록 조회 (클라이언트 사이드)
   * API를 통해 서버 사이드 placeService 호출
   */
  async getPlaces(options?: {
    limit?: number
    areaCode?: string
    contentTypeId?: string
  }): Promise<Place[]> {
    try {
      const params = new URLSearchParams()
      if (options?.limit) params.append("limit", String(options.limit))
      if (options?.areaCode) params.append("areaCode", options.areaCode)
      if (options?.contentTypeId) params.append("contentTypeId", options.contentTypeId)

      const response = await fetch(`/api/places?${params.toString()}`)
      if (!response.ok) {
        return []
      }

      const data = await response.json()
      return data.places || []
    } catch (error) {
      console.error("Error fetching places:", error)
      return []
    }
  },

  /**
   * 장소 검색 (클라이언트 사이드)
   * API를 통해 서버 사이드 placeService 호출
   */
  async searchPlaces(
    query: string,
    options?: {
      limit?: number
      preferExternal?: boolean
    }
  ): Promise<Place[]> {
    try {
      const params = new URLSearchParams({ query })
      if (options?.limit) params.append("limit", String(options.limit))
      if (options?.preferExternal !== undefined) {
        params.append("preferExternal", String(options.preferExternal))
      }

      const response = await fetch(`/api/places/search?${params.toString()}`)
      if (!response.ok) {
        return []
      }

      const data = await response.json()
      return data.places || []
    } catch (error) {
      console.error("Error searching places:", error)
      return []
    }
  },

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
    return data as TravelPlan
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
    return data as TravelPlan
  },

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
    return data as BudgetItem
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
    return data as BudgetItem
  },

  async deleteBudgetItem(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase.from("budget_items").delete().eq("id", id)

    if (error) throw error
  },
}
