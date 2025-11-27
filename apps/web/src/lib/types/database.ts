export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      budget_items: {
        Row: {
          category: string
          created_at: string | null
          id: string
          name: string
          planned_amount: number
          travel_day_id: string | null
          travel_plan_id: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          name: string
          planned_amount?: number
          travel_day_id?: string | null
          travel_plan_id: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          name?: string
          planned_amount?: number
          travel_day_id?: string | null
          travel_plan_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_items_travel_day_id_fkey"
            columns: ["travel_day_id"]
            isOneToOne: false
            referencedRelation: "travel_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_items_travel_plan_id_fkey"
            columns: ["travel_plan_id"]
            isOneToOne: false
            referencedRelation: "expense_settlement_summary"
            referencedColumns: ["travel_plan_id"]
          },
          {
            foreignKeyName: "budget_items_travel_plan_id_fkey"
            columns: ["travel_plan_id"]
            isOneToOne: false
            referencedRelation: "travel_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          calendar_id: string
          created_at: string
          created_by: string
          description: string | null
          end_time: string | null
          id: string
          location: string | null
          place_id: string | null
          start_time: string
          title: string
          updated_at: string
        }
        Insert: {
          calendar_id: string
          created_at?: string
          created_by: string
          description?: string | null
          end_time?: string | null
          id?: string
          location?: string | null
          place_id?: string | null
          start_time: string
          title: string
          updated_at?: string
        }
        Update: {
          calendar_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          end_time?: string | null
          id?: string
          location?: string | null
          place_id?: string | null
          start_time?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_calendar_id_fkey"
            columns: ["calendar_id"]
            isOneToOne: false
            referencedRelation: "shared_calendars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          subject: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          subject: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      couples: {
        Row: {
          created_at: string | null
          id: string
          status: string
          updated_at: string | null
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          status?: string
          updated_at?: string | null
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          status?: string
          updated_at?: string | null
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      crawler_runs: {
        Row: {
          completed_at: string | null
          created_at: string
          duration_seconds: number | null
          error_message: string | null
          id: string
          items_errors: number | null
          items_inserted: number | null
          items_updated: number | null
          logs: string[] | null
          started_at: string
          status: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          duration_seconds?: number | null
          error_message?: string | null
          id?: string
          items_errors?: number | null
          items_inserted?: number | null
          items_updated?: number | null
          logs?: string[] | null
          started_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          duration_seconds?: number | null
          error_message?: string | null
          id?: string
          items_errors?: number | null
          items_inserted?: number | null
          items_updated?: number | null
          logs?: string[] | null
          started_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      date_course_places: {
        Row: {
          created_at: string | null
          date_course_id: string
          distance_from_previous_km: number | null
          id: string
          notes: string | null
          order_index: number
          place_id: string
          visit_duration_minutes: number | null
        }
        Insert: {
          created_at?: string | null
          date_course_id: string
          distance_from_previous_km?: number | null
          id?: string
          notes?: string | null
          order_index?: number
          place_id: string
          visit_duration_minutes?: number | null
        }
        Update: {
          created_at?: string | null
          date_course_id?: string
          distance_from_previous_km?: number | null
          id?: string
          notes?: string | null
          order_index?: number
          place_id?: string
          visit_duration_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "date_course_places_date_course_id_fkey"
            columns: ["date_course_id"]
            isOneToOne: false
            referencedRelation: "date_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "date_course_places_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      date_courses: {
        Row: {
          area_code: number | null
          course_type: string
          created_at: string | null
          description: string | null
          duration: string
          id: string
          image_url: string | null
          max_distance_km: number | null
          place_count: number
          region: string
          sigungu_code: number | null
          sigungu_name: string | null
          title: string
          total_distance_km: number | null
          updated_at: string | null
        }
        Insert: {
          area_code?: number | null
          course_type?: string
          created_at?: string | null
          description?: string | null
          duration?: string
          id?: string
          image_url?: string | null
          max_distance_km?: number | null
          place_count?: number
          region: string
          sigungu_code?: number | null
          sigungu_name?: string | null
          title: string
          total_distance_km?: number | null
          updated_at?: string | null
        }
        Update: {
          area_code?: number | null
          course_type?: string
          created_at?: string | null
          description?: string | null
          duration?: string
          id?: string
          image_url?: string | null
          max_distance_km?: number | null
          place_count?: number
          region?: string
          sigungu_code?: number | null
          sigungu_name?: string | null
          title?: string
          total_distance_km?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      expense_splits: {
        Row: {
          amount: number
          created_at: string | null
          expense_id: string
          id: string
          is_paid: boolean | null
          notes: string | null
          paid_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          expense_id: string
          id?: string
          is_paid?: boolean | null
          notes?: string | null
          paid_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          expense_id?: string
          id?: string
          is_paid?: boolean | null
          notes?: string | null
          paid_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_splits_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          budget_item_id: string | null
          category: string
          created_at: string | null
          expense_date: string
          id: string
          name: string
          notes: string | null
          paid_by_user_id: string
          receipt_url: string | null
          travel_day_id: string | null
          travel_plan_id: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          budget_item_id?: string | null
          category: string
          created_at?: string | null
          expense_date?: string
          id?: string
          name: string
          notes?: string | null
          paid_by_user_id: string
          receipt_url?: string | null
          travel_day_id?: string | null
          travel_plan_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          budget_item_id?: string | null
          category?: string
          created_at?: string | null
          expense_date?: string
          id?: string
          name?: string
          notes?: string | null
          paid_by_user_id?: string
          receipt_url?: string | null
          travel_day_id?: string | null
          travel_plan_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_budget_item_id_fkey"
            columns: ["budget_item_id"]
            isOneToOne: false
            referencedRelation: "budget_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_travel_day_id_fkey"
            columns: ["travel_day_id"]
            isOneToOne: false
            referencedRelation: "travel_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_travel_plan_id_fkey"
            columns: ["travel_plan_id"]
            isOneToOne: false
            referencedRelation: "expense_settlement_summary"
            referencedColumns: ["travel_plan_id"]
          },
          {
            foreignKeyName: "expenses_travel_plan_id_fkey"
            columns: ["travel_plan_id"]
            isOneToOne: false
            referencedRelation: "travel_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      place_favorites: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          place_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          place_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          place_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "place_favorites_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      places: {
        Row: {
          address: string | null
          area_code: number | null
          category1: string | null
          category2: string | null
          category3: string | null
          course_type: string[] | null
          created_at: string | null
          created_time: string | null
          description: string | null
          homepage: string | null
          id: string
          image_url: string | null
          image_url2: string | null
          lat: number
          lng: number
          map_level: number | null
          modified_time: string | null
          name: string
          opening_hours: string | null
          overview: string | null
          phone: string | null
          price_level: number | null
          rating: number | null
          sigungu_code: number | null
          tour_content_id: string | null
          tour_content_type_id: number | null
          type: string
          updated_at: string | null
          zipcode: string | null
        }
        Insert: {
          address?: string | null
          area_code?: number | null
          category1?: string | null
          category2?: string | null
          category3?: string | null
          course_type?: string[] | null
          created_at?: string | null
          created_time?: string | null
          description?: string | null
          homepage?: string | null
          id?: string
          image_url?: string | null
          image_url2?: string | null
          lat: number
          lng: number
          map_level?: number | null
          modified_time?: string | null
          name: string
          opening_hours?: string | null
          overview?: string | null
          phone?: string | null
          price_level?: number | null
          rating?: number | null
          sigungu_code?: number | null
          tour_content_id?: string | null
          tour_content_type_id?: number | null
          type: string
          updated_at?: string | null
          zipcode?: string | null
        }
        Update: {
          address?: string | null
          area_code?: number | null
          category1?: string | null
          category2?: string | null
          category3?: string | null
          course_type?: string[] | null
          created_at?: string | null
          created_time?: string | null
          description?: string | null
          homepage?: string | null
          id?: string
          image_url?: string | null
          image_url2?: string | null
          lat?: number
          lng?: number
          map_level?: number | null
          modified_time?: string | null
          name?: string
          opening_hours?: string | null
          overview?: string | null
          phone?: string | null
          price_level?: number | null
          rating?: number | null
          sigungu_code?: number | null
          tour_content_id?: string | null
          tour_content_type_id?: number | null
          type?: string
          updated_at?: string | null
          zipcode?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          id: string
          nickname: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          nickname?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          nickname?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      shared_calendars: {
        Row: {
          color: string
          couple_id: string
          created_at: string
          created_by: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          color?: string
          couple_id: string
          created_at?: string
          created_by: string
          id?: string
          name?: string
          updated_at?: string
        }
        Update: {
          color?: string
          couple_id?: string
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_calendars_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      tour_api_sync: {
        Row: {
          area_code: number | null
          content_type_id: number | null
          created_at: string | null
          error_message: string | null
          id: string
          last_synced_at: string | null
          sigungu_code: number | null
          status: string | null
          synced_items: number | null
          total_items: number | null
          updated_at: string | null
        }
        Insert: {
          area_code?: number | null
          content_type_id?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_synced_at?: string | null
          sigungu_code?: number | null
          status?: string | null
          synced_items?: number | null
          total_items?: number | null
          updated_at?: string | null
        }
        Update: {
          area_code?: number | null
          content_type_id?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_synced_at?: string | null
          sigungu_code?: number | null
          status?: string | null
          synced_items?: number | null
          total_items?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      travel_course_places: {
        Row: {
          created_at: string | null
          day_number: number
          distance_from_previous_km: number | null
          id: string
          notes: string | null
          order_index: number
          place_id: string
          travel_course_id: string
          visit_duration_minutes: number | null
        }
        Insert: {
          created_at?: string | null
          day_number: number
          distance_from_previous_km?: number | null
          id?: string
          notes?: string | null
          order_index?: number
          place_id: string
          travel_course_id: string
          visit_duration_minutes?: number | null
        }
        Update: {
          created_at?: string | null
          day_number?: number
          distance_from_previous_km?: number | null
          id?: string
          notes?: string | null
          order_index?: number
          place_id?: string
          travel_course_id?: string
          visit_duration_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "travel_course_places_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "travel_course_places_travel_course_id_fkey"
            columns: ["travel_course_id"]
            isOneToOne: false
            referencedRelation: "travel_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_courses: {
        Row: {
          area_code: number | null
          course_type: string
          created_at: string | null
          description: string | null
          duration: string
          id: string
          image_url: string | null
          place_count: number
          region: string
          sigungu_code: number | null
          title: string
          total_distance_km: number | null
          updated_at: string | null
        }
        Insert: {
          area_code?: number | null
          course_type: string
          created_at?: string | null
          description?: string | null
          duration: string
          id?: string
          image_url?: string | null
          place_count?: number
          region: string
          sigungu_code?: number | null
          title: string
          total_distance_km?: number | null
          updated_at?: string | null
        }
        Update: {
          area_code?: number | null
          course_type?: string
          created_at?: string | null
          description?: string | null
          duration?: string
          id?: string
          image_url?: string | null
          place_count?: number
          region?: string
          sigungu_code?: number | null
          title?: string
          total_distance_km?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      travel_day_places: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          order_index: number
          place_id: string
          travel_day_id: string
          visit_time: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          order_index?: number
          place_id: string
          travel_day_id: string
          visit_time?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          order_index?: number
          place_id?: string
          travel_day_id?: string
          visit_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "travel_day_places_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "travel_day_places_travel_day_id_fkey"
            columns: ["travel_day_id"]
            isOneToOne: false
            referencedRelation: "travel_days"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_days: {
        Row: {
          created_at: string | null
          date: string | null
          day_number: number
          id: string
          notes: string | null
          title: string | null
          travel_plan_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          day_number: number
          id?: string
          notes?: string | null
          title?: string | null
          travel_plan_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          day_number?: number
          id?: string
          notes?: string | null
          title?: string | null
          travel_plan_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "travel_days_travel_plan_id_fkey"
            columns: ["travel_plan_id"]
            isOneToOne: false
            referencedRelation: "expense_settlement_summary"
            referencedColumns: ["travel_plan_id"]
          },
          {
            foreignKeyName: "travel_days_travel_plan_id_fkey"
            columns: ["travel_plan_id"]
            isOneToOne: false
            referencedRelation: "travel_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_plans: {
        Row: {
          created_at: string | null
          description: string | null
          destination: string
          end_date: string
          id: string
          start_date: string
          status: string
          title: string
          total_budget: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          destination: string
          end_date: string
          id?: string
          start_date: string
          status?: string
          title: string
          total_budget?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          destination?: string
          end_date?: string
          id?: string
          start_date?: string
          status?: string
          title?: string
          total_budget?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      expense_settlement_summary: {
        Row: {
          expense_count: number | null
          net_amount: number | null
          paid_by_user_id: string | null
          plan_owner_id: string | null
          total_paid: number | null
          total_split: number | null
          travel_plan_id: string | null
          travel_plan_title: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_distance: {
        Args: { lat1: number; lat2: number; lng1: number; lng2: number }
        Returns: number
      }
      calculate_distance_km: {
        Args: { lat1: number; lat2: number; lng1: number; lng2: number }
        Returns: number
      }
      generate_date_courses: {
        Args: never
        Returns: {
          course_id: string
          course_title: string
          places_count: number
          region_name: string
        }[]
      }
      generate_date_courses_batch: {
        Args: {
          batch_size?: number
          max_distance_km?: number
          max_places_per_course?: number
          min_places_per_course?: number
        }
        Returns: number
      }
      generate_date_courses_by_sigungu: {
        Args: {
          max_distance_km?: number
          max_places_per_course?: number
          min_places_per_course?: number
        }
        Returns: number
      }
      generate_travel_courses_for_region: {
        Args: {
          p_area_code: number
          p_max_distance_km?: number
          p_max_places_per_course?: number
          p_min_places_per_course?: number
          p_region: string
        }
        Returns: number
      }
      get_travel_plan_total_budget: {
        Args: { plan_id: string }
        Returns: number
      }
      get_travel_plan_total_expense: {
        Args: { plan_id: string }
        Returns: number
      }
      get_user_expense_by_plan: {
        Args: { plan_id: string; user_id: string }
        Returns: number
      }
      get_user_split_expense_by_plan: {
        Args: { plan_id: string; user_id: string }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
