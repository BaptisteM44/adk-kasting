import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { Button } from './ui/Button'
import { supabase } from '@/lib/supabase'
import type { Comedien } from '@/types'
import { AdminStars } from './AdminStars'

// Fonction pour calculer l'âge
const calculateAge = (birthDate: string) => {
  if (!birthDate) return null
  const today = new Date()
  const birth = new Date(birthDate)
  const age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  return monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate()) ? age - 1 : age
}

interface ComedienCardProps {
  comedien: Comedien
  isAdmin?: boolean
}

export const ComedienCard: React.FC<ComedienCardProps> = ({ comedien }) => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [loadingPDF, setLoadingPDF] = useState(false)
  const [currentRating, setCurrentRating] = useState(comedien.admin_rating || 0)

  const handleRatingUpdate = (newRating: number) => {
    setCurrentRating(newRating)
  }

  const handleDownloadPDF = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      setLoadingPDF(true)

      // Utiliser le nouveau générateur PDF professionnel
      const { generateComedienPDF } = await import('@/lib/pdf-generator')
      await generateComedienPDF(comedien)

    } catch (error) {
      console.error('Erreur lors du téléchargement du PDF:', error)
      alert('Erreur lors de la génération du PDF')
    } finally {
      setLoadingPDF(false)
    }
  }

  return (
    <Link href={`/comediens/${comedien.id}`}>
      <div className="comedien-card">
        
        {/* Header avec image */}
        <div className="comedien-card__header">
          <div className="comedien-card__image">
            {(() => {
              // Priorité : profile_picture, puis photos array, puis photos WordPress (actor_photo1, actor_photo2, actor_photo3)
              let photoUrl = null;

              if (comedien.profile_picture) {
                photoUrl = comedien.profile_picture;
              } else if (comedien.photos && Array.isArray(comedien.photos) && comedien.photos.length > 0) {
                photoUrl = comedien.photos[0];
              } else if (comedien.actor_photo1) {
                photoUrl = comedien.actor_photo1;
              } else if (comedien.actor_photo2) {
                photoUrl = comedien.actor_photo2;
              } else if (comedien.actor_photo3) {
                photoUrl = comedien.actor_photo3;
              }

              return photoUrl ? (
                <img
                  src={photoUrl}
                  alt={`Photo de ${comedien.display_name}`}
                  onError={(e) => {
                    // Si l'image ne charge pas, afficher le placeholder
                    e.currentTarget.style.display = 'none';
                    const placeholder = e.currentTarget.nextElementSibling;
                    if (placeholder) placeholder.classList.remove('hidden');
                  }}
                />
              ) : null;
            })()}
            <div className={`comedien-card__placeholder ${(() => {
              const hasPhoto = comedien.profile_picture || (comedien.photos && comedien.photos.length > 0) || comedien.actor_photo1 || comedien.actor_photo2 || comedien.actor_photo3;
              return hasPhoto ? 'hidden' : '';
            })()}`}>
              <span>Photo non disponible</span>
            </div>
          </div>
          
                  
          {/* Contrôles admin (overlay) */}
          {isAdmin && (
            <div className="comedien-card__controls">
              {/* Bouton PDF */}
              <button
                onClick={handleDownloadPDF}
                disabled={loadingPDF}
                className="comedien-card__pdf-badge"
                title="Télécharger la fiche PDF"
              >
                {loadingPDF ? '⏳' : '📄'}
              </button>

              {/* Étoiles admin */}
              <div className="comedien-card__rating">
                <AdminStars 
                  comedienId={comedien.id}
                  rating={currentRating}
                  isAdmin={isAdmin}
                  size="small"
                  onRatingUpdate={handleRatingUpdate}
                />
              </div>
            </div>
          )}
        </div>

        {/* Informations (visibles par défaut, glissent vers le haut au hover) */}
        <div className="comedien-card__info">
          <h3 className="comedien-card__name text-body">
            {comedien.first_name} {comedien.last_name}
          </h3>
          {comedien.birth_date && (
            <p className="comedien-card__age text-body">
              {calculateAge(comedien.birth_date)} ans
            </p>
          )}

          <p className="comedien-card__detail text-body">
            <a
              href={`mailto:${comedien.email}`}
              className="comedien-card__email"
              onClick={(e) => e.stopPropagation()}
            >
              {comedien.email}
            </a>
          </p>

          {comedien.phone && (
            <p className="comedien-card__detail">
              <a 
                href={`tel:${comedien.phone}`} 
                className="comedien-card__phone"
                onClick={(e) => e.stopPropagation()}
              >
                {comedien.phone}
              </a>
            </p>
          )}

          {comedien.domiciliation && (
            <p className="comedien-card__detail">{comedien.domiciliation}</p>
          )}
        </div>
      </div>
    </Link>
  )
}
