// components/FilmCarousel.tsx
import React, { useState, useEffect } from 'react'
import type { Film } from '@/types'

interface FilmCarouselProps {
  films: Film[]
  autoplay?: boolean
  autoplayDelay?: number
}

export const FilmCarousel: React.FC<FilmCarouselProps> = ({
  films,
  autoplay = true,
  autoplayDelay = 5000
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imagesPreloaded, setImagesPreloaded] = useState<Set<number>>(new Set())
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null)

  // Précharger l'image courante
  useEffect(() => {
    if (!films[currentIndex]?.image_url) return

    setImageLoaded(false)
    const img = new Image()
    img.src = films[currentIndex].image_url
    img.onload = () => {
      setImageLoaded(true)
      setImagesPreloaded(prev => new Set(prev).add(currentIndex))
    }
  }, [currentIndex, films])

  // Précharger les images suivantes en arrière-plan
  useEffect(() => {
    films.forEach((film, index) => {
      if (!imagesPreloaded.has(index) && film.image_url) {
        const img = new Image()
        img.src = film.image_url
        img.onload = () => {
          setImagesPreloaded(prev => new Set(prev).add(index))
        }
      }
    })
  }, [films, imagesPreloaded])

  // Autoplay avec ref pour pouvoir reset le timer
  const startAutoplay = React.useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    if (autoplay && films.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === films.length - 1 ? 0 : prevIndex + 1
        )
      }, autoplayDelay)
    }
  }, [autoplay, autoplayDelay, films.length])

  useEffect(() => {
    startAutoplay()
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [startAutoplay])

  // Image par défaut pour chargement instantané
  const defaultFilm = {
    id: 'default',
    title: "l'art d'être heureux",
    year: 2013,
    image_url: "/images/films/l'artd'êtreheureux.webp"
  }

  const currentFilm = films.length > 0 ? films[currentIndex] : defaultFilm

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    startAutoplay() // Reset le timer
  }

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? films.length - 1 : currentIndex - 1)
    startAutoplay() // Reset le timer
  }

  const goToNext = () => {
    setCurrentIndex(currentIndex === films.length - 1 ? 0 : currentIndex + 1)
    startAutoplay() // Reset le timer
  }

  return (
    <div className="hero film-hero-animate">
      <div className="hero__background film-background-animate">
        <img
          key={currentFilm.id}
          src={currentFilm.image_url}
          alt={currentFilm.title}
          className="film-image-animate"
        />
      </div>

      <div className="hero__overlay" />

      {/* Texte ADK-KASTING comme dans l'image - cascade d'apparition */}
      <div className="hero__brand brand-cascade-animate">
        <span className="letter-cascade" data-delay="0">A</span>
        <span className="letter-cascade" data-delay="1">D</span>
        <span className="letter-cascade" data-delay="2">K</span>
        <span className="letter-cascade" data-delay="3">-</span>
        <span className="letter-cascade" data-delay="4">K</span>
        <span className="letter-cascade" data-delay="5">A</span>
        <span className="letter-cascade" data-delay="6">S</span>
        <span className="letter-cascade" data-delay="7">T</span>
        <span className="letter-cascade" data-delay="8">I</span>
        <span className="letter-cascade" data-delay="9">N</span>
        <span className="letter-cascade" data-delay="10">G</span>
      </div>
      <div className="hero__film-info">
        <div className="hero__film-info-content">
          <h2>{currentFilm.title}</h2>
          <p>({currentFilm.year})</p>
        </div>
      </div>

      {/* Navigation */}
      {films.length > 1 && (
        <>
          {/* Indicateurs */}
          <div className="carousel__indicators">
            {films.map((_, index) => {
              // Détermine l'état de chaque barre
              const isCompleted = index < currentIndex
              const isActive = index === currentIndex
              const isPending = index > currentIndex
              
              return (
                <div
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`carousel__indicator ${
                    isCompleted ? 'carousel__indicator--completed' :
                    isActive ? 'carousel__indicator--active' : 
                    'carousel__indicator--pending'
                  }`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Aller au film ${index + 1}`}
                >
                  {isActive && (
                    <div 
                      key={`progress-${currentIndex}`} // Force la re-création de l'animation
                      className="carousel__indicator-progress"
                      style={{
                        animationDuration: `${autoplayDelay}ms`
                      }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
