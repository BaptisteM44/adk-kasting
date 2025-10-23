// lib/auth.ts
import { User, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { User as AppUser, Comedien } from '@/types'

class AuthService {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  }

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  async getCurrentUser(): Promise<AppUser | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Récupérer le rôle et les infos supplémentaires
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    return {
      id: user.id,
      email: user.email!,
      role: profile?.role || 'public',
      created_at: user.created_at,
      updated_at: user.updated_at || user.created_at
    }
  }

  async getComedienProfile(userId: string): Promise<Comedien | null> {
    const { data } = await supabase
      .from('comediens')
      .select('*')
      .eq('user_id', userId)
      .single()

    return data
  }

  async updateComedienProfile(userId: string, updates: Partial<Comedien>) {
    const { data, error } = await supabase
      .from('comediens')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async createOrUpdateComedienProfile(userId: string, profileData: Partial<Comedien>) {
    // Vérifier si le profil existe déjà
    const { data: existing } = await supabase
      .from('comediens')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existing) {
      // Mettre à jour le profil existant
      return this.updateComedienProfile(userId, profileData)
    } else {
      // Créer un nouveau profil
      const { data, error } = await supabase
        .from('comediens')
        .insert([{ ...profileData, user_id: userId }])
        .select()
        .single()

      if (error) throw error
      return data
    }
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null)
    })
  }
}

export const authService = new AuthService()
