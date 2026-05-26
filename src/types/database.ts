// Auto-generated via: supabase gen types typescript --project-id xxx > src/types/database.ts
// Replace with: npx supabase gen types typescript --project-id <PROJECT_ID> > src/types/database.ts

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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          is_super_admin: boolean
          plan: string
          subscription_status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          referral_code: string | null
          referred_by: string | null
          deletion_requested: boolean
          wallet_balance_cents: number
          wallet_pending_cents: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          is_super_admin?: boolean
          plan?: string
          subscription_status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          referral_code?: string | null
          referred_by?: string | null
          deletion_requested?: boolean
          wallet_balance_cents?: number
          wallet_pending_cents?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          is_super_admin?: boolean
          plan?: string
          subscription_status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          referral_code?: string | null
          referred_by?: string | null
          deletion_requested?: boolean
          wallet_balance_cents?: number
          wallet_pending_cents?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      wallet_entries: {
        Row: {
          id: string
          user_id: string
          amount_cents: number
          type: string
          status: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount_cents: number
          type: string
          status?: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount_cents?: number
          type?: string
          status?: string
          description?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_entries_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      referrals: {
        Row: {
          id: string
          referrer_id: string
          referred_id: string
          amount_cents: number
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          referrer_id: string
          referred_id: string
          amount_cents?: number
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          referrer_id?: string
          referred_id?: string
          amount_cents?: number
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          body: string | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          body?: string | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          body?: string | null
          read?: boolean
          created_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          title: string | null
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          updated_at?: string
          created_at?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          id: string
          user_id: string
          amount_cents: number
          iban: string
          bic: string
          status: string
          requested_at: string
          processed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          amount_cents: number
          iban: string
          bic: string
          status?: string
          requested_at?: string
          processed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          amount_cents?: number
          iban?: string
          bic?: string
          status?: string
          requested_at?: string
          processed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
