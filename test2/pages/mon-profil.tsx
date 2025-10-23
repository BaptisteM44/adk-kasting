// pages/mon-profil.tsx
import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/components/AuthProvider'
import { Layout } from '@/components/Layout'

const MonProfil: React.FC = () => {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    const redirectToProfile = async () => {
      if (!user) {
        // Si pas connecté, rediriger vers la page de connexion
        router.push('/connexion')
        return
      }

      try {
        // Récupérer l'ID du comédien correspondant à l'utilisateur
        const response = await fetch('/api/comediens')
        if (response.ok) {
          const data = await response.json()
          const comedien = data.data?.find((c: any) => c.email === user.email)
          
          if (comedien) {
            // Rediriger vers la page de profil comédien
            router.push(`/comediens/${comedien.id}`)
          } else {
            // Si pas de profil comédien trouvé, rediriger vers la page d'accueil
            router.push('/')
          }
        } else {
          // Fallback vers la page d'accueil en cas d'erreur
          router.push('/')
        }
      } catch (error) {
        console.error('Erreur lors de la redirection:', error)
        router.push('/')
      }
    }

    redirectToProfile()
  }, [user, router])

  return (
    <Layout>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        fontSize: '1.1rem',
        color: '#666'
      }}>
        Redirection vers votre profil...
      </div>
    </Layout>
  )
}

export default MonProfil