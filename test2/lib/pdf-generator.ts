// import type { Comedien } from '../types'

// export const generateComedienPDF = async (comedien: any) => {
//   try {
//     if (typeof window === 'undefined') {
//       throw new Error('Cette fonction ne peut être utilisée que côté client')
//     }

//     const html2pdf = (await import('html2pdf.js')).default

//     const age = comedien.birth_date ? calculateAge(comedien.birth_date) : null
//     const fullName = `${comedien.first_name || ''} ${comedien.last_name || ''}`.trim()
//     const displayName = fullName || comedien.display_name_normalized || comedien.email

//     const photos = (comedien.photos || []).filter((photo: string) =>
//       photo && photo.trim() !== '' && !photo.includes('undefined') && !photo.includes('null')
//     )
//     const mainPhoto = photos[0] || null

//     const languages: string[] = []
//     if (comedien.native_language_normalized) {
//       languages.push(comedien.native_language_normalized)
//     }
//     if (comedien.languages_fluent_normalized?.length > 0) {
//       languages.push(...comedien.languages_fluent_normalized)
//     }
//     if (comedien.languages_notions_normalized?.length > 0) {
//       languages.push(...comedien.languages_notions_normalized.map((l: string) => `${l} (notions)`))
//     }

//     const htmlContent = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="utf-8">
//         <title>${displayName}</title>
//         <style>
//           * {
//             margin: 0;
//             padding: 0;
//             box-sizing: border-box;
//           }

//           html, body {
//             width: 100%;
//             margin: 0;
//             padding: 0;
//             font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
//             background: white;
//             color: #1a1a1a;
//           }

//           body {
//             padding: 12px;
//           }

//           .page {
//             width: 100%;
//             display: flex;
//             flex-direction: column;
//             gap: 8px;
//           }

//           /* ===== HEADER AVEC PHOTO 1/3 ===== */
//           .header {
//             display: flex;
//             gap: 12px;
//             border-bottom: 2px solid #1a1a1a;
//             padding-bottom: 8px;
//           }

//           .photo-wrapper {
//             width: 33.33%;
//             flex-shrink: 0;
//             aspect-ratio: 3 / 4;
//             background: #f5f5f5;
//             border: 1px solid #ddd;
//             border-radius: 2px;
//             overflow: hidden;
//             background-size: cover;
//             background-position: center top;
//             background-repeat: no-repeat;
//           }

//           .photo-wrapper.no-photo {
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             font-size: 10px;
//             color: #999;
//           }

//           .header-right {
//             flex: 1;
//             display: flex;
//             flex-direction: column;
//             gap: 6px;
//             justify-content: flex-start;
//           }

//           .header-title {
//             display: flex;
//             align-items: center;
//             gap: 10px;
//           }

//           h1 {
//             font-size: 18px;
//             font-weight: 700;
//             color: #1a1a1a;
//             line-height: 1;
//           }

//           .rating {
//             display: inline-flex;
//             align-items: center;
//             gap: 3px;
//             background: #f0f0f0;
//             padding: 2px 6px;
//             border-radius: 2px;
//             font-size: 8px;
//             border: 1px solid #ddd;
//             flex-shrink: 0;
//           }

//           .rating .stars {
//             color: #ffc107;
//             font-size: 10px;
//             letter-spacing: 1px;
//           }

//           .header-meta {
//             display: grid;
//             grid-template-columns: 1fr 1fr;
//             gap: 6px 10px;
//             font-size: 9px;
//             line-height: 1.3;
//           }

//           .meta-item {
//             display: flex;
//             gap: 4px;
//             align-items: flex-start;
//           }

//           .meta-label {
//             font-weight: 600;
//             color: #333;
//             min-width: 42px;
//             flex-shrink: 0;
//             font-size: 8px;
//             text-transform: uppercase;
//           }

//           .meta-value {
//             color: #1a1a1a;
//             flex: 1;
//             word-break: break-word;
//           }

//           .copyable {
//             cursor: pointer;
//             padding: 1px 3px;
//             border-radius: 1px;
//             transition: all 0.15s;
//             user-select: none;
//             border: 1px solid transparent;
//           }

//           .copyable:hover {
//             background: #e3f2fd;
//             border: 1px solid #90caf9;
//           }

//           /* ===== CONTENU ===== */
//           .content {
//             display: grid;
//             grid-template-columns: repeat(2, 1fr);
//             gap: 8px;
//             flex: 1;
//           }

//           .section {
//             background: #fafafa;
//             border-left: 2.5px solid #1a1a1a;
//             padding: 7px;
//             border-radius: 1px;
//             display: flex;
//             flex-direction: column;
//             gap: 4px;
//           }

//           .section h3 {
//             font-size: 9px;
//             font-weight: 700;
//             color: #1a1a1a;
//             text-transform: uppercase;
//             letter-spacing: 0.4px;
//             margin: 0;
//             padding-bottom: 2px;
//             border-bottom: 1px solid #ddd;
//           }

//           .section-content {
//             font-size: 9px;
//             display: flex;
//             flex-direction: column;
//             gap: 3px;
//           }

//           .info-row {
//             display: flex;
//             gap: 6px;
//             font-size: 9px;
//             line-height: 1.3;
//           }

//           .info-label {
//             font-weight: 600;
//             color: #333;
//             min-width: 48px;
//             flex-shrink: 0;
//             font-size: 8px;
//             text-transform: uppercase;
//           }

//           .info-value {
//             color: #1a1a1a;
//             flex: 1;
//             word-break: break-word;
//             font-size: 9px;
//           }

//           .tags {
//             display: flex;
//             flex-wrap: wrap;
//             gap: 3px;
//             margin-top: 1px;
//           }

//           .tag {
//             background: #333;
//             color: white;
//             padding: 2px 6px;
//             border-radius: 10px;
//             font-size: 8px;
//             font-weight: 500;
//             white-space: nowrap;
//           }

//           .tag.light {
//             background: #e8e8e8;
//             color: #333;
//             border: 0.5px solid #ccc;
//           }

//           .text-truncate {
//             font-size: 8px;
//             line-height: 1.35;
//             color: #1a1a1a;
//             max-height: 48px;
//             overflow: hidden;
//             display: -webkit-box;
//             -webkit-line-clamp: 3;
//             -webkit-box-orient: vertical;
//             word-break: break-word;
//           }

//           .link-item {
//             font-size: 9px;
//             color: #0066cc;
//             text-decoration: none;
//             word-break: break-all;
//           }

//           .admin-note {
//             background: #fffbea;
//             border-left-color: #ffc107;
//             grid-column: 1 / -1;
//           }

//           .admin-note h3 {
//             color: #856404;
//             border-bottom-color: #ffd700;
//           }

//           .admin-note .text-truncate {
//             color: #856404;
//           }

//           /* ===== FOOTER ===== */
//           .footer {
//             text-align: center;
//             font-size: 7px;
//             color: #999;
//             border-top: 1px solid #ddd;
//             padding-top: 4px;
//           }

//           @page {
//             margin: 0;
//             size: A4 portrait;
//           }

//           @media print {
//             body {
//               margin: 0;
//               padding: 12px;
//             }
//             .page {
//               margin: 0;
//             }
//           }
//         </style>
//       </head>
//       <body>
//         <div class="page">

//           <!-- HEADER: PHOTO (1/3) + INFOS (2/3) -->
//           <div class="header">
//             <div 
//               class="photo-wrapper ${mainPhoto ? '' : 'no-photo'}"
//               ${mainPhoto ? `style="background-image: url('${mainPhoto}');"` : ''}
//             >
//               ${!mainPhoto ? 'Aucune photo' : ''}
//             </div>

//             <div class="header-right">
//               <div class="header-title">
//                 <h1>${displayName}</h1>
//                 ${comedien.admin_rating > 0 ? `
//                   <div class="rating">
//                     <span class="stars">${'★'.repeat(comedien.admin_rating)}${'☆'.repeat(5 - comedien.admin_rating)}</span>
//                     <span>${comedien.admin_rating}/5</span>
//                   </div>
//                 ` : ''}
//               </div>

//               <div class="header-meta">
//                 ${age ? `<div class="meta-item"><span class="meta-label">Âge</span> <span class="meta-value">${age} ans</span></div>` : ''}
//                 ${comedien.gender ? `<div class="meta-item"><span class="meta-label">Genre</span> <span class="meta-value">${comedien.gender}</span></div>` : ''}
//                 ${comedien.height ? `<div class="meta-item"><span class="meta-label">Taille</span> <span class="meta-value">${comedien.height} cm</span></div>` : ''}
//                 ${comedien.build ? `<div class="meta-item"><span class="meta-label">Corpo</span> <span class="meta-value">${comedien.build}</span></div>` : ''}
//                 ${comedien.domiciliation ? `<div class="meta-item"><span class="meta-label">Lieu</span> <span class="meta-value">${comedien.domiciliation}</span></div>` : ''}
//                 ${comedien.email ? `<div class="meta-item"><span class="meta-label">Email</span> <span class="meta-value copyable" title="Cliquez pour copier" onclick="copyToClipboard(event)">${comedien.email}</span></div>` : ''}
//                 ${comedien.phone ? `<div class="meta-item"><span class="meta-label">Tél</span> <span class="meta-value copyable" title="Cliquez pour copier" onclick="copyToClipboard(event)">${comedien.phone}</span></div>` : ''}
//               </div>
//             </div>
//           </div>

//           <!-- CONTENU 2 COLONNES -->
//           <div class="content">

//             <!-- COL 1 -->
//             <div>
//               <!-- Infos physiques -->
//               ${(comedien.hair_color || comedien.eye_color || comedien.ethnicity || comedien.nationality) ? `
//                 <div class="section">
//                   <h3>👤 Caractéristiques</h3>
//                   <div class="section-content">
//                     ${comedien.hair_color ? `<div class="info-row"><span class="info-label">Cheveux</span> <span class="info-value">${comedien.hair_color}</span></div>` : ''}
//                     ${comedien.eye_color ? `<div class="info-row"><span class="info-label">Yeux</span> <span class="info-value">${comedien.eye_color}</span></div>` : ''}
//                     ${comedien.ethnicity ? `<div class="info-row"><span class="info-label">Type</span> <span class="info-value">${comedien.ethnicity}</span></div>` : ''}
//                     ${comedien.nationality ? `<div class="info-row"><span class="info-label">Nat.</span> <span class="info-value">${comedien.nationality}</span></div>` : ''}
//                   </div>
//                 </div>
//               ` : ''}

//               <!-- Langues -->
//               ${languages.length > 0 ? `
//                 <div class="section">
//                   <h3>🌍 Langues</h3>
//                   <div class="tags">
//                     ${languages.map(lang => `<span class="tag light">${lang}</span>`).join('')}
//                   </div>
//                 </div>
//               ` : ''}

//               <!-- Compétences -->
//               ${(comedien.driving_licenses_normalized?.length > 0 ||
//                  comedien.dance_skills_normalized?.length > 0 ||
//                  comedien.music_skills_normalized?.length > 0 ||
//                  comedien.diverse_skills_normalized?.length > 0) ? `
//                 <div class="section">
//                   <h3>🎯 Compétences</h3>
//                   <div class="section-content">
//                     ${comedien.driving_licenses_normalized?.length > 0 ? `
//                       <div>
//                         <div style="font-size: 8px; font-weight: 600; color: #333;">Permis</div>
//                         <div class="tags">
//                           ${comedien.driving_licenses_normalized.map((s: string) => `<span class="tag light">${s}</span>`).join('')}
//                         </div>
//                       </div>
//                     ` : ''}
//                     ${comedien.dance_skills_normalized?.length > 0 ? `
//                       <div style="margin-top: 3px;">
//                         <div style="font-size: 8px; font-weight: 600; color: #333;">Danse</div>
//                         <div class="tags">
//                           ${comedien.dance_skills_normalized.map((s: string) => `<span class="tag light">${s}</span>`).join('')}
//                         </div>
//                       </div>
//                     ` : ''}
//                     ${comedien.music_skills_normalized?.length > 0 ? `
//                       <div style="margin-top: 3px;">
//                         <div style="font-size: 8px; font-weight: 600; color: #333;">Musique</div>
//                         <div class="tags">
//                           ${comedien.music_skills_normalized.map((s: string) => `<span class="tag light">${s}</span>`).join('')}
//                         </div>
//                       </div>
//                     ` : ''}
//                     ${comedien.diverse_skills_normalized?.length > 0 ? `
//                       <div style="margin-top: 3px;">
//                         <div style="font-size: 8px; font-weight: 600; color: #333;">Autres</div>
//                         <div class="tags">
//                           ${comedien.diverse_skills_normalized.map((s: string) => `<span class="tag light">${s}</span>`).join('')}
//                         </div>
//                       </div>
//                     ` : ''}
//                   </div>
//                 </div>
//               ` : ''}
//             </div>

//             <!-- COL 2 -->
//             <div>
//               <!-- Représentation -->
//               ${(comedien.agency_name || comedien.agent_name) ? `
//                 <div class="section">
//                   <h3>🏢 Représentation</h3>
//                   <div class="section-content">
//                     ${comedien.agency_name ? `<div class="info-row"><span class="info-label">Agence</span> <span class="info-value">${comedien.agency_name}</span></div>` : ''}
//                     ${comedien.agent_name ? `<div class="info-row"><span class="info-label">Agent</span> <span class="info-value">${comedien.agent_name}</span></div>` : ''}
//                     ${comedien.agent_email ? `<div class="info-row"><span class="info-label">Email</span> <span class="info-value copyable" title="Cliquez pour copier" onclick="copyToClipboard(event)">${comedien.agent_email}</span></div>` : ''}
//                     ${comedien.agent_phone ? `<div class="info-row"><span class="info-label">Tél</span> <span class="info-value copyable" title="Cliquez pour copier" onclick="copyToClipboard(event)">${comedien.agent_phone}</span></div>` : ''}
//                   </div>
//                 </div>
//               ` : ''}

//               <!-- Adresse -->
//               ${(comedien.street || comedien.city) ? `
//                 <div class="section">
//                   <h3>📍 Adresse</h3>
//                   <div class="text-truncate">
//                     ${comedien.street ? `${comedien.street}<br>` : ''}
//                     ${comedien.zip_code || ''} ${comedien.city || ''}<br>
//                     ${comedien.country || ''}
//                   </div>
//                 </div>
//               ` : ''}

//               <!-- Expérience -->
//               ${comedien.experience ? `
//                 <div class="section">
//                   <h3>🎬 Expérience</h3>
//                   <div class="text-truncate">${comedien.experience}</div>
//                 </div>
//               ` : ''}

//               <!-- Formation -->
//               ${comedien.certificates ? `
//                 <div class="section">
//                   <h3>🎓 Formation</h3>
//                   <div class="text-truncate">${comedien.certificates}</div>
//                 </div>
//               ` : ''}
//             </div>

//             <!-- ADMIN NOTE (FULL WIDTH) -->
//             ${comedien.admin_comment ? `
//               <div class="section admin-note">
//                 <h3>💬 Note admin</h3>
//                 <div class="text-truncate">${comedien.admin_comment}</div>
//               </div>
//             ` : ''}

//             <!-- LIENS (COL 2) -->
//             ${(comedien.website_url || comedien.imdb_url || comedien.showreel_url) ? `
//               <div class="section" style="grid-column: 2;">
//                 <h3>🔗 Liens</h3>
//                 <div class="section-content">
//                   ${comedien.imdb_url ? `<a href="${comedien.imdb_url}" target="_blank" class="link-item">IMDb ↗</a>` : ''}
//                   ${comedien.showreel_url ? `<a href="${comedien.showreel_url}" target="_blank" class="link-item">Showreel ↗</a>` : ''}
//                   ${comedien.website_url ? `<a href="${comedien.website_url}" target="_blank" class="link-item">Site web ↗</a>` : ''}
//                 </div>
//               </div>
//             ` : ''}
//           </div>

//           <!-- FOOTER -->
//           <div class="footer">
//             Profil généré le ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })} • ADK-KASTING
//           </div>

//         </div>

//         <script>
//           function copyToClipboard(event) {
//             event.preventDefault()
//             event.stopPropagation()
            
//             const text = event.target.textContent.trim()
            
//             const temp = document.createElement('textarea')
//             temp.value = text
//             temp.style.position = 'fixed'
//             temp.style.opacity = '0'
//             document.body.appendChild(temp)
            
//             try {
//               temp.select()
//               document.execCommand('copy')
              
//               const originalText = event.target.textContent
//               const originalBg = event.target.style.background
              
//               event.target.textContent = '✓ Copié'
//               event.target.style.background = '#c8e6c9'
              
//               setTimeout(() => {
//                 event.target.textContent = originalText
//                 event.target.style.background = originalBg
//               }, 1200)
//             } catch (err) {
//               console.error('Erreur copie:', err)
//             } finally {
//               document.body.removeChild(temp)
//             }
//           }
//         </script>
//       </body>
//       </html>
//     `

//     const options = {
//       margin: 0,
//       filename: `${displayName.replace(/[^a-zA-Z0-9]/g, '_')}_profil_ADK.pdf`,
//       image: { type: 'jpeg' as const, quality: 1 },
//       html2canvas: {
//         scale: 3,
//         useCORS: true,
//         allowTaint: false,
//         logging: false,
//         backgroundColor: '#ffffff',
//         letterRendering: true
//       },
//       jsPDF: {
//         unit: 'mm' as const,
//         format: 'a4' as const,
//         orientation: 'portrait' as const,
//         compress: false
//       },
//       pagebreak: { mode: ['css'] as const }
//     }

//     const element = document.createElement('div')
//     element.innerHTML = htmlContent
//     element.style.width = '210mm'
//     element.style.background = 'white'
//     document.body.appendChild(element)

//     await html2pdf().set(options).from(element).save()

//     document.body.removeChild(element)

//   } catch (error) {
//     console.error('Erreur PDF:', error)
//     alert('Erreur lors de la génération du PDF. Veuillez réessayer.')
//     throw error
//   }
// }

// function calculateAge(birthDate: string): number | null {
//   if (!birthDate) return null
//   const today = new Date()
//   const birth = new Date(birthDate)
//   if (isNaN(birth.getTime())) return null
//   let age = today.getFullYear() - birth.getFullYear()
//   const monthDiff = today.getMonth() - birth.getMonth()
//   return monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate()) ? age - 1 : age
// }


// /lib/pdf-generator.ts
// /lib/pdf-generator.ts
import type { Comedien } from '../types'

export const generateComedienPDF = async (comedien: any) => {
  try {
    if (typeof window === 'undefined') {
      throw new Error('Cette fonction ne peut être utilisée que côté client')
    }

    const html2pdf = (await import('html2pdf.js')).default

    const age = comedien.birth_date ? calculateAge(comedien.birth_date) : null
    const fullName = `${comedien.first_name || ''} ${comedien.last_name || ''}`.trim()
    const displayName = fullName || comedien.display_name_normalized || comedien.email

    const photos = (comedien.photos || []).filter((photo: string) =>
      photo && photo.trim() !== '' && !photo.includes('undefined') && !photo.includes('null')
    )
    const mainPhoto = photos[0] || null

    // Préparer les langues par niveau
    const nativeLanguage = comedien.native_language_normalized || null
    const fluentLanguages = comedien.languages_fluent_normalized || []
    const notionLanguages = comedien.languages_notions_normalized || []
    const hasLanguages = nativeLanguage || fluentLanguages.length > 0 || notionLanguages.length > 0

    // Charger et redessiner l'image en haute qualité SANS étirement
    let photoBase64 = ''
    if (mainPhoto) {
      try {
        photoBase64 = await loadImageAsBase64(mainPhoto)
      } catch (err) {
        console.warn('Erreur chargement image:', err)
      }
    }

    const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>${displayName}</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      html, body {
        width: 100%;
        margin: 0;
        padding: 0;
        font-family: 'Helvetica', 'Arial', sans-serif;
        background: white;
        color: #1a1a1a;
      }

      body {
        padding: 20px;
      }

      .page {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 0;
      }

      /* ===== HEADER PHOTO + NOM + INFOS ===== */
      .header {
        display: grid;
        grid-template-columns: 30% 1fr;
        gap: 16px;
        border-bottom: 3px solid #1a1a1a;
        padding-bottom: 16px;
        margin-bottom: 16px;
      }

      .photo-wrapper {
        aspect-ratio: 3 / 4;
        background: #f5f5f5;
        border: 1px solid #ddd;
        border-radius: 2px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .photo-wrapper img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center top;
        display: block;
      }

      .photo-wrapper.no-photo {
        font-size: 11px;
        color: #999;
      }

      .header-right {
        display: flex;
        flex-direction: column;
        gap: 8px;
        justify-content: flex-start;
      }

      .header-top {
        display: flex;
        align-items: baseline;
        gap: 12px;
        padding-top: 4px;
      }

      h1 {
        font-size: 28px;
        font-weight: 700;
        color: #1a1a1a;
        line-height: 1.2;
        letter-spacing: -0.5px;
      }

      .rating {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: #f8f8f8;
        padding: 4px 10px;
        border-radius: 4px;
        font-size: 10px;
        border: 1px solid #e0e0e0;
        flex-shrink: 0;
      }

      .rating .stars {
        color: #ffc107;
        font-size: 13px;
        letter-spacing: 1px;
      }

      /* Grille infos header 4x2 */
      .header-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px 16px;
        font-size: 10px;
        padding-bottom: 8px;
      }

      .header-item {
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .header-item-label {
        font-weight: 700;
        color: #555;
        text-transform: uppercase;
        font-size: 8.5px;
        letter-spacing: 0.5px;
      }

      .header-item-value {
        color: #1a1a1a;
        font-size: 11px;
        font-weight: 500;
        word-break: break-word;
      }

      .admin-section {
        grid-column: 1 / -1;
        background: #fffbea;
        border-left: 2.5px solid #ffc107;
        padding: 5px;
        border-radius: 1px;
        margin-top: 2px;
      }

      .admin-section-label {
        font-weight: 700;
        color: #856404;
        text-transform: uppercase;
        font-size: 7.5px;
        letter-spacing: 0.3px;
        display: block;
        margin-bottom: 2px;
        padding-bottom: 2px;
        border-bottom: 1px solid #ffd700;
      }

      .admin-section-value {
        color: #856404;
        font-size: 8.5px;
        line-height: 1.3;
        max-height: 30px;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      /* ===== CONTENU PRINCIPAL 2 COLONNES ===== */
      .content {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        flex: 1;
        margin-bottom: 8px;
      }

      .section {
        background: #fafafa;
        border-left: 3px solid #1a1a1a;
        padding: 12px;
        border-radius: 2px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-height: fit-content;
      }

      .section h3 {
        font-size: 12px;
        font-weight: 700;
        color: #1a1a1a;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin: 0;
        padding-bottom: 6px;
        border-bottom: 2px solid #ddd;
      }

      .section-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
        font-size: 10px;
      }

      .info-row {
        display: flex;
        flex-direction: column;
        gap: 3px;
        font-size: 10px;
        line-height: 1.4;
      }

      .info-label {
        font-weight: 700;
        color: #555;
        font-size: 9px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .info-value {
        color: #1a1a1a;
        font-size: 10px;
        font-weight: 500;
        word-break: break-word;
      }

      .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        margin-top: 4px;
      }

      .tag {
        background: #333;
        color: white;
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 9px;
        font-weight: 500;
        white-space: nowrap;
      }

      .tag.light {
        background: #f0f0f0;
        color: #333;
        border: 1px solid #ddd;
      }

      .text-content {
        font-size: 10px;
        line-height: 1.5;
        color: #1a1a1a;
        max-height: 70px;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
        word-break: break-word;
      }

      .link-item {
        font-size: 10px;
        color: #0066cc;
        text-decoration: none;
        word-break: break-all;
      }

      .section.span2 {
        grid-column: 1 / -1;
      }

      /* ===== FOOTER ===== */
      .footer {
        text-align: center;
        font-size: 7px;
        color: #999;
        border-top: 1px solid #ddd;
        padding-top: 4px;
        margin-top: auto;
      }

      @page {
        margin: 0;
        size: A4 portrait;
      }

      @media print {
        body {
          margin: 0;
          padding: 10px;
        }
        .page {
          margin: 0;
        }
      }
    </style>
      </head>
      <body>
        <div class="page">

          <!-- HEADER: PHOTO (30%) + NOM + INFOS (70%) -->
          <div class="header">
            <div class="photo-wrapper ${mainPhoto ? '' : 'no-photo'}">
              ${photoBase64 ? `<img src="${photoBase64}" alt="Photo de ${displayName}">` : 'Aucune photo'}
            </div>

            <div class="header-right">
              <div class="header-top">
                <h1>${displayName}</h1>
                ${comedien.admin_rating > 0 ? `
                  <div class="rating">
                    <span class="stars">${'★'.repeat(comedien.admin_rating)}${'☆'.repeat(5 - comedien.admin_rating)}</span>
                    <span>${comedien.admin_rating}/5</span>
                  </div>
                ` : ''}
              </div>

              <div class="header-grid">
                ${age ? `
                  <div class="header-item">
                    <span class="header-item-label">Âge</span>
                    <span class="header-item-value">${age} ans</span>
                  </div>
                ` : ''}
                ${comedien.gender ? `
                  <div class="header-item">
                    <span class="header-item-label">Genre</span>
                    <span class="header-item-value">${comedien.gender}</span>
                  </div>
                ` : ''}
                ${comedien.height ? `
                  <div class="header-item">
                    <span class="header-item-label">Taille</span>
                    <span class="header-item-value">${comedien.height} cm</span>
                  </div>
                ` : ''}
                ${comedien.build ? `
                  <div class="header-item">
                    <span class="header-item-label">Corpo</span>
                    <span class="header-item-value">${comedien.build}</span>
                  </div>
                ` : ''}
                ${comedien.domiciliation ? `
                  <div class="header-item">
                    <span class="header-item-label">Lieu</span>
                    <span class="header-item-value">${comedien.domiciliation}</span>
                  </div>
                ` : ''}
                ${comedien.email ? `
                  <div class="header-item">
                    <span class="header-item-label">Email</span>
                    <span class="header-item-value">${comedien.email}</span>
                  </div>
                ` : ''}
                ${comedien.phone ? `
                  <div class="header-item">
                    <span class="header-item-label">Tél</span>
                    <span class="header-item-value">${comedien.phone}</span>
                  </div>
                ` : ''}
                ${comedien.nationality ? `
                  <div class="header-item">
                    <span class="header-item-label">Nat.</span>
                    <span class="header-item-value">${comedien.nationality}</span>
                  </div>
                ` : ''}
                
                ${comedien.admin_comment ? `
                  <div class="admin-section">
                    <span class="admin-section-label">💬 Note Admin</span>
                    <span class="admin-section-value">${comedien.admin_comment}</span>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>

          <!-- CONTENU 2 COLONNES -->
          <div class="content">

            <!-- COL 1 -->
            <div>
              <!-- Infos physiques -->
              ${(comedien.hair_color || comedien.eye_color || comedien.ethnicity) ? `
                <div class="section">
                  <h3>👤 Caractéristiques</h3>
                  <div class="section-content">
                    ${comedien.hair_color ? `
                      <div class="info-row">
                        <span class="info-label">Cheveux</span>
                        <span class="info-value">${comedien.hair_color}</span>
                      </div>
                    ` : ''}
                    ${comedien.eye_color ? `
                      <div class="info-row">
                        <span class="info-label">Yeux</span>
                        <span class="info-value">${comedien.eye_color}</span>
                      </div>
                    ` : ''}
                    ${comedien.ethnicity ? `
                      <div class="info-row">
                        <span class="info-label">Type</span>
                        <span class="info-value">${comedien.ethnicity}</span>
                      </div>
                    ` : ''}
                  </div>
                </div>
              ` : ''}

              <!-- Langues -->
              ${hasLanguages ? `
                <div class="section">
                  <h3>🌍 Langues</h3>
                  <div class="section-content">
                    ${nativeLanguage ? `
                      <div>
                        <div style="font-size: 8px; font-weight: 700; color: #555; text-transform: uppercase;">Maternelle</div>
                        <div class="tags">
                          <span class="tag light">${nativeLanguage}</span>
                        </div>
                      </div>
                    ` : ''}
                    ${fluentLanguages.length > 0 ? `
                      <div>
                        <div style="font-size: 8px; font-weight: 700; color: #555; text-transform: uppercase; margin-top: ${nativeLanguage ? '8px' : '0'};">Couramment</div>
                        <div class="tags">
                          ${fluentLanguages.map((lang: string) => `<span class="tag light">${lang}</span>`).join('')}
                        </div>
                      </div>
                    ` : ''}
                    ${notionLanguages.length > 0 ? `
                      <div>
                        <div style="font-size: 8px; font-weight: 700; color: #555; text-transform: uppercase; margin-top: ${(nativeLanguage || fluentLanguages.length > 0) ? '8px' : '0'};">Notions</div>
                        <div class="tags">
                          ${notionLanguages.map((lang: string) => `<span class="tag light">${lang}</span>`).join('')}
                        </div>
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
                  <div class="section-content">
                    ${comedien.driving_licenses_normalized?.length > 0 ? `
                      <div>
                        <div style="font-size: 8px; font-weight: 700; color: #555; text-transform: uppercase;">Permis</div>
                        <div class="tags">
                          ${comedien.driving_licenses_normalized.map((s: string) => `<span class="tag light">${s}</span>`).join('')}
                        </div>
                      </div>
                    ` : ''}
                    ${comedien.dance_skills_normalized?.length > 0 ? `
                      <div style="margin-top: 3px;">
                        <div style="font-size: 8px; font-weight: 700; color: #555; text-transform: uppercase;">Danse</div>
                        <div class="tags">
                          ${comedien.dance_skills_normalized.map((s: string) => `<span class="tag light">${s}</span>`).join('')}
                        </div>
                      </div>
                    ` : ''}
                    ${comedien.music_skills_normalized?.length > 0 ? `
                      <div style="margin-top: 3px;">
                        <div style="font-size: 8px; font-weight: 700; color: #555; text-transform: uppercase;">Musique</div>
                        <div class="tags">
                          ${comedien.music_skills_normalized.map((s: string) => `<span class="tag light">${s}</span>`).join('')}
                        </div>
                      </div>
                    ` : ''}
                    ${comedien.diverse_skills_normalized?.length > 0 ? `
                      <div style="margin-top: 3px;">
                        <div style="font-size: 8px; font-weight: 700; color: #555; text-transform: uppercase;">Autres</div>
                        <div class="tags">
                          ${comedien.diverse_skills_normalized.map((s: string) => `<span class="tag light">${s}</span>`).join('')}
                        </div>
                      </div>
                    ` : ''}
                  </div>
                </div>
              ` : ''}
            </div>

            <!-- COL 2 -->
            <div>
              <!-- Représentation -->
              ${(comedien.agency_name || comedien.agent_name) ? `
                <div class="section">
                  <h3>🏢 Représentation</h3>
                  <div class="section-content">
                    ${comedien.agency_name ? `
                      <div class="info-row">
                        <span class="info-label">Agence</span>
                        <span class="info-value">${comedien.agency_name}</span>
                      </div>
                    ` : ''}
                    ${comedien.agent_name ? `
                      <div class="info-row">
                        <span class="info-label">Agent</span>
                        <span class="info-value">${comedien.agent_name}</span>
                      </div>
                    ` : ''}
                    ${comedien.agent_email ? `
                      <div class="info-row">
                        <span class="info-label">Email</span>
                        <span class="info-value">${comedien.agent_email}</span>
                      </div>
                    ` : ''}
                    ${comedien.agent_phone ? `
                      <div class="info-row">
                        <span class="info-label">Tél</span>
                        <span class="info-value">${comedien.agent_phone}</span>
                      </div>
                    ` : ''}
                  </div>
                </div>
              ` : ''}

              <!-- Adresse -->
              ${(comedien.street || comedien.city) ? `
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
                <div class="section">
                  <h3>🎬 Expérience</h3>
                  <div class="text-content">${comedien.experience}</div>
                </div>
              ` : ''}

              <!-- Formation -->
              ${comedien.certificates ? `
                <div class="section">
                  <h3>🎓 Formation</h3>
                  <div class="text-content">${comedien.certificates}</div>
                </div>
              ` : ''}

              <!-- Liens -->
              ${(comedien.website_url || comedien.imdb_url || comedien.showreel_url) ? `
                <div class="section">
                  <h3>🔗 Liens</h3>
                  <div class="section-content">
                    ${comedien.imdb_url ? `<a href="${comedien.imdb_url}" target="_blank" class="link-item">IMDb ↗</a>` : ''}
                    ${comedien.showreel_url ? `<a href="${comedien.showreel_url}" target="_blank" class="link-item">Showreel ↗</a>` : ''}
                    ${comedien.website_url ? `<a href="${comedien.website_url}" target="_blank" class="link-item">Site web ↗</a>` : ''}
                  </div>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- FOOTER -->
          <div class="footer">
            Profil généré le ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })} • ADK-KASTING • Document confidentiel
          </div>

        </div>
      </body>
      </html>
    `

    const options = {
      margin: 0,
      filename: `${displayName.replace(/[^a-zA-Z0-9]/g, '_')}_profil_ADK.pdf`,
      image: { 
        type: 'png' as const, 
        quality: 1 
      },
      html2canvas: {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#ffffff',
        letterRendering: true,
        imageTimeout: 0,
        removeContainer: true
      },
      jsPDF: {
        unit: 'mm' as const,
        format: 'a4' as const,
        orientation: 'portrait' as const,
        compress: true
      },
      pagebreak: { mode: ['css'] as const }
    }

    const element = document.createElement('div')
    element.innerHTML = htmlContent
    element.style.width = '210mm'
    element.style.background = 'white'
    document.body.appendChild(element)

    await html2pdf().set(options).from(element).save()

    document.body.removeChild(element)

  } catch (error) {
    console.error('Erreur PDF:', error)
    alert('Erreur lors de la génération du PDF. Veuillez réessayer.')
    throw error
  }
}

/**
 * Charge une image et la retourne en base64 haute qualité sans l'étirer
 */
async function loadImageAsBase64(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      // Dimensions cibles (aspect ratio 3:4)
      const targetWidth = 300
      const targetHeight = 400
      
      // Calculer les dimensions pour que l'image couvre tout le conteneur SANS étirement
      const imgRatio = img.naturalWidth / img.naturalHeight
      const targetRatio = targetWidth / targetHeight
      
      let drawWidth = targetWidth
      let drawHeight = targetHeight
      let drawX = 0
      let drawY = 0
      
      if (imgRatio > targetRatio) {
        // Image plus large : on centre horizontalement
        drawWidth = targetHeight * imgRatio
        drawX = -(drawWidth - targetWidth) / 2
      } else {
        // Image plus haute : on centre verticalement
        drawHeight = targetWidth / imgRatio
        drawY = -(drawHeight - targetHeight) / 2
      }
      
      // Créer un canvas avec les dimensions cibles
      const canvas = document.createElement('canvas')
      canvas.width = targetWidth
      canvas.height = targetHeight
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Impossible de créer le contexte canvas'))
        return
      }
      
      // Fond blanc
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, targetWidth, targetHeight)
      
      // Dessiner l'image sans l'étirer (cover mode)
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
      
      // Convertir en base64 PNG haute qualité
      const base64 = canvas.toDataURL('image/png', 1.0)
      resolve(base64)
    }
    
    img.onerror = () => {
      reject(new Error('Erreur chargement image'))
    }
    
    img.src = imageUrl
  })
}

function calculateAge(birthDate: string): number | null {
  if (!birthDate) return null
  const today = new Date()
  const birth = new Date(birthDate)
  if (isNaN(birth.getTime())) return null
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  return monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate()) ? age - 1 : age
}
