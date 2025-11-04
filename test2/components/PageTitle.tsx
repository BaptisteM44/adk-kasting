// components/PageTitle.tsx
import React from 'react'
import { useRouter } from 'next/router'

export const PageTitle: React.FC = () => {
  const router = useRouter()
  const isHomePage = router.pathname === '/'

  // Ne pas afficher sur la page d'accueil
  if (isHomePage) return null

  return (
    <section className="page-title" id="page-title">
      <div className="container">
        <h1 className="page-title__brand">
          ADK-KASTING
        </h1>
      </div>
    </section>
  )
}