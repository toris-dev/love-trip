export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      places: {
        Row: {
          id: string
          name: string
          description: string | null
          lat: number
          lng: number
          type: "CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC"
          rating: number
          price_level: number
          image_url: string | null
          address: string | null
          phone: string | null
          website: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          lat: number
          lng: number
          type: "CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC"
          rating?: number
          price_level?: number
          image_url?: string | null
          address?: string | null
          phone?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          lat?: number
          lng?: number
          type?: "CAFE" | "FOOD" | "VIEW" | "MUSEUM" | "ETC"
          rating?: number
          price_level?: number
          image_url?: string | null
          address?: string | null
          phone?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      travel_plans: {
        Row: {
          id: string
          user_id: string
          title: string
          destination: string
          duration: string
          total_budget: number
          score: number
          status: "draft" | "active" | "completed"
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          destination: string
          duration: string
          total_budget?: number
          score?: number
          status?: "draft" | "active" | "completed"
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          destination?: string
          duration?: string
          total_budget?: number
          score?: number
          status?: "draft" | "active" | "completed"
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      travel_plan_places: {
        Row: {
          id: string
          travel_plan_id: string
          place_id: string
          day_number: number
          order_in_day: number
          visit_duration: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          travel_plan_id: string
          place_id: string
          day_number?: number
          order_in_day?: number
          visit_duration?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          travel_plan_id?: string
          place_id?: string
          day_number?: number
          order_in_day?: number
          visit_duration?: number | null
          notes?: string | null
          created_at?: string
        }
      }
      budget_items: {
        Row: {
          id: string
          travel_plan_id: string
          category: "교통비" | "숙박비" | "식비" | "액티비티" | "쇼핑" | "기타"
          name: string
          planned_amount: number
          actual_amount: number
          date: string | null
          notes: string | null
          receipt_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          travel_plan_id: string
          category: "교통비" | "숙박비" | "식비" | "액티비티" | "쇼핑" | "기타"
          name: string
          planned_amount?: number
          actual_amount?: number
          date?: string | null
          notes?: string | null
          receipt_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          travel_plan_id?: string
          category?: "교통비" | "숙박비" | "식비" | "액티비티" | "쇼핑" | "기타"
          name?: string
          planned_amount?: number
          actual_amount?: number
          date?: string | null
          notes?: string | null
          receipt_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      travel_plan_routes: {
        Row: {
          id: string
          travel_plan_id: string
          day_number: number
          route_points: { lat: number; lng: number }[]
          created_at: string
        }
        Insert: {
          id?: string
          travel_plan_id: string
          day_number?: number
          route_points: { lat: number; lng: number }[]
          created_at?: string
        }
        Update: {
          id?: string
          travel_plan_id?: string
          day_number?: number
          route_points?: { lat: number; lng: number }[]
          created_at?: string
        }
      }
    }
  }
}
