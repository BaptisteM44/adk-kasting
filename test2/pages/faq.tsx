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
              Trouvez rapidement les réponses à vos questions les plus courantes sur ADK-KASTING. 
            </p>
          </div>
        </div>
      </div>

      <div className="about-page" style={{ backgroundColor: '#ffffff' }}>
        {/* Section 3 - FAQ Questions */}
        <div className="hero-part hero-part--transport">
          <div className="hero-content">
            <div className="faq-list">
              <div className="text-reveal text-reveal--delay-1">
                <h3>Comment puis-je m'inscrire sur ADK-KASTING ?</h3>
                <p>L'inscription est simple et gratuite. Cliquez sur "Inscription" et remplissez votre profil complet avec vos informations personnelles et professionnelles.</p>
              </div>
              <div className="text-reveal text-reveal--delay-2">
                <h3>À qui s’adresse ce site ?</h3>
                <p>Aux comédiens professionnels, aux amateurs, adultes, enfants et ados…</p>
              </div>
              <div className="text-reveal text-reveal--delay-3">
                <h3>Y a-t-il des frais d'inscription ?</h3>
                <p>L’inscription chez ADK-KASTING est gratuite. Néanmoins, si vous désirez que votre profil soit public (c’est à dire apparent sur le site), un forfait unique de 25€ est demandé pour la publication. Si vous ne payez pas, votre profil ne sera pas visible sur le site mais nous aurons toutefois accès à vos données. 
                    Les paiements s’effectuent au numéro de compte IBAN :BE75 0689 0495 4251 – BIC GKCCBEBB en mentionnant votre nom et prénom en communication 
                    <br /><u> <b>Attention : Avant que nous ne validions votre inscription, veuillez n’effectuer aucun paiement!</b></u>
                    <br />
                    A quoi sert la participation aux frais ?
                    Cette participation aux frais nous permet de financer la mise à jour quotidienne du site ainsi que l’espace que nous occupons sur le net.</p>
              </div>
              <div className="text-reveal text-reveal--delay-4">
                <h3>Comment puis-je être appelé.e pour un casting ?</h3>
                <p>Vous serez contacté.e par ADK pour tout rôle qui pourrait vous correspondre après sélection de notre part ou de la part du/ de la réalisateurice. Cette sélection se fait sur base de votre matériel (photos / bande démo).</p>
              </div>
              <div className="text-reveal text-reveal--delay-4">
                <h3>Comment fonctionne le processus de casting ?</h3>
                <p>Vous recevez des notifications pour les castings correspondant à votre profil, postulez en ligne, et si vous êtes sélectionné, le directeur de casting vous contacte directement.
                  <br />Dans certains cas, nous postons également des annonces sur nos réseaux (Instagram, Facebook). N’hésitez pas à les consulter régulièrement.
                </p>
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
                <p>Pour toute question technique concernant votre profil ou l'utilisation de la plateforme, contactez- nous à info@adk kasting.com. Nous y répondrons au plus vite.</p>
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
