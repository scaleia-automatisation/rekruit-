import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client: SupabaseClient<any> | null = null

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSupabaseClient(): SupabaseClient<any> {
  if (client) return client

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for this environment.',
    )
  }

  client = createClient(supabaseUrl, supabaseAnonKey)
  return client
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = new Proxy({} as SupabaseClient<any>, {
  get(_target, prop, receiver) {
    const instance = getSupabaseClient()
    const value = Reflect.get(instance as object, prop, receiver)
    return typeof value === 'function' ? value.bind(instance) : value
  },
})

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          logo: string | null
          logo_url: string | null
          email: string | null
          phone: string | null
          address: string | null
          website: string | null
          plan: string
          plan_interval: string | null
          plan_status: string | null
          plan_current_period_end: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          credits: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['organizations']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>
      }
      users: {
        Row: {
          id: string
          organization_id: string | null
          first_name: string
          last_name: string
          email: string
          phone: string | null
          role: 'admin' | 'recruiter'
          is_super_admin: boolean
          plan: string
          status: string
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      job_offers: {
        Row: {
          id: string
          organization_id: string
          created_by: string | null
          title: string
          company: string
          location: string | null
          contract_type: string | null
          description: string | null
          missions: string | null
          skills: string | null
          experience: string | null
          education: string | null
          languages: string | null
          mandatory_criteria: string | null
          preferred_criteria: string | null
          status: 'draft' | 'active' | 'paused' | 'closed'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['job_offers']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['job_offers']['Insert']>
      }
      candidates: {
        Row: {
          id: string
          organization_id: string
          job_offer_id: string | null
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          location: string | null
          cv_url: string | null
          cover_letter_url: string | null
          cv_text: string | null
          cover_letter_text: string | null
          status: 'new' | 'analyzing' | 'analyzed' | 'shortlisted' | 'interview_1' | 'interview_2' | 'interview_3' | 'offer' | 'hired' | 'rejected' | 'pool'
          score_global: number | null
          score_skills: number | null
          score_experience: number | null
          score_education: number | null
          progression: number | null
          recommendation: string | null
          ai_summary: string | null
          ai_strengths: string | null
          ai_weaknesses: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['candidates']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['candidates']['Insert']>
      }
      interviews: {
        Row: {
          id: string
          candidate_id: string
          organization_id: string
          number: number
          scheduled_at: string | null
          duration_minutes: number | null
          status: 'pending' | 'scheduled' | 'completed' | 'cancelled' | 'no_show'
          score: number | null
          comment: string | null
          audio_url: string | null
          transcript: string | null
          ai_analysis: string | null
          interviewer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['interviews']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['interviews']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          organization_id: string
          user_id: string | null
          type: string
          title: string
          content: string | null
          read_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
    }
  }
}
