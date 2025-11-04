// components/Header.tsx
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/components/AuthProvider'
import { Button } from './ui/Button'
import { PersonIcon, DashboardIcon } from './ui/Icons'

export const Header: React.FC = () => {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const isHomePage = router.pathname === '/'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Accueil', href: '/' },
    { name: 'Nos Comédien.nes', href: '/comediens' },
    { name: 'À propos', href: '/about' },
    { name: 'FAQ', href: '/faq' }
  ]

  // Fermer le menu mobile lors du changement de route
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [router.pathname])

  // Bloquer le scroll du body quand le menu est ouvert
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

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
          {/* Navigation desktop */}
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

          {/* Boutons utilisateur desktop */}
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

          {/* Bouton hamburger mobile */}
          <button
            className={`header__hamburger ${mobileMenuOpen ? 'header__hamburger--open' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Menu mobile overlay */}
      {mobileMenuOpen && (
        <div className="header__mobile-menu">
          <nav className="header__mobile-nav">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`header__mobile-link ${
                  router.pathname === item.href ? 'header__mobile-link--active' : ''
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="header__mobile-actions">
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link href="/dashboard">
                    <Button variant="primary" icon={<DashboardIcon />} fullWidth>
                      Dashboard
                    </Button>
                  </Link>
                )}
                <Button variant="primary" icon={<PersonIcon />} onClick={handleProfileClick} fullWidth>
                  Mon Profil
                </Button>
                <Button variant="outline" onClick={handleSignOut} fullWidth>
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Link href="/inscription">
                  <Button variant="primary" fullWidth>
                    S'inscrire
                  </Button>
                </Link>
                <Link href="/connexion">
                  <Button variant="outline" icon={<PersonIcon />} fullWidth>
                    Se connecter
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
