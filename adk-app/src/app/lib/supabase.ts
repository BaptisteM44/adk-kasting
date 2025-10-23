// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type pour les appels RPC
export type Database = {
  public: {
    Functions: {
      get_actors_critical_filters: {
        Args: {
          gender_filter?: string | null
          age_min?: number | null
          age_max?: number | null
          city_filter?: string | null
          experience_filter?: string | null
          page_num?: number
          page_size?: number
          excluded_ids?: number[]
        }
        Returns: Array<{
          profilepicture: string | null
          first_name: string | null
          last_name: string | null
          display_name: string
          user_age: number | null
          user_email: string
          domiciliation: string | null
          total_count: number
        }>
      }
      get_actors_optimized_filters: {
        Args: {
          gender_filter?: string | null
          ethnicity_filter?: string | null
          domiciliation_filter?: string | null
          build_filter?: string | null
          hair_color_filter?: string | null
          eye_color_filter?: string | null
          experience_level_filter?: string | null
          native_language_filter?: string | null
          languages_filter?: string | null
          dance_skills_filter?: string | null
          music_skills_filter?: string | null
          driving_license_filter?: string | null
          nationality_filter?: string | null
          city_filter?: string | null
          size_filter?: string | null
          age_min?: number | null
          age_max?: number | null
          page_num?: number
          page_size?: number
          excluded_ids?: number[]
        }
        Returns: Array<{
          id: number
          display_name: string
          user_email: string
          first_name: string | null
          last_name: string | null
          birth_date: string | null
          mobile_number: string | null
          profilepicture: string | null
          city: string | null
          country: string | null
          gender: string | null
          ethnicity: string | null
          domiciliation: string | null
          build: string | null
          hair_color: string | null
          eye_color: string | null
          experience_level: string | null
          actor_nationality: string | null
          actor_languages_native: string | null
          languages: string | null
          actor_dance_skills: string | null
          actor_music_skills: string | null
          actor_driving_license: string | null
          size: string | null
          total_count: number
        }>
      }
    }
  }
}
