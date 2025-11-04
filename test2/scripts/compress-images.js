// Script pour compresser les images du bucket comedien-photos
// Objectif : passer sous la limite de 1 GB (actuellement 1236 MB)
// Usage: node scripts/compress-images.js

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const sharp = require('sharp')
const fetch = require('node-fetch')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Configuration de compression
const COMPRESSION_CONFIG = {
  quality: 80,        // Qualité WebP (80% offre un excellent ratio qualité/taille)
  maxWidth: 1920,     // Largeur max (les photos + grandes seront redimensionnées)
  maxHeight: 2560,    // Hauteur max
  format: 'webp'      // Convertir tout en WebP (meilleure compression que JPEG)
}

async function compressAndReupload() {
  console.log('🔍 Récupération de la liste des fichiers...\n')

  try {
    // Lister tous les dossiers (comédiens)
    const { data: folders, error: foldersError } = await supabase
      .storage
      .from('comedien-photos')
      .list('', { limit: 10000 })

    if (foldersError) throw foldersError

    let totalProcessed = 0
    let totalSaved = 0

    console.log(`📁 Trouvé ${folders.length} dossiers de comédiens\n`)

    // Traiter chaque dossier
    for (const folder of folders) { // Traiter TOUS les dossiers
      if (!folder.name) continue

      console.log(`\n📂 Traitement du dossier: ${folder.name}`)

      const { data: files } = await supabase
        .storage
        .from('comedien-photos')
        .list(folder.name, { limit: 100 })

      if (!files || files.length === 0) continue

      for (const file of files) {
        try {
          const filePath = `${folder.name}/${file.name}`
          const fileSize = file.metadata?.size || 0

          console.log(`  📸 ${file.name} (${(fileSize / 1024).toFixed(1)} KB)`)

          // Télécharger l'image
          const { data: downloadData, error: downloadError } = await supabase
            .storage
            .from('comedien-photos')
            .download(filePath)

          if (downloadError) {
            console.log(`    ❌ Erreur téléchargement: ${downloadError.message}`)
            continue
          }

          // Convertir en buffer
          const buffer = Buffer.from(await downloadData.arrayBuffer())

          // Compresser avec Sharp
          const compressedBuffer = await sharp(buffer)
            .resize({
              width: COMPRESSION_CONFIG.maxWidth,
              height: COMPRESSION_CONFIG.maxHeight,
              fit: 'inside',
              withoutEnlargement: true
            })
            .webp({ quality: COMPRESSION_CONFIG.quality })
            .toBuffer()

          const newSize = compressedBuffer.length
          const saved = fileSize - newSize
          const savedPercent = ((saved / fileSize) * 100).toFixed(1)

          if (saved > 0) {
            console.log(`    ✅ Compressé: ${(newSize / 1024).toFixed(1)} KB (économie: ${savedPercent}%)`)

            // Re-uploader la version compressée
            const { error: uploadError } = await supabase
              .storage
              .from('comedien-photos')
              .update(filePath, compressedBuffer, {
                contentType: 'image/webp',
                upsert: true
              })

            if (uploadError) {
              console.log(`    ❌ Erreur upload: ${uploadError.message}`)
            } else {
              totalSaved += saved
              totalProcessed++
            }
          } else {
            console.log(`    ⏭️  Déjà optimisé`)
          }

        } catch (err) {
          console.log(`    ❌ Erreur: ${err.message}`)
        }
      }
    }

    console.log('\n\n🎉 Compression terminée!')
    console.log(`   Photos traitées: ${totalProcessed}`)
    console.log(`   Espace économisé: ${(totalSaved / 1024 / 1024).toFixed(2)} MB`)

  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

// Compression complète de TOUS les dossiers
console.log('🚀 COMPRESSION COMPLÈTE : Traitement de TOUS les dossiers\n')
compressAndReupload()
