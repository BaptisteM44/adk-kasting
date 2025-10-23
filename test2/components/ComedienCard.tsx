import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { Button } from './ui/Button'
import { jsPDF } from 'jspdf'
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
      
      // Création directe du PDF avec jsPDF
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 20
      let yPosition = 30

      // Titre centré
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text(comedien.display_name, pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 15

      // Ligne de séparation
      doc.setLineWidth(0.5)
      doc.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 15

      // Informations personnelles
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('INFORMATIONS PERSONNELLES', margin, yPosition)
      yPosition += 10

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      
      const personalInfo = [
        `Nom: ${comedien.first_name} ${comedien.last_name}`,
        `Email: ${comedien.email}`,
        `Téléphone: ${comedien.phone}`,
        ...(comedien.phone_fixe ? [`Téléphone fixe: ${comedien.phone_fixe}`] : []),
        `Domiciliation: ${comedien.domiciliation}`,
        ...(comedien.city ? [`Ville: ${comedien.city}`] : []),
        ...(comedien.zip_code ? [`Code postal: ${comedien.zip_code}`] : []),
        `Âge: ${comedien.age ? comedien.age + ' ans' : 'Non spécifié'}`,
        ...(comedien.nationality ? [`Nationalité: ${comedien.nationality}`] : [])
      ]

      personalInfo.forEach(info => {
        doc.text(info, margin, yPosition)
        yPosition += 6
      })

      // Caractéristiques physiques
      yPosition += 10
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('CARACTÉRISTIQUES PHYSIQUES', margin, yPosition)
      yPosition += 10

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      
      const physicalInfo = [
        ...(comedien.height ? [`Taille: ${comedien.height} cm`] : []),
        ...(comedien.build ? [`Corpulence: ${comedien.build}`] : []),
        ...(comedien.ethnicity ? [`Type: ${comedien.ethnicity}`] : []),
        ...(comedien.hair_color ? [`Couleur des cheveux: ${comedien.hair_color}`] : []),
        ...(comedien.eye_color ? [`Couleur des yeux: ${comedien.eye_color}`] : [])
      ]

      physicalInfo.forEach(info => {
        doc.text(info, margin, yPosition)
        yPosition += 6
      })

      // Langues
      yPosition += 10
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('LANGUES', margin, yPosition)
      yPosition += 10

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      
      const languageInfo = [
        ...(comedien.languages && comedien.languages.length > 0 ? [`Maternelle: ${comedien.languages.join(', ')}`] : []),
        ...(comedien.languages_fluent && comedien.languages_fluent.length > 0 ? [`Couramment: ${comedien.languages_fluent.join(', ')}`] : []),
        ...(comedien.languages_notions && comedien.languages_notions.length > 0 ? [`Notions: ${comedien.languages_notions.join(', ')}`] : [])
      ]

      languageInfo.forEach(info => {
        doc.text(info, margin, yPosition)
        yPosition += 6
      })

      // Compétences
      yPosition += 10
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('COMPÉTENCES', margin, yPosition)
      yPosition += 10

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      
      const skillsInfo = [
        ...(comedien.experience_level ? [`Expérience: ${comedien.experience_level}`] : []),
        ...(comedien.driving_licenses && comedien.driving_licenses.length > 0 ? [`Permis: ${comedien.driving_licenses.join(', ')}`] : []),
        ...(comedien.diverse_skills && comedien.diverse_skills.length > 0 ? [`Compétences diverses: ${comedien.diverse_skills.join(', ')}`] : []),
        ...(comedien.dance_skills && comedien.dance_skills.length > 0 ? [`Danse: ${comedien.dance_skills.join(', ')}`] : []),
        ...(comedien.music_skills && comedien.music_skills.length > 0 ? [`Musique: ${comedien.music_skills.join(', ')}`] : []),
        ...(comedien.desired_activities && comedien.desired_activities.length > 0 ? [`Activités désirées: ${comedien.desired_activities.join(', ')}`] : [])
      ]

      skillsInfo.forEach(info => {
        doc.text(info, margin, yPosition)
        yPosition += 6
      })

      // Agent/Agence
      if (comedien.agency_name || comedien.agent_name) {
        yPosition += 10
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('AGENT / AGENCE', margin, yPosition)
        yPosition += 10

        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        
        const agentInfo = [
          ...(comedien.agency_name ? [`Agence: ${comedien.agency_name}`] : []),
          ...(comedien.agent_name ? [`Agent: ${comedien.agent_name}`] : []),
          ...(comedien.agent_email ? [`Email agent: ${comedien.agent_email}`] : []),
          ...(comedien.agent_phone ? [`Téléphone agent: ${comedien.agent_phone}`] : [])
        ]

        agentInfo.forEach(info => {
          doc.text(info, margin, yPosition)
          yPosition += 6
        })
      }

      // Liens et médias
      const hasLinks = comedien.website_url || comedien.imdb_url || comedien.showreel_url
      if (hasLinks) {
        yPosition += 10
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('LIENS ET MÉDIAS', margin, yPosition)
        yPosition += 10

        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        
        const linksInfo = [
          ...(comedien.website_url ? [`Site web: ${comedien.website_url}`] : []),
          ...(comedien.imdb_url ? [`IMDB: ${comedien.imdb_url}`] : []),
          ...(comedien.showreel_url ? [`Showreel: ${comedien.showreel_url}`] : []),
          ...(comedien.video_1_url ? [`Vidéo 1: ${comedien.video_1_url}`] : []),
          ...(comedien.facebook_url ? [`Facebook: ${comedien.facebook_url}`] : []),
          ...(comedien.linkedin_url ? [`LinkedIn: ${comedien.linkedin_url}`] : [])
        ]

        linksInfo.forEach(info => {
          doc.text(info, margin, yPosition)
          yPosition += 6
        })
      }

      // Expérience professionnelle
      if (comedien.professional_experience) {
        yPosition += 10
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('EXPÉRIENCE PROFESSIONNELLE', margin, yPosition)
        yPosition += 10

        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        
        // Découper le texte pour qu'il s'adapte à la largeur
        const lines = doc.splitTextToSize(comedien.professional_experience, pageWidth - 2 * margin)
        lines.forEach((line: string) => {
          doc.text(line, margin, yPosition)
          yPosition += 6
        })
      }

      // Formations et diplômes
      if (comedien.training_diplomas) {
        yPosition += 10
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('FORMATIONS ET DIPLÔMES', margin, yPosition)
        yPosition += 10

        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        
        // Découper le texte pour qu'il s'adapte à la largeur
        const lines = doc.splitTextToSize(comedien.training_diplomas, pageWidth - 2 * margin)
        lines.forEach((line: string) => {
          doc.text(line, margin, yPosition)
          yPosition += 6
        })
      }

      // Note admin si présente
      if (comedien.admin_rating && comedien.admin_rating > 0) {
        yPosition += 10
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(0, 100, 200)
        doc.text(`Note administrative: ${comedien.admin_rating}/5 étoiles`, margin, yPosition)
      }

      // Pied de page
      const pageHeight = doc.internal.pageSize.getHeight()
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.setFont('helvetica', 'italic')
      doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} - ADKcasting`, 
               pageWidth / 2, pageHeight - 10, { align: 'center' })

      // Télécharger le PDF
      const filename = `${comedien.display_name.replace(/[^a-zA-Z0-9]/g, '_')}_profil.pdf`
      doc.save(filename)
      
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
              // Filtrer pour n'afficher que les photos Supabase (pas WordPress)
              const profilePicture = comedien.profile_picture && 
                !comedien.profile_picture.includes('wp-content') && 
                !comedien.profile_picture.includes('adk-kasting.com/wp-content')
                ? comedien.profile_picture 
                : null;
              
              return profilePicture ? (
                <img
                  src={profilePicture}
                  alt={`Photo de ${comedien.display_name}`}
                />
              ) : (
                <div className="comedien-card__placeholder">
                  <span>Photo non disponible</span>
                </div>
              );
            })()}
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

          {/* Détails supplémentaires */}
          {comedien.display_name !== `${comedien.first_name} ${comedien.last_name}` && (
            <p className="comedien-card__detail text-body">
              {comedien.display_name}
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
