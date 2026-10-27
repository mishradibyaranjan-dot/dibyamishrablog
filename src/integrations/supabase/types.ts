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
      ai_usage_metrics: {
        Row: {
          created_at: string
          id: string
          input_tokens: number
          operation: string
          output_tokens: number
          session_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          input_tokens?: number
          operation: string
          output_tokens?: number
          session_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          input_tokens?: number
          operation?: string
          output_tokens?: number
          session_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_metrics_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_email_domains: {
        Row: {
          created_at: string
          created_by: string | null
          domain: string
          id: string
          reason: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          domain: string
          id?: string
          reason?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          domain?: string
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
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
      contact_email_attempts: {
        Row: {
          actor_id: string | null
          attempt_no: number
          created_at: string
          enquiry_id: string
          error_message: string | null
          id: string
          kind: string
          recipient_email: string
          status: string
          trigger_source: string
        }
        Insert: {
          actor_id?: string | null
          attempt_no?: number
          created_at?: string
          enquiry_id: string
          error_message?: string | null
          id?: string
          kind: string
          recipient_email: string
          status: string
          trigger_source?: string
        }
        Update: {
          actor_id?: string | null
          attempt_no?: number
          created_at?: string
          enquiry_id?: string
          error_message?: string | null
          id?: string
          kind?: string
          recipient_email?: string
          status?: string
          trigger_source?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_email_attempts_enquiry_id_fkey"
            columns: ["enquiry_id"]
            isOneToOne: false
            referencedRelation: "contact_enquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_enquiries: {
        Row: {
          confirmation_status: string
          created_at: string
          email: string
          error_message: string | null
          id: string
          ip_hash: string | null
          last_attempt_at: string | null
          message: string
          message_id: string | null
          name: string
          next_retry_at: string | null
          notification_status: string
          replied_at: string | null
          retry_count: number
          status: string
          subject: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          confirmation_status?: string
          created_at?: string
          email: string
          error_message?: string | null
          id?: string
          ip_hash?: string | null
          last_attempt_at?: string | null
          message: string
          message_id?: string | null
          name: string
          next_retry_at?: string | null
          notification_status?: string
          replied_at?: string | null
          retry_count?: number
          status?: string
          subject: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          confirmation_status?: string
          created_at?: string
          email?: string
          error_message?: string | null
          id?: string
          ip_hash?: string | null
          last_attempt_at?: string | null
          message?: string
          message_id?: string | null
          name?: string
          next_retry_at?: string | null
          notification_status?: string
          replied_at?: string | null
          retry_count?: number
          status?: string
          subject?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      disposable_email_domains: {
        Row: {
          created_at: string
          domain: string
        }
        Insert: {
          created_at?: string
          domain: string
        }
        Update: {
          created_at?: string
          domain?: string
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
      interview_answers: {
        Row: {
          content: Json
          id: string
          question_id: string
          session_id: string
        }
        Insert: {
          content: Json
          id?: string
          question_id: string
          session_id: string
        }
        Update: {
          content?: Json
          id?: string
          question_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: true
            referencedRelation: "interview_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_engine_state: {
        Row: {
          id: string
          lease_until: string | null
          paused: boolean
          reason: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          lease_until?: string | null
          paused?: boolean
          reason?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          lease_until?: string | null
          paused?: boolean
          reason?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      interview_feedback: {
        Row: {
          candidate_answer: string
          content: Json | null
          created_at: string
          error: string | null
          id: string
          question_id: string
          session_id: string
          status: string
        }
        Insert: {
          candidate_answer: string
          content?: Json | null
          created_at?: string
          error?: string | null
          id?: string
          question_id: string
          session_id: string
          status?: string
        }
        Update: {
          candidate_answer?: string
          content?: Json | null
          created_at?: string
          error?: string | null
          id?: string
          question_id?: string
          session_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_feedback_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "interview_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_feedback_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_preparation_plans: {
        Row: {
          content: Json
          id: string
          session_id: string
        }
        Insert: {
          content: Json
          id?: string
          session_id: string
        }
        Update: {
          content?: Json
          id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_preparation_plans_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_questions: {
        Row: {
          category: string
          id: string
          position: number
          question: string
          session_id: string
        }
        Insert: {
          category: string
          id?: string
          position: number
          question: string
          session_id: string
        }
        Update: {
          category?: string
          id?: string
          position?: number
          question?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_questions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_sessions: {
        Row: {
          analysis: Json | null
          attempts: number
          cache_key: string
          created_at: string
          current_question: number
          employer: string | null
          error: string | null
          expires_at: string
          id: string
          jd: string
          job_id: string | null
          lease_until: string | null
          resume_text: string | null
          retry_at: string | null
          settings: Json
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis?: Json | null
          attempts?: number
          cache_key: string
          created_at?: string
          current_question?: number
          employer?: string | null
          error?: string | null
          expires_at?: string
          id?: string
          jd: string
          job_id?: string | null
          lease_until?: string | null
          resume_text?: string | null
          retry_at?: string | null
          settings?: Json
          status?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis?: Json | null
          attempts?: number
          cache_key?: string
          created_at?: string
          current_question?: number
          employer?: string | null
          error?: string | null
          expires_at?: string
          id?: string
          jd?: string
          job_id?: string | null
          lease_until?: string | null
          resume_text?: string | null
          retry_at?: string | null
          settings?: Json
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ip_blocks: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          ip_address: string
          metadata: Json
          reason: string
          severity: Database["public"]["Enums"]["security_severity"]
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          ip_address: string
          metadata?: Json
          reason: string
          severity?: Database["public"]["Enums"]["security_severity"]
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          ip_address?: string
          metadata?: Json
          reason?: string
          severity?: Database["public"]["Enums"]["security_severity"]
        }
        Relationships: []
      }
      job_admin_audit: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          job_id: string | null
          note: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          note?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          note?: string | null
        }
        Relationships: []
      }
      job_alerts: {
        Row: {
          created_at: string
          enabled: boolean
          filters: Json
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          filters?: Json
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          filters?: Json
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      job_classifications: {
        Row: {
          error: string | null
          input_hash: string
          job_id: string
          result: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          error?: string | null
          input_hash: string
          job_id: string
          result?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          error?: string | null
          input_hash?: string
          job_id?: string
          result?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_classifications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_operational_summaries: {
        Row: {
          created_at: string
          day: string
          expired: number
          id: string
          live: number
          open_reports: number
          source_failures: number
        }
        Insert: {
          created_at?: string
          day: string
          expired?: number
          id?: string
          live?: number
          open_reports?: number
          source_failures?: number
        }
        Update: {
          created_at?: string
          day?: string
          expired?: number
          id?: string
          live?: number
          open_reports?: number
          source_failures?: number
        }
        Relationships: []
      }
      job_publication_events: {
        Row: {
          created_at: string
          event: string
          id: string
          job_id: string
        }
        Insert: {
          created_at?: string
          event: string
          id?: string
          job_id: string
        }
        Update: {
          created_at?: string
          event?: string
          id?: string
          job_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_publication_events_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_sources: {
        Row: {
          active: boolean
          board_token: string | null
          created_at: string
          failure_count: number
          id: string
          last_error: string | null
          last_synced_at: string | null
          lock_token: string | null
          locked_until: string | null
          name: string
          poll_minutes: number
          provider: string
          retry_after: string | null
          slug: string
          status: string
          terms_note: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          board_token?: string | null
          created_at?: string
          failure_count?: number
          id?: string
          last_error?: string | null
          last_synced_at?: string | null
          lock_token?: string | null
          locked_until?: string | null
          name: string
          poll_minutes?: number
          provider: string
          retry_after?: string | null
          slug: string
          status?: string
          terms_note?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          board_token?: string | null
          created_at?: string
          failure_count?: number
          id?: string
          last_error?: string | null
          last_synced_at?: string | null
          lock_token?: string | null
          locked_until?: string | null
          name?: string
          poll_minutes?: number
          provider?: string
          retry_after?: string | null
          slug?: string
          status?: string
          terms_note?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      job_verifications: {
        Row: {
          checked_at: string
          evidence: string
          final_url: string | null
          http_status: number | null
          id: string
          job_id: string
          status: string
        }
        Insert: {
          checked_at?: string
          evidence: string
          final_url?: string | null
          http_status?: number | null
          id?: string
          job_id: string
          status: string
        }
        Update: {
          checked_at?: string
          evidence?: string
          final_url?: string | null
          http_status?: number | null
          id?: string
          job_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_verifications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          admin_hold: boolean
          application_status: string
          apply_url: string
          canonical_apply_url: string | null
          career_level: string
          categories: string[]
          city: string | null
          company: string
          country: string | null
          created_at: string
          dedupe_key: string
          employment_type: string | null
          experience_max: number | null
          experience_min: number | null
          expires_at: string
          first_seen_at: string
          id: string
          industry: string | null
          is_primary: boolean
          last_application_checked_at: string | null
          last_verified_at: string
          location: string | null
          original_posted_at: string
          region: string | null
          remote_eligibility: string | null
          salary_currency: string | null
          salary_max: number | null
          salary_min: number | null
          search: unknown
          skills: string[]
          slug: string
          source_access_status: string
          source_id: string
          source_job_id: string
          source_url: string
          summary: string | null
          title: string
          updated_at: string
          verification_basis: string | null
          verification_notes: string | null
          verification_status: string
          work_arrangement: string
        }
        Insert: {
          admin_hold?: boolean
          application_status?: string
          apply_url: string
          canonical_apply_url?: string | null
          career_level?: string
          categories?: string[]
          city?: string | null
          company: string
          country?: string | null
          created_at?: string
          dedupe_key: string
          employment_type?: string | null
          experience_max?: number | null
          experience_min?: number | null
          expires_at: string
          first_seen_at?: string
          id?: string
          industry?: string | null
          is_primary?: boolean
          last_application_checked_at?: string | null
          last_verified_at?: string
          location?: string | null
          original_posted_at: string
          region?: string | null
          remote_eligibility?: string | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          search?: unknown
          skills?: string[]
          slug: string
          source_access_status?: string
          source_id: string
          source_job_id: string
          source_url: string
          summary?: string | null
          title: string
          updated_at?: string
          verification_basis?: string | null
          verification_notes?: string | null
          verification_status?: string
          work_arrangement?: string
        }
        Update: {
          admin_hold?: boolean
          application_status?: string
          apply_url?: string
          canonical_apply_url?: string | null
          career_level?: string
          categories?: string[]
          city?: string | null
          company?: string
          country?: string | null
          created_at?: string
          dedupe_key?: string
          employment_type?: string | null
          experience_max?: number | null
          experience_min?: number | null
          expires_at?: string
          first_seen_at?: string
          id?: string
          industry?: string | null
          is_primary?: boolean
          last_application_checked_at?: string | null
          last_verified_at?: string
          location?: string | null
          original_posted_at?: string
          region?: string | null
          remote_eligibility?: string | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          search?: unknown
          skills?: string[]
          slug?: string
          source_access_status?: string
          source_id?: string
          source_job_id?: string
          source_url?: string
          summary?: string | null
          title?: string
          updated_at?: string
          verification_basis?: string | null
          verification_notes?: string | null
          verification_status?: string
          work_arrangement?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "job_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs_ai_state: {
        Row: {
          id: string
          paused: boolean
          reason: string | null
          updated_at: string
        }
        Insert: {
          id: string
          paused?: boolean
          reason?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          paused?: boolean
          reason?: string | null
          updated_at?: string
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
      newsletter_issue_versions: {
        Row: {
          body_markdown: string
          created_at: string
          created_by: string | null
          hero_emoji: string
          id: string
          issue_id: string
          linkedin_post: string
          snapshot_reason: string
          status_at_snapshot: string
          summary: string
          title: string
          version_no: number
        }
        Insert: {
          body_markdown?: string
          created_at?: string
          created_by?: string | null
          hero_emoji?: string
          id?: string
          issue_id: string
          linkedin_post?: string
          snapshot_reason?: string
          status_at_snapshot?: string
          summary?: string
          title: string
          version_no: number
        }
        Update: {
          body_markdown?: string
          created_at?: string
          created_by?: string | null
          hero_emoji?: string
          id?: string
          issue_id?: string
          linkedin_post?: string
          snapshot_reason?: string
          status_at_snapshot?: string
          summary?: string
          title?: string
          version_no?: number
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_issue_versions_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "newsletter_issues"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_issues: {
        Row: {
          approved_at: string | null
          approved_by: string | null
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
          approved_at?: string | null
          approved_by?: string | null
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
          approved_at?: string | null
          approved_by?: string | null
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
      newsletter_schedules: {
        Row: {
          active: boolean
          cadence: string
          created_at: string
          created_by: string | null
          day_of_month: number | null
          day_of_week: number | null
          hour_utc: number
          id: string
          last_run_at: string | null
          name: string
          next_run_at: string | null
          topic_hint: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          cadence: string
          created_at?: string
          created_by?: string | null
          day_of_month?: number | null
          day_of_week?: number | null
          hour_utc?: number
          id?: string
          last_run_at?: string | null
          name: string
          next_run_at?: string | null
          topic_hint?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          cadence?: string
          created_at?: string
          created_by?: string | null
          day_of_month?: number | null
          day_of_week?: number | null
          hour_utc?: number
          id?: string
          last_run_at?: string | null
          name?: string
          next_run_at?: string | null
          topic_hint?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_send_recipients: {
        Row: {
          created_at: string
          email: string
          error_message: string | null
          id: string
          run_id: string
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          error_message?: string | null
          id?: string
          run_id: string
          status: string
        }
        Update: {
          created_at?: string
          email?: string
          error_message?: string | null
          id?: string
          run_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_send_recipients_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "newsletter_send_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_send_runs: {
        Row: {
          created_at: string
          error_message: string | null
          failed_count: number
          finished_at: string | null
          id: string
          issue_id: string | null
          linkedin_error: string | null
          linkedin_status: string | null
          queued_count: number
          recipients_total: number
          schedule_id: string | null
          started_at: string
          status: string
          title: string | null
          trigger_source: string
          triggered_by: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          failed_count?: number
          finished_at?: string | null
          id?: string
          issue_id?: string | null
          linkedin_error?: string | null
          linkedin_status?: string | null
          queued_count?: number
          recipients_total?: number
          schedule_id?: string | null
          started_at?: string
          status?: string
          title?: string | null
          trigger_source: string
          triggered_by?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          failed_count?: number
          finished_at?: string | null
          id?: string
          issue_id?: string | null
          linkedin_error?: string | null
          linkedin_status?: string | null
          queued_count?: number
          recipients_total?: number
          schedule_id?: string | null
          started_at?: string
          status?: string
          title?: string | null
          trigger_source?: string
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_send_runs_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "newsletter_issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "newsletter_send_runs_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "newsletter_schedules"
            referencedColumns: ["id"]
          },
        ]
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
          theme_preference: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          theme_preference?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          theme_preference?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reported_jobs: {
        Row: {
          created_at: string
          details: string | null
          id: string
          job_id: string
          reason: string
          status: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          job_id: string
          reason: string
          status?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          job_id?: string
          reason?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reported_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
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
      resume_analysis: {
        Row: {
          content: Json
          id: string
          session_id: string
        }
        Insert: {
          content: Json
          id?: string
          session_id: string
        }
        Update: {
          content?: Json
          id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resume_analysis_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_jobs: {
        Row: {
          created_at: string
          id: string
          job_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
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
      security_events: {
        Row: {
          action_taken: string | null
          created_at: string
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json
          severity: Database["public"]["Enums"]["security_severity"]
          target_path: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action_taken?: string | null
          created_at?: string
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json
          severity?: Database["public"]["Enums"]["security_severity"]
          target_path?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action_taken?: string | null
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json
          severity?: Database["public"]["Enums"]["security_severity"]
          target_path?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      source_sync_runs: {
        Row: {
          accepted: number
          closed: number
          error: string | null
          fetched: number
          finished_at: string | null
          id: string
          rejected: number
          source_id: string | null
          started_at: string
          status: string
        }
        Insert: {
          accepted?: number
          closed?: number
          error?: string | null
          fetched?: number
          finished_at?: string | null
          id?: string
          rejected?: number
          source_id?: string | null
          started_at?: string
          status?: string
        }
        Update: {
          accepted?: number
          closed?: number
          error?: string | null
          fetched?: number
          finished_at?: string | null
          id?: string
          rejected?: number
          source_id?: string | null
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "source_sync_runs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "job_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      spam_audit_log: {
        Row: {
          action_type: string
          actor_id: string | null
          created_at: string
          domain: string | null
          email: string | null
          id: string
          metadata: Json
          reason: string | null
        }
        Insert: {
          action_type: string
          actor_id?: string | null
          created_at?: string
          domain?: string | null
          email?: string | null
          id?: string
          metadata?: Json
          reason?: string | null
        }
        Update: {
          action_type?: string
          actor_id?: string | null
          created_at?: string
          domain?: string | null
          email?: string | null
          id?: string
          metadata?: Json
          reason?: string | null
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
      visitor_audit_settings: {
        Row: {
          alert_email_enabled: boolean
          alert_failure_pct: number
          alert_min_events: number
          alert_slack_enabled: boolean
          alert_window_minutes: number
          alerts_enabled: boolean
          id: number
          last_alert_at: string | null
          retention_days: number
          updated_at: string
        }
        Insert: {
          alert_email_enabled?: boolean
          alert_failure_pct?: number
          alert_min_events?: number
          alert_slack_enabled?: boolean
          alert_window_minutes?: number
          alerts_enabled?: boolean
          id?: number
          last_alert_at?: string | null
          retention_days?: number
          updated_at?: string
        }
        Update: {
          alert_email_enabled?: boolean
          alert_failure_pct?: number
          alert_min_events?: number
          alert_slack_enabled?: boolean
          alert_window_minutes?: number
          alerts_enabled?: boolean
          id?: number
          last_alert_at?: string | null
          retention_days?: number
          updated_at?: string
        }
        Relationships: []
      }
      visitor_logs: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          created_at: string
          device: string | null
          id: string
          ip: string | null
          ip_hash: string | null
          language: string | null
          os: string | null
          path: string | null
          referrer: string | null
          region: string | null
          screen: string | null
          session_id: string | null
          timezone: string | null
          user_agent: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          visitor_id: string
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device?: string | null
          id?: string
          ip?: string | null
          ip_hash?: string | null
          language?: string | null
          os?: string | null
          path?: string | null
          referrer?: string | null
          region?: string | null
          screen?: string | null
          session_id?: string | null
          timezone?: string | null
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visitor_id: string
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device?: string | null
          id?: string
          ip?: string | null
          ip_hash?: string | null
          language?: string | null
          os?: string | null
          path?: string | null
          referrer?: string | null
          region?: string | null
          screen?: string | null
          session_id?: string | null
          timezone?: string | null
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visitor_id?: string
        }
        Relationships: []
      }
      visitor_tracking_audit: {
        Row: {
          country: string | null
          created_at: string
          duration_ms: number | null
          error_message: string | null
          id: string
          identified: boolean
          ip_hash: string | null
          metadata: Json
          outcome: string
          path: string | null
          reason: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
          visitor_id: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          identified?: boolean
          ip_hash?: string | null
          metadata?: Json
          outcome: string
          path?: string | null
          reason?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          visitor_id?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          identified?: boolean
          ip_hash?: string | null
          metadata?: Json
          outcome?: string
          path?: string | null
          reason?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          visitor_id?: string | null
        }
        Relationships: []
      }
      visitors: {
        Row: {
          browser: string | null
          device: string | null
          display_name: string | null
          email: string | null
          first_country: string | null
          first_ip: string | null
          first_referrer: string | null
          first_seen_at: string
          first_utm_campaign: string | null
          first_utm_medium: string | null
          first_utm_source: string | null
          identified_at: string | null
          last_city: string | null
          last_country: string | null
          last_ip: string | null
          last_seen_at: string
          os: string | null
          total_pageviews: number
          total_visits: number
          user_agent: string | null
          user_id: string | null
          visitor_id: string
        }
        Insert: {
          browser?: string | null
          device?: string | null
          display_name?: string | null
          email?: string | null
          first_country?: string | null
          first_ip?: string | null
          first_referrer?: string | null
          first_seen_at?: string
          first_utm_campaign?: string | null
          first_utm_medium?: string | null
          first_utm_source?: string | null
          identified_at?: string | null
          last_city?: string | null
          last_country?: string | null
          last_ip?: string | null
          last_seen_at?: string
          os?: string | null
          total_pageviews?: number
          total_visits?: number
          user_agent?: string | null
          user_id?: string | null
          visitor_id: string
        }
        Update: {
          browser?: string | null
          device?: string | null
          display_name?: string | null
          email?: string | null
          first_country?: string | null
          first_ip?: string | null
          first_referrer?: string | null
          first_seen_at?: string
          first_utm_campaign?: string | null
          first_utm_medium?: string | null
          first_utm_source?: string | null
          identified_at?: string | null
          last_city?: string | null
          last_country?: string | null
          last_ip?: string | null
          last_seen_at?: string
          os?: string | null
          total_pageviews?: number
          total_visits?: number
          user_agent?: string | null
          user_id?: string | null
          visitor_id?: string
        }
        Relationships: []
      }
      web_vital_samples: {
        Row: {
          created_at: string
          device: string
          id: string
          metric: string
          path: string
          rating: string
          value: number
        }
        Insert: {
          created_at?: string
          device: string
          id?: string
          metric: string
          path: string
          rating: string
          value: number
        }
        Update: {
          created_at?: string
          device?: string
          id?: string
          metric?: string
          path?: string
          rating?: string
          value?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_interview_work: { Args: never; Returns: string }
      claim_job_source: {
        Args: { p_force?: boolean; p_id: string; p_token: string }
        Returns: boolean
      }
      commit_interview_batch: {
        Args: {
          p_analysis: Json
          p_plan: Json
          p_questions: Json
          p_resume: Json
          p_session: string
        }
        Returns: undefined
      }
      contact_enquiries_due_for_retry: {
        Args: { _limit?: number; _max_retries?: number }
        Returns: {
          confirmation_status: string
          email: string
          id: string
          message: string
          message_id: string
          name: string
          notification_status: string
          retry_count: number
          subject: string
        }[]
      }
      count_recent_contact_submissions: {
        Args: { _ip_hash: string; _minutes?: number }
        Returns: number
      }
      count_recent_failed_logins: {
        Args: { _ip: string; _minutes?: number }
        Returns: number
      }
      drain_interview_queue: { Args: never; Returns: undefined }
      is_blocked_email: { Args: { _email: string }; Returns: boolean }
      is_disposable_email: { Args: { _email: string }; Returns: boolean }
      is_ip_blocked: { Args: { _ip: string }; Returns: boolean }
      jobs_daily_summary: { Args: never; Returns: undefined }
      jobs_expiry_maintenance: { Args: never; Returns: number }
      purge_expired_ip_blocks: { Args: never; Returns: number }
      purge_visitor_tracking_audit: { Args: never; Returns: number }
      reserve_interview_usage: {
        Args: { p_operation: string; p_session: string; p_user: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "user"
      security_severity: "low" | "medium" | "critical"
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
      app_role: ["admin", "user"],
      security_severity: ["low", "medium", "critical"],
    },
  },
} as const
