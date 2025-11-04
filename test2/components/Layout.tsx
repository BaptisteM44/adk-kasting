// components/Layout.tsx
import React from 'react'
import { Header } from './Header'
import { PageTitle } from './PageTitle'
import { Footer } from './Footer'
import { useFooterAnimation } from '@/hooks/useFooterAnimation'
import { useHeaderScroll } from '@/hooks/useHeaderScroll'

interface LayoutProps {
  children: React.ReactNode
  showPageTitle?: boolean // Option pour masquer le titre ADK-KASTING
}

export const Layout: React.FC<LayoutProps> = ({ children, showPageTitle = true }) => {
  // Activer l'animation du footer sur toutes les pages
  useFooterAnimation()
  
  // Activer l'animation de scroll du header
  useHeaderScroll()

  return (
    <>
      <Header />
      {showPageTitle && <PageTitle />}
      <main>{children}</main>
      <Footer />
    </>
  )
}
