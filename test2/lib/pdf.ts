// /lib/pdf.ts
import { jsPDF } from 'jspdf'
import type { Comedien } from '../types'

interface PDFData {
  comedien: Comedien
  skills?: Array<{ skill_category: string; skill_name: string }>
  languages?: Array<{ level: string; language: string }>
}

export const generateComedienPDF = async (comedien: Comedien) => {
  const age = comedien.birth_date ? calculateAge(comedien.birth_date) : null
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Profil - ${comedien.display_name}</title>
      <style>
        * { box-sizing: border-box; }
        body { 
          font-family: 'Arial', sans-serif; 
          margin: 0; 
          padding: 20px;
          font-size: 11px;
          line-height: 1.4;
          color: #333;
        }
        .container {
          max-width: 100%;
        }
        .header { 
          text-align: center; 
          margin-bottom: 20px; 
          padding-bottom: 15px;
          border-bottom: 2px solid #333;
        }
        .header h1 {
          margin: 0 0 10px 0;
          font-size: 18px;
          color: #333;
        }
        .main-content {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 20px;
          margin-top: 20px;
        }
        .sidebar {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .main-info {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .profile-photo {
          width: 150px;
          height: 150px;
          object-fit: cover;
          border-radius: 8px;
          margin: 0 auto 10px;
          display: block;
        }
        .portfolio-photos {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 5px;
          margin: 10px 0;
        }
        .portfolio-photo {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 4px;
        }
        .section { 
          margin-bottom: 15px;
          padding: 10px;
          border: 1px solid #eee;
          border-radius: 6px;
          background: #fafafa;
        }
        .section h3 { 
          color: #333; 
          margin: 0 0 8px 0;
          font-size: 12px;
          border-bottom: 1px solid #ddd;
          padding-bottom: 3px;
        }
        .info-grid { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 8px;
        }
        .info-item { 
          font-size: 10px;
          margin-bottom: 5px;
        }
        .info-item strong { 
          color: #666; 
          display: block;
          margin-bottom: 2px;
          font-size: 9px;
          text-transform: uppercase;
        }
        .skills-category { 
          margin: 8px 0; 
        }
        .skills-category h4 {
          margin: 0 0 5px 0;
          font-size: 10px;
          color: #666;
        }
        .skill-tag { 
          background: #e9ecef; 
          padding: 2px 6px; 
          margin: 1px; 
          border-radius: 10px; 
          display: inline-block; 
          font-size: 8px;
        }
        .stars {
          font-size: 14px;
          margin: 5px 0;
        }
        .admin-section {
          background: #e8f4f8;
          padding: 10px;
          border-radius: 6px;
          margin: 10px 0;
          border-left: 3px solid #007bff;
        }
        .experience-text {
          font-size: 9px;
          line-height: 1.3;
          margin: 5px 0;
          max-height: 80px;
          overflow: hidden;
        }
        .links a {
          color: #007bff;
          text-decoration: none;
          font-size: 9px;
          word-break: break-all;
        }
        .compact {
          margin: 3px 0;
          font-size: 9px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${comedien.display_name}</h1>
          ${age ? `<p style="margin: 5px 0; font-size: 12px;"><strong>Âge:</strong> ${age} ans</p>` : ''}

          ${(comedien.admin_rating ?? 0) > 0 ? `
            <div class="admin-section">
              <strong>Note administrative:</strong>
              <div class="stars">
                ${Array.from({length: 5}, (_, i) =>
                  `<span style="color: ${i < (comedien.admin_rating ?? 0) ? '#FFD700' : '#ccc'};">★</span>`
                ).join('')}
                (${comedien.admin_rating}/5)
              </div>
            </div>
          ` : ''}
        </div>

        <div class="main-content">
          
          <div class="sidebar">
            ${(() => {
              // Construire le tableau des photos WordPress disponibles
              const wpPhotos = [
                comedien.actor_photo1,
                comedien.actor_photo2,
                comedien.actor_photo3,
                comedien.actor_photo4,
                comedien.actor_photo5
              ].filter(photo => photo && photo.trim() !== '');
              
              // Fallback vers profile_picture ou photos existantes
              const photos = wpPhotos.length > 0 ? wpPhotos : 
                            comedien.profile_picture ? [comedien.profile_picture] :
                            (comedien.photos || []);
              
              if (photos.length > 0) {
                return `
                  <img src="${photos[0]}" alt="Photo" class="profile-photo" crossorigin="anonymous">
                  ${photos.length > 1 ? `
                    <div class="section">
                      <h3>Portfolio</h3>
                      <div class="portfolio-photos">
                        ${photos.slice(1, 5).map(photo => `
                          <img src="${photo}" alt="Portfolio" class="portfolio-photo" crossorigin="anonymous">
                        `).join('')}
                      </div>
                    </div>
                  ` : ''}
                `;
              }
              return '';
            })()}
          </div>

          <div class="main-info">
            
            <div class="section">
              <h3>👤 Informations personnelles</h3>
              <div class="info-grid">
                <div class="info-item">
                  <strong>Genre</strong>
                  ${comedien.gender || '-'}
                </div>
                <div class="info-item">
                  <strong>Nationalité</strong>
                  ${comedien.nationality || comedien.actor_nationality || '-'}
                </div>
                <div class="info-item">
                  <strong>Taille</strong>
                  ${comedien.height || comedien.actor_size ? `${comedien.height || comedien.actor_size} cm` : '-'}
                </div>
                <div class="info-item">
                  <strong>Corpulence</strong>
                  ${comedien.build || '-'}
                </div>
                <div class="info-item">
                  <strong>Cheveux</strong>
                  ${comedien.hair_color || '-'}
                </div>
                <div class="info-item">
                  <strong>Yeux</strong>
                  ${comedien.eye_color || '-'}
                </div>
              </div>
            </div>

            <div class="section">
              <h3>📞 Contact</h3>
              <div class="compact"><strong>Email:</strong> ${comedien.email}</div>
              ${comedien.phone ? `<div class="compact"><strong>Tél:</strong> ${comedien.phone}</div>` : ''}
              ${comedien.wp_mobile_number ? `<div class="compact"><strong>Mobile:</strong> ${comedien.wp_mobile_number}</div>` : ''}
              ${comedien.city ? `<div class="compact"><strong>Ville:</strong> ${comedien.city}</div>` : ''}
            </div>

            ${(comedien.agency_name || comedien.agent_name) ? `
            <div class="section">
              <h3>🏢 Représentation</h3>
              ${comedien.agency_name ? `<div class="compact"><strong>Agence:</strong> ${comedien.agency_name}</div>` : ''}
              ${comedien.agent_name ? `<div class="compact"><strong>Agent:</strong> ${comedien.agent_name}</div>` : ''}
            </div>
            ` : ''}

            ${(comedien.actor_resume || comedien.experience) ? `
            <div class="section">
              <h3>🎬 Expérience</h3>
              <div class="experience-text">
                ${(comedien.actor_resume || comedien.experience || '').substring(0, 200)}${(comedien.actor_resume || comedien.experience || '').length > 200 ? '...' : ''}
              </div>
            </div>
            ` : ''}

            ${(comedien.website_url || comedien.imdb_url || comedien.showreel_url) ? `
            <div class="section">
              <h3>🔗 Liens</h3>
              <div class="links">
                ${comedien.imdb_url ? `<div class="compact"><a href="${comedien.imdb_url}">IMDB</a></div>` : ''}
                ${comedien.showreel_url ? `<div class="compact"><a href="${comedien.showreel_url}">Showreel</a></div>` : ''}
              </div>
            </div>
            ` : ''}

          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; font-size: 8px; color: #666;">
          Profil généré le ${new Date().toLocaleDateString('fr-FR')} - ADKcasting (Admins seulement)
        </div>
        
      </div>
    </body>
    </html>
  `
  
  return htmlContent
}

const calculateAge = (birthDate: string) => {
  if (!birthDate) return null
  const today = new Date()
  const birth = new Date(birthDate)
  const age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  return monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate()) ? age - 1 : age
}

export const downloadComedienPDF = async (comedien: Comedien) => {
  try {
    // Import dynamique côté client seulement
    if (typeof window === 'undefined') {
      throw new Error('Cette fonction ne peut être utilisée que côté client')
    }

    const html2pdf = (await import('html2pdf.js')).default
    const htmlContent = await generateComedienPDF(comedien)

    const opt = {
      margin: [0.3, 0.3, 0.3, 0.3] as [number, number, number, number],
      filename: `${comedien.display_name.replace(/[^a-zA-Z0-9]/g, '_')}_profil.pdf`,
      image: { type: 'jpeg' as const, quality: 0.95 },
      html2canvas: {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: true
      },
      jsPDF: {
        unit: 'in' as const,
        format: 'a4' as const,
        orientation: 'portrait' as const,
        putOnlyUsedFonts: true,
        floatPrecision: 16
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] as const }
    }
    
    const element = document.createElement('div')
    element.innerHTML = htmlContent
    element.style.width = '8.5in'
    
    return html2pdf().set(opt).from(element).save()
    
  } catch (error) {
    console.error('Erreur génération PDF:', error)
    throw error
  }
}

// Version simple avec jsPDF seulement
export const downloadComedienPDFSimple = async (PDFData: PDFData) => {
  try {
    const { comedien, skills, languages } = PDFData
    
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
      `Téléphone: ${comedien.phone}`,
      `Genre: ${comedien.gender}`,
      `Nationalité: ${comedien.nationality}`,
      `Ville: ${comedien.city}`,
      `Taille: ${comedien.height ? comedien.height + ' cm' : 'Non spécifiée'}`,
      `Cheveux: ${comedien.hair_color}`,
      `Yeux: ${comedien.eye_color}`,
      `Corpulence: ${comedien.build}`
    ]

    personalInfo.forEach(info => {
      if (info.split(': ')[1] && info.split(': ')[1] !== 'undefined' && info.split(': ')[1] !== '') {
        doc.text(info, margin, yPosition)
        yPosition += 6
      }
    })

    yPosition += 10

    // Compétences
    if (skills && skills.length > 0) {
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
          driving: 'Permis',
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
    if (languages && languages.length > 0) {
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

    // Note admin si présente
    if ((comedien.admin_rating ?? 0) > 0) {
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
    console.error('Erreur génération PDF simple:', error)
    throw error
  }
}
