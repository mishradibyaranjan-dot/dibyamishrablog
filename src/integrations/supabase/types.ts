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
      chatbot_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          sources: Json | null
          user_id: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          sources?: Json | null
          user_id?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          sources?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      failed_login_attempts: {
        Row: {
          attempted_at: string
          email: string | null
          id: string
          ip: string | null
          reason: string | null
        }
        Insert: {
          attempted_at?: string
          email?: string | null
          id?: string
          ip?: string | null
          reason?: string | null
        }
        Update: {
          attempted_at?: string
          email?: string | null
          id?: string
          ip?: string | null
          reason?: string | null
        }
        Relationships: []
      }
      login_sessions: {
        Row: {
          duration_seconds: number | null
          ended_at: string | null
          id: string
          ip: string | null
          started_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          ip?: string | null
          started_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          ip?: string | null
          started_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      newsletter_issues: {
        Row: {
          body_markdown: string
          created_at: string
          created_by: string | null
          emails_sent_at: string | null
          hero_emoji: string
          id: string
          linkedin_post: string
          linkedin_posted_at: string | null
          published_at: string | null
          slug: string
          status: string
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          body_markdown?: string
          created_at?: string
          created_by?: string | null
          emails_sent_at?: string | null
          hero_emoji?: string
          id?: string
          linkedin_post?: string
          linkedin_posted_at?: string | null
          published_at?: string | null
          slug: string
          status?: string
          summary?: string
          title: string
          updated_at?: string
        }
        Update: {
          body_markdown?: string
          created_at?: string
          created_by?: string | null
          emails_sent_at?: string | null
          hero_emoji?: string
          id?: string
          linkedin_post?: string
          linkedin_posted_at?: string | null
          published_at?: string | null
          slug?: string
          status?: string
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          source: string | null
          status: string
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          source?: string | null
          status?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          source?: string | null
          status?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      page_visits: {
        Row: {
          duration_seconds: number | null
          id: string
          path: string
          referrer: string | null
          user_id: string
          visited_at: string
        }
        Insert: {
          duration_seconds?: number | null
          id?: string
          path: string
          referrer?: string | null
          user_id: string
          visited_at?: string
        }
        Update: {
          duration_seconds?: number | null
          id?: string
          path?: string
          referrer?: string | null
          user_id?: string
          visited_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      resource_access: {
        Row: {
          accessed_at: string
          id: string
          resource_id: string
          resource_type: string
          user_id: string
        }
        Insert: {
          accessed_at?: string
          id?: string
          resource_id: string
          resource_type: string
          user_id: string
        }
        Update: {
          accessed_at?: string
          id?: string
          resource_id?: string
          resource_type?: string
          user_id?: string
        }
        Relationships: []
      }
      search_queries: {
        Row: {
          id: string
          query: string
          results_count: number | null
          searched_at: string
          user_id: string
        }
        Insert: {
          id?: string
          query: string
          results_count?: number | null
          searched_at?: string
          user_id: string
        }
        Update: {
          id?: string
          query?: string
          results_count?: number | null
          searched_at?: string
          user_id?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      tab_access: {
        Row: {
          id: string
          opened_at: string
          page: string
          tab_id: string
          user_id: string
        }
        Insert: {
          id?: string
          opened_at?: string
          page: string
          tab_id: string
          user_id: string
        }
        Update: {
          id?: string
          opened_at?: string
          page?: string
          tab_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          action_type: string
          id: string
          metadata: Json | null
          occurred_at: string
          target: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          id?: string
          metadata?: Json | null
          occurred_at?: string
          target?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          id?: string
          metadata?: Json | null
          occurred_at?: string
          target?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
