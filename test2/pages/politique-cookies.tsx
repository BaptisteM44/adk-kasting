// pages/politique-cookies.tsx
import React, { useEffect } from 'react'
import Head from 'next/head'
import { Layout } from '@/components/Layout'

export default function PolitiqueCookiesPage() {
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
        <title>Politique de cookies - ADK-KASTING</title>
        <meta
          name="description"
          content="Information sur l'utilisation des cookies sur le site ADK-KASTING."
        />
      </Head>

      <div className="about-page" style={{ backgroundColor: '#ffffff' }}>
        {/* Section 1 - Titre principal */}
        <div className="hero-part hero-part--search">
          <div className="hero-content">
            <h2 className="text-reveal">
              Politique de cookies
            </h2>
            <p className="text-reveal text-reveal--delay-1">
              Cette page vous informe sur l'utilisation des cookies et technologies similaires sur notre site.
            </p>
          </div>
        </div>

        {/* Section 2 - Qu'est-ce qu'un cookie */}
        <div className="hero-part hero-part--register">
          <div className="hero-content">
            <h2 className="text-reveal">
              1. Qu'est-ce qu'un cookie ?
            </h2>
            <div className="text-reveal text-reveal--delay-1">
              <p>Un cookie est un petit fichier texte déposé sur votre ordinateur, tablette ou smartphone lors de la visite d'un site web.</p>
              <p>Les cookies permettent au site de reconnaître votre appareil et de mémoriser certaines informations sur vos préférences ou actions passées.</p>
              <p>Les cookies ne contiennent aucun virus et ne peuvent pas accéder à vos fichiers personnels.</p>
            </div>
          </div>
        </div>

        {/* Section 3 - Types de cookies */}
        <div className="hero-part hero-part--transport">
          <div className="hero-content">
            <h2 className="text-reveal">
              2. Types de cookies utilisés
            </h2>
            <div className="text-reveal text-reveal--delay-1">
              <h3>2.1 Cookies strictement nécessaires</h3>
              <p>Ces cookies sont essentiels au fonctionnement du site. Ils permettent :</p>
              <ul>
                <li>La navigation sur le site</li>
                <li>L'accès aux zones sécurisées (compte utilisateur)</li>
                <li>La mémorisation de votre session de connexion</li>
              </ul>
              <p>Ces cookies ne peuvent pas être désactivés sans compromettre le fonctionnement du site.</p>

              <h3>2.2 Cookies de performance</h3>
              <p>Ces cookies collectent des informations sur la façon dont les visiteurs utilisent notre site :</p>
              <ul>
                <li>Pages les plus visitées</li>
                <li>Temps passé sur le site</li>
                <li>Messages d'erreur rencontrés</li>
              </ul>
              <p>Ces informations sont utilisées pour améliorer le site et sont anonymes.</p>

              <h3>2.3 Cookies de fonctionnalité</h3>
              <p>Ces cookies permettent au site de mémoriser vos choix et préférences :</p>
              <ul>
                <li>Langue préférée</li>
                <li>Préférences de filtrage</li>
                <li>Paramètres d'affichage</li>
              </ul>

              <h3>2.4 Cookies tiers</h3>
              <p>Nous utilisons des services tiers qui peuvent déposer des cookies :</p>
              <ul>
                <li><strong>Google Analytics :</strong> analyse d'audience (si applicable)</li>
                <li><strong>Réseaux sociaux :</strong> boutons de partage Facebook, Instagram</li>
              </ul>
              <p><strong>[À compléter avec les cookies tiers réellement utilisés]</strong></p>
            </div>
          </div>
        </div>

        {/* Section 4 - Finalités */}
        <div className="hero-part hero-part--team">
          <div className="hero-content">
            <h2 className="text-reveal">
              3. Finalités de l'utilisation des cookies
            </h2>
            <div className="text-reveal text-reveal--delay-1">
              <p>Nous utilisons des cookies pour :</p>
              <ul>
                <li><strong>Sécurité :</strong> protéger votre compte et prévenir la fraude</li>
                <li><strong>Fonctionnement :</strong> assurer le bon fonctionnement du site</li>
                <li><strong>Performance :</strong> analyser l'utilisation et améliorer nos services</li>
                <li><strong>Personnalisation :</strong> mémoriser vos préférences</li>
                <li><strong>Statistiques :</strong> comprendre comment nos utilisateurs naviguent</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 5 - Durée de conservation */}
        <div className="hero-part hero-part--search">
          <div className="hero-content">
            <h2 className="text-reveal">
              4. Durée de conservation des cookies
            </h2>
            <div className="text-reveal text-reveal--delay-1">
              <p>La durée de conservation des cookies varie selon leur type :</p>
              <ul>
                <li><strong>Cookies de session :</strong> supprimés à la fermeture du navigateur</li>
                <li><strong>Cookies persistants :</strong> conservés pendant [durée à compléter - ex: 12 mois]</li>
                <li><strong>Cookies analytiques :</strong> [durée à compléter selon le service]</li>
              </ul>
              <p><strong>[À compléter avec les durées exactes]</strong></p>
            </div>
          </div>
        </div>

        {/* Section 6 - Gestion des cookies */}
        <div className="hero-part hero-part--register">
          <div className="hero-content">
            <h2 className="text-reveal">
              5. Comment gérer les cookies ?
            </h2>
            <div className="text-reveal text-reveal--delay-1">
              <h3>5.1 Paramètres de votre navigateur</h3>
              <p>Vous pouvez configurer votre navigateur pour refuser les cookies ou être averti avant d'accepter un cookie.</p>

              <p><strong>Instructions par navigateur :</strong></p>
              <ul>
                <li><strong>Google Chrome :</strong> Menu &gt; Paramètres &gt; Confidentialité et sécurité &gt; Cookies</li>
                <li><strong>Firefox :</strong> Menu &gt; Options &gt; Vie privée et sécurité &gt; Cookies</li>
                <li><strong>Safari :</strong> Préférences &gt; Confidentialité &gt; Cookies</li>
                <li><strong>Edge :</strong> Paramètres &gt; Confidentialité &gt; Cookies</li>
              </ul>

              <h3>5.2 Outils de gestion</h3>
              <p>Pour gérer les cookies analytiques et publicitaires :</p>
              <ul>
                <li><strong>Google Analytics :</strong> <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>Extension de désactivation</a></li>
                <li><strong>Vos choix en ligne :</strong> <a href="https://www.youronlinechoices.com/be-fr" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>Your Online Choices</a></li>
              </ul>

              <h3>5.3 Conséquences du refus</h3>
              <p>Le refus des cookies peut entraîner :</p>
              <ul>
                <li>L'impossibilité d'accéder à certaines fonctionnalités</li>
                <li>Une expérience utilisateur dégradée</li>
                <li>La nécessité de ressaisir vos informations à chaque visite</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 7 - Cookies des réseaux sociaux */}
        <div className="hero-part hero-part--transport">
          <div className="hero-content">
            <h2 className="text-reveal">
              6. Cookies des réseaux sociaux
            </h2>
            <div className="text-reveal text-reveal--delay-1">
              <p>Notre site peut intégrer des boutons de partage vers les réseaux sociaux (Facebook, Instagram). Ces plateformes peuvent déposer des cookies lors de votre navigation.</p>
              <p>Nous vous invitons à consulter les politiques de confidentialité de ces réseaux :</p>
              <ul>
                <li><strong>Facebook :</strong> <a href="https://www.facebook.com/privacy/explanation" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>Politique de cookies</a></li>
                <li><strong>Instagram :</strong> <a href="https://help.instagram.com/1896641480634370" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>Politique de cookies</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 8 - Mise à jour */}
        <div className="hero-part hero-part--team">
          <div className="hero-content">
            <h2 className="text-reveal">
              7. Mise à jour de la politique
            </h2>
            <div className="text-reveal text-reveal--delay-1">
              <p>Cette politique de cookies peut être modifiée à tout moment pour refléter les changements dans nos pratiques ou pour se conformer aux exigences légales.</p>
              <p>Nous vous encourageons à consulter régulièrement cette page.</p>
              <p><strong>Dernière mise à jour :</strong> [Date à compléter]</p>
            </div>
          </div>
        </div>

        {/* Section 9 - Contact */}
        <div className="hero-part hero-part--search">
          <div className="hero-content">
            <h2 className="text-reveal">
              8. Contact
            </h2>
            <div className="text-reveal text-reveal--delay-1">
              <p>Pour toute question concernant notre utilisation des cookies :</p>
              <p><strong>Email :</strong> info@adk-kasting.com</p>
              <p><strong>Téléphone :</strong> +32 2 544 09 05</p>
              <p><strong>Adresse :</strong> Avenue Maurice 1, 1050 Ixelles, Belgique</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
