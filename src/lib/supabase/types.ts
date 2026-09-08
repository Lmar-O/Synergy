// Generated from the Synergy-dev database. Do not edit by hand.
//
// Regenerate after every migration. Via the Supabase MCP connector:
//   generate_typescript_types(project_id: "yswyhkhszniowvogjxyq")
// Or with the CLI, once it is installed:
//   supabase gen types typescript --project-id yswyhkhszniowvogjxyq > src/lib/supabase/types.ts
//
// Known gap: the generator reads columns, not triggers. `north_stars.version`
// and `tickets.number` are NOT NULL with no DEFAULT, so they appear REQUIRED in
// the Insert types below — but a BEFORE INSERT trigger assigns both per user
// when they are omitted. See NorthStarInsert / TicketInsert in ./server.ts.

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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      generations: {
        Row: {
          completion_tokens: number | null
          created_at: string
          id: string
          model: string
          north_star_id: string
          prompt_tokens: number | null
          raw_response: Json
          user_id: string
        }
        Insert: {
          completion_tokens?: number | null
          created_at?: string
          id?: string
          model: string
          north_star_id: string
          prompt_tokens?: number | null
          raw_response: Json
          user_id: string
        }
        Update: {
          completion_tokens?: number | null
          created_at?: string
          id?: string
          model?: string
          north_star_id?: string
          prompt_tokens?: number | null
          raw_response?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generations_north_star_id_fkey"
            columns: ["north_star_id"]
            isOneToOne: false
            referencedRelation: "north_stars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      north_stars: {
        Row: {
          constraints: string
          core_problem: string
          created_at: string
          current_milestone: string
          id: string
          out_of_scope: string
          product_name: string
          success_criteria: string
          tech_stack: string
          user_id: string
          version: number
        }
        Insert: {
          constraints?: string
          core_problem: string
          created_at?: string
          current_milestone: string
          id?: string
          out_of_scope?: string
          product_name: string
          success_criteria: string
          tech_stack: string
          user_id: string
          version: number
        }
        Update: {
          constraints?: string
          core_problem?: string
          created_at?: string
          current_milestone?: string
          id?: string
          out_of_scope?: string
          product_name?: string
          success_criteria?: string
          tech_stack?: string
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "north_stars_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          acceptance_criteria: Json
          blocked_reason: string | null
          body: string
          completed_at: string | null
          created_at: string
          depends_on: string[]
          estimate_hours: number
          id: string
          north_star_id: string
          number: number
          position: number
          priority: number
          status: Database["public"]["Enums"]["ticket_status"]
          tags: string[]
          title: string
          user_id: string
        }
        Insert: {
          acceptance_criteria?: Json
          blocked_reason?: string | null
          body?: string
          completed_at?: string | null
          created_at?: string
          depends_on?: string[]
          estimate_hours: number
          id?: string
          north_star_id: string
          number: number
          position?: number
          priority?: number
          status?: Database["public"]["Enums"]["ticket_status"]
          tags?: string[]
          title: string
          user_id: string
        }
        Update: {
          acceptance_criteria?: Json
          blocked_reason?: string | null
          body?: string
          completed_at?: string | null
          created_at?: string
          depends_on?: string[]
          estimate_hours?: number
          id?: string
          north_star_id?: string
          number?: number
          position?: number
          priority?: number
          status?: Database["public"]["Enums"]["ticket_status"]
          tags?: string[]
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_north_star_id_fkey"
            columns: ["north_star_id"]
            isOneToOne: false
            referencedRelation: "north_stars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      clerk_user_id: { Args: never; Returns: string }
    }
    Enums: {
      ticket_status: "queued" | "active" | "done" | "blocked"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      ticket_status: ["queued", "active", "done", "blocked"],
    },
  },
} as const
