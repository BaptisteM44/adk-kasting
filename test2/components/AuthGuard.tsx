// components/AuthGuard.tsx
import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/components/AuthProvider'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireRole?: 'comedien' | 'admin'
  redirectTo?: string
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = false,
  requireRole,
  redirectTo = '/connexion'
}) => {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    // Redirection si authentification requise mais pas connecté
    if (requireAuth && !user) {
      router.push(redirectTo)
      return
    }

    // Redirection si rôle spécifique requis
    if (requireRole && user?.role !== requireRole) {
      router.push('/')
      return
    }
  }, [user, loading, requireAuth, requireRole, redirectTo, router])

  // Affichage du loading
  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '2rem' }}>
        <div className="loading" style={{ transform: 'scale(2)' }} />
        <p style={{ marginTop: '1rem' }}>Chargement...</p>
      </div>
    )
  }

  // Ne pas afficher le contenu si les conditions ne sont pas remplies
  if (requireAuth && !user) return null
  if (requireRole && user?.role !== requireRole) return null

  return <>{children}</>
}
