// Script pour analyser l'utilisation du Storage Supabase
// Usage: node scripts/check-storage-usage.js

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function analyzeStorage() {
  console.log('🔍 Analyse du bucket "comedien-photos"...\n')

  try {
    // Lister tous les fichiers du bucket
    const { data: files, error } = await supabase
      .storage
      .from('comedien-photos')
      .list('', {
        limit: 1000,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      })

    if (error) {
      console.error('❌ Erreur:', error)
      return
    }

    // Lister récursivement dans les sous-dossiers
    let allFiles = []

    // Récupérer les dossiers (un par comedien)
    if (files) {
      for (const folder of files) {
        if (folder.name) {
          const { data: folderFiles } = await supabase
            .storage
            .from('comedien-photos')
            .list(folder.name, { limit: 1000 })

          if (folderFiles) {
            allFiles = allFiles.concat(
              folderFiles.map(f => ({
                ...f,
                path: `${folder.name}/${f.name}`,
                comedienId: folder.name
              }))
            )
          }
        }
      }
    }

    // Statistiques
    const totalFiles = allFiles.length
    const totalSize = allFiles.reduce((sum, f) => sum + (f.metadata?.size || 0), 0)
    const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2)

    console.log(`📊 Statistiques du Storage:`)
    console.log(`   Total fichiers: ${totalFiles}`)
    console.log(`   Taille totale: ${totalSizeMB} MB`)
    console.log(`   Limite gratuite: 1000 MB\n`)

    // Grouper par comédien
    const filesByComedien = {}
    allFiles.forEach(f => {
      const id = f.comedienId
      if (!filesByComedien[id]) {
        filesByComedien[id] = []
      }
      filesByComedien[id].push(f)
    })

    console.log(`👤 Nombre de comédiens avec photos: ${Object.keys(filesByComedien).length}\n`)

    // Top 10 comédiens avec le plus de photos
    const sorted = Object.entries(filesByComedien)
      .map(([id, files]) => ({
        id,
        count: files.length,
        size: files.reduce((sum, f) => sum + (f.metadata?.size || 0), 0)
      }))
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)

    console.log('🔝 Top 10 comédiens par taille de photos:')
    sorted.forEach((c, i) => {
      console.log(`   ${i + 1}. Comédien ${c.id}: ${c.count} photos, ${(c.size / 1024 / 1024).toFixed(2)} MB`)
    })

    console.log('\n💡 Recommandations:')
    if (totalSize > 800 * 1024 * 1024) {
      console.log('   ⚠️  Vous approchez de la limite (800+ MB / 1000 MB)')
      console.log('   → Envisagez de compresser les images ou supprimer les anciennes')
    } else {
      console.log(`   ✅ Espace restant: ${(1000 - parseFloat(totalSizeMB)).toFixed(2)} MB`)
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

analyzeStorage()
