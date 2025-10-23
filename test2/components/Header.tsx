// components/Header.tsx
import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/components/AuthProvider'
import { Button } from './ui/Button'
import { PersonIcon, DashboardIcon } from './ui/Icons'

export const Header: React.FC = () => {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const isHomePage = router.pathname === '/'

  const navigation = [
    { name: 'Accueil', href: '/' },
    { name: 'Nos Comédien.nes', href: '/comediens' },
    { name: 'À propos', href: '/about' },
    { name: 'FAQ', href: '/faq' }
  ]

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  const handleProfileClick = async () => {
    if (!user) return
    
    try {
      // Utiliser l'API dédiée pour trouver le comédien par email
      const response = await fetch(`/api/comedien-by-email?email=${encodeURIComponent(user.email)}`)
      
      if (response.ok) {
        const result = await response.json()
        router.push(`/comediens/${result.data.id}`)
      } else if (response.status === 404) {
        console.error('Profil comédien non trouvé pour:', user.email)
        alert('Profil comédien non trouvé. Contactez l\'administrateur.')
      } else {
        console.error('Erreur API:', response.status)
        alert('Erreur lors de la recherche du profil.')
      }
    } catch (error) {
      console.error('Erreur lors de la recherche du profil:', error)
      alert('Erreur lors de la recherche du profil.')
    }
  }

  return (
    <header className="header">
      <div className="container">
        <div className="header__container">
          <nav className="header__nav">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`header__nav-link ${
                  router.pathname === item.href ? 'header__nav-link--active' : ''
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="header__user">
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link href="/dashboard">
                    <Button variant="header" icon={<DashboardIcon />}>
                      Dashboard
                    </Button>
                  </Link>
                )}
                <Button variant="header" icon={<PersonIcon />} onClick={handleProfileClick}>
                  Mon Profil
                </Button>
                <Button variant="header" onClick={handleSignOut}>
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Link href="/inscription">
                  <Button variant="header">
                    S'inscrire
                  </Button>
                </Link>
                <Link href="/connexion">
                  <Button variant="header" icon={<PersonIcon />}>
                    Se connecter
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
