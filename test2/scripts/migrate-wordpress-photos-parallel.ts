/**
 * Script de migration PARALLÈLE des photos WordPress vers Supabase Storage
 * Divise la charge en plusieurs processus pour accélérer la migration
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Paramètres de parallélisation
const WORKER_ID = parseInt(process.env.WORKER_ID || '0')
const TOTAL_WORKERS = parseInt(process.env.TOTAL_WORKERS || '1')

async function migrateWordPressPhotos() {
  console.log(`\n🚀 WORKER ${WORKER_ID + 1}/${TOTAL_WORKERS} - DÉBUT DE LA MIGRATION\n`)
  console.log('═'.repeat(80))
  
  try {
    // 1. Compter le nombre total de comédiens
    const { count, error: countError } = await supabase
      .from('comediens')
      .select('*', { count: 'exact', head: true })
    
    if (countError) throw countError
    
    console.log(`\n📊 TOTAL: ${count} comédiens dans la base de données`)
    console.log(`📌 Ce worker traitera 1 comédien sur ${TOTAL_WORKERS}\n`)
    
    // 2. Récupérer TOUS les comédiens par batch de 1000
    let allComediens: any[] = []
    let offset = 0
    const batchSize = 1000
    
    while (true) {
      const { data: batch, error: fetchError } = await supabase
        .from('comediens')
        .select('id, user_id, first_name, last_name, photos, actor_photo1, actor_photo2, actor_photo3, actor_photo4, actor_photo5, profile_picture')
        .range(offset, offset + batchSize - 1)
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      
      if (!batch || batch.length === 0) break
      
      allComediens = [...allComediens, ...batch]
      
      if (batch.length < batchSize) break
      offset += batchSize
    }
    
    // 3. Filtrer pour ce worker (distribuer la charge)
    const myComediens = allComediens.filter((_, index) => index % TOTAL_WORKERS === WORKER_ID)
    
    console.log(`✅ ${myComediens.length} comédiens assignés à ce worker\n`)
    
    let totalPhotos = 0
    let migratedPhotos = 0
    let errorPhotos = 0
    let skippedPhotos = 0
    let processedComediens = 0
    
    for (const comedien of myComediens) {
      processedComediens++
      const progress = Math.round((processedComediens / myComediens.length) * 100)
      
      console.log(`\n[${progress}%] 👤 ${comedien.first_name || 'Inconnu'} ${comedien.last_name || 'Inconnu'} (${processedComediens}/${myComediens.length})`)
      console.log('─'.repeat(40))
      
      // Collecter toutes les URLs de photos WordPress
      const wpPhotoUrls: string[] = []
      
      // Photos dans le tableau photos[]
      if (comedien.photos && Array.isArray(comedien.photos)) {
        wpPhotoUrls.push(...comedien.photos.filter((url: string) => 
          url && typeof url === 'string' && url.includes('wp-content')
        ))
      }
      
      // Photos individuelles (actor_photo1-5)
      const photoFields = ['actor_photo1', 'actor_photo2', 'actor_photo3', 'actor_photo4', 'actor_photo5', 'profile_picture']
      for (const field of photoFields) {
        const url = comedien[field]
        if (url && typeof url === 'string' && url.includes('wp-content')) {
          wpPhotoUrls.push(url)
        }
      }
      
      // Dédupliquer
      const uniqueWpUrls = [...new Set(wpPhotoUrls)]
      
      if (uniqueWpUrls.length === 0) {
        console.log('  ℹ️  Aucune photo WordPress à migrer')
        continue
      }
      
      console.log(`  📷 ${uniqueWpUrls.length} photo(s) WordPress trouvée(s)`)
      totalPhotos += uniqueWpUrls.length
      
      // Migrer chaque photo
      const newPhotoUrls: string[] = []
      
      for (let i = 0; i < uniqueWpUrls.length; i++) {
        const wpUrl = uniqueWpUrls[i]
        
        try {
          // Télécharger la photo depuis WordPress
          const response = await fetch(wpUrl)
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
          }
          
          const arrayBuffer = await response.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)
          
          // Extraire l'extension du fichier
          const urlParts = wpUrl.split('/')
          const fileName = urlParts[urlParts.length - 1]
          const extension = fileName.split('.').pop()?.toLowerCase() || 'jpg'
          
          // Générer un nom de fichier unique
          const timestamp = Date.now()
          const newFileName = `${timestamp}_${i + 1}.${extension}`
          
          // Uploader vers Supabase Storage
          const userId = comedien.user_id || comedien.id
          const filePath = `${userId}/${newFileName}`
          
          const { error: uploadError } = await supabase.storage
            .from('comedien-photos')
            .upload(filePath, buffer, {
              contentType: `image/${extension}`,
              upsert: false,
              cacheControl: '3600'
            })
          
          if (uploadError) {
            // Si le fichier existe déjà, on le skip
            if (uploadError.message.includes('already exists')) {
              skippedPhotos++
              continue
            }
            throw uploadError
          }
          
          // Obtenir l'URL publique
          const { data: publicUrlData } = supabase.storage
            .from('comedien-photos')
            .getPublicUrl(filePath)
          
          const newUrl = publicUrlData.publicUrl
          newPhotoUrls.push(newUrl)
          
          migratedPhotos++
          
          // Petite pause pour ne pas surcharger le serveur
          await new Promise(resolve => setTimeout(resolve, 50))
          
        } catch (error: any) {
          errorPhotos++
        }
      }
      
      // Mettre à jour la base de données avec les nouvelles URLs
      if (newPhotoUrls.length > 0) {
        const { error: updateError } = await supabase
          .from('comediens')
          .update({ photos: newPhotoUrls })
          .eq('id', comedien.id)
        
        if (updateError) {
          console.error(`  ❌ ERREUR lors de la mise à jour: ${updateError.message}`)
        } else {
          console.log(`  ✅ ${newPhotoUrls.length} photo(s) migrée(s)`)
        }
      }
    }
    
    // Résumé final
    console.log('\n\n')
    console.log('═'.repeat(80))
    console.log(`📊 RÉSUMÉ WORKER ${WORKER_ID + 1}/${TOTAL_WORKERS}`)
    console.log('═'.repeat(80))
    console.log(`  Comédiens traités:             ${processedComediens}`)
    console.log(`  Total de photos WordPress:     ${totalPhotos}`)
    console.log(`  Photos migrées avec succès:    ${migratedPhotos} ✅`)
    console.log(`  Photos déjà existantes:        ${skippedPhotos} ⏭️`)
    console.log(`  Photos en erreur:              ${errorPhotos} ❌`)
    console.log(`  Taux de réussite:              ${totalPhotos > 0 ? Math.round((migratedPhotos / totalPhotos) * 100) : 0}%`)
    console.log('═'.repeat(80))
    console.log(`\n✨ Worker ${WORKER_ID + 1} terminé !\n`)
    
  } catch (error: any) {
    console.error(`\n❌ ERREUR FATALE Worker ${WORKER_ID + 1}:`, error.message)
    console.error(error)
    process.exit(1)
  }
}

// Lancer la migration
migrateWordPressPhotos()
