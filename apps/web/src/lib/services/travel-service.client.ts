import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/types/database"

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

export const travelService = {
  async getPlaces(): Promise<Place[]> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("places").select("*").order("rating", { ascending: false })

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
          (place) =>
            place.name.toLowerCase().includes(query.toLowerCase()) ||
            (place.description && place.description.toLowerCase().includes(query.toLowerCase())) ||
            (place.address && place.address.toLowerCase().includes(query.toLowerCase())),
        )
      }
      return data || []
    } catch (error) {
      console.log("[v0] Search service error, using fallback search:", error)
      return (FALLBACK_PLACES as unknown as Place[]).filter(
        (place) =>
          place.name.toLowerCase().includes(query.toLowerCase()) ||
          (place.description && place.description.toLowerCase().includes(query.toLowerCase())) ||
            (place.address && place.address.toLowerCase().includes(query.toLowerCase())),
        )
    }
  },

  async getTravelPlans(): Promise<TravelPlan[]> {
    const supabase = createClient()
    const { data, error } = await supabase.from("travel_plans").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  async createTravelPlan(plan: Database["public"]["Tables"]["travel_plans"]["Insert"]): Promise<TravelPlan> {
    const supabase = createClient()
    const { data, error } = await supabase.from("travel_plans").insert(plan).select().single()

    if (error) throw error
    return data as TravelPlan
  },

  async updateTravelPlan(
    id: string,
    updates: Database["public"]["Tables"]["travel_plans"]["Update"],
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

  async createBudgetItem(item: Database["public"]["Tables"]["budget_items"]["Insert"]): Promise<BudgetItem> {
    const supabase = createClient()
    const { data, error } = await supabase.from("budget_items").insert(item).select().single()

    if (error) throw error
    return data as BudgetItem
  },

  async updateBudgetItem(
    id: string,
    updates: Database["public"]["Tables"]["budget_items"]["Update"],
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


