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
      ai_history: {
        Row: {
          cost_usd: number
          created_at: string
          duration_ms: number | null
          feature: string
          id: string
          map_id: string | null
          model: string
          prompt: string
          response: string | null
          tokens_input: number
          tokens_output: number
          user_id: string
        }
        Insert: {
          cost_usd?: number
          created_at?: string
          duration_ms?: number | null
          feature: string
          id?: string
          map_id?: string | null
          model: string
          prompt: string
          response?: string | null
          tokens_input?: number
          tokens_output?: number
          user_id: string
        }
        Update: {
          cost_usd?: number
          created_at?: string
          duration_ms?: number | null
          feature?: string
          id?: string
          map_id?: string | null
          model?: string
          prompt?: string
          response?: string | null
          tokens_input?: number
          tokens_output?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_history_map_id_fkey"
            columns: ["map_id"]
            isOneToOne: false
            referencedRelation: "maps"
            referencedColumns: ["id"]
          },
        ]
      }
      annotations: {
        Row: {
          created_at: string
          id: string
          node_id: string
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          node_id: string
          text: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          node_id?: string
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "annotations_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      connections: {
        Row: {
          color: string | null
          created_at: string
          from_node_id: string | null
          from_x: number | null
          from_y: number | null
          id: string
          line_style: string
          map_id: string
          number: number | null
          step_label: string | null
          to_node_id: string | null
          to_x: number | null
          to_y: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          from_node_id?: string | null
          from_x?: number | null
          from_y?: number | null
          id?: string
          line_style?: string
          map_id: string
          number?: number | null
          step_label?: string | null
          to_node_id?: string | null
          to_x?: number | null
          to_y?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string
          from_node_id?: string | null
          from_x?: number | null
          from_y?: number | null
          id?: string
          line_style?: string
          map_id?: string
          number?: number | null
          step_label?: string | null
          to_node_id?: string | null
          to_x?: number | null
          to_y?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "connections_from_node_id_fkey"
            columns: ["from_node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_map_id_fkey"
            columns: ["map_id"]
            isOneToOne: false
            referencedRelation: "maps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_to_node_id_fkey"
            columns: ["to_node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      maps: {
        Row: {
          background_color: string
          background_pattern: string
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          is_template: boolean
          team_id: string | null
          theme: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          background_color?: string
          background_pattern?: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          is_template?: boolean
          team_id?: string | null
          theme?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          background_color?: string
          background_pattern?: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          is_template?: boolean
          team_id?: string | null
          theme?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maps_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      nodes: {
        Row: {
          color: string
          created_at: string
          description: string | null
          emoji: string | null
          end_date: string | null
          height: number
          id: string
          image_url: string | null
          label_position: string
          lane: string | null
          map_id: string
          name: string
          parent_node_id: string | null
          position_x: number
          position_y: number
          progress: number
          shape: string
          short_desc: string | null
          start_date: string | null
          status: string
          status_icon: string
          step_number: number
          text_color: string
          updated_at: string
          width: number
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          emoji?: string | null
          end_date?: string | null
          height?: number
          id?: string
          image_url?: string | null
          label_position?: string
          lane?: string | null
          map_id: string
          name?: string
          parent_node_id?: string | null
          position_x?: number
          position_y?: number
          progress?: number
          shape?: string
          short_desc?: string | null
          start_date?: string | null
          status?: string
          status_icon?: string
          step_number?: number
          text_color?: string
          updated_at?: string
          width?: number
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          emoji?: string | null
          end_date?: string | null
          height?: number
          id?: string
          image_url?: string | null
          label_position?: string
          lane?: string | null
          map_id?: string
          name?: string
          parent_node_id?: string | null
          position_x?: number
          position_y?: number
          progress?: number
          shape?: string
          short_desc?: string | null
          start_date?: string | null
          status?: string
          status_icon?: string
          step_number?: number
          text_color?: string
          updated_at?: string
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "nodes_map_id_fkey"
            columns: ["map_id"]
            isOneToOne: false
            referencedRelation: "maps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nodes_parent_node_id_fkey"
            columns: ["parent_node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          id: string
          plan: string
          status: string
          stripe_customer_id: string | null
          stripe_sub_id: string | null
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_sub_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_sub_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          created_at: string
          description: string | null
          done: boolean
          due_date: string | null
          id: string
          node_id: string
          order_index: number
          text: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          done?: boolean
          due_date?: string | null
          id?: string
          node_id: string
          order_index?: number
          text: string
        }
        Update: {
          created_at?: string
          description?: string | null
          done?: boolean
          due_date?: string | null
          id?: string
          node_id?: string
          order_index?: number
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          joined_at: string
          role: string
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: string
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
        }
        Insert: {
          id?: string
          name: string
          owner_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_team_member: { Args: { p_team_id: string }; Returns: boolean }
      is_team_owner: { Args: { p_team_id: string }; Returns: boolean }
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
