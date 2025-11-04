// components/SEOHead.tsx
import React from 'react'
import Head from 'next/head'

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'profile'
  noindex?: boolean
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'ADK-KASTING - Agence de casting professionnelle',
  description = 'ADK-KASTING est une agence de casting professionnelle basée à Bruxelles. Découvrez nos comédiens talentueux pour vos projets de cinéma, télévision, théâtre et publicité.',
  keywords = 'casting, comédiens, acteurs, actrices, cinéma, télévision, théâtre, publicité, Bruxelles, Belgique, ADK',
  image = '/images/Logo-ADK-KASTING.jpeg',
  url,
  type = 'website',
  noindex = false
}) => {
  // Construire l'URL complète si nécessaire
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.adk-kasting.com'
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl
  const fullImageUrl = image?.startsWith('http') ? image : `${siteUrl}${image}`

  return (
    <Head>
      {/* Title */}
      <title>{title}</title>

      {/* Meta tags standards */}
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph (Facebook, LinkedIn) */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:site_name" content="ADK-KASTING" />
      <meta property="og:locale" content="fr_BE" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />

      {/* Additional meta tags */}
      <meta name="format-detection" content="telephone=no" />
    </Head>
  )
}
