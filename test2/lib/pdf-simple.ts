// /lib/pdf-simple.ts
import { jsPDF } from 'jspdf'
import type { Comedien } from '../types'

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
        }
        .profile-photo {
          width: 180px;
          height: 220px;
          object-fit: cover;
          border-radius: 8px;
          margin-bottom: 15px;
        }
        .section {
          margin-bottom: 15px;
        }
        .section h3 {
          margin: 0 0 8px 0;
          font-size: 12px;
          color: #333;
          border-bottom: 1px solid #ddd;
          padding-bottom: 3px;
        }
        .compact {
          margin: 3px 0;
          font-size: 10px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          font-size: 9px;
        }
        .info-item {
          margin: 5px 0;
        }
        .skill-tag {
          background: #f0f0f0;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 8px;
          margin-right: 4px;
          display: inline-block;
          margin-bottom: 2px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px solid #ddd;
          font-size: 8px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${comedien.display_name}</h1>
          ${age ? `<p style="margin: 5px 0; font-size: 12px;"><strong>Âge:</strong> ${age} ans</p>` : ''}
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
                let html = `<img src="${photos[0]}" alt="Photo principale" class="profile-photo" crossorigin="anonymous">`;
                
                // Ajouter les photos supplémentaires (plus petites)
                if (photos.length > 1) {
                  html += '<div style="margin-top: 10px;">';
                  for (let i = 1; i < Math.min(photos.length, 3); i++) {
                    html += `<img src="${photos[i]}" alt="Photo ${i+1}" style="width: 55px; height: 70px; object-fit: cover; border-radius: 4px; margin-right: 5px; margin-bottom: 5px;" crossorigin="anonymous">`;
                  }
                  if (photos.length > 3) {
                    html += `<div style="font-size: 8px; color: #666; margin-top: 5px;">+${photos.length - 3} autres photos</div>`;
                  }
                  html += '</div>';
                }
                
                return html;
              }
              return '<div style="width: 180px; height: 220px; background: #f0f0f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">Pas de photo</div>';
            })()}
          </div>

          <div class="main-info">
            
            <div class="section">
              <h3>👤 Informations personnelles</h3>
              <div class="info-grid">
                <div class="info-item">
                  <strong>Genre:</strong> ${comedien.gender || '-'}
                </div>
                <div class="info-item">
                  <strong>Nationalité:</strong> ${comedien.nationality || comedien.actor_nationality || '-'}
                </div>
                <div class="info-item">
                  <strong>Taille:</strong> ${comedien.height || comedien.actor_size ? `${comedien.height || comedien.actor_size} cm` : '-'}
                </div>
                <div class="info-item">
                  <strong>Corpulence:</strong> ${comedien.build || '-'}
                </div>
                <div class="info-item">
                  <strong>Cheveux:</strong> ${comedien.hair_color || '-'}
                </div>
                <div class="info-item">
                  <strong>Yeux:</strong> ${comedien.eye_color || '-'}
                </div>
                ${comedien.wp_experience ? `<div class="info-item"><strong>Expérience:</strong> ${comedien.wp_experience}</div>` : ''}
                ${comedien.wp_activity_domain ? `<div class="info-item"><strong>Domaine:</strong> ${comedien.wp_activity_domain}</div>` : ''}
              </div>
            </div>

            <div class="section">
              <h3>📞 Contact</h3>
              <div class="compact"><strong>Email:</strong> ${comedien.email}</div>
              ${comedien.wp_user_email && comedien.wp_user_email !== comedien.email ? `<div class="compact"><strong>Email WP:</strong> ${comedien.wp_user_email}</div>` : ''}
              ${comedien.phone ? `<div class="compact"><strong>Tél:</strong> ${comedien.phone}</div>` : ''}
              ${comedien.wp_phone_number ? `<div class="compact"><strong>Tél WP:</strong> ${comedien.wp_phone_number}</div>` : ''}
              ${comedien.wp_mobile_number ? `<div class="compact"><strong>Mobile:</strong> ${comedien.wp_mobile_number}</div>` : ''}
              ${comedien.city ? `<div class="compact"><strong>Ville:</strong> ${comedien.city}</div>` : ''}
              ${comedien.user_url ? `<div class="compact"><strong>Site web:</strong> ${comedien.user_url}</div>` : ''}
            </div>

            ${(comedien.actor_agency_name || comedien.actor_agent_name || comedien.agency_name || comedien.agent_name) ? `
            <div class="section">
              <h3>🏢 Représentation</h3>
              ${(comedien.actor_agency_name || comedien.agency_name) ? `<div class="compact"><strong>Agence:</strong> ${comedien.actor_agency_name || comedien.agency_name}</div>` : ''}
              ${(comedien.actor_agency_email) ? `<div class="compact"><strong>Email agence:</strong> ${comedien.actor_agency_email}</div>` : ''}
              ${(comedien.actor_agency_phone) ? `<div class="compact"><strong>Tél agence:</strong> ${comedien.actor_agency_phone}</div>` : ''}
              ${(comedien.actor_agent_name || comedien.agent_name) ? `<div class="compact"><strong>Agent:</strong> ${comedien.actor_agent_name || comedien.agent_name}</div>` : ''}
              ${(comedien.actor_agent_email) ? `<div class="compact"><strong>Email agent:</strong> ${comedien.actor_agent_email}</div>` : ''}
              ${(comedien.actor_agent_phone) ? `<div class="compact"><strong>Tél agent:</strong> ${comedien.actor_agent_phone}</div>` : ''}
            </div>
            ` : ''}

            ${(comedien.actor_dance_skills || comedien.actor_music_skills || comedien.wp_skills || comedien.actor_driving_license) ? `
            <div class="section">
              <h3>🎯 Compétences</h3>
              ${comedien.actor_driving_license ? `<div class="compact"><strong>Permis:</strong> ${comedien.actor_driving_license}</div>` : ''}
              ${comedien.actor_dance_skills ? `<div class="compact"><strong>Danse:</strong> ${comedien.actor_dance_skills}</div>` : ''}
              ${comedien.actor_music_skills ? `<div class="compact"><strong>Musique:</strong> ${comedien.actor_music_skills}</div>` : ''}
              ${comedien.wp_skills ? `<div class="compact"><strong>Compétences:</strong> ${comedien.wp_skills}</div>` : ''}
            </div>
            ` : ''}

            ${(comedien.native_language || comedien.actor_languages_native || comedien.languages || comedien.actor_languages_notions || comedien.actor_languages_other) ? `
            <div class="section">
              <h3>🌍 Langues</h3>
              ${(comedien.native_language || comedien.actor_languages_native) ? `<div class="compact"><strong>Maternelles:</strong> ${comedien.native_language || comedien.actor_languages_native}</div>` : ''}
              ${comedien.actor_languages_native_other ? `<div class="compact"><strong>Maternelles (autres):</strong> ${comedien.actor_languages_native_other}</div>` : ''}
              ${comedien.actor_languages_native2 ? `<div class="compact"><strong>Maternelles (2):</strong> ${comedien.actor_languages_native2}</div>` : ''}
              ${comedien.languages ? `<div class="compact"><strong>Couramment:</strong> ${comedien.languages}</div>` : ''}
              ${comedien.actor_languages_notions ? `<div class="compact"><strong>Notions:</strong> ${comedien.actor_languages_notions}</div>` : ''}
              ${comedien.actor_languages_notions_other ? `<div class="compact"><strong>Notions (autres):</strong> ${comedien.actor_languages_notions_other}</div>` : ''}
              ${comedien.actor_languages_other ? `<div class="compact"><strong>Autres langues:</strong> ${comedien.actor_languages_other}</div>` : ''}
            </div>
            ` : ''}

            ${(comedien.actor_profile_facebook || comedien.actor_profile_imdb || comedien.actor_profile_linkedin || comedien.actor_profile_other) ? `
            <div class="section">
              <h3>🌐 Réseaux sociaux</h3>
              ${comedien.actor_profile_facebook ? `<div class="compact"><strong>Facebook:</strong> ${comedien.actor_profile_facebook}</div>` : ''}
              ${comedien.actor_profile_imdb ? `<div class="compact"><strong>IMDB:</strong> ${comedien.actor_profile_imdb}</div>` : ''}
              ${comedien.actor_profile_linkedin ? `<div class="compact"><strong>LinkedIn:</strong> ${comedien.actor_profile_linkedin}</div>` : ''}
              ${comedien.actor_profile_other ? `<div class="compact"><strong>Autres profils:</strong> ${comedien.actor_profile_other}</div>` : ''}
            </div>
            ` : ''}

            ${(comedien.experience || comedien.certificates || comedien.wp_experience || comedien.wp_fielddata) ? `
            <div class="section">
              <h3>🎓 Formation & Expérience</h3>
              ${comedien.experience ? `<div class="compact"><strong>Expérience:</strong> ${comedien.experience}</div>` : ''}
              ${comedien.wp_experience && comedien.wp_experience !== comedien.experience ? `<div class="compact"><strong>Expérience WP:</strong> ${comedien.wp_experience}</div>` : ''}
              ${comedien.certificates ? `<div class="compact"><strong>Formation:</strong> ${comedien.certificates}</div>` : ''}
              ${comedien.wp_fielddata ? `<div class="compact"><strong>Données complémentaires:</strong> ${comedien.wp_fielddata}</div>` : ''}
            </div>
            ` : ''}

            ${(comedien.actor_resume || comedien.actor_showreal || comedien.actor_video1 || comedien.actor_video2 || comedien.actor_video3 || comedien.certificates) ? `
            <div class="section">
              <h3>📁 Documents & Médias</h3>
              ${comedien.actor_resume ? `<div class="compact"><strong>CV:</strong> Disponible</div>` : ''}
              ${comedien.certificates ? `<div class="compact"><strong>Certificats:</strong> Disponible</div>` : ''}
              ${comedien.actor_showreal ? `<div class="compact"><strong>Showreel:</strong> Disponible</div>` : ''}
              ${comedien.actor_video1 ? `<div class="compact"><strong>Vidéo 1:</strong> Disponible</div>` : ''}
              ${comedien.actor_video2 ? `<div class="compact"><strong>Vidéo 2:</strong> Disponible</div>` : ''}
              ${comedien.actor_video3 ? `<div class="compact"><strong>Vidéo 3:</strong> Disponible</div>` : ''}
            </div>
            ` : ''}

          </div>
        </div>

        <div class="footer">
          <p>Profil généré le ${new Date().toLocaleDateString('fr-FR')} - ADK Casting</p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    // Créer le PDF
    const printWindow = window.open('', '_blank')
    if (!printWindow) throw new Error('Impossible d\'ouvrir la fenêtre d\'impression')
    
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    
    // Attendre que le contenu soit chargé
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 500)
    }
    
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error)
    throw error
  }
}

// Fonction utilitaire pour calculer l'âge
function calculateAge(birthDate: string): number | null {
  if (!birthDate) return null
  const today = new Date()
  const birth = new Date(birthDate)
  const age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  return monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate()) ? age - 1 : age
}