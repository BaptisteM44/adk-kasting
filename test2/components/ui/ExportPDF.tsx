import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { jsPDF } from 'jspdf'
import type { ComedienData, ComedienPhoto, ComedienSkill, ComedienLanguage, ComedienVideo } from '@/types'

interface ExportPDFProps {
  comedien: ComedienData
  photos?: ComedienPhoto[]
  videos?: ComedienVideo[]
  skills?: ComedienSkill[]
  languages?: ComedienLanguage[]
  isAdmin: boolean
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'small' | 'medium' | 'large'
  buttonText?: string
}

const sizeMap = {
  small: 'sm',
  medium: 'md',
  large: 'lg'
} as const

export const ExportPDF: React.FC<ExportPDFProps> = ({
  comedien,
  photos = [],
  videos = [],
  skills = [],
  languages = [],
  isAdmin,
  variant = 'outline',
  size = 'medium',
  buttonText = '📄 Exporter PDF'
}) => {
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  const handleExport = async () => {
    if (!isAdmin) {
      setError('Accès réservé aux administrateurs')
      return
    }

    try {
      setGenerating(true)
      setError('')
      
      // Création du PDF avec jsPDF (version étendue pour les détails)
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 20
      let yPosition = 30

      // Titre
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
        `Téléphone: ${comedien.phone || comedien.mobile_phone || 'Non renseigné'}`,
        `Genre: ${comedien.gender || 'Non spécifié'}`,
        `Nationalité: ${comedien.nationality || comedien.actor_nationality || 'Non spécifiée'}`,
        `Ville: ${comedien.city || 'Non renseignée'}`,
        `Taille: ${comedien.height ? comedien.height + ' cm' : 'Non spécifiée'}`,
        `Cheveux: ${comedien.hair_color || 'Non spécifié'}`,
        `Yeux: ${comedien.eye_color || 'Non spécifié'}`,
        `Corpulence: ${comedien.build || 'Non spécifiée'}`
      ]

      personalInfo.forEach(info => {
        if (info.split(': ')[1] && info.split(': ')[1] !== 'undefined' && info.split(': ')[1] !== 'Non spécifié' && info.split(': ')[1] !== 'Non spécifiée' && info.split(': ')[1] !== 'Non renseigné' && info.split(': ')[1] !== 'Non renseignée') {
          doc.text(info, margin, yPosition)
          yPosition += 6
        }
      })

      yPosition += 10

      // Compétences
      if (skills.length > 0) {
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('COMPÉTENCES', margin, yPosition)
        yPosition += 10

        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')

        const skillsByCategory = skills.reduce((acc, skill) => {
          if (!acc[skill.skill_category]) acc[skill.skill_category] = []
          acc[skill.skill_category].push(skill.skill_name)
          return acc
        }, {} as Record<string, string[]>)

        Object.entries(skillsByCategory).forEach(([category, skillList]) => {
          const categoryNames: Record<string, string> = {
            driving: 'Permis de conduire',
            diverse: 'Compétences diverses',
            dance: 'Danse',
            music: 'Musique'
          }
          
          doc.setFont('helvetica', 'bold')
          doc.text(`${categoryNames[category] || category}:`, margin, yPosition)
          yPosition += 5
          
          doc.setFont('helvetica', 'normal')
          const skillsText = skillList.join(', ')
          const lines = doc.splitTextToSize(skillsText, pageWidth - 2 * margin)
          doc.text(lines, margin + 5, yPosition)
          yPosition += lines.length * 5 + 5
        })
      }

      // Langues
      if (languages.length > 0) {
        yPosition += 5
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('LANGUES', margin, yPosition)
        yPosition += 10

        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')

        const langsByLevel = languages.reduce((acc, lang) => {
          if (!acc[lang.level]) acc[lang.level] = []
          acc[lang.level].push(lang.language)
          return acc
        }, {} as Record<string, string[]>)

        Object.entries(langsByLevel).forEach(([level, langList]) => {
          const levelNames: Record<string, string> = {
            native: 'Langues maternelles',
            fluent: 'Parlées couramment',
            notions: 'Notions'
          }
          
          doc.setFont('helvetica', 'bold')
          doc.text(`${levelNames[level] || level}:`, margin, yPosition)
          yPosition += 5
          
          doc.setFont('helvetica', 'normal')
          doc.text(langList.join(', '), margin + 5, yPosition)
          yPosition += 8
        })
      }

      // Expérience
      if (comedien.actor_resume || comedien.experience) {
        yPosition += 10
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('EXPÉRIENCE', margin, yPosition)
        yPosition += 10

        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        const experienceText = comedien.actor_resume || comedien.experience || ''
        const lines = doc.splitTextToSize(experienceText.substring(0, 500), pageWidth - 2 * margin)
        doc.text(lines, margin, yPosition)
        yPosition += lines.length * 5
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
      doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} - ADKcasting (Profil détaillé)`, 
               pageWidth / 2, pageHeight - 10, { align: 'center' })

      // Télécharger le PDF
      const filename = `${comedien.display_name.replace(/[^a-zA-Z0-9]/g, '_')}_profil_detaille.pdf`
      doc.save(filename)
    } catch (err: any) {
      setError('Erreur lors de la génération du PDF')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="export-pdf">
      <Button onClick={handleExport} variant={variant} size={sizeMap[size]} disabled={generating}>
        {generating ? '⏳ Génération...' : buttonText}
      </Button>
      {error && <div className="error-message">{error}</div>}

      <style jsx>{`
        .export-pdf {
          position: relative;
        }
        .error-message {
          position: absolute;
          top: 100%;
          left: 0;
          background: #fee;
          color: #c33;
          padding: 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          white-space: nowrap;
          z-index: 10;
          margin-top: 0.25rem;
        }
      `}</style>
    </div>
  )
}
