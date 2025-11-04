// pages/politique-confidentialite.tsx
import React, { useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { Layout } from '@/components/Layout'

export default function PolitiqueConfidentialitePage() {
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
        <title>Politique de confidentialité - ADK-KASTING</title>
        <meta
          name="description"
          content="Politique de confidentialité et protection des données personnelles (RGPD) d'ADK-KASTING."
        />
      </Head>

      <div className="about-page" style={{ backgroundColor: '#ffffff' }}>
        {/* Section 1 - Titre principal */}
        <div className="hero-part hero-part--search">
          <div className="hero-content">
            <h2 className="text-reveal">
              Politique de confidentialité
            </h2>
            <p className="text-reveal text-reveal--delay-1">
              ADK-KASTING s'engage à protéger vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD).
            </p>
          </div>
        </div>

        {/* Section 2 - Collecte des données */}
        <div className="hero-part hero-part--register">
          <div className="hero-content">
            <h2 className="text-reveal">
              1. Collecte des données personnelles
            </h2>
            <div className="text-reveal text-reveal--delay-1">
              <h3>Données collectées</h3>
              <p>Dans le cadre de l'utilisation de notre plateforme, nous collectons les données suivantes :</p>
              <ul>
                <li><strong>Informations d'identification :</strong> nom, prénom, date de naissance, sexe</li>
                <li><strong>Coordonnées :</strong> adresse postale, email, téléphone</li>
                <li><strong>Informations professionnelles :</strong> expérience, compétences, formations</li>
                <li><strong>Données physiques :</strong> taille, couleur des yeux/cheveux, corpulence</li>
                <li><strong>Médias :</strong> photos, vidéos (showreel)</li>
                <li><strong>Données techniques :</strong> adresse IP, cookies, logs de connexion</li>
              </ul>
              <p><strong>[À compléter avec les détails spécifiques de votre collecte]</strong></p>
            </div>
          </div>
        </div>

        {/* Section 3 - Utilisation des données */}
        <div className="hero-part hero-part--transport">
          <div className="hero-content">
            <h2 className="text-reveal">
              2. Utilisation des données
            </h2>
            <div className="text-reveal text-reveal--delay-1">
              <p>Vos données personnelles sont utilisées pour :</p>
              <ul>
                <li>Créer et gérer votre profil de comédien sur notre plateforme</li>
                <li>Permettre aux professionnels du casting de vous contacter</li>
                <li>Améliorer nos services et l'expérience utilisateur</li>
                <li>Vous informer des opportunités de casting correspondant à votre profil</li>
                <li>Respecter nos obligations légales et réglementaires</li>
              </ul>
              <p><strong>Base légale :</strong> [À compléter - consentement, contrat, intérêt légitime, etc.]</p>
            </div>
          </div>
        </div>

        {/* Section 4 - Partage des données */}
        <div className="hero-part hero-part--team">
          <div className="hero-content">
            <h2 className="text-reveal">
              3. Partage et destinataires des données
            </h2>
            <div className="text-reveal text-reveal--delay-1">
              <p>Vos données peuvent être partagées avec :</p>
              <ul>
                <li><strong>Professionnels du casting :</strong> directeurs de casting, producteurs (avec votre consentement)</li>
                <li><strong>Prestataires techniques :</strong> hébergement (Supabase), services cloud</li>
                <li><strong>Autorités compétentes :</strong> sur demande légale uniquement</li>
              </ul>
              <p>Nous ne vendons jamais vos données personnelles à des tiers.</p>
              <p><strong>[À compléter avec la liste exacte des destinataires]</strong></p>
            </div>
          </div>
        </div>

        {/* Section 5 - Droits des utilisateurs */}
        <div className="hero-part hero-part--search">
          <div className="hero-content">
            <h2 className="text-reveal">
              4. Vos droits (RGPD)
            </h2>
            <div className="text-reveal text-reveal--delay-1">
              <p>Conformément au RGPD, vous disposez des droits suivants :</p>
              <ul>
                <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
                <li><strong>Droit de rectification :</strong> corriger vos données inexactes</li>
                <li><strong>Droit à l'effacement :</strong> supprimer vos données (« droit à l'oubli »)</li>
                <li><strong>Droit à la limitation :</strong> limiter le traitement de vos données</li>
                <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
                <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
                <li><strong>Droit de retirer votre consentement :</strong> à tout moment</li>
              </ul>
              <p>Pour exercer vos droits, contactez-nous à : <strong>[email DPO à compléter]</strong></p>
              <p>Vous pouvez également introduire une réclamation auprès de l'Autorité de Protection des Données (APD) en Belgique.</p>
            </div>
          </div>
        </div>

        {/* Section 6 - Durée de conservation */}
        <div className="hero-part hero-part--register">
          <div className="hero-content">
            <h2 className="text-reveal">
              5. Durée de conservation
            </h2>
            <div className="text-reveal text-reveal--delay-1">
              <p>Vos données sont conservées pendant :</p>
              <ul>
                <li><strong>Profil actif :</strong> tant que votre compte est actif</li>
                <li><strong>Profil inactif :</strong> [À compléter - ex: 3 ans après la dernière connexion]</li>
                <li><strong>Données de connexion :</strong> [À compléter - ex: 12 mois]</li>
              </ul>
              <p>Passé ce délai, vos données sont supprimées ou anonymisées, sauf obligation légale de conservation.</p>
              <p><strong>[À compléter avec les durées précises]</strong></p>
            </div>
          </div>
        </div>

        {/* Section 7 - Sécurité */}
        <div className="hero-part hero-part--transport">
          <div className="hero-content">
            <h2 className="text-reveal">
              6. Sécurité des données
            </h2>
            <div className="text-reveal text-reveal--delay-1">
              <p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre :</p>
              <ul>
                <li>L'accès non autorisé</li>
                <li>La perte ou la destruction</li>
                <li>L'utilisation abusive</li>
                <li>La divulgation non autorisée</li>
              </ul>
              <p>Nos mesures incluent : chiffrement des données, authentification sécurisée, sauvegardes régulières, accès restreint aux données.</p>
            </div>
          </div>
        </div>

        {/* Section 8 - Cookies */}
        <div className="hero-part hero-part--team">
          <div className="hero-content">
            <h2 className="text-reveal">
              7. Cookies et technologies similaires
            </h2>
            <div className="text-reveal text-reveal--delay-1">
              <p>Notre site utilise des cookies pour améliorer votre expérience. Pour en savoir plus, consultez notre <Link href="/politique-cookies" style={{ textDecoration: 'underline' }}>Politique de cookies</Link>.</p>
            </div>
          </div>
        </div>

        {/* Section 9 - Contact */}
        <div className="hero-part hero-part--search">
          <div className="hero-content">
            <h2 className="text-reveal">
              8. Contact - Délégué à la Protection des Données
            </h2>
            <div className="text-reveal text-reveal--delay-1">
              <p>Pour toute question relative à la protection de vos données personnelles :</p>
              <p><strong>Email :</strong> [DPO email à compléter]</p>
              <p><strong>Courrier :</strong> ADK-KASTING, Avenue Maurice 1, 1050 Ixelles, Belgique</p>
              <p><strong>Téléphone :</strong> +32 2 544 09 05</p>
            </div>
          </div>
        </div>

        {/* Section 10 - Mise à jour */}
        <div className="hero-part hero-part--register">
          <div className="hero-content">
            <h2 className="text-reveal">
              9. Mises à jour
            </h2>
            <div className="text-reveal text-reveal--delay-1">
              <p>Cette politique de confidentialité peut être mise à jour. La date de dernière modification est indiquée en haut de cette page.</p>
              <p><strong>Dernière mise à jour :</strong> [Date à compléter]</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
