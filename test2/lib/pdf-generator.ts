// /lib/pdf-generator.ts
import type { Comedien } from '../types'

/**
 * Génère un PDF professionnel pour un comédien
 * Utilise html2pdf.js pour convertir le HTML en PDF téléchargeable
 */
export const generateComedienPDF = async (comedien: any) => {
  try {
    // Import dynamique de html2pdf (client-side only)
    if (typeof window === 'undefined') {
      throw new Error('Cette fonction ne peut être utilisée que côté client')
    }

    const html2pdf = (await import('html2pdf.js')).default

    // Calculer l'âge
    const age = comedien.birth_date ? calculateAge(comedien.birth_date) : null

    // Préparer les données normalisées
    const fullName = `${comedien.first_name || ''} ${comedien.last_name || ''}`.trim()
    const displayName = fullName || comedien.display_name_normalized || comedien.email

    // Photos - utiliser le tableau photos[]
    const photos = (comedien.photos || []).filter((photo: string) =>
      photo &&
      photo.trim() !== '' &&
      !photo.includes('undefined') &&
      !photo.includes('null')
    )
    const mainPhoto = photos[0] || null

    // Langues
    const allLanguages: string[] = []
    if (comedien.native_language_normalized) {
      allLanguages.push(`${comedien.native_language_normalized} (maternelle)`)
    }
    if (comedien.languages_fluent_normalized?.length > 0) {
      comedien.languages_fluent_normalized.forEach((lang: string) => {
        allLanguages.push(`${lang} (couramment)`)
      })
    }
    if (comedien.languages_notions_normalized?.length > 0) {
      comedien.languages_notions_normalized.forEach((lang: string) => {
        allLanguages.push(`${lang} (notions)`)
      })
    }

    // HTML du PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Profil - ${displayName}</title>
        <style>
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            padding: 15px;
            font-size: 8px;
            line-height: 1.3;
            color: #333;
            background: white;
          }
          .container {
            max-width: 100%;
          }

          /* En-tête */
          .header {
            text-align: center;
            margin-bottom: 12px;
            padding-bottom: 10px;
            border-bottom: 2px solid #393939;
          }
          .header h1 {
            margin: 0 0 4px 0;
            font-size: 16px;
            color: #393939;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .header .age {
            font-size: 9px;
            color: #666;
            margin-bottom: 5px;
          }
          .header .admin-rating {
            background: #f8f9fa;
            padding: 4px 10px;
            border-radius: 4px;
            display: inline-block;
            margin-top: 5px;
            border: 1px solid #dee2e6;
          }
          .stars {
            color: #FFD700;
            font-size: 10px;
            letter-spacing: 1px;
          }

          /* Layout principal */
          .main-content {
            display: grid;
            grid-template-columns: 140px 1fr;
            gap: 12px;
            margin-top: 10px;
          }

          /* Photo principale */
          .sidebar {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .profile-photo {
            width: 140px;
            height: 180px;
            object-fit: cover;
            object-position: center top;
            border-radius: 4px;
            border: 1px solid #e0e0e0;
          }
          .no-photo {
            width: 140px;
            height: 180px;
            background: #f5f5f5;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #999;
            font-size: 10px;
            border: 1px solid #e0e0e0;
          }

          /* Sections */
          .main-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }
          .section {
            background: #fafafa;
            padding: 6px 8px;
            border-radius: 4px;
            border-left: 2px solid #393939;
          }
          .section h3 {
            font-size: 8px;
            color: #393939;
            margin-bottom: 4px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }
          .section.full-width {
            grid-column: 1 / -1;
          }

          /* Grille d'informations */
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 3px 8px;
          }
          .info-item {
            font-size: 7px;
          }
          .info-item strong {
            color: #666;
            font-size: 6px;
            text-transform: uppercase;
            display: block;
            margin-bottom: 1px;
            letter-spacing: 0.2px;
          }
          .info-item .value {
            color: #333;
            font-size: 7px;
          }

          /* Liste simple */
          .simple-list {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }
          .simple-item {
            font-size: 7px;
            padding: 1px 0;
          }
          .simple-item strong {
            color: #666;
            font-size: 6px;
            text-transform: uppercase;
            min-width: 60px;
            display: inline-block;
          }

          /* Tags pour compétences et langues */
          .tags-container {
            display: flex;
            flex-wrap: wrap;
            gap: 3px;
            margin-top: 3px;
          }
          .tag {
            background: #393939;
            color: white;
            padding: 2px 6px;
            border-radius: 8px;
            font-size: 6px;
            display: inline-block;
            font-weight: 500;
          }
          .tag.secondary {
            background: #e9ecef;
            color: #495057;
          }

          /* Texte long (expérience, etc.) */
          .text-content {
            font-size: 7px;
            line-height: 1.4;
            color: #444;
            white-space: pre-wrap;
            max-height: 60px;
            overflow: hidden;
          }

          /* Liens cliquables */
          a {
            color: #007bff;
            text-decoration: none;
            font-size: 7px;
          }
          a:hover {
            text-decoration: underline;
          }

          /* Footer */
          .footer {
            text-align: center;
            margin-top: 10px;
            padding-top: 8px;
            border-top: 1px solid #dee2e6;
            font-size: 6px;
            color: #999;
            font-style: italic;
          }

          /* Utilitaires */
          .mb-1 { margin-bottom: 3px; }
          .mb-2 { margin-bottom: 5px; }
        </style>
      </head>
      <body>
        <div class="container">

          <!-- En-tête -->
          <div class="header">
            <h1>${displayName}</h1>
            ${age ? `<div class="age">Âge : ${age} ans</div>` : ''}
            ${comedien.admin_rating > 0 ? `
              <div class="admin-rating">
                <strong style="font-size: 7px; color: #666;">NOTE</strong>
                <span class="stars">
                  ${'★'.repeat(comedien.admin_rating)}${'☆'.repeat(5 - comedien.admin_rating)}
                </span>
                <span style="font-size: 8px; color: #666; margin-left: 4px;">${comedien.admin_rating}/5</span>
              </div>
            ` : ''}
          </div>

          <!-- Contenu principal -->
          <div class="main-content">

            <!-- Sidebar avec photo -->
            <div class="sidebar">
              ${mainPhoto ? `
                <img src="${mainPhoto}" alt="Photo de ${displayName}" class="profile-photo" crossorigin="anonymous">
              ` : `
                <div class="no-photo">Aucune photo</div>
              `}

              ${comedien.admin_comment ? `
                <div class="section" style="background: #fff3cd; border-left-color: #ffc107;">
                  <h3 style="color: #856404;">💬 Note</h3>
                  <div class="text-content" style="font-size: 6px; color: #856404; max-height: 40px;">
                    ${comedien.admin_comment}
                  </div>
                </div>
              ` : ''}
            </div>

            <!-- Informations principales -->
            <div class="main-info">

              <!-- Infos clés -->
              <div class="section">
                <h3>📋 Informations clés</h3>
                <div class="simple-list">
                  ${age ? `<div class="simple-item"><strong>Âge :</strong> ${age} ans</div>` : ''}
                  ${allLanguages.length > 0 ? `<div class="simple-item"><strong>Langues :</strong> ${allLanguages.join(', ')}</div>` : ''}
                  ${comedien.desired_activities_normalized?.length > 0 ? `
                    <div class="simple-item"><strong>Domaines :</strong> ${comedien.desired_activities_normalized.join(', ')}</div>
                  ` : ''}
                  ${comedien.email ? `<div class="simple-item"><strong>Email :</strong> ${comedien.email}</div>` : ''}
                  ${comedien.phone ? `<div class="simple-item"><strong>Téléphone :</strong> ${comedien.phone}</div>` : ''}
                </div>
              </div>

              <!-- Caractéristiques physiques -->
              <div class="section">
                <h3>👤 Caractéristiques physiques</h3>
                <div class="info-grid">
                  ${comedien.ethnicity ? `
                    <div class="info-item">
                      <strong>Type</strong>
                      <div class="value">${comedien.ethnicity}</div>
                    </div>
                  ` : ''}
                  ${comedien.build ? `
                    <div class="info-item">
                      <strong>Corpulence</strong>
                      <div class="value">${comedien.build}</div>
                    </div>
                  ` : ''}
                  ${comedien.height ? `
                    <div class="info-item">
                      <strong>Taille</strong>
                      <div class="value">${comedien.height} cm</div>
                    </div>
                  ` : ''}
                  ${comedien.hair_color ? `
                    <div class="info-item">
                      <strong>Cheveux</strong>
                      <div class="value">${comedien.hair_color}</div>
                    </div>
                  ` : ''}
                  ${comedien.eye_color ? `
                    <div class="info-item">
                      <strong>Yeux</strong>
                      <div class="value">${comedien.eye_color}</div>
                    </div>
                  ` : ''}
                  ${comedien.gender ? `
                    <div class="info-item">
                      <strong>Genre</strong>
                      <div class="value">${comedien.gender}</div>
                    </div>
                  ` : ''}
                  ${comedien.nationality ? `
                    <div class="info-item">
                      <strong>Nationalité</strong>
                      <div class="value">${comedien.nationality}</div>
                    </div>
                  ` : ''}
                  ${comedien.domiciliation ? `
                    <div class="info-item">
                      <strong>Domiciliation</strong>
                      <div class="value">${comedien.domiciliation}</div>
                    </div>
                  ` : ''}
                </div>
              </div>

              <!-- Langues détaillées -->
              ${allLanguages.length > 0 ? `
                <div class="section">
                  <h3>🌍 Langues</h3>
                  <div class="simple-list">
                    ${comedien.native_language_normalized ? `
                      <div class="simple-item">
                        <strong>Maternelle :</strong> ${comedien.native_language_normalized}
                      </div>
                    ` : ''}
                    ${comedien.languages_fluent_normalized?.length > 0 ? `
                      <div class="simple-item">
                        <strong>Couramment :</strong> ${comedien.languages_fluent_normalized.join(', ')}
                      </div>
                    ` : ''}
                    ${comedien.languages_notions_normalized?.length > 0 ? `
                      <div class="simple-item">
                        <strong>Notions :</strong> ${comedien.languages_notions_normalized.join(', ')}
                      </div>
                    ` : ''}
                  </div>
                </div>
              ` : ''}

              <!-- Compétences -->
              ${(comedien.driving_licenses_normalized?.length > 0 ||
                 comedien.dance_skills_normalized?.length > 0 ||
                 comedien.music_skills_normalized?.length > 0 ||
                 comedien.diverse_skills_normalized?.length > 0) ? `
                <div class="section">
                  <h3>🎯 Compétences</h3>
                  ${comedien.driving_licenses_normalized?.length > 0 ? `
                    <div class="mb-1">
                      <strong style="font-size: 6px; color: #666; text-transform: uppercase;">Permis</strong>
                      <div class="tags-container">
                        ${comedien.driving_licenses_normalized.map((skill: string) =>
                          `<span class="tag secondary">${skill}</span>`
                        ).join('')}
                      </div>
                    </div>
                  ` : ''}
                  ${comedien.dance_skills_normalized?.length > 0 ? `
                    <div class="mb-1">
                      <strong style="font-size: 6px; color: #666; text-transform: uppercase;">Danse</strong>
                      <div class="tags-container">
                        ${comedien.dance_skills_normalized.map((skill: string) =>
                          `<span class="tag secondary">${skill}</span>`
                        ).join('')}
                      </div>
                    </div>
                  ` : ''}
                  ${comedien.music_skills_normalized?.length > 0 ? `
                    <div class="mb-1">
                      <strong style="font-size: 6px; color: #666; text-transform: uppercase;">Musique</strong>
                      <div class="tags-container">
                        ${comedien.music_skills_normalized.map((skill: string) =>
                          `<span class="tag secondary">${skill}</span>`
                        ).join('')}
                      </div>
                    </div>
                  ` : ''}
                  ${comedien.diverse_skills_normalized?.length > 0 ? `
                    <div class="mb-1">
                      <strong style="font-size: 6px; color: #666; text-transform: uppercase;">Diverses</strong>
                      <div class="tags-container">
                        ${comedien.diverse_skills_normalized.map((skill: string) =>
                          `<span class="tag secondary">${skill}</span>`
                        ).join('')}
                      </div>
                    </div>
                  ` : ''}
                </div>
              ` : ''}

              <!-- Agence / Agent -->
              ${(comedien.agency_name || comedien.agent_name ||
                 comedien.agency_name_2 || comedien.agent_name_2) ? `
                <div class="section">
                  <h3>🏢 Représentation</h3>
                  <div class="info-grid">
                    ${comedien.agency_name ? `
                      <div class="info-item">
                        <strong>Agence 1</strong>
                        <div class="value">${comedien.agency_name}</div>
                      </div>
                    ` : ''}
                    ${comedien.agent_name ? `
                      <div class="info-item">
                        <strong>Agent 1</strong>
                        <div class="value">${comedien.agent_name}</div>
                      </div>
                    ` : ''}
                    ${comedien.agent_email ? `
                      <div class="info-item">
                        <strong>Email agent 1</strong>
                        <div class="value">${comedien.agent_email}</div>
                      </div>
                    ` : ''}
                    ${comedien.agent_phone ? `
                      <div class="info-item">
                        <strong>Tél agent 1</strong>
                        <div class="value">${comedien.agent_phone}</div>
                      </div>
                    ` : ''}
                    ${comedien.agency_name_2 ? `
                      <div class="info-item">
                        <strong>Agence 2</strong>
                        <div class="value">${comedien.agency_name_2}</div>
                      </div>
                    ` : ''}
                    ${comedien.agent_name_2 ? `
                      <div class="info-item">
                        <strong>Agent 2</strong>
                        <div class="value">${comedien.agent_name_2}</div>
                      </div>
                    ` : ''}
                  </div>
                </div>
              ` : ''}

              <!-- Coordonnées complètes -->
              ${(comedien.street || comedien.zip_code || comedien.city) ? `
                <div class="section">
                  <h3>📍 Adresse</h3>
                  <div class="text-content">
                    ${comedien.street ? `${comedien.street}<br>` : ''}
                    ${comedien.zip_code || ''} ${comedien.city || ''}<br>
                    ${comedien.country || ''}
                  </div>
                </div>
              ` : ''}

              <!-- Expérience -->
              ${comedien.experience ? `
                <div class="section full-width">
                  <h3>🎬 Expérience professionnelle</h3>
                  <div class="text-content">${comedien.experience.substring(0, 400)}${comedien.experience.length > 400 ? '...' : ''}</div>
                </div>
              ` : ''}

              <!-- Formation -->
              ${comedien.certificates ? `
                <div class="section full-width">
                  <h3>🎓 Formations et diplômes</h3>
                  <div class="text-content">${comedien.certificates.substring(0, 400)}${comedien.certificates.length > 400 ? '...' : ''}</div>
                </div>
              ` : ''}

              <!-- Liens -->
              ${(comedien.website_url || comedien.facebook_url || comedien.imdb_url ||
                 comedien.linkedin_url || comedien.showreel_url) ? `
                <div class="section">
                  <h3>🔗 Liens et médias</h3>
                  <div class="simple-list">
                    ${comedien.imdb_url ? `<div class="simple-item"><strong>IMDb :</strong> <a href="${comedien.imdb_url}" target="_blank">${comedien.imdb_url}</a></div>` : ''}
                    ${comedien.showreel_url ? `<div class="simple-item"><strong>Showreel :</strong> <a href="${comedien.showreel_url}" target="_blank">${comedien.showreel_url}</a></div>` : ''}
                    ${comedien.website_url ? `<div class="simple-item"><strong>Site web :</strong> <a href="${comedien.website_url}" target="_blank">${comedien.website_url}</a></div>` : ''}
                    ${comedien.linkedin_url ? `<div class="simple-item"><strong>LinkedIn :</strong> <a href="${comedien.linkedin_url}" target="_blank">${comedien.linkedin_url}</a></div>` : ''}
                    ${comedien.facebook_url ? `<div class="simple-item"><strong>Facebook :</strong> <a href="${comedien.facebook_url}" target="_blank">${comedien.facebook_url}</a></div>` : ''}
                  </div>
                </div>
              ` : ''}

            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            Profil généré le ${new Date().toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            })} par ADK-KASTING
            <br>
            Document confidentiel - Réservé aux administrateurs
          </div>

        </div>
      </body>
      </html>
    `

    // Configuration html2pdf
    const options = {
      margin: 0.2,
      filename: `${displayName.replace(/[^a-zA-Z0-9]/g, '_')}_profil_ADK.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false
      },
      jsPDF: {
        unit: 'in',
        format: 'a4',
        orientation: 'portrait'
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    }

    // Créer un élément temporaire pour le rendu
    const element = document.createElement('div')
    element.innerHTML = htmlContent
    document.body.appendChild(element)

    // Générer et télécharger le PDF
    await html2pdf().set(options).from(element).save()

    // Nettoyer
    document.body.removeChild(element)

  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error)
    alert('Erreur lors de la génération du PDF. Veuillez réessayer.')
    throw error
  }
}

/**
 * Calcule l'âge à partir d'une date de naissance
 */
function calculateAge(birthDate: string): number | null {
  if (!birthDate) return null
  const today = new Date()
  const birth = new Date(birthDate)
  if (isNaN(birth.getTime())) return null
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  return monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate()) ? age - 1 : age
}
