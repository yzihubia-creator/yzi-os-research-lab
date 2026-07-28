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
      connection_audit_events: {
        Row: {
          actor_user_id: string | null
          connection_id: string | null
          created_at: string
          event: string
          id: string
          metadata: Json
          tenant_id: string
        }
        Insert: {
          actor_user_id?: string | null
          connection_id?: string | null
          created_at?: string
          event: string
          id?: string
          metadata?: Json
          tenant_id: string
        }
        Update: {
          actor_user_id?: string | null
          connection_id?: string | null
          created_at?: string
          event?: string
          id?: string
          metadata?: Json
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connection_audit_events_connection_fkey"
            columns: ["connection_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_connections"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "connection_audit_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      connection_authorizations: {
        Row: {
          catalog_id: string
          completed_at: string | null
          consumed_at: string | null
          created_at: string
          expires_at: string
          failed_at: string | null
          failure_code: string | null
          id: string
          processing_lease_expires_at: string | null
          processing_started_at: string | null
          provider: string
          request_id: string | null
          state_hash: string
          status: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          catalog_id: string
          completed_at?: string | null
          consumed_at?: string | null
          created_at?: string
          expires_at?: string
          failed_at?: string | null
          failure_code?: string | null
          id?: string
          processing_lease_expires_at?: string | null
          processing_started_at?: string | null
          provider: string
          request_id?: string | null
          state_hash: string
          status?: string
          tenant_id: string
          user_id: string
        }
        Update: {
          catalog_id?: string
          completed_at?: string | null
          consumed_at?: string | null
          created_at?: string
          expires_at?: string
          failed_at?: string | null
          failure_code?: string | null
          id?: string
          processing_lease_expires_at?: string | null
          processing_started_at?: string | null
          provider?: string
          request_id?: string | null
          state_hash?: string
          status?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connection_authorizations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      controlled_run_records: {
        Row: {
          boundary_snapshot: Json
          capability_key: string
          created_at: string
          id: string
          input_context_snapshot: Json
          operator_role: string
          operator_user_id: string
          persistence_status: string
          result_summary: string
          run_mode: string
          run_status: string
          side_effects: string
          tenant_id: string
        }
        Insert: {
          boundary_snapshot?: Json
          capability_key: string
          created_at?: string
          id?: string
          input_context_snapshot?: Json
          operator_role: string
          operator_user_id: string
          persistence_status?: string
          result_summary: string
          run_mode: string
          run_status: string
          side_effects?: string
          tenant_id: string
        }
        Update: {
          boundary_snapshot?: Json
          capability_key?: string
          created_at?: string
          id?: string
          input_context_snapshot?: Json
          operator_role?: string
          operator_user_id?: string
          persistence_status?: string
          result_summary?: string
          run_mode?: string
          run_status?: string
          side_effects?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "controlled_run_records_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      controlled_runs: {
        Row: {
          boundary_snapshot: Json
          capability_key: string
          created_at: string
          input_context_snapshot: Json
          operator_role: string
          operator_user_id: string
          persistence_status: string
          result_summary: string | null
          run_id: string
          run_mode: string
          run_status: string
          side_effects: string
          tenant_id: string
        }
        Insert: {
          boundary_snapshot?: Json
          capability_key: string
          created_at?: string
          input_context_snapshot?: Json
          operator_role: string
          operator_user_id: string
          persistence_status?: string
          result_summary?: string | null
          run_id?: string
          run_mode: string
          run_status: string
          side_effects?: string
          tenant_id: string
        }
        Update: {
          boundary_snapshot?: Json
          capability_key?: string
          created_at?: string
          input_context_snapshot?: Json
          operator_role?: string
          operator_user_id?: string
          persistence_status?: string
          result_summary?: string | null
          run_id?: string
          run_mode?: string
          run_status?: string
          side_effects?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "controlled_runs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_webhook_events: {
        Row: {
          channel: string
          connection_id: string
          created_at: string
          event_type: string
          external_message_id: string | null
          id: string
          normalized_status: string
          payload_min: Json
          phone_number_id: string | null
          processed_at: string | null
          provider: string
          provider_event_key: string
          tenant_id: string
          waba_id: string | null
        }
        Insert: {
          channel: string
          connection_id: string
          created_at?: string
          event_type: string
          external_message_id?: string | null
          id?: string
          normalized_status: string
          payload_min?: Json
          phone_number_id?: string | null
          processed_at?: string | null
          provider: string
          provider_event_key: string
          tenant_id: string
          waba_id?: string | null
        }
        Update: {
          channel?: string
          connection_id?: string
          created_at?: string
          event_type?: string
          external_message_id?: string | null
          id?: string
          normalized_status?: string
          payload_min?: Json
          phone_number_id?: string | null
          processed_at?: string | null
          provider?: string
          provider_event_key?: string
          tenant_id?: string
          waba_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_webhook_events_connection_fkey"
            columns: ["connection_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_connections"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "provider_webhook_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_brand_settings: {
        Row: {
          audience: string[]
          channels: string[]
          created_at: string
          positioning: string | null
          positioning_custom: string | null
          tenant_id: string
          tone: string | null
          updated_at: string
        }
        Insert: {
          audience?: string[]
          channels?: string[]
          created_at?: string
          positioning?: string | null
          positioning_custom?: string | null
          tenant_id: string
          tone?: string | null
          updated_at?: string
        }
        Update: {
          audience?: string[]
          channels?: string[]
          created_at?: string
          positioning?: string | null
          positioning_custom?: string | null
          tenant_id?: string
          tone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_brand_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_communication_settings: {
        Row: {
          after_hours_yzi: boolean
          created_at: string
          service_days: string[]
          service_end: string | null
          service_start: string | null
          tenant_id: string
          updated_at: string
          yzi_goals: string[]
        }
        Insert: {
          after_hours_yzi?: boolean
          created_at?: string
          service_days?: string[]
          service_end?: string | null
          service_start?: string | null
          tenant_id: string
          updated_at?: string
          yzi_goals?: string[]
        }
        Update: {
          after_hours_yzi?: boolean
          created_at?: string
          service_days?: string[]
          service_end?: string | null
          service_start?: string | null
          tenant_id?: string
          updated_at?: string
          yzi_goals?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "tenant_communication_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_connection_assets: {
        Row: {
          account_label: string | null
          connection_id: string
          created_at: string
          external_account_id: string
          id: string
          kind: string
          metadata: Json
          provider: string
          revoked_at: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          account_label?: string | null
          connection_id: string
          created_at?: string
          external_account_id: string
          id?: string
          kind: string
          metadata?: Json
          provider: string
          revoked_at?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          account_label?: string | null
          connection_id?: string
          created_at?: string
          external_account_id?: string
          id?: string
          kind?: string
          metadata?: Json
          provider?: string
          revoked_at?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_connection_assets_connection_fkey"
            columns: ["connection_id", "tenant_id", "provider"]
            isOneToOne: false
            referencedRelation: "tenant_connections"
            referencedColumns: ["id", "tenant_id", "provider"]
          },
        ]
      }
      tenant_connections: {
        Row: {
          catalog_id: string
          connected_at: string | null
          connected_by: string | null
          created_at: string
          expires_at: string | null
          granted_scopes: string[]
          id: string
          last_checked_at: string | null
          last_failure_at: string | null
          last_failure_reason: string | null
          last_sync_at: string | null
          previous_vault_secret_id: string | null
          previous_vault_secret_retire_after: string | null
          provider: string
          provider_metadata: Json
          revoked_at: string | null
          status: string
          tenant_id: string
          updated_at: string
          vault_secret_id: string | null
        }
        Insert: {
          catalog_id: string
          connected_at?: string | null
          connected_by?: string | null
          created_at?: string
          expires_at?: string | null
          granted_scopes?: string[]
          id?: string
          last_checked_at?: string | null
          last_failure_at?: string | null
          last_failure_reason?: string | null
          last_sync_at?: string | null
          previous_vault_secret_id?: string | null
          previous_vault_secret_retire_after?: string | null
          provider: string
          provider_metadata?: Json
          revoked_at?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
          vault_secret_id?: string | null
        }
        Update: {
          catalog_id?: string
          connected_at?: string | null
          connected_by?: string | null
          created_at?: string
          expires_at?: string | null
          granted_scopes?: string[]
          id?: string
          last_checked_at?: string | null
          last_failure_at?: string | null
          last_failure_reason?: string | null
          last_sync_at?: string | null
          previous_vault_secret_id?: string | null
          previous_vault_secret_retire_after?: string | null
          provider?: string
          provider_metadata?: Json
          revoked_at?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
          vault_secret_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_connections_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_member_profiles: {
        Row: {
          avatar_asset_ref: string | null
          created_at: string
          display_name: string | null
          id: string
          job_title: string | null
          membership_id: string
          operational_availability: string
          phone: string | null
          property_types: string[]
          regions: string[]
          specialties: string[]
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_asset_ref?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          job_title?: string | null
          membership_id: string
          operational_availability?: string
          phone?: string | null
          property_types?: string[]
          regions?: string[]
          specialties?: string[]
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_asset_ref?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          job_title?: string | null
          membership_id?: string
          operational_availability?: string
          phone?: string | null
          property_types?: string[]
          regions?: string[]
          specialties?: string[]
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_member_profiles_membership_identity_fkey"
            columns: ["membership_id", "tenant_id", "user_id"]
            isOneToOne: false
            referencedRelation: "tenant_memberships"
            referencedColumns: ["id", "tenant_id", "user_id"]
          },
          {
            foreignKeyName: "tenant_member_profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_memberships: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          role: string
          status: string
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          role?: string
          status?: string
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          role?: string
          status?: string
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_memberships_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_onboarding_state: {
        Row: {
          completed_at: string | null
          created_at: string
          owner_display_name: string | null
          owner_phone: string | null
          owner_role_title: string | null
          steps_completed: string[]
          team_setup_mode: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          owner_display_name?: string | null
          owner_phone?: string | null
          owner_role_title?: string | null
          steps_completed?: string[]
          team_setup_mode?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          owner_display_name?: string | null
          owner_phone?: string | null
          owner_role_title?: string | null
          steps_completed?: string[]
          team_setup_mode?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_onboarding_state_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_operation_settings: {
        Row: {
          captador_priority: boolean
          commercial_focus: string[]
          created_at: string
          launch_belongs_to_operation: boolean
          lead_distribution: string | null
          property_types: string[]
          regions: string[]
          response_time_minutes: number | null
          standalone_has_captador: boolean
          tenant_id: string
          updated_at: string
        }
        Insert: {
          captador_priority?: boolean
          commercial_focus?: string[]
          created_at?: string
          launch_belongs_to_operation?: boolean
          lead_distribution?: string | null
          property_types?: string[]
          regions?: string[]
          response_time_minutes?: number | null
          standalone_has_captador?: boolean
          tenant_id: string
          updated_at?: string
        }
        Update: {
          captador_priority?: boolean
          commercial_focus?: string[]
          created_at?: string
          launch_belongs_to_operation?: boolean
          lead_distribution?: string | null
          property_types?: string[]
          regions?: string[]
          response_time_minutes?: number | null
          standalone_has_captador?: boolean
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_operation_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_profiles: {
        Row: {
          city: string
          cnpj: string | null
          created_at: string
          email: string | null
          logo_asset_ref: string | null
          operation_type: string | null
          state: string
          tenant_id: string
          trade_name: string | null
          updated_at: string
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          city: string
          cnpj?: string | null
          created_at?: string
          email?: string | null
          logo_asset_ref?: string | null
          operation_type?: string | null
          state: string
          tenant_id: string
          trade_name?: string | null
          updated_at?: string
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          city?: string
          cnpj?: string | null
          created_at?: string
          email?: string | null
          logo_asset_ref?: string | null
          operation_type?: string | null
          state?: string
          tenant_id?: string
          trade_name?: string | null
          updated_at?: string
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_team_invitations: {
        Row: {
          created_at: string
          email: string | null
          id: string
          invited_by: string
          membership_role: string
          name: string
          onboarding_position: number | null
          role_intent: string | null
          status: string
          tenant_id: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          invited_by: string
          membership_role?: string
          name: string
          onboarding_position?: number | null
          role_intent?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          invited_by?: string
          membership_role?: string
          name?: string
          onboarding_position?: number | null
          role_intent?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_team_invitations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          name: string
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      yzi_action_requests: {
        Row: {
          action_type: string
          approved_at: string | null
          approved_by: string | null
          artifact_hash: string | null
          artifact_id: string | null
          created_at: string
          decision_note: string | null
          decision_reason: string | null
          evidence_snapshot: Json
          executed_at: string | null
          id: string
          metadata: Json
          payload: Json
          recommendation_id: string | null
          rejected_at: string | null
          rejected_by: string | null
          requested_by: string
          risk_level: string
          run_id: string | null
          run_step_id: string | null
          session_id: string | null
          side_effects: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          action_type: string
          approved_at?: string | null
          approved_by?: string | null
          artifact_hash?: string | null
          artifact_id?: string | null
          created_at?: string
          decision_note?: string | null
          decision_reason?: string | null
          evidence_snapshot?: Json
          executed_at?: string | null
          id?: string
          metadata?: Json
          payload?: Json
          recommendation_id?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          requested_by: string
          risk_level?: string
          run_id?: string | null
          run_step_id?: string | null
          session_id?: string | null
          side_effects?: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          action_type?: string
          approved_at?: string | null
          approved_by?: string | null
          artifact_hash?: string | null
          artifact_id?: string | null
          created_at?: string
          decision_note?: string | null
          decision_reason?: string | null
          evidence_snapshot?: Json
          executed_at?: string | null
          id?: string
          metadata?: Json
          payload?: Json
          recommendation_id?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          requested_by?: string
          risk_level?: string
          run_id?: string | null
          run_step_id?: string | null
          session_id?: string | null
          side_effects?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "yzi_action_requests_artifact_tenant_fkey"
            columns: ["artifact_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "yzi_artifacts"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "yzi_action_requests_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "yzi_agent_recommendations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "yzi_action_requests_recommendation_tenant_fkey"
            columns: ["recommendation_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "yzi_agent_recommendations"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "yzi_action_requests_run_tenant_fkey"
            columns: ["run_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "yzi_runs"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "yzi_action_requests_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "yzi_chat_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "yzi_action_requests_session_tenant_fkey"
            columns: ["session_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "yzi_chat_sessions"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "yzi_action_requests_step_tenant_fkey"
            columns: ["run_step_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "yzi_run_steps"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "yzi_action_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      yzi_agent_recommendations: {
        Row: {
          confidence: number
          created_at: string
          evidence_snapshot: Json
          id: string
          metadata: Json
          priority: string
          proposed_actions: Json
          recommendation_type: string
          session_id: string | null
          status: string
          summary: string
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          confidence?: number
          created_at?: string
          evidence_snapshot?: Json
          id?: string
          metadata?: Json
          priority?: string
          proposed_actions?: Json
          recommendation_type: string
          session_id?: string | null
          status?: string
          summary: string
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          confidence?: number
          created_at?: string
          evidence_snapshot?: Json
          id?: string
          metadata?: Json
          priority?: string
          proposed_actions?: Json
          recommendation_type?: string
          session_id?: string | null
          status?: string
          summary?: string
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "yzi_agent_recommendations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "yzi_chat_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "yzi_agent_recommendations_session_tenant_fkey"
            columns: ["session_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "yzi_chat_sessions"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "yzi_agent_recommendations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      yzi_artifacts: {
        Row: {
          content: Json
          content_hash: string
          contract_key: string
          created_at: string
          id: string
          run_id: string
          run_step_id: string
          status: string
          tenant_id: string
          version: number
          visibility: string
        }
        Insert: {
          content: Json
          content_hash: string
          contract_key: string
          created_at?: string
          id?: string
          run_id: string
          run_step_id: string
          status?: string
          tenant_id: string
          version: number
          visibility?: string
        }
        Update: {
          content?: Json
          content_hash?: string
          contract_key?: string
          created_at?: string
          id?: string
          run_id?: string
          run_step_id?: string
          status?: string
          tenant_id?: string
          version?: number
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "yzi_artifacts_run_tenant_fkey"
            columns: ["run_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "yzi_runs"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "yzi_artifacts_step_run_fkey"
            columns: ["run_step_id", "run_id"]
            isOneToOne: false
            referencedRelation: "yzi_run_steps"
            referencedColumns: ["id", "run_id"]
          },
          {
            foreignKeyName: "yzi_artifacts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      yzi_audit_events: {
        Row: {
          action_request_id: string | null
          actor_user_id: string | null
          created_at: string
          event_label: string
          event_type: string
          evidence_snapshot: Json
          id: string
          metadata: Json
          recommendation_id: string | null
          session_id: string | null
          source: string
          tenant_id: string
        }
        Insert: {
          action_request_id?: string | null
          actor_user_id?: string | null
          created_at?: string
          event_label: string
          event_type: string
          evidence_snapshot?: Json
          id?: string
          metadata?: Json
          recommendation_id?: string | null
          session_id?: string | null
          source?: string
          tenant_id: string
        }
        Update: {
          action_request_id?: string | null
          actor_user_id?: string | null
          created_at?: string
          event_label?: string
          event_type?: string
          evidence_snapshot?: Json
          id?: string
          metadata?: Json
          recommendation_id?: string | null
          session_id?: string | null
          source?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "yzi_audit_events_action_request_id_fkey"
            columns: ["action_request_id"]
            isOneToOne: false
            referencedRelation: "yzi_action_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "yzi_audit_events_action_request_tenant_fkey"
            columns: ["action_request_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "yzi_action_requests"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "yzi_audit_events_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "yzi_agent_recommendations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "yzi_audit_events_recommendation_tenant_fkey"
            columns: ["recommendation_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "yzi_agent_recommendations"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "yzi_audit_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "yzi_chat_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "yzi_audit_events_session_tenant_fkey"
            columns: ["session_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "yzi_chat_sessions"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "yzi_audit_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      yzi_chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          message_role: string
          metadata: Json
          sender_type: string
          session_id: string
          structured_payload: Json
          tenant_id: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          message_role?: string
          metadata?: Json
          sender_type: string
          session_id: string
          structured_payload?: Json
          tenant_id: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          message_role?: string
          metadata?: Json
          sender_type?: string
          session_id?: string
          structured_payload?: Json
          tenant_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "yzi_chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "yzi_chat_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "yzi_chat_messages_session_tenant_fkey"
            columns: ["session_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "yzi_chat_sessions"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "yzi_chat_messages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      yzi_chat_sessions: {
        Row: {
          context_scope: Json
          created_at: string
          id: string
          metadata: Json
          mode: string
          status: string
          tenant_id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          context_scope?: Json
          created_at?: string
          id?: string
          metadata?: Json
          mode?: string
          status?: string
          tenant_id: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          context_scope?: Json
          created_at?: string
          id?: string
          metadata?: Json
          mode?: string
          status?: string
          tenant_id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "yzi_chat_sessions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      yzi_credit_ledger: {
        Row: {
          account_id: string | null
          action_request_id: string | null
          amount: number
          balance_after: number | null
          created_at: string
          entry_type: string
          id: string
          metadata: Json
          reason: string
          tenant_id: string
        }
        Insert: {
          account_id?: string | null
          action_request_id?: string | null
          amount: number
          balance_after?: number | null
          created_at?: string
          entry_type: string
          id?: string
          metadata?: Json
          reason: string
          tenant_id: string
        }
        Update: {
          account_id?: string | null
          action_request_id?: string | null
          amount?: number
          balance_after?: number | null
          created_at?: string
          entry_type?: string
          id?: string
          metadata?: Json
          reason?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "yzi_credit_ledger_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "yzi_tenant_credit_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "yzi_credit_ledger_account_tenant_fkey"
            columns: ["account_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "yzi_tenant_credit_accounts"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "yzi_credit_ledger_action_request_id_fkey"
            columns: ["action_request_id"]
            isOneToOne: false
            referencedRelation: "yzi_action_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "yzi_credit_ledger_action_request_tenant_fkey"
            columns: ["action_request_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "yzi_action_requests"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "yzi_credit_ledger_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      yzi_imob_appointments: {
        Row: {
          broker_user_id: string | null
          confirmation_status: string
          created_at: string
          ends_at: string | null
          id: string
          lead_id: string | null
          notes: string | null
          property_id: string | null
          source: string
          starts_at: string
          status: string
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          broker_user_id?: string | null
          confirmation_status: string
          created_at?: string
          ends_at?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          property_id?: string | null
          source?: string
          starts_at: string
          status: string
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          broker_user_id?: string | null
          confirmation_status?: string
          created_at?: string
          ends_at?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          property_id?: string | null
          source?: string
          starts_at?: string
          status?: string
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "yzi_imob_appointments_lead_tenant_fkey"
            columns: ["lead_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "yzi_imob_leads"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "yzi_imob_appointments_property_tenant_fkey"
            columns: ["property_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "yzi_imob_properties"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "yzi_imob_appointments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      yzi_imob_conversations: {
        Row: {
          channel: string
          created_at: string
          external_sender_id: string | null
          id: string
          last_message_at: string | null
          lead_id: string | null
          started_at: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          channel: string
          created_at?: string
          external_sender_id?: string | null
          id?: string
          last_message_at?: string | null
          lead_id?: string | null
          started_at?: string
          status: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          channel?: string
          created_at?: string
          external_sender_id?: string | null
          id?: string
          last_message_at?: string | null
          lead_id?: string | null
          started_at?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "yzi_imob_conversations_lead_tenant_fkey"
            columns: ["lead_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "yzi_imob_leads"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "yzi_imob_conversations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      yzi_imob_follow_up_tasks: {
        Row: {
          appointment_id: string | null
          assignment_id: string | null
          attempt_count: number
          cancelled_at: string | null
          channel: string | null
          claimed_at: string | null
          completed_at: string | null
          conversation_id: string | null
          created_at: string
          due_at: string
          failed_at: string | null
          id: string
          kind: string
          last_attempt_at: string | null
          last_error_code: string | null
          lead_id: string | null
          max_attempts: number
          metadata: Json
          notes: string | null
          recovered_at: string | null
          recovery_count: number
          recovery_reason: string | null
          recovery_source: string | null
          scheduled_at: string
          source: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          assignment_id?: string | null
          attempt_count?: number
          cancelled_at?: string | null
          channel?: string | null
          claimed_at?: string | null
          completed_at?: string | null
          conversation_id?: string | null
          created_at?: string
          due_at: string
          failed_at?: string | null
          id?: string
          kind: string
          last_attempt_at?: string | null
          last_error_code?: string | null
          lead_id?: string | null
          max_attempts?: number
          metadata?: Json
          notes?: string | null
          recovered_at?: string | null
          recovery_count?: number
          recovery_reason?: string | null
          recovery_source?: string | null
          scheduled_at?: string
          source: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          assignment_id?: string | null
          attempt_count?: number
          cancelled_at?: string | null
          channel?: string | null
          claimed_at?: string | null
          completed_at?: string | null
          conversation_id?: string | null
          created_at?: string
          due_at?: string
          failed_at?: string | null
          id?: string
          kind?: string
          last_attempt_at?: string | null
          last_error_code?: string | null
          lead_id?: string | null
          max_attempts?: number
          metadata?: Json
          notes?: string | null
          recovered_at?: string | null
          recovery_count?: number
          recovery_reason?: string | null
          recovery_source?: string | null
          scheduled_at?: string
          source?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "yzi_imob_follow_up_tasks_appointment_tenant_fkey"
            columns: ["appointment_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "yzi_imob_appointments"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "yzi_imob_follow_up_tasks_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "yzi_imob_lead_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "yzi_imob_follow_up_tasks_conversation_tenant_fkey"
            columns: ["conversation_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "yzi_imob_conversations"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "yzi_imob_follow_up_tasks_lead_tenant_fkey"
            columns: ["lead_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "yzi_imob_leads"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "yzi_imob_follow_up_tasks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      yzi_imob_inbound_operation_requests: {
        Row: {
          channel: string
          claimed_at: string | null
          completed_at: string | null
          conversation_id: string
          created_at: string
          execution_status: string
          failure_code: string | null
          id: string
          idempotency_key: string
          intent_key: string | null
          intent_status: string
          message_id: string
          provider: string
          tenant_id: string
          updated_at: string
          workflow_key: string | null
          workflow_status: string
        }
        Insert: {
          channel?: string
          claimed_at?: string | null
          completed_at?: string | null
          conversation_id: string
          created_at?: string
          execution_status?: string
          failure_code?: string | null
          id?: string
          idempotency_key: string
          intent_key?: string | null
          intent_status?: string
          message_id: string
          provider?: string
          tenant_id: string
          updated_at?: string
          workflow_key?: string | null
          workflow_status?: string
        }
        Update: {
          channel?: string
          claimed_at?: string | null
          completed_at?: string | null
          conversation_id?: string
          created_at?: string
          execution_status?: string
          failure_code?: string | null
          id?: string
          idempotency_key?: string
          intent_key?: string | null
          intent_status?: string
          message_id?: string
          provider?: string
          tenant_id?: string
          updated_at?: string
          workflow_key?: string | null
          workflow_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "yzi_imob_inbound_operation_requests_conversation_tenant_fkey"
            columns: ["conversation_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "yzi_imob_conversations"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "yzi_imob_inbound_operation_requests_message_tenant_fkey"
            columns: ["message_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "yzi_imob_messages"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "yzi_imob_inbound_operation_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      yzi_imob_inbound_runner_executions: {
        Row: {
          created_at: string
          failure_code: string | null
          id: string
          intent_key: string | null
          outcome_status: string
          request_id: string | null
          tenant_id: string | null
          workflow_key: string | null
        }
        Insert: {
          created_at?: string
          failure_code?: string | null
          id?: string
          intent_key?: string | null
          outcome_status: string
          request_id?: string | null
          tenant_id?: string | null
          workflow_key?: string | null
        }
        Update: {
          created_at?: string
          failure_code?: string | null
          id?: string
          intent_key?: string | null
          outcome_status?: string
          request_id?: string | null
          tenant_id?: string | null
          workflow_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "yzi_imob_inbound_runner_executions_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "yzi_imob_inbound_operation_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "yzi_imob_inbound_runner_executions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      yzi_imob_lead_assignments: {
        Row: {
          accepted_at: string | null
          assigned_at: string
          broker_user_id: string
          created_at: string
          created_by_user_id: string | null
          declined_at: string | null
          expires_at: string | null
          id: string
          lead_id: string
          notes: string | null
          source: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          assigned_at?: string
          broker_user_id: string
          created_at?: string
          created_by_user_id?: string | null
          declined_at?: string | null
          expires_at?: string | null
          id?: string
          lead_id: string
          notes?: string | null
          source?: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          assigned_at?: string
          broker_user_id?: string
          created_at?: string
          created_by_user_id?: string | null
          declined_at?: string | null
          expires_at?: string | null
          id?: string
          lead_id?: string
          notes?: string | null
          source?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "yzi_imob_lead_assignments_lead_tenant_fkey"
            columns: ["lead_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "yzi_imob_leads"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "yzi_imob_lead_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      yzi_imob_leads: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          source: string | null
          status: string
          temperature: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status: string
          temperature?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string
          temperature?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "yzi_imob_leads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      yzi_imob_messages: {
        Row: {
          body: string
          channel: string | null
          conversation_id: string
          created_at: string
          delivery_status: string | null
          direction: string
          external_message_id: string | null
          id: string
          idempotency_key: string | null
          provider: string | null
          provider_error_code: string | null
          provider_message_id: string | null
          provider_timestamp: string | null
          sender_type: string
          tenant_id: string
        }
        Insert: {
          body: string
          channel?: string | null
          conversation_id: string
          created_at?: string
          delivery_status?: string | null
          direction: string
          external_message_id?: string | null
          id?: string
          idempotency_key?: string | null
          provider?: string | null
          provider_error_code?: string | null
          provider_message_id?: string | null
          provider_timestamp?: string | null
          sender_type: string
          tenant_id: string
        }
        Update: {
          body?: string
          channel?: string | null
          conversation_id?: string
          created_at?: string
          delivery_status?: string | null
          direction?: string
          external_message_id?: string | null
          id?: string
          idempotency_key?: string | null
          provider?: string | null
          provider_error_code?: string | null
          provider_message_id?: string | null
          provider_timestamp?: string | null
          sender_type?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "yzi_imob_messages_conversation_tenant_fkey"
            columns: ["conversation_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "yzi_imob_conversations"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "yzi_imob_messages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      yzi_imob_properties: {
        Row: {
          attributes: Json
          availability_status: string | null
          bathrooms: number | null
          bedrooms: number | null
          city: string | null
          commercial_context: Json
          condominium_amenities: Json
          condominium_fee: number | null
          created_at: string
          created_by_user_id: string | null
          description: string | null
          editorial_status: string | null
          floor: number | null
          furnished_status: string | null
          id: string
          iptu_value: number | null
          neighborhood: string | null
          optimized_description: string | null
          original_description: string | null
          parking_spaces: number | null
          price: number | null
          private_area: number | null
          property_features: Json
          property_type: string | null
          reference_code: string | null
          short_summary: string | null
          solar_orientation: string | null
          stage: string | null
          status: string
          suites: number | null
          surroundings: Json
          tenant_id: string
          title: string
          total_area: number | null
          transaction_type: string | null
          updated_at: string
        }
        Insert: {
          attributes?: Json
          availability_status?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          commercial_context?: Json
          condominium_amenities?: Json
          condominium_fee?: number | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          editorial_status?: string | null
          floor?: number | null
          furnished_status?: string | null
          id?: string
          iptu_value?: number | null
          neighborhood?: string | null
          optimized_description?: string | null
          original_description?: string | null
          parking_spaces?: number | null
          price?: number | null
          private_area?: number | null
          property_features?: Json
          property_type?: string | null
          reference_code?: string | null
          short_summary?: string | null
          solar_orientation?: string | null
          stage?: string | null
          status: string
          suites?: number | null
          surroundings?: Json
          tenant_id: string
          title: string
          total_area?: number | null
          transaction_type?: string | null
          updated_at?: string
        }
        Update: {
          attributes?: Json
          availability_status?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          commercial_context?: Json
          condominium_amenities?: Json
          condominium_fee?: number | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          editorial_status?: string | null
          floor?: number | null
          furnished_status?: string | null
          id?: string
          iptu_value?: number | null
          neighborhood?: string | null
          optimized_description?: string | null
          original_description?: string | null
          parking_spaces?: number | null
          price?: number | null
          private_area?: number | null
          property_features?: Json
          property_type?: string | null
          reference_code?: string | null
          short_summary?: string | null
          solar_orientation?: string | null
          stage?: string | null
          status?: string
          suites?: number | null
          surroundings?: Json
          tenant_id?: string
          title?: string
          total_area?: number | null
          transaction_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "yzi_imob_properties_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      yzi_imob_property_description_revisions: {
        Row: {
          accepted_at: string | null
          accepted_by_user_id: string | null
          created_at: string
          id: string
          model: string | null
          original_text: string
          property_id: string
          provider: string | null
          requested_by_user_id: string | null
          source_revision_id: string | null
          status: string
          suggested_text: string
          tenant_id: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by_user_id?: string | null
          created_at?: string
          id?: string
          model?: string | null
          original_text: string
          property_id: string
          provider?: string | null
          requested_by_user_id?: string | null
          source_revision_id?: string | null
          status?: string
          suggested_text: string
          tenant_id: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by_user_id?: string | null
          created_at?: string
          id?: string
          model?: string | null
          original_text?: string
          property_id?: string
          provider?: string | null
          requested_by_user_id?: string | null
          source_revision_id?: string | null
          status?: string
          suggested_text?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "yzi_imob_property_description_revisions_property_tenant_fkey"
            columns: ["property_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "yzi_imob_properties"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "yzi_imob_property_description_revisions_source_tenant_property_"
            columns: ["source_revision_id", "tenant_id", "property_id"]
            isOneToOne: false
            referencedRelation: "yzi_imob_property_description_revisions"
            referencedColumns: ["id", "tenant_id", "property_id"]
          },
          {
            foreignKeyName: "yzi_imob_property_description_revisions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      yzi_imob_property_interests: {
        Row: {
          created_at: string
          id: string
          lead_id: string
          property_id: string
          score: number | null
          source: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id: string
          property_id: string
          score?: number | null
          source?: string | null
          status: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string
          property_id?: string
          score?: number | null
          source?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "yzi_imob_property_interests_lead_tenant_fkey"
            columns: ["lead_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "yzi_imob_leads"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "yzi_imob_property_interests_property_tenant_fkey"
            columns: ["property_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "yzi_imob_properties"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "yzi_imob_property_interests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      yzi_imob_property_private_locations: {
        Row: {
          access_instructions: string | null
          block: string | null
          complement: string | null
          condominium_name: string | null
          created_at: string
          id: string
          latitude: number | null
          longitude: number | null
          meeting_point: string | null
          number: string | null
          postal_code: string | null
          property_id: string
          street: string | null
          tenant_id: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          access_instructions?: string | null
          block?: string | null
          complement?: string | null
          condominium_name?: string | null
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          meeting_point?: string | null
          number?: string | null
          postal_code?: string | null
          property_id: string
          street?: string | null
          tenant_id: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          access_instructions?: string | null
          block?: string | null
          complement?: string | null
          condominium_name?: string | null
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          meeting_point?: string | null
          number?: string | null
          postal_code?: string | null
          property_id?: string
          street?: string | null
          tenant_id?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "yzi_imob_property_private_locations_property_tenant_fkey"
            columns: ["property_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "yzi_imob_properties"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "yzi_imob_property_private_locations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      yzi_imob_property_proximities: {
        Row: {
          created_at: string
          distance_unit: string | null
          distance_value: number | null
          estimated_minutes: number | null
          id: string
          is_confirmed: boolean
          label: string
          place_type: string
          property_id: string
          source: string
          tenant_id: string
          travel_mode: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          distance_unit?: string | null
          distance_value?: number | null
          estimated_minutes?: number | null
          id?: string
          is_confirmed?: boolean
          label: string
          place_type: string
          property_id: string
          source?: string
          tenant_id: string
          travel_mode?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          distance_unit?: string | null
          distance_value?: number | null
          estimated_minutes?: number | null
          id?: string
          is_confirmed?: boolean
          label?: string
          place_type?: string
          property_id?: string
          source?: string
          tenant_id?: string
          travel_mode?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "yzi_imob_property_proximities_property_tenant_fkey"
            columns: ["property_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "yzi_imob_properties"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "yzi_imob_property_proximities_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      yzi_imob_run_contexts: {
        Row: {
          conversation_id: string | null
          created_at: string
          lead_id: string
          property_id: string
          run_id: string
          tenant_id: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          lead_id: string
          property_id: string
          run_id: string
          tenant_id: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          lead_id?: string
          property_id?: string
          run_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "yzi_imob_run_contexts_conversation_lead_tenant_fkey"
            columns: ["conversation_id", "lead_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "yzi_imob_conversations"
            referencedColumns: ["id", "lead_id", "tenant_id"]
          },
          {
            foreignKeyName: "yzi_imob_run_contexts_lead_tenant_fkey"
            columns: ["lead_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "yzi_imob_leads"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "yzi_imob_run_contexts_property_tenant_fkey"
            columns: ["property_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "yzi_imob_properties"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "yzi_imob_run_contexts_run_tenant_fkey"
            columns: ["run_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "yzi_runs"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "yzi_imob_run_contexts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      yzi_imob_visit_feedback: {
        Row: {
          appointment_id: string
          broker_user_id: string | null
          client_attendance: string
          created_at: string
          feedback_at: string
          id: string
          lead_id: string | null
          next_action: string | null
          next_action_at: string | null
          observation: string | null
          outcome: string
          property_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          appointment_id: string
          broker_user_id?: string | null
          client_attendance?: string
          created_at?: string
          feedback_at?: string
          id?: string
          lead_id?: string | null
          next_action?: string | null
          next_action_at?: string | null
          observation?: string | null
          outcome?: string
          property_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string
          broker_user_id?: string | null
          client_attendance?: string
          created_at?: string
          feedback_at?: string
          id?: string
          lead_id?: string | null
          next_action?: string | null
          next_action_at?: string | null
          observation?: string | null
          outcome?: string
          property_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "yzi_imob_visit_feedback_appointment_tenant_fkey"
            columns: ["appointment_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "yzi_imob_appointments"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "yzi_imob_visit_feedback_lead_tenant_fkey"
            columns: ["lead_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "yzi_imob_leads"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "yzi_imob_visit_feedback_property_tenant_fkey"
            columns: ["property_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "yzi_imob_properties"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "yzi_imob_visit_feedback_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      yzi_radar_signals: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string | null
          evidence_snapshot: Json
          id: string
          metadata: Json
          signal_type: string
          source_channel: string | null
          status: string
          strength: number
          summary: string | null
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          evidence_snapshot?: Json
          id?: string
          metadata?: Json
          signal_type: string
          source_channel?: string | null
          status?: string
          strength?: number
          summary?: string | null
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          evidence_snapshot?: Json
          id?: string
          metadata?: Json
          signal_type?: string
          source_channel?: string | null
          status?: string
          strength?: number
          summary?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "yzi_radar_signals_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      yzi_run_steps: {
        Row: {
          attempt: number
          completed_at: string | null
          created_at: string
          id: string
          run_id: string
          started_at: string | null
          status: string
          step_key: string
          tenant_id: string
        }
        Insert: {
          attempt?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          run_id: string
          started_at?: string | null
          status?: string
          step_key: string
          tenant_id: string
        }
        Update: {
          attempt?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          run_id?: string
          started_at?: string | null
          status?: string
          step_key?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "yzi_run_steps_run_tenant_fkey"
            columns: ["run_id", "tenant_id"]
            isOneToOne: false
            referencedRelation: "yzi_runs"
            referencedColumns: ["id", "tenant_id"]
          },
          {
            foreignKeyName: "yzi_run_steps_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      yzi_runs: {
        Row: {
          active_asset_id: string
          active_asset_type: string
          context_fingerprint: string
          created_at: string
          cursor_step: string
          id: string
          initiated_by: string
          intent_type: string
          status: string
          tenant_id: string
          updated_at: string
          workflow_id: string
        }
        Insert: {
          active_asset_id: string
          active_asset_type: string
          context_fingerprint: string
          created_at?: string
          cursor_step?: string
          id?: string
          initiated_by: string
          intent_type: string
          status?: string
          tenant_id: string
          updated_at?: string
          workflow_id: string
        }
        Update: {
          active_asset_id?: string
          active_asset_type?: string
          context_fingerprint?: string
          created_at?: string
          cursor_step?: string
          id?: string
          initiated_by?: string
          intent_type?: string
          status?: string
          tenant_id?: string
          updated_at?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "yzi_runs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      yzi_tenant_credit_accounts: {
        Row: {
          created_at: string
          credits_balance: number
          currency: string
          id: string
          media_budget_cents: number
          metadata: Json
          plan_key: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          credits_balance?: number
          currency?: string
          id?: string
          media_budget_cents?: number
          metadata?: Json
          plan_key?: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          credits_balance?: number
          currency?: string
          id?: string
          media_budget_cents?: number
          metadata?: Json
          plan_key?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "yzi_tenant_credit_accounts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_yzi_imob_property_description_revision: {
        Args: { p_source_revision_id: string }
        Returns: {
          accepted_revision_id: string
          property_id: string
          success: boolean
        }[]
      }
      accept_yzi_imob_team_invitation: {
        Args: { p_invitation_id: string }
        Returns: {
          invitation_status: string
          member_id: string
          profile_created: boolean
          role: string
          status: string
        }[]
      }
      complete_yzi_imob_meta_connection: {
        Args: {
          p_access_token: string
          p_authorization_id: string
          p_exchanged_for_long_lived?: boolean
          p_graph_api_version?: string
          p_state_hash: string
          p_token_expires_at?: string
          p_token_type?: string
        }
        Returns: {
          connection_action: string
          connection_id: string
          connection_status: string
        }[]
      }
      consume_yzi_imob_meta_authorization: {
        Args: { p_state_hash: string }
        Returns: {
          authorization_id: string
          catalog_id: string
          claim_status: string
          expires_at: string
          processing_lease_expires_at: string
          request_id: string
          tenant_id: string
          user_id: string
        }[]
      }
      create_yzi_imob_team_invitation: {
        Args: {
          p_email: string
          p_membership_role?: string
          p_name: string
          p_role_intent?: string
          p_whatsapp?: string
        }
        Returns: {
          created_at: string
          delivery_status: string
          email: string
          invitation_id: string
          membership_role: string
          name: string
          role_intent: string
          status: string
          whatsapp: string
        }[]
      }
      create_yzi_imob_tenant_with_owner: {
        Args: { p_name: string; p_slug: string }
        Returns: {
          created: boolean
          success: boolean
          tenant_id: string
          tenant_slug: string
        }[]
      }
      get_yzi_imob_property_private_location: {
        Args: { p_property_id: string }
        Returns: {
          access_instructions: string
          block: string
          complement: string
          condominium_name: string
          created_at: string
          latitude: number
          longitude: number
          meeting_point: string
          number: string
          postal_code: string
          property_id: string
          street: string
          unit: string
          updated_at: string
        }[]
      }
      get_yzi_imob_tenant_connections: {
        Args: { p_tenant_id: string }
        Returns: {
          assets: Json
          capabilities: Json
          catalog_id: string
          connected_at: string
          connected_by: string
          created_at: string
          expires_at: string
          granted_scopes: string[]
          id: string
          last_checked_at: string
          last_failure_at: string
          last_failure_reason: string
          last_sync_at: string
          provider: string
          status: string
          tenant_id: string
          updated_at: string
        }[]
      }
      list_yzi_imob_team_members: {
        Args: never
        Returns: {
          avatar_asset_ref: string
          display_name: string
          is_self: boolean
          job_title: string
          member_id: string
          operational_availability: string
          phone: string
          property_types: string[]
          regions: string[]
          role: string
          since: string
          specialties: string[]
          status: string
          updated_at: string
        }[]
      }
      record_yzi_imob_meta_authorization_failure: {
        Args: {
          p_authorization_id: string
          p_failure_code: string
          p_graph_api_version?: string
          p_state_hash: string
        }
        Returns: undefined
      }
      reject_yzi_imob_property_description_revision: {
        Args: { p_source_revision_id: string }
        Returns: {
          property_id: string
          rejected_revision_id: string
          success: boolean
        }[]
      }
      resend_yzi_imob_team_invitation: {
        Args: { p_invitation_id: string }
        Returns: {
          capability_status: string
          invitation_id: string
          message: string
          status: string
          updated_at: string
        }[]
      }
      revoke_yzi_imob_team_invitation: {
        Args: { p_invitation_id: string }
        Returns: {
          invitation_id: string
          status: string
          updated_at: string
        }[]
      }
      save_yzi_imob_onboarding_profile: {
        Args: { p_payload: Json }
        Returns: {
          onboarding_completed: boolean
          success: boolean
        }[]
      }
      start_yzi_imob_meta_authorization: {
        Args: {
          p_catalog_id: string
          p_expires_at: string
          p_redirect_origin: string
          p_request_id?: string
          p_state_hash: string
          p_tenant_id: string
        }
        Returns: {
          authorization_id: string
          expires_at: string
        }[]
      }
      update_yzi_imob_team_member_availability: {
        Args: { p_member_id: string; p_operational_availability: string }
        Returns: {
          member_id: string
          operational_availability: string
          updated_at: string
        }[]
      }
      update_yzi_imob_team_member_role: {
        Args: { p_member_id: string; p_role: string }
        Returns: {
          member_id: string
          role: string
          status: string
          updated_at: string
        }[]
      }
      update_yzi_imob_team_member_status: {
        Args: { p_member_id: string; p_status: string }
        Returns: {
          member_id: string
          role: string
          status: string
          updated_at: string
        }[]
      }
      upsert_yzi_imob_property_private_location: {
        Args: {
          p_access_instructions?: string
          p_block?: string
          p_complement?: string
          p_condominium_name?: string
          p_latitude?: number
          p_longitude?: number
          p_meeting_point?: string
          p_number?: string
          p_postal_code?: string
          p_property_id: string
          p_street?: string
          p_unit?: string
        }
        Returns: {
          returned_property_id: string
          success: boolean
        }[]
      }
      yzi_advance_after_approval: {
        Args: { p_action_request_id: string; p_run_id: string }
        Returns: {
          artifact_id: string
          run_id: string
          run_step_id: string
          status: string
        }[]
      }
      yzi_create_action_request: {
        Args: {
          p_action_type: string
          p_evidence_snapshot?: Json
          p_payload?: Json
          p_recommendation_id?: string
          p_risk_level?: string
          p_session_id?: string
          p_side_effects?: string
          p_tenant_id: string
        }
        Returns: {
          action_type: string
          approved_at: string | null
          approved_by: string | null
          artifact_hash: string | null
          artifact_id: string | null
          created_at: string
          decision_note: string | null
          decision_reason: string | null
          evidence_snapshot: Json
          executed_at: string | null
          id: string
          metadata: Json
          payload: Json
          recommendation_id: string | null
          rejected_at: string | null
          rejected_by: string | null
          requested_by: string
          risk_level: string
          run_id: string | null
          run_step_id: string | null
          session_id: string | null
          side_effects: string
          status: string
          tenant_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "yzi_action_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      yzi_create_chat_session: {
        Args: {
          p_context_scope?: Json
          p_mode?: string
          p_tenant_id: string
          p_title?: string
        }
        Returns: {
          context_scope: Json
          created_at: string
          id: string
          metadata: Json
          mode: string
          status: string
          tenant_id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "yzi_chat_sessions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      yzi_create_user_chat_message: {
        Args: {
          p_content: string
          p_session_id: string
          p_structured_payload?: Json
          p_tenant_id: string
        }
        Returns: {
          content: string
          created_at: string
          id: string
          message_role: string
          metadata: Json
          sender_type: string
          session_id: string
          structured_payload: Json
          tenant_id: string
          user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "yzi_chat_messages"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      yzi_decide_action_request: {
        Args: {
          p_action_request_id: string
          p_decision: string
          p_decision_note?: string
          p_decision_reason?: string
        }
        Returns: {
          action_request_id: string
          decided_at: string
          status: string
        }[]
      }
      yzi_get_tenant_operating_context: {
        Args: { p_tenant_id: string }
        Returns: Json
      }
      yzi_imob_record_message: {
        Args: {
          p_body: string
          p_conversation_id: string
          p_direction: string
          p_external_message_id?: string
          p_sender_type: string
          p_tenant_id: string
        }
        Returns: {
          body: string
          conversation_id: string
          conversation_last_message_at: string
          created_at: string
          direction: string
          external_message_id: string
          id: string
          sender_type: string
          tenant_id: string
        }[]
      }
      yzi_internal_record_audit_event: {
        Args: {
          p_action_request_id: string
          p_event_label: string
          p_event_type: string
          p_evidence?: Json
          p_run_id: string
          p_tenant_id: string
        }
        Returns: undefined
      }
      yzi_is_active_tenant_member: {
        Args: { p_tenant_id: string }
        Returns: boolean
      }
      yzi_record_run_adjustment: {
        Args: {
          p_mode: string
          p_new_content: Json
          p_new_content_hash: string
          p_previous_action_request_id: string
          p_run_id: string
        }
        Returns: {
          action_request_id: string
          artifact_id: string
          run_id: string
          run_step_id: string
          status: string
        }[]
      }
      yzi_start_prepare_contact_run: {
        Args: {
          p_content: Json
          p_content_hash: string
          p_context_fingerprint: string
          p_conversation_id?: string
          p_lead_id: string
          p_property_id: string
          p_tenant_id: string
        }
        Returns: {
          action_request_id: string
          artifact_id: string
          run_id: string
          run_step_id: string
          status: string
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
