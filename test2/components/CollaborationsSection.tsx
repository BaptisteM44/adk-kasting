// components/CollaborationsSection.tsx
import React, { useState, useEffect, useRef } from 'react'
import type { Film } from '@/types'
import filmsData from '@/data/films.json'

interface CollaborationsSectionProps {
  autoScroll?: boolean
}

export const CollaborationsSection: React.FC<CollaborationsSectionProps> = ({ 
  autoScroll = false 
}) => {
  const [films, setFilms] = useState<Film[]>([])
  const [loading, setLoading] = useState(true)
  const filmsGridRef = useRef<HTMLDivElement>(null)
  const posterRefs = useRef<HTMLDivElement[]>([])

  // Créer une liste infinie de films en les dupliquant
  const infiniteFilms = films.length > 0 ? [
    ...films,
    ...films.map(film => ({ ...film, id: `${film.id}_copy1` })),
    ...films.map(film => ({ ...film, id: `${film.id}_copy2` })),
    ...films.map(film => ({ ...film, id: `${film.id}_copy3` }))
  ] : []

  useEffect(() => {
    const loadFilms = () => {
      try {
        // Charger les films depuis le fichier JSON local
        const activeFilms = filmsData.filter(film => film.is_active)
        setFilms(activeFilms as Film[])
      } catch (error) {
        console.error('Erreur lors du chargement des films:', error)
        setFilms([])
      } finally {
        setLoading(false)
      }
    }

    loadFilms()
  }, [])

  // Drag horizontal pour faire défiler les affiches
  useEffect(() => {
    const filmsGrid = filmsGridRef.current
    if (!filmsGrid) return

    let isDown = false
    let startX: number
    let scrollLeft: number

    const handleMouseDown = (e: MouseEvent) => {
      isDown = true
      filmsGrid.classList.add('dragging')
      startX = e.pageX - filmsGrid.offsetLeft
      scrollLeft = filmsGrid.scrollLeft
      e.preventDefault()
    }

    const handleMouseLeave = () => {
      isDown = false
      filmsGrid.classList.remove('dragging')
    }

    const handleMouseUp = () => {
      isDown = false
      filmsGrid.classList.remove('dragging')
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return
      e.preventDefault()
      const x = e.pageX - filmsGrid.offsetLeft
      const walk = (x - startX) * 2 // Vitesse de scroll
      filmsGrid.scrollLeft = scrollLeft - walk
    }

    // Touch events pour mobile
    const handleTouchStart = (e: TouchEvent) => {
      isDown = true
      filmsGrid.classList.add('dragging')
      startX = e.touches[0].pageX - filmsGrid.offsetLeft
      scrollLeft = filmsGrid.scrollLeft
    }

    const handleTouchEnd = () => {
      isDown = false
      filmsGrid.classList.remove('dragging')
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDown) return
      const x = e.touches[0].pageX - filmsGrid.offsetLeft
      const walk = (x - startX) * 2
      filmsGrid.scrollLeft = scrollLeft - walk
    }

    // Ajouter les événements
    filmsGrid.addEventListener('mousedown', handleMouseDown)
    filmsGrid.addEventListener('mouseleave', handleMouseLeave)
    filmsGrid.addEventListener('mouseup', handleMouseUp)
    filmsGrid.addEventListener('mousemove', handleMouseMove)
    filmsGrid.addEventListener('touchstart', handleTouchStart)
    filmsGrid.addEventListener('touchend', handleTouchEnd)
    filmsGrid.addEventListener('touchmove', handleTouchMove)

    // Cleanup
    return () => {
      filmsGrid.removeEventListener('mousedown', handleMouseDown)
      filmsGrid.removeEventListener('mouseleave', handleMouseLeave)
      filmsGrid.removeEventListener('mouseup', handleMouseUp)
      filmsGrid.removeEventListener('mousemove', handleMouseMove)
      filmsGrid.removeEventListener('touchstart', handleTouchStart)
      filmsGrid.removeEventListener('touchend', handleTouchEnd)
      filmsGrid.removeEventListener('touchmove', handleTouchMove)
    }
  }, [films])

  // Auto-scroll simple et efficace (seulement pour la page d'accueil)
  useEffect(() => {
    if (!autoScroll) return
    
    const filmsGrid = filmsGridRef.current
    if (!filmsGrid || infiniteFilms.length === 0) return

    let animationId: number
    let isUserInteracting = false
    const scrollSpeed = 1.2

    const smoothScroll = () => {
      if (filmsGrid && !isUserInteracting) {
        const currentScroll = filmsGrid.scrollLeft
        const maxScroll = filmsGrid.scrollWidth - filmsGrid.clientWidth
        
        if (currentScroll >= maxScroll * 0.75) {
          filmsGrid.scrollLeft = 0
        } else {
          filmsGrid.scrollLeft = currentScroll + scrollSpeed
        }
      }
      animationId = requestAnimationFrame(smoothScroll)
    }

    // Pause sur interaction utilisateur
    const pauseScroll = () => { 
      isUserInteracting = true 
    }
    const resumeScroll = () => { 
      setTimeout(() => { 
        isUserInteracting = false 
      }, 1500) 
    }

    // Events pour pauser/reprendre
    filmsGrid.addEventListener('mouseenter', pauseScroll)
    filmsGrid.addEventListener('mouseleave', resumeScroll)
    filmsGrid.addEventListener('mousedown', pauseScroll)
    filmsGrid.addEventListener('touchstart', pauseScroll)

    // Démarrage de l'auto-scroll
    animationId = requestAnimationFrame(smoothScroll)

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      filmsGrid.removeEventListener('mouseenter', pauseScroll)
      filmsGrid.removeEventListener('mouseleave', resumeScroll)
      filmsGrid.removeEventListener('mousedown', pauseScroll)
      filmsGrid.removeEventListener('touchstart', pauseScroll)
    }
  }, [infiniteFilms, autoScroll])

  return (
    <section className="collaborations-section" style={{ backgroundColor: '#F0F0F0' }}>
      <div className="collaborations-container">
        <h2>Nos Dernières Collaborations</h2>
        <div 
          ref={filmsGridRef}
          className="films-grid morphing-grid"
        >
          {loading ? (
            <p>Chargement des films...</p>
          ) : (
            infiniteFilms.map((film, index) => (
              <div 
                key={film.id} 
                ref={(el) => {
                  if (el) posterRefs.current[index] = el
                }}
                className="film-poster morphing-poster"
                data-film-id={film.id}
              >
                <div className="poster-inner">
                  <img 
                    src={film.image_url} 
                    alt={film.title}
                    onError={(e) => {
                      e.currentTarget.src = '/images/films/placeholder.jpg'
                    }}
                  />
                </div>
                <div className="film-info">
                  <h3>{film.title},{film.year}</h3>
                  <p></p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}