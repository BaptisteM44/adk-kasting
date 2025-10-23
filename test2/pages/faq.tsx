// pages/faq.tsx
import React, { useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { Layout } from '@/components/Layout'

export default function FAQPage() {
  // Intersection Observer pour les animations au scroll (copié de about.tsx)
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

    // Observer tous les éléments avec animations
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
        <title>FAQ - Questions fréquentes - ADK-KASTING</title>
        <meta 
          name="description" 
          content="Trouvez les réponses aux questions les plus fréquentes sur ADK-KASTING." 
        />
      </Head>

      <div className="about-page" style={{ backgroundColor: '#ffffff' }}>
        {/* Section 1 - Hero avec bouton */}
        <div className="hero-part hero-part--search">
          <div className="hero-content">
            <h2 className="text-reveal">
              Questions Fréquemment Posées
            </h2>
            <p className="text-reveal text-reveal--delay-1">
              Trouvez rapidement les réponses à vos questions les plus courantes sur ADK Kasting. Notre équipe est là pour vous accompagner dans votre parcours artistique.
            </p>
            <Link href="/connexion">
              <button className="hero-button button-reveal">
                Se connecter
              </button>
            </Link>
          </div>
        </div>

        {/* Section 2 - Simple titre + paragraphe */}
        <div className="hero-part hero-part--register">
          <div className="hero-content">
            <h2 className="text-reveal text-reveal--delay-2">
              Besoin d'aide ?
            </h2>
            <p className="text-reveal text-reveal--delay-3">
              Nous avons rassemblé les questions les plus fréquemment posées par notre communauté de comédiens et de professionnels. Si vous ne trouvez pas la réponse à votre question, n'hésitez pas à nous contacter directement.
            </p>
          </div>
        </div>
      </div>

      <div className="about-page" style={{ backgroundColor: '#ffffff' }}>
        {/* Section 3 - FAQ Questions */}
        <div className="hero-part hero-part--transport">
          <div className="hero-content">
            <h2 className="text-reveal">
              Questions les plus fréquentes
            </h2>
            <div className="faq-list">
              <div className="text-reveal text-reveal--delay-1">
                <h3>Comment puis-je m'inscrire sur ADK Kasting ?</h3>
                <p>L'inscription est simple et gratuite. Cliquez sur "Inscription" et remplissez votre profil complet avec vos informations personnelles et professionnelles.</p>
              </div>
              <div className="text-reveal text-reveal--delay-2">
                <h3>Quels types de profils recherchez-vous ?</h3>
                <p>Nous recherchons tous types de profils : comédiens professionnels et amateurs, figurants, doubleurs, cascadeurs, danseurs, mannequins, etc.</p>
              </div>
              <div className="text-reveal text-reveal--delay-3">
                <h3>Y a-t-il des frais d'inscription ?</h3>
                <p>Non, l'inscription sur ADK Kasting est entièrement gratuite. Nous ne percevons aucun frais ni commission sur les cachets des comédiens.</p>
              </div>
              <div className="text-reveal text-reveal--delay-4">
                <h3>Comment fonctionne le processus de casting ?</h3>
                <p>Vous recevez des notifications pour les castings correspondant à votre profil, postulez en ligne, et si vous êtes sélectionné, le directeur de casting vous contacte directement.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4 - Support */}
        <div className="hero-part hero-part--team">
          <div className="hero-content">
            <h2 className="text-reveal">
              Besoin d'aide supplémentaire ?
            </h2>
            <div className="support-info">
              <div className="text-reveal text-reveal--delay-1">
                <h3>Support technique</h3>
                <p>Pour toute question technique concernant votre profil ou l'utilisation de la plateforme, contactez notre équipe support.</p>
              </div>
              <div className="text-reveal text-reveal--delay-2">
                <h3>Questions sur les castings</h3>
                <p>Pour des questions spécifiques sur un casting, vous pouvez contacter directement le directeur de casting via sa fiche de contact.</p>
              </div>
              <div className="text-reveal text-reveal--delay-3">
                <h3>Partenariats</h3>
                <p>Vous êtes un producteur ou directeur de casting ? Découvrez comment publier vos castings sur notre plateforme.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
