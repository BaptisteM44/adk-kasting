// pages/conditions-generales.tsx
import React, { useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { Layout } from '@/components/Layout'

export default function ConditionsGeneralesPage() {
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
        <title>Conditions Générales d'Utilisation - ADK-KASTING</title>
        <meta
          name="description"
          content="Conditions Générales d'Utilisation de la plateforme ADK-KASTING."
        />
      </Head>

      <div className="about-page" style={{ backgroundColor: '#ffffff' }}>
        {/* Section 1 - Titre principal */}
        <div className="hero-part hero-part--search">
          <div className="hero-content">
            <h2 className="text-reveal">
              Conditions Générales d'Utilisation
            </h2>
            <p className="text-reveal text-reveal--delay-1">
              Les présentes Conditions Générales d'Utilisation régissent l'accès et l'utilisation de la plateforme ADK-KASTING.
            </p>
          </div>
        </div>

        {/* Section 2 - Objet */}
        <div className="hero-part hero-part--register">
          <div className="hero-content">
            <h2 className="text-reveal">
              1. Objet
            </h2>
            <div className="text-reveal text-reveal--delay-1">
              <p>Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») ont pour objet de définir les modalités et conditions d'utilisation de la plateforme ADK-KASTING accessible à l'adresse <strong>[URL à compléter]</strong>.</p>
              <p>La plateforme ADK-KASTING est un service de mise en relation entre comédiens et professionnels du casting (directeurs de casting, producteurs, etc.).</p>
              <p><strong>[À compléter avec la description précise de vos services]</strong></p>
            </div>
          </div>
        </div>

        {/* Section 3 - Acceptation des conditions */}
        <div className="hero-part hero-part--transport">
          <div className="hero-content">
            <h2 className="text-reveal">
              2. Acceptation des conditions
            </h2>
            <div className="text-reveal text-reveal--delay-1">
              <p>L'accès et l'utilisation de la plateforme impliquent l'acceptation pleine et entière des présentes CGU.</p>
              <p>Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser la plateforme.</p>
              <p>ADK-KASTING se réserve le droit de modifier à tout moment les présentes CGU. Les modifications entrent en vigueur dès leur publication sur le site.</p>
            </div>
          </div>
        </div>

        {/* Section 4 - Inscription */}
        <div className="hero-part hero-part--team">
          <div className="hero-content">
            <h2 className="text-reveal">
              3. Inscription et compte utilisateur
            </h2>
            <div className="text-reveal text-reveal--delay-1">
              <h3>3.1 Conditions d'inscription</h3>
              <p>L'inscription sur la plateforme est gratuite et ouverte :</p>
              <ul>
                <li>Aux comédiens professionnels ou non, domiciliés en Belgique ou au Luxembourg</li>
                <li>À partir de 7 ans (autorisation parentale obligatoire pour les mineurs)</li>
                <li>Aux professionnels du casting (sur validation)</li>
              </ul>

              <h3>3.2 Compte utilisateur</h3>
              <p>Lors de l'inscription, vous vous engagez à :</p>
              <ul>
                <li>Fournir des informations exactes, à jour et complètes</li>
                <li>Maintenir et mettre à jour ces informations</li>
                <li>Garder vos identifiants confidentiels</li>
                <li>Ne pas céder ou transférer votre compte</li>
              </ul>

              <h3>3.3 Validation du profil</h3>
              <p>Votre profil est soumis à validation par notre équipe avant d'être publié sur la plateforme.</p>
              <p><strong>[À compléter avec le processus de validation]</strong></p>
            </div>
          </div>
        </div>

        {/* Section 5 - Services proposés */}
        <div className="hero-part hero-part--search">
          <div className="hero-content">
            <h2 className="text-reveal">
              4. Services proposés
            </h2>
            <div className="text-reveal text-reveal--delay-1">
              <h3>4.1 Pour les comédiens</h3>
              <ul>
                <li>Création d'un profil professionnel</li>
                <li>Publication de photos et vidéos (showreel)</li>
                <li>Visibilité auprès des professionnels du casting</li>
                <li>Modification de votre profil à tout moment</li>
              </ul>

              <h3>4.2 Pour les professionnels du casting</h3>
              <ul>
                <li>Accès à la base de données de comédiens</li>
                <li>Recherche avancée par critères</li>
                <li>Export des fiches comédiens (format PDF)</li>
                <li>Contact direct avec les comédiens ou leurs agents</li>
              </ul>

              <p><strong>Important :</strong> ADK-KASTING est une plateforme de mise en relation. Nous ne sommes pas une agence de comédiens et ne prenons aucune commission sur les cachets.</p>
              <p><strong>[À compléter avec les services détaillés]</strong></p>
            </div>
          </div>
        </div>

        {/* Section 6 - Obligations des utilisateurs */}
        <div className="hero-part hero-part--register">
          <div className="hero-content">
            <h2 className="text-reveal">
              5. Obligations des utilisateurs
            </h2>
            <div className="text-reveal text-reveal--delay-1">
              <p>En utilisant la plateforme, vous vous engagez à :</p>
              <ul>
                <li>Respecter les lois et réglementations en vigueur</li>
                <li>Ne pas diffuser de contenu illégal, offensant ou inapproprié</li>
                <li>Respecter les droits de propriété intellectuelle</li>
                <li>Ne pas utiliser la plateforme à des fins commerciales non autorisées</li>
                <li>Ne pas collecter ou utiliser les données des autres utilisateurs</li>
                <li>Informer ADK-KASTING de tout abus ou dysfonctionnement</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 7 - Propriété intellectuelle */}
        <div className="hero-part hero-part--transport">
          <div className="hero-content">
            <h2 className="text-reveal">
              6. Propriété intellectuelle
            </h2>
            <div className="text-reveal text-reveal--delay-1">
              <h3>6.1 Contenu de la plateforme</h3>
              <p>Tous les éléments de la plateforme (structure, design, logos, textes, etc.) sont protégés par le droit d'auteur et appartiennent à ADK-KASTING.</p>

              <h3>6.2 Contenu utilisateur</h3>
              <p>Vous conservez tous les droits sur le contenu que vous publiez (photos, vidéos, textes).</p>
              <p>En publiant du contenu, vous accordez à ADK-KASTING une licence non-exclusive pour afficher, reproduire et diffuser ce contenu dans le cadre du service.</p>
              <p>Vous garantissez détenir tous les droits nécessaires sur le contenu publié.</p>
            </div>
          </div>
        </div>

        {/* Section 8 - Responsabilités */}
        <div className="hero-part hero-part--team">
          <div className="hero-content">
            <h2 className="text-reveal">
              7. Responsabilités et garanties
            </h2>
            <div className="text-reveal text-reveal--delay-1">
              <h3>7.1 Responsabilité d'ADK-KASTING</h3>
              <p>ADK-KASTING s'efforce d'assurer la disponibilité et la sécurité de la plateforme, mais ne peut garantir :</p>
              <ul>
                <li>L'absence d'interruption ou d'erreur</li>
                <li>La sécurité absolue des données</li>
                <li>L'exactitude des informations fournies par les utilisateurs</li>
              </ul>

              <h3>7.2 Responsabilité de l'utilisateur</h3>
              <p>Vous êtes seul responsable :</p>
              <ul>
                <li>De l'exactitude des informations que vous fournissez</li>
                <li>De l'utilisation de votre compte</li>
                <li>Des relations que vous nouez avec d'autres utilisateurs</li>
              </ul>

              <p><strong>[À compléter avec les limitations de responsabilité spécifiques]</strong></p>
            </div>
          </div>
        </div>

        {/* Section 9 - Protection des données */}
        <div className="hero-part hero-part--search">
          <div className="hero-content">
            <h2 className="text-reveal">
              8. Protection des données personnelles
            </h2>
            <div className="text-reveal text-reveal--delay-1">
              <p>Le traitement de vos données personnelles est détaillé dans notre <Link href="/politique-confidentialite" style={{ textDecoration: 'underline' }}>Politique de confidentialité</Link>.</p>
              <p>Nous nous engageons à respecter le RGPD et les législations applicables en matière de protection des données.</p>
            </div>
          </div>
        </div>

        {/* Section 10 - Résiliation */}
        <div className="hero-part hero-part--register">
          <div className="hero-content">
            <h2 className="text-reveal">
              9. Résiliation
            </h2>
            <div className="text-reveal text-reveal--delay-1">
              <h3>9.1 Par l'utilisateur</h3>
              <p>Vous pouvez supprimer votre compte à tout moment en nous contactant à : info@adk-kasting.com</p>

              <h3>9.2 Par ADK-KASTING</h3>
              <p>Nous nous réservons le droit de suspendre ou supprimer votre compte en cas de :</p>
              <ul>
                <li>Violation des présentes CGU</li>
                <li>Activité frauduleuse ou illégale</li>
                <li>Non-respect des règles de la communauté</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 11 - Droit applicable */}
        <div className="hero-part hero-part--transport">
          <div className="hero-content">
            <h2 className="text-reveal">
              10. Droit applicable et juridiction
            </h2>
            <div className="text-reveal text-reveal--delay-1">
              <p>Les présentes CGU sont régies par le droit belge.</p>
              <p>En cas de litige, les tribunaux de Bruxelles seront seuls compétents.</p>
              <p><strong>[À compléter selon votre juridiction]</strong></p>
            </div>
          </div>
        </div>

        {/* Section 12 - Contact */}
        <div className="hero-part hero-part--team">
          <div className="hero-content">
            <h2 className="text-reveal">
              11. Contact
            </h2>
            <div className="text-reveal text-reveal--delay-1">
              <p>Pour toute question concernant ces CGU :</p>
              <p><strong>Email :</strong> info@adk-kasting.com</p>
              <p><strong>Téléphone :</strong> +32 2 544 09 05</p>
              <p><strong>Adresse :</strong> Avenue Maurice 1, 1050 Ixelles, Belgique</p>
              <p><strong>Dernière mise à jour :</strong> [Date à compléter]</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
