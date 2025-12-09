// pages/about.tsx
import React, { useEffect } from 'react'
import Head from 'next/head'
import { Layout } from '@/components/Layout'

export default function AboutPage() {
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
        <title>À propos - ADK-KASTING</title>
        <meta 
          name="description" 
          content="Découvrez l'histoire et la mission d'ADK-KASTING, l'agence de casting belge." 
        />
      </Head>

      <div className="about-page" style={{ backgroundColor: '#F0F0F0', minHeight: '100vh' }}>
        {/* Section 1 - Similaire à "Vous êtes à la recherche d'un comédien" */}
        <div className="hero-part hero-part--search">
          <div className="hero-content">
            <h2 className="text-reveal">
              Qui sommes-nous ?
            </h2>
            <p className="text-reveal text-reveal--delay-1">
              Depuis 2004, ADK-KASTING œuvre principalement dans le casting de fiction cinématographique, courts et longs métrages. ADK-KASTING offre aux comédiens la possibilité de mettre en lumière leur profil. 
              <br /> Mais ADK-KASTING NE SE VEUT PAS, pour autant, agence de comédiens. Le but n’est pas ici de VENDRE qui que ce soit plutôt qu’un(e) autre. 
              <br /> Elle NE SE VEUT PAS NON PLUS simple vitrine de comédiens. Il s’agit bien d’une structure désirée par un.e directeurice de casting dans le but d’optimaliser leur travail. Leur seule philosophie est de se mettre au service de votre envie, de votre vision, de votre projet.
            </p>
            <a href="mailto:info@adk-kasting.com" className="hero-button button-reveal">
              Contactez-nous
            </a>
          </div>
        </div>

        {/* Section 2 - Notre philosophie (sans bouton) */}
        <div className="hero-part hero-part--register">
          <div className="hero-content">
            <h2 className="text-reveal text-reveal--delay-2">
              Notre philosophie
            </h2>
            <p className="text-reveal text-reveal--delay-3">
              La société se distingue des autres agences ou directeurs de castings par deux éléments qui lui tiennent à cœur :
            </p>
            <p className="text-reveal text-reveal--delay-3 bullet-list">
              • Une offre abondante sans cesse renouvelée d'extraits vidéos plus à même de rendre compte du talent d'un comédien que ne pourrait le faire une simple photo.
              <br /><br />
              • Un mélange équilibré de comédiens professionnels, à l'expérience riche et variée et de comédiens non professionnels au talent étonnant. Ce mélange trouve sa source dans l'historique de la société qui a fait ses gammes autour de personnalités telles que Benoît Mariage et Bouli Lanners qui favorisent ce type de rencontres.
            </p>
          </div>
        </div>

        {/* Section 3 - Google Maps */}
        <div className="map-section">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5041.6006978547875!2d4.376618912648913!3d50.8163376608332!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c3c46405a8cde5%3A0x1ab7b983e081e3a7!2sADK-Kasting!5e0!3m2!1sfr!2sbe!4v1762183909561!5m2!1sfr!2sbe"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Localisation ADK-KASTING"
          />
        </div>

        {/* Section 4 - Les moyens de transport (sans bouton) */}
        <div className="hero-part hero-part--transport">
          <div className="hero-content">
            <h2 className="text-reveal">
              Les moyens de transport
            </h2>
            <p className="text-reveal text-reveal--delay-1">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.
            </p>
          </div>
        </div>

        {/* Section 5 - L'équipe (format cohérent avec les autres sections) */}
        <div className="hero-part hero-part--team">
          <div className="hero-content">
            <h2 className="text-reveal">
              L'équipe
            </h2>
            
            <div className="team-members-row">
              {/* Personne 1 */}
              <div className="team-member text-reveal text-reveal--delay-1">
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%', 
                  backgroundColor: '#D9D9D9',
                  margin: '20px 0em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  color: 'white',
                }}>
                  BM
                </div>
                <h3>BIER MICHAËL</h3>
                <h4>Créateur de la société</h4>
                <p>Directeur de casting</p>
              </div>

              {/* Personne 2 */}
              <div className="team-member text-reveal text-reveal--delay-2">
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%', 
                  backgroundColor: '#D9D9D9',
                  margin: '20px 0em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  color: 'white',
                }}>
                  DF
                </div>
                <h3>DORIANE FLAMAND</h3>
                <p>Directrice de casting</p>
              </div>
            </div>
            
            <p className="text-reveal text-reveal--delay-3 team-description">
                La société accueille également des stagiaires, futur.es réalisateurices ou comédien.nes en vue de compléter leur formation. Pour plus d'infos à ce sujet, n'hésitez pas à nous contacter.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
