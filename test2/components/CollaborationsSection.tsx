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
  const isDraggingRef = useRef(false) // Flag pour arrêter l'auto-scroll pendant le drag

  // Créer une liste infinie de films en les dupliquant
  const infiniteFilms = films.length > 0 ? [
    ...films,
    ...films.map(film => ({ ...film, id: `${film.id}_copy1` })),
    ...films.map(film => ({ ...film, id: `${film.id}_copy2` })),
    ...films.map(film => ({ ...film, id: `${film.id}_copy3` }))
  ] : []

  useEffect(() => {
    const loadFilms = async () => {
      try {
        // Charger les films depuis l'API Supabase (show_in_collaborations = true)
        const response = await fetch('/api/films?show_in_collaborations=true')
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

  // Drag horizontal - fonctionne toujours, arrête l'auto-scroll pendant le drag
  useEffect(() => {
    const filmsGrid = filmsGridRef.current
    if (!filmsGrid) return

    let isDown = false
    let startX: number
    let scrollLeft: number

    const handleMouseDown = (e: MouseEvent) => {
      isDown = true
      isDraggingRef.current = true // Arrêter l'auto-scroll
      filmsGrid.classList.add('dragging')
      startX = e.pageX - filmsGrid.offsetLeft
      scrollLeft = filmsGrid.scrollLeft
      e.preventDefault()
    }

    const handleMouseLeave = () => {
      isDown = false
      isDraggingRef.current = false // Reprendre l'auto-scroll
      filmsGrid.classList.remove('dragging')
    }

    const handleMouseUp = () => {
      isDown = false
      isDraggingRef.current = false // Reprendre l'auto-scroll
      filmsGrid.classList.remove('dragging')
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return
      e.preventDefault()
      const x = e.pageX - filmsGrid.offsetLeft
      const walk = (x - startX) * 2
      filmsGrid.scrollLeft = scrollLeft - walk
    }

    // Touch events pour mobile
    const handleTouchStart = (e: TouchEvent) => {
      isDown = true
      isDraggingRef.current = true
      filmsGrid.classList.add('dragging')
      startX = e.touches[0].pageX - filmsGrid.offsetLeft
      scrollLeft = filmsGrid.scrollLeft
    }

    const handleTouchEnd = () => {
      isDown = false
      isDraggingRef.current = false
      filmsGrid.classList.remove('dragging')
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDown) return
      const x = e.touches[0].pageX - filmsGrid.offsetLeft
      const walk = (x - startX) * 2
      filmsGrid.scrollLeft = scrollLeft - walk
    }

    filmsGrid.addEventListener('mousedown', handleMouseDown)
    filmsGrid.addEventListener('mouseleave', handleMouseLeave)
    filmsGrid.addEventListener('mouseup', handleMouseUp)
    filmsGrid.addEventListener('mousemove', handleMouseMove)
    filmsGrid.addEventListener('touchstart', handleTouchStart)
    filmsGrid.addEventListener('touchend', handleTouchEnd)
    filmsGrid.addEventListener('touchmove', handleTouchMove)

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

  // Auto-scroll simplifié - s'arrête pendant le drag
  useEffect(() => {
    if (!autoScroll) return

    const filmsGrid = filmsGridRef.current
    if (!filmsGrid || infiniteFilms.length === 0) return

    let animationId: number
    const scrollSpeed = 0.8

    const smoothScroll = () => {
      // Ne pas scroller si l'utilisateur est en train de drag
      if (filmsGrid && !isDraggingRef.current) {
        const currentScroll = filmsGrid.scrollLeft
        const maxScroll = filmsGrid.scrollWidth - filmsGrid.clientWidth

        // Reset quand on arrive aux 3/4 pour créer une boucle infinie
        if (currentScroll >= maxScroll * 0.66) {
          filmsGrid.scrollLeft = 0
        } else {
          filmsGrid.scrollLeft = currentScroll + scrollSpeed
        }
      }
      animationId = requestAnimationFrame(smoothScroll)
    }

    // Démarrage de l'auto-scroll
    animationId = requestAnimationFrame(smoothScroll)

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
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