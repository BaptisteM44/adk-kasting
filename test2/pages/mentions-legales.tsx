// pages/mentions-legales.tsx
import React, { useEffect } from 'react'
import Head from 'next/head'
import { Layout } from '@/components/Layout'

export default function MentionsLegalesPage() {
  // Intersection Observer pour les animations au scroll
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate')
        }
      })
    }, observerOptions)

    const animatedElements = document.querySelectorAll(
      '.text-reveal, .button-reveal'
    )
    animatedElements.forEach(el => observer.observe(el))

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <Layout>
      <Head>
        <title>Mentions légales - ADK-KASTING</title>
        <meta
          name="description"
          content="Mentions légales du site ADK-KASTING, plateforme de casting professionnelle."
        />
      </Head>

      <div className="about-page" style={{ backgroundColor: '#ffffff' }}>
        {/* Section 1 - Titre principal */}
        <div className="hero-part hero-part--search">
          <div className="hero-content">
            <h2 className="text-reveal">
              Mentions Légales
            </h2>
            <p className="text-reveal text-reveal--delay-1">
              Informations légales concernant le site ADK-KASTING et son exploitation.
            </p>
          </div>
        </div>

        {/* Section 2 - Éditeur du site */}
        <div className="hero-part hero-part--register">
          <div className="hero-content">
            <h2 className="text-reveal">
              Éditeur du site
            </h2>
            <div className="text-reveal text-reveal--delay-1">
              <p><strong>Raison sociale :</strong> [À compléter]</p>
              <p><strong>Forme juridique :</strong> [À compléter]</p>
              <p><strong>Capital social :</strong> [À compléter]</p>
              <p><strong>Siège social :</strong> Avenue Maurice 1, 1050 Ixelles, Belgique</p>
              <p><strong>TVA :</strong> BE0820 300 591</p>
              <p><strong>Email :</strong> info@adk-kasting.com</p>
              <p><strong>Téléphone :</strong> +32 2 544 09 05</p>
            </div>
          </div>
        </div>

        {/* Section 3 - Directeur de publication */}
        <div className="hero-part hero-part--transport">
          <div className="hero-content">
            <h2 className="text-reveal">
              Directeur de publication
            </h2>
            <div className="text-reveal text-reveal--delay-1">
              <p><strong>Nom :</strong> [À compléter]</p>
              <p><strong>Fonction :</strong> [À compléter]</p>
              <p><strong>Email :</strong> [À compléter]</p>
            </div>
          </div>
        </div>

        {/* Section 4 - Hébergement */}
        <div className="hero-part hero-part--team">
          <div className="hero-content">
            <h2 className="text-reveal">
              Hébergement
            </h2>
            <div className="text-reveal text-reveal--delay-1">
              <p><strong>Hébergeur :</strong> [À compléter - ex: Hostinger, OVH, etc.]</p>
              <p><strong>Adresse :</strong> [À compléter]</p>
              <p><strong>Site web :</strong> [À compléter]</p>
            </div>
          </div>
        </div>

        {/* Section 5 - Propriété intellectuelle */}
        <div className="hero-part hero-part--search">
          <div className="hero-content">
            <h2 className="text-reveal">
              Propriété intellectuelle
            </h2>
            <div className="text-reveal text-reveal--delay-1">
              <p>L'ensemble du contenu présent sur ce site (textes, images, vidéos, logos, graphismes, etc.) est protégé par les lois relatives à la propriété intellectuelle.</p>
              <p>Toute reproduction, représentation, modification, publication, transmission ou dénaturation, totale ou partielle du site ou de son contenu, par quelque procédé que ce soit et sur quelque support que ce soit, est interdite sans l'autorisation écrite préalable de ADK-KASTING.</p>
              <p>Les photographies et vidéos des comédiens présents sur le site restent la propriété de leurs auteurs respectifs. Leur utilisation est strictement réservée aux professionnels du casting dans le cadre de leurs recherches.</p>
            </div>
          </div>
        </div>

        {/* Section 6 - Crédits */}
        <div className="hero-part hero-part--register">
          <div className="hero-content">
            <h2 className="text-reveal">
              Crédits
            </h2>
            <div className="text-reveal text-reveal--delay-1">
              <p><strong>Développement :</strong> [À compléter]</p>
              <p><strong>Design :</strong> [À compléter]</p>
              <p><strong>Technologies :</strong> Next.js, Supabase, TypeScript</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
