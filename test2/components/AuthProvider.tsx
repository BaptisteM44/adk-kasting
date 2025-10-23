// components/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { authService } from '@/lib/auth'
import type { User as AppUser, Comedien, AuthState } from '@/types'

interface AuthContextType extends AuthState {
  updateProfile: (profileData: Partial<Comedien>) => Promise<void>
  refreshComedien: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null)
  const [comedien, setComedien] = useState<Comedien | null>(null)
  const [loading, setLoading] = useState(true)

  // Sauvegarder l'utilisateur dans localStorage
  const saveUserToStorage = (user: AppUser | null) => {
    if (user) {
      localStorage.setItem('adk_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('adk_user')
    }
  }

  // Charger l'utilisateur depuis localStorage
  const loadUserFromStorage = (): AppUser | null => {
    try {
      const stored = localStorage.getItem('adk_user')
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error('Erreur lors du chargement de l\'utilisateur depuis localStorage:', error)
      return null
    }
  }

  const refreshComedien = async () => {
    if (user) {
      try {
        const comedienData = await authService.getComedienProfile(user.id)
        setComedien(comedienData)
      } catch (error) {
        console.error('Erreur lors du chargement du profil comédien:', error)
        setComedien(null)
      }
    } else {
      setComedien(null)
    }
  }

  const updateProfile = async (profileData: Partial<Comedien>) => {
    if (!user) {
      throw new Error('Vous devez être connecté pour mettre à jour votre profil')
    }

    try {
      const updatedProfile = await authService.createOrUpdateComedienProfile(user.id, profileData)
      setComedien(updatedProfile)
    } catch (error: any) {
      throw new Error('Erreur lors de la mise à jour du profil: ' + error.message)
    }
  }

  useEffect(() => {
    // Charger l'utilisateur depuis localStorage au démarrage
    const loadUser = async () => {
      try {
        // D'abord essayer de charger depuis localStorage
        const storedUser = loadUserFromStorage()
        
        if (storedUser) {
          console.log('✅ Utilisateur chargé depuis localStorage:', storedUser)
          setUser(storedUser)
          
          // Essayer de charger le profil comédien si c'est un utilisateur normal
          if (storedUser.role !== 'admin') {
            try {
              const comedienData = await authService.getComedienProfile(storedUser.id)
              setComedien(comedienData)
            } catch (error) {
              console.warn('Pas de profil comédien trouvé')
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()

    // Note: On n'écoute plus les changements Supabase car on utilise localStorage
    // Si vous voulez réactiver Supabase Auth plus tard, décommentez ce code
    
    /*
    const { data: { subscription } } = authService.onAuthStateChange(async (supabaseUser: User | null) => {
      if (supabaseUser) {
        try {
          const appUser = await authService.getCurrentUser()
          setUser(appUser)
          
          if (appUser) {
            await refreshComedien()
          }
        } catch (error) {
          console.error('Erreur lors du chargement des données utilisateur:', error)
          setUser(null)
          setComedien(null)
        }
      } else {
        // Ne pas réinitialiser si on a un utilisateur en localStorage
        const storedUser = loadUserFromStorage()
        if (!storedUser) {
          setUser(null)
          setComedien(null)
        }
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
    */
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Tentative de connexion avec:', { email, passwordLength: password.length }) // Debug côté client
      
      // Utiliser directement l'API de login pour tous les utilisateurs
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      console.log('Status de la réponse:', loginResponse.status) // Debug

      if (loginResponse.ok) {
        const loginData = await loginResponse.json()
        console.log('Réponse login API:', loginData) // Debug
        
        // Créer l'objet utilisateur
        const mockUser = {
          id: loginData.user.id,
          email: loginData.user.email,
          role: loginData.user.role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        // Sauvegarder dans localStorage
        saveUserToStorage(mockUser)
        
        // Mettre à jour l'état
        setUser(mockUser)
        setLoading(false)
        
        console.log('✅ Utilisateur sauvegardé dans localStorage')
        
        return { success: true }
      } else {
        const errorData = await loginResponse.json()
        console.log('Erreur API:', errorData) // Debug
        return { success: false, error: errorData.message }
      }
    } catch (error: any) {
      console.error('Erreur de connexion:', error)
      return { 
        success: false, 
        error: error.message || 'Email ou mot de passe incorrect' 
      }
    }
  }

  const signOut = async () => {
    try {
      // Supprimer de localStorage
      saveUserToStorage(null)
      
      // Réinitialiser l'état
      setUser(null)
      setComedien(null)
      
      // Déconnexion Supabase
      await authService.signOut()
      
      console.log('✅ Déconnexion réussie')
    } catch (error: any) {
      console.error('Erreur lors de la déconnexion:', error)
      throw new Error('Erreur lors de la déconnexion: ' + error.message)
    }
  }

  const value: AuthContextType = {
    user,
    comedien,
    loading,
    updateProfile,
    refreshComedien,
    signIn,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}