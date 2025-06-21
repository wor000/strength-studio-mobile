export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_generated_workouts: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          status: string
          user_id: string
          workout_data: Json
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          status?: string
          user_id: string
          workout_data: Json
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          status?: string
          user_id?: string
          workout_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "ai_generated_workouts_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          created_at: string
          id: string
          image: string | null
          instructions: string | null
          muscle_group: string
          name: string
          type: string
          updated_at: string
          user_id: string
          video: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image?: string | null
          instructions?: string | null
          muscle_group: string
          name: string
          type: string
          updated_at?: string
          user_id: string
          video?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image?: string | null
          instructions?: string | null
          muscle_group?: string
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
          video?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          bio: string | null
          birth_date: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          objective: string | null
          phone: string | null
          profile_photo: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          objective?: string | null
          phone?: string | null
          profile_photo?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          objective?: string | null
          phone?: string | null
          profile_photo?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      routine_exercises: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          order_index: number
          reps: number
          rest_time: number
          routine_id: string
          sets: number
          superset_group: number | null
          superset_order: number | null
          weight: number | null
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          order_index?: number
          reps: number
          rest_time?: number
          routine_id: string
          sets: number
          superset_group?: number | null
          superset_order?: number | null
          weight?: number | null
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          order_index?: number
          reps?: number
          rest_time?: number
          routine_id?: string
          sets?: number
          superset_group?: number | null
          superset_order?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "routine_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routine_exercises_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
      routines: {
        Row: {
          created_at: string
          days: string[]
          estimated_duration: number
          id: string
          name: string
          notes: string | null
          objective: string
          program_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          days: string[]
          estimated_duration?: number
          id?: string
          name: string
          notes?: string | null
          objective: string
          program_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          days?: string[]
          estimated_duration?: number
          id?: string
          name?: string
          notes?: string | null
          objective?: string
          program_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "routines_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "workout_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          active_program_id: string | null
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active_program_id?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active_program_id?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_active_program_id_fkey"
            columns: ["active_program_id"]
            isOneToOne: false
            referencedRelation: "workout_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_programs: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
          objective: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          id?: string
          name: string
          objective: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          objective?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workout_sessions: {
        Row: {
          completed_exercises: string[] | null
          created_at: string
          date: string
          end_time: string | null
          exercise_data: Json | null
          id: string
          notes: string | null
          routine_id: string
          start_time: string
          user_id: string
        }
        Insert: {
          completed_exercises?: string[] | null
          created_at?: string
          date?: string
          end_time?: string | null
          exercise_data?: Json | null
          id?: string
          notes?: string | null
          routine_id: string
          start_time?: string
          user_id: string
        }
        Update: {
          completed_exercises?: string[] | null
          created_at?: string
          date?: string
          end_time?: string | null
          exercise_data?: Json | null
          id?: string
          notes?: string | null
          routine_id?: string
          start_time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
