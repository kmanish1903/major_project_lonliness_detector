export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      crisis_events: {
        Row: {
          created_at: string
          follow_up_date: string | null
          follow_up_required: boolean
          id: string
          intervention_taken: string | null
          notes: string | null
          resolved: boolean
          severity: string
          trigger_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          follow_up_date?: string | null
          follow_up_required?: boolean
          id?: string
          intervention_taken?: string | null
          notes?: string | null
          resolved?: boolean
          severity: string
          trigger_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          follow_up_date?: string | null
          follow_up_required?: boolean
          id?: string
          intervention_taken?: string | null
          notes?: string | null
          resolved?: boolean
          severity?: string
          trigger_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_goals: {
        Row: {
          category: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          difficulty_level: string | null
          id: string
          is_ai_generated: boolean
          is_completed: boolean
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          id?: string
          is_ai_generated?: boolean
          is_completed?: boolean
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          id?: string
          is_ai_generated?: boolean
          is_completed?: boolean
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mood_entries: {
        Row: {
          audio_url: string | null
          created_at: string
          emotion_tags: string[] | null
          id: string
          mood_score: number
          notes: string | null
          updated_at: string
          user_id: string
          voice_transcription: string | null
        }
        Insert: {
          audio_url?: string | null
          created_at?: string
          emotion_tags?: string[] | null
          id?: string
          mood_score: number
          notes?: string | null
          updated_at?: string
          user_id: string
          voice_transcription?: string | null
        }
        Update: {
          audio_url?: string | null
          created_at?: string
          emotion_tags?: string[] | null
          id?: string
          mood_score?: number
          notes?: string | null
          updated_at?: string
          user_id?: string
          voice_transcription?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          created_at: string
          emergency_contact: string | null
          full_name: string | null
          gender: string | null
          health_conditions: string[] | null
          id: string
          preferences: Json | null
          updated_at: string
        }
        Insert: {
          age?: number | null
          created_at?: string
          emergency_contact?: string | null
          full_name?: string | null
          gender?: string | null
          health_conditions?: string[] | null
          id: string
          preferences?: Json | null
          updated_at?: string
        }
        Update: {
          age?: number | null
          created_at?: string
          emergency_contact?: string | null
          full_name?: string | null
          gender?: string | null
          health_conditions?: string[] | null
          id?: string
          preferences?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          achievements: Json | null
          created_at: string
          goals_completed_count: number
          id: string
          mental_health_score: number | null
          month: string
          mood_entries_count: number
          total_goals_count: number
          updated_at: string
          user_id: string
          weekly_summary: Json | null
          year: number
        }
        Insert: {
          achievements?: Json | null
          created_at?: string
          goals_completed_count?: number
          id?: string
          mental_health_score?: number | null
          month: string
          mood_entries_count?: number
          total_goals_count?: number
          updated_at?: string
          user_id: string
          weekly_summary?: Json | null
          year: number
        }
        Update: {
          achievements?: Json | null
          created_at?: string
          goals_completed_count?: number
          id?: string
          mental_health_score?: number | null
          month?: string
          mood_entries_count?: number
          total_goals_count?: number
          updated_at?: string
          user_id?: string
          weekly_summary?: Json | null
          year?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
