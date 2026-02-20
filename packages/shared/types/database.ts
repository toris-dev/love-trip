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
      date_course_places: {
        Row: {
          created_at: string | null
          date_course_id: string
          distance_from_previous_km: number | null
          id: string
          notes: string | null
          order_index: number
          place_address: string | null
          place_description: string | null
          place_id: string | null
          place_image_url: string | null
          place_lat: number | null
          place_lng: number | null
          place_name: string | null
          place_price_level: number | null
          place_rating: number | null
          place_type: string | null
          visit_duration_minutes: number | null
        }
        Insert: {
          created_at?: string | null
          date_course_id: string
          distance_from_previous_km?: number | null
          id?: string
          notes?: string | null
          order_index?: number
          place_address?: string | null
          place_description?: string | null
          place_id?: string | null
          place_image_url?: string | null
          place_lat?: number | null
          place_lng?: number | null
          place_name?: string | null
          place_price_level?: number | null
          place_rating?: number | null
          place_type?: string | null
          visit_duration_minutes?: number | null
        }
        Update: {
          created_at?: string | null
          date_course_id?: string
          distance_from_previous_km?: number | null
          id?: string
          notes?: string | null
          order_index?: number
          place_address?: string | null
          place_description?: string | null
          place_id?: string | null
          place_image_url?: string | null
          place_lat?: number | null
          place_lng?: number | null
          place_name?: string | null
          place_price_level?: number | null
          place_rating?: number | null
          place_type?: string | null
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
          max_price: number | null
          min_price: number | null
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
          max_price?: number | null
          min_price?: number | null
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
          max_price?: number | null
          min_price?: number | null
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
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          deleted_at: string | null
          display_name: string | null
          id: string
          is_deleted: boolean
          is_public: boolean
          nickname: string | null
          notifications_enabled: boolean
          onboarding_completed: boolean
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          display_name?: string | null
          id: string
          is_deleted?: boolean
          is_public?: boolean
          nickname?: string | null
          notifications_enabled?: boolean
          onboarding_completed?: boolean
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          display_name?: string | null
          id?: string
          is_deleted?: boolean
          is_public?: boolean
          nickname?: string | null
          notifications_enabled?: boolean
          onboarding_completed?: boolean
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
      reservation_reminders: {
        Row: {
          contact_info: string | null
          created_at: string
          description: string | null
          id: string
          is_sent: boolean
          place_address: string | null
          place_name: string | null
          reminder_hours_before: number | null
          reservation_date: string
          sent_at: string | null
          title: string
          travel_plan_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_info?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_sent?: boolean
          place_address?: string | null
          place_name?: string | null
          reminder_hours_before?: number | null
          reservation_date: string
          sent_at?: string | null
          title: string
          travel_plan_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_info?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_sent?: boolean
          place_address?: string | null
          place_name?: string | null
          reminder_hours_before?: number | null
          reservation_date?: string
          sent_at?: string | null
          title?: string
          travel_plan_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservation_reminders_travel_plan_id_fkey"
            columns: ["travel_plan_id"]
            isOneToOne: false
            referencedRelation: "expense_settlement_summary"
            referencedColumns: ["travel_plan_id"]
          },
          {
            foreignKeyName: "reservation_reminders_travel_plan_id_fkey"
            columns: ["travel_plan_id"]
            isOneToOne: false
            referencedRelation: "travel_plans"
            referencedColumns: ["id"]
          },
        ]
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
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          end_date: string | null
          id: string
          start_date: string
          status: string
          tier: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          start_date?: string
          status: string
          tier: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          start_date?: string
          status?: string
          tier?: string
          updated_at?: string | null
          user_id?: string
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
          place_address: string | null
          place_description: string | null
          place_id: string | null
          place_image_url: string | null
          place_lat: number | null
          place_lng: number | null
          place_name: string | null
          place_price_level: number | null
          place_rating: number | null
          place_type: string | null
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
          place_address?: string | null
          place_description?: string | null
          place_id?: string | null
          place_image_url?: string | null
          place_lat?: number | null
          place_lng?: number | null
          place_name?: string | null
          place_price_level?: number | null
          place_rating?: number | null
          place_type?: string | null
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
          place_address?: string | null
          place_description?: string | null
          place_id?: string | null
          place_image_url?: string | null
          place_lat?: number | null
          place_lng?: number | null
          place_name?: string | null
          place_price_level?: number | null
          place_rating?: number | null
          place_type?: string | null
          travel_course_id?: string
          visit_duration_minutes?: number | null
        }
        Relationships: [
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
          max_price: number | null
          min_price: number | null
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
          max_price?: number | null
          min_price?: number | null
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
          max_price?: number | null
          min_price?: number | null
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
      travel_memories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_shared: boolean
          location: string | null
          memory_date: string
          photo_urls: string[]
          place_id: string | null
          tags: string[] | null
          title: string | null
          travel_plan_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_shared?: boolean
          location?: string | null
          memory_date?: string
          photo_urls?: string[]
          place_id?: string | null
          tags?: string[] | null
          title?: string | null
          travel_plan_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_shared?: boolean
          location?: string | null
          memory_date?: string
          photo_urls?: string[]
          place_id?: string | null
          tags?: string[] | null
          title?: string | null
          travel_plan_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "travel_memories_travel_plan_id_fkey"
            columns: ["travel_plan_id"]
            isOneToOne: false
            referencedRelation: "expense_settlement_summary"
            referencedColumns: ["travel_plan_id"]
          },
          {
            foreignKeyName: "travel_memories_travel_plan_id_fkey"
            columns: ["travel_plan_id"]
            isOneToOne: false
            referencedRelation: "travel_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_plans: {
        Row: {
          course_type: string | null
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
          course_type?: string | null
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
          course_type?: string | null
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
      user_achievements: {
        Row: {
          achievement_description: string | null
          achievement_id: string
          achievement_name: string
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          progress: number | null
          target: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          achievement_description?: string | null
          achievement_id: string
          achievement_name: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          progress?: number | null
          target?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          achievement_description?: string | null
          achievement_id?: string
          achievement_name?: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          progress?: number | null
          target?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_description: string | null
          badge_id: string
          badge_name: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_description?: string | null
          badge_id: string
          badge_name: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_description?: string | null
          badge_id?: string
          badge_name?: string
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_course_likes: {
        Row: {
          created_at: string | null
          id: string
          user_course_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_course_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          user_course_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_course_likes_user_course_id_fkey"
            columns: ["user_course_id"]
            isOneToOne: false
            referencedRelation: "user_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_course_places: {
        Row: {
          created_at: string | null
          day_number: number | null
          id: string
          notes: string | null
          order_index: number
          place_address: string | null
          place_description: string | null
          place_id: string | null
          place_image_url: string | null
          place_lat: number | null
          place_lng: number | null
          place_name: string | null
          place_price_level: number | null
          place_rating: number | null
          place_type: string | null
          user_course_id: string
          visit_duration_minutes: number | null
        }
        Insert: {
          created_at?: string | null
          day_number?: number | null
          id?: string
          notes?: string | null
          order_index: number
          place_address?: string | null
          place_description?: string | null
          place_id?: string | null
          place_image_url?: string | null
          place_lat?: number | null
          place_lng?: number | null
          place_name?: string | null
          place_price_level?: number | null
          place_rating?: number | null
          place_type?: string | null
          user_course_id: string
          visit_duration_minutes?: number | null
        }
        Update: {
          created_at?: string | null
          day_number?: number | null
          id?: string
          notes?: string | null
          order_index?: number
          place_address?: string | null
          place_description?: string | null
          place_id?: string | null
          place_image_url?: string | null
          place_lat?: number | null
          place_lng?: number | null
          place_name?: string | null
          place_price_level?: number | null
          place_rating?: number | null
          place_type?: string | null
          user_course_id?: string
          visit_duration_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_course_places_user_course_id_fkey"
            columns: ["user_course_id"]
            isOneToOne: false
            referencedRelation: "user_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_course_saves: {
        Row: {
          created_at: string | null
          id: string
          user_course_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_course_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          user_course_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_course_saves_user_course_id_fkey"
            columns: ["user_course_id"]
            isOneToOne: false
            referencedRelation: "user_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_courses: {
        Row: {
          course_type: string
          created_at: string | null
          description: string | null
          duration: string | null
          estimated_budget: number | null
          id: string
          image_url: string | null
          is_public: boolean | null
          like_count: number | null
          place_count: number | null
          published_at: string | null
          rating: number | null
          region: string
          review_photos: string[] | null
          review_text: string | null
          save_count: number | null
          status: string | null
          target_audience: string
          title: string
          updated_at: string | null
          user_id: string
          view_count: number | null
          visited_at: string | null
        }
        Insert: {
          course_type: string
          created_at?: string | null
          description?: string | null
          duration?: string | null
          estimated_budget?: number | null
          id?: string
          image_url?: string | null
          is_public?: boolean | null
          like_count?: number | null
          place_count?: number | null
          published_at?: string | null
          rating?: number | null
          region: string
          review_photos?: string[] | null
          review_text?: string | null
          save_count?: number | null
          status?: string | null
          target_audience?: string
          title: string
          updated_at?: string | null
          user_id: string
          view_count?: number | null
          visited_at?: string | null
        }
        Update: {
          course_type?: string
          created_at?: string | null
          description?: string | null
          duration?: string | null
          estimated_budget?: number | null
          id?: string
          image_url?: string | null
          is_public?: boolean | null
          like_count?: number | null
          place_count?: number | null
          published_at?: string | null
          rating?: number | null
          region?: string
          review_photos?: string[] | null
          review_text?: string | null
          save_count?: number | null
          status?: string | null
          target_audience?: string
          title?: string
          updated_at?: string | null
          user_id?: string
          view_count?: number | null
          visited_at?: string | null
        }
        Relationships: []
      }
      user_gamification: {
        Row: {
          created_at: string | null
          current_xp: number | null
          id: string
          last_activity_date: string | null
          level: number | null
          points: number | null
          streak: number | null
          total_xp: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_xp?: number | null
          id?: string
          last_activity_date?: string | null
          level?: number | null
          points?: number | null
          streak?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_xp?: number | null
          id?: string
          last_activity_date?: string | null
          level?: number | null
          points?: number | null
          streak?: number | null
          total_xp?: number | null
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
      calculate_distance:
        | {
            Args: { lat1: number; lat2: number; lon1: number; lon2: number }
            Returns: number
          }
        | {
            Args: { lat1: number; lat2: number; lng1: number; lng2: number }
            Returns: number
          }
      calculate_distance_km:
        | {
            Args: { lat1: number; lat2: number; lon1: number; lon2: number }
            Returns: number
          }
        | {
            Args: { lat1: number; lat2: number; lng1: number; lng2: number }
            Returns: number
          }
      create_travel_plan_with_transaction: {
        Args: {
          p_budget_items?: Json
          p_course_type?: string
          p_description?: string
          p_destination: string
          p_end_date: string
          p_places?: Json
          p_start_date: string
          p_title: string
          p_total_budget?: number
          p_user_id: string
        }
        Returns: string
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
      hard_delete_expired_accounts: {
        Args: never
        Returns: {
          deleted_count: number
          deleted_user_ids: string[]
        }[]
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
