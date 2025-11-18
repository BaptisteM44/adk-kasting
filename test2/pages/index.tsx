// pages/index.tsx
import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Layout } from '@/components/Layout'
import { SEOHead } from '@/components/SEOHead'
import { FilmCarousel } from '@/components/FilmCarousel'
import { CollaborationsSection } from '@/components/CollaborationsSection'
import { Button } from '@/components/ui/Button'
import type { Film } from '@/types'
import filmsData from '@/data/films.json'

export default function HomePage() {
  const [films, setFilms] = useState<Film[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFilms = async () => {
      try {
        // Charger les films depuis l'API Supabase (show_in_hero = true)
        const response = await fetch('/api/films?show_in_hero=true')
        const data = await response.json()

        if (response.ok && data.films) {
          setFilms(data.films as Film[])
        } else {
          // Fallback sur le fichier JSON si l'API échoue
          const activeFilms = filmsData.filter(film => film.is_active)
          setFilms(activeFilms as Film[])
        }
      } catch (error) {
        console.error('Erreur lors du chargement des films:', error)
        // Fallback sur le fichier JSON si l'API échoue
        const activeFilms = filmsData.filter(film => film.is_active)
        setFilms(activeFilms as Film[])
      } finally {
        setLoading(false)
      }
    }

    loadFilms()
  }, [])

  // Intersection Observer pour les animations au scroll
  useEffect(() => {
    console.log('Setting up animations...')
    
    // Animation immédiate pour le carousel au chargement
    setTimeout(() => {
      console.log('Animating film carousel...')
      
      // Animer d'abord l'image et le container
      const filmElements = document.querySelectorAll('.film-image-animate, .film-hero-animate')
      console.log('Film elements found:', filmElements.length)
      filmElements.forEach((el, index) => {
        console.log(`Adding animate class to film element ${index}:`, el.className)
        el.classList.add('animate')
      })
      
      // Puis animer chaque lettre du titre en cascade
      const letters = document.querySelectorAll('.letter-cascade')
      console.log('Letters found:', letters.length)
      letters.forEach((letter, index) => {
        console.log(`Adding animate class to letter ${index}:`, letter.textContent)
        letter.classList.add('animate')
      })
      
      // Enfin animer les indicateurs du carousel en cascade
      const indicators = document.querySelectorAll('.carousel__indicator')
      console.log('Carousel indicators found:', indicators.length)
      indicators.forEach((indicator, index) => {
        console.log(`Adding indicator-animate class to indicator ${index}`)
        indicator.classList.add('indicator-animate')
        // Délai court pour déclencher l'animation
        setTimeout(() => {
          indicator.classList.add('show')
        }, 100)
        
        // Nettoyer les classes d'animation après qu'elles soient finies
        setTimeout(() => {
          indicator.classList.remove('indicator-animate', 'show')
          console.log(`Cleaned animation classes from indicator ${index}`)
        }, 3000) // Après que toutes les animations soient finies
      })
    }, 50) // Réduit de 300ms à 50ms pour apparition plus rapide
    
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          console.log('Animating element:', entry.target.className)
          entry.target.classList.add('animate')
        }
      })
    }, observerOptions)

    // Observer tous les éléments avec animations
    const animatedElements = document.querySelectorAll(
      '.text-reveal, .button-reveal, .film-poster, .hero-appear, .brand-cascade-animate, .film-image-animate'
    )
    console.log('Found animated elements:', animatedElements.length)
    animatedElements.forEach(el => observer.observe(el))

    // Animation pour les éléments hero de la section principale
    setTimeout(() => {
      console.log('Triggering hero section animations...')
      const heroElements = document.querySelectorAll('.hero-appear')
      console.log('Hero section elements found:', heroElements.length)
      heroElements.forEach((el, index) => {
        console.log(`Adding animate class to hero element ${index}:`, el.className)
        el.classList.add('animate')
      })
    }, 600)

    return () => {
      observer.disconnect()
    }
  }, [films])

  return (
    <Layout>
      <SEOHead
        title="ADK-KASTING - Agence de casting professionnelle à Bruxelles"
        description="Découvrez les talents d'ADK-KASTING, agence de casting professionnelle basée à Bruxelles. Trouvez les comédiens parfaits pour vos projets de cinéma, télévision, théâtre et publicité."
        keywords="casting, comédiens, acteurs, actrices, cinéma, télévision, théâtre, publicité, Bruxelles, Belgique, ADK-KASTING"
        url="/"
      />

      {/* Hero avec carousel de films */}
      <FilmCarousel films={films} autoplay autoplayDelay={5000} />

      {/* Zone Hero Principale - 100vh divisée en 2 parties */}
      <div className="main-hero-area hero-appear">
        {/* Première partie - Recherche de comédiens (50vh) */}
        <div className="hero-part hero-part--search hero-appear--delay-1">
          <div className="hero-content">
            <h2 className="text-reveal">
              Vous êtes à la recherche d'un·e comédien·ne ?
            </h2>
            <p className="text-reveal text-reveal--delay-1">
              L'agence ADK-Kasting dispose d'une base de données de près de 3000 comédiens belges et internationaux, professionnels ou non.
              <br />
              Vous aurez accès, sur ce site, à une galerie de plusieurs centaines de comédiens·nes, professionnel·les, non professionnel·les, enfants, adolescents ou adultes. Cette communauté riche et variée est le fruit de plusieurs années de castings sur plus d'une centaine de projets… longs-métrages ou autres.
            </p>
            <button className="hero-button button-reveal">
              Contactez nous
            </button>
          </div>
        </div>

        <div className="hero-part hero-part--register hero-appear--delay-2">
          <div className="hero-content">
            <h2 className="text-reveal text-reveal--delay-2">
              Vous êtes comédien·ne ?
            </h2>
            <p className="text-reveal text-reveal--delay-3">
              ADK-Kasting est en permanence à la recherche de talents.
              <br />
              En vous inscrivant sur ce site, vous créez votre profil et le mettez à jour quand vous le souhaitez. Vous pouvez également ajouter des photos et extraits vidéos. ADK-Kasting.com étant régulièrement utilisé par des réalisateurs, vous augmentez ainsi vos chances de visibilité.
            </p>
            <Link href="/inscription">
              <button className="hero-button button-reveal text-reveal--delay-4">
                Inscrivez vous
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Section Nos Dernières Collaborations */}
      <CollaborationsSection autoScroll={true} />
    </Layout>
  )
}
