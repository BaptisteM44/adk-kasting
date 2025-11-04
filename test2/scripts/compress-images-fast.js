// Script de compression optimisé avec traitement parallèle
// Objectif : passer sous la limite de 1 GB
// Usage: node scripts/compress-images-fast.js
// Optimisations:
// - Traitement parallèle (10 dossiers + 5 fichiers simultanément)
// - Ignore les fichiers < 100 KB (économie négligeable)
// - Skip les PDFs automatiquement
// - Sauvegarde progression (reprise automatique si interruption)

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Configuration
const CONFIG = {
  quality: 80,
  maxWidth: 1920,
  maxHeight: 2560,
  format: 'webp',
  minFileSize: 100 * 1024, // 100 KB minimum (ignore les petits fichiers)
  concurrentFolders: 10,   // Nombre de dossiers en parallèle
  concurrentFiles: 5,      // Nombre de fichiers en parallèle par dossier
  progressFile: 'compression-progress.json'
}

// Charger la progression sauvegardée
function loadProgress() {
  try {
    if (fs.existsSync(CONFIG.progressFile)) {
      const data = fs.readFileSync(CONFIG.progressFile, 'utf8')
      return JSON.parse(data)
    }
  } catch (err) {
    console.log('⚠️  Impossible de charger la progression, démarrage depuis le début')
  }
  return { processedFolders: [], totalSaved: 0, totalProcessed: 0 }
}

// Sauvegarder la progression
function saveProgress(progress) {
  try {
    fs.writeFileSync(CONFIG.progressFile, JSON.stringify(progress, null, 2))
  } catch (err) {
    console.log('⚠️  Impossible de sauvegarder la progression:', err.message)
  }
}

// Vérifier si un fichier doit être traité
function shouldProcessFile(file) {
  const fileSize = file.metadata?.size || 0
  const fileName = file.name.toLowerCase()

  // Skip PDFs
  if (fileName.endsWith('.pdf')) {
    return false
  }

  // Skip fichiers < 100 KB
  if (fileSize < CONFIG.minFileSize) {
    return false
  }

  // Skip fichiers déjà WebP (optimisés)
  if (fileName.endsWith('.webp')) {
    return false
  }

  return true
}

// Traiter un seul fichier
async function processFile(folderName, file) {
  const filePath = `${folderName}/${file.name}`
  const fileSize = file.metadata?.size || 0

  try {
    // Télécharger l'image
    const { data: downloadData, error: downloadError } = await supabase
      .storage
      .from('comedien-photos')
      .download(filePath)

    if (downloadError) {
      return { success: false, saved: 0, error: downloadError.message }
    }

    // Convertir en buffer
    const buffer = Buffer.from(await downloadData.arrayBuffer())

    // Compresser avec Sharp
    const compressedBuffer = await sharp(buffer)
      .resize({
        width: CONFIG.maxWidth,
        height: CONFIG.maxHeight,
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: CONFIG.quality })
      .toBuffer()

    const newSize = compressedBuffer.length
    const saved = fileSize - newSize

    // Seulement re-uploader si on économise de l'espace
    if (saved > 0) {
      const { error: uploadError } = await supabase
        .storage
        .from('comedien-photos')
        .update(filePath, compressedBuffer, {
          contentType: 'image/webp',
          upsert: true
        })

      if (uploadError) {
        return { success: false, saved: 0, error: uploadError.message }
      }

      return {
        success: true,
        saved,
        originalSize: fileSize,
        newSize,
        fileName: file.name
      }
    }

    return { success: true, saved: 0, skipped: true }

  } catch (err) {
    return { success: false, saved: 0, error: err.message }
  }
}

// Traiter un dossier avec parallélisation des fichiers
async function processFolder(folder, progress) {
  const folderName = folder.name

  // Skip si déjà traité
  if (progress.processedFolders.includes(folderName)) {
    return { processed: 0, saved: 0, skipped: true }
  }

  console.log(`\n📂 Traitement: ${folderName}`)

  // Lister les fichiers du dossier
  const { data: files, error } = await supabase
    .storage
    .from('comedien-photos')
    .list(folderName, { limit: 100 })

  if (error || !files || files.length === 0) {
    progress.processedFolders.push(folderName)
    return { processed: 0, saved: 0 }
  }

  // Filtrer les fichiers à traiter
  const filesToProcess = files.filter(shouldProcessFile)

  if (filesToProcess.length === 0) {
    console.log(`  ⏭️  Aucun fichier à traiter (${files.length} fichiers ignorés)`)
    progress.processedFolders.push(folderName)
    return { processed: 0, saved: 0 }
  }

  console.log(`  📸 ${filesToProcess.length} fichiers à compresser (${files.length - filesToProcess.length} ignorés)`)

  // Traiter les fichiers en parallèle (batches de CONFIG.concurrentFiles)
  let folderSaved = 0
  let folderProcessed = 0

  for (let i = 0; i < filesToProcess.length; i += CONFIG.concurrentFiles) {
    const batch = filesToProcess.slice(i, i + CONFIG.concurrentFiles)
    const results = await Promise.all(
      batch.map(file => processFile(folderName, file))
    )

    // Comptabiliser les résultats
    results.forEach((result, idx) => {
      if (result.success && !result.skipped) {
        folderSaved += result.saved
        folderProcessed++
        const savedKB = (result.saved / 1024).toFixed(1)
        const savedPercent = ((result.saved / result.originalSize) * 100).toFixed(1)
        console.log(`    ✅ ${result.fileName}: ${savedKB} KB économisés (${savedPercent}%)`)
      } else if (result.error) {
        console.log(`    ❌ ${batch[idx].name}: ${result.error}`)
      }
    })
  }

  // Marquer comme traité
  progress.processedFolders.push(folderName)

  console.log(`  💾 Total dossier: ${(folderSaved / 1024 / 1024).toFixed(2)} MB économisés`)

  return { processed: folderProcessed, saved: folderSaved }
}

// Fonction principale
async function compressImagesOptimized() {
  console.log('🚀 COMPRESSION OPTIMISÉE (Parallèle + Filtrage)\n')
  console.log(`⚙️  Configuration:`)
  console.log(`   - Fichiers min: ${CONFIG.minFileSize / 1024} KB`)
  console.log(`   - Dossiers parallèles: ${CONFIG.concurrentFolders}`)
  console.log(`   - Fichiers parallèles: ${CONFIG.concurrentFiles}`)
  console.log(`   - Format: WebP ${CONFIG.quality}%\n`)

  // Charger la progression
  const progress = loadProgress()

  if (progress.processedFolders.length > 0) {
    console.log(`📂 Reprise: ${progress.processedFolders.length} dossiers déjà traités`)
    console.log(`💾 Déjà économisé: ${(progress.totalSaved / 1024 / 1024).toFixed(2)} MB\n`)
  }

  try {
    // Lister tous les dossiers
    console.log('🔍 Récupération de la liste des dossiers...\n')
    const { data: folders, error: foldersError } = await supabase
      .storage
      .from('comedien-photos')
      .list('', { limit: 10000 })

    if (foldersError) throw foldersError

    const foldersToProcess = folders.filter(f =>
      f.name && !progress.processedFolders.includes(f.name)
    )

    console.log(`📁 Total: ${folders.length} dossiers`)
    console.log(`✅ Déjà traités: ${progress.processedFolders.length}`)
    console.log(`⏳ Restants: ${foldersToProcess.length}\n`)

    // Traiter les dossiers en parallèle (batches de CONFIG.concurrentFolders)
    const startTime = Date.now()

    for (let i = 0; i < foldersToProcess.length; i += CONFIG.concurrentFolders) {
      const batch = foldersToProcess.slice(i, i + CONFIG.concurrentFolders)
      const batchNum = Math.floor(i / CONFIG.concurrentFolders) + 1
      const totalBatches = Math.ceil(foldersToProcess.length / CONFIG.concurrentFolders)

      console.log(`\n🔄 Batch ${batchNum}/${totalBatches} (${batch.length} dossiers en parallèle)`)

      const results = await Promise.all(
        batch.map(folder => processFolder(folder, progress))
      )

      // Mise à jour des totaux
      results.forEach(result => {
        progress.totalProcessed += result.processed
        progress.totalSaved += result.saved
      })

      // Sauvegarder la progression après chaque batch
      saveProgress(progress)

      // Afficher les statistiques
      const elapsed = (Date.now() - startTime) / 1000 / 60 // minutes
      const processedCount = progress.processedFolders.length
      const remaining = folders.length - processedCount
      const rate = processedCount / elapsed
      const eta = remaining / rate

      console.log(`\n📊 Progression globale:`)
      console.log(`   Dossiers: ${processedCount}/${folders.length} (${((processedCount/folders.length)*100).toFixed(1)}%)`)
      console.log(`   Photos compressées: ${progress.totalProcessed}`)
      console.log(`   Espace économisé: ${(progress.totalSaved / 1024 / 1024).toFixed(2)} MB`)
      console.log(`   Vitesse: ${rate.toFixed(1)} dossiers/min`)
      console.log(`   ETA: ${eta.toFixed(0)} minutes`)
    }

    // Résumé final
    console.log('\n\n🎉 Compression terminée!')
    console.log(`   📂 Dossiers traités: ${progress.processedFolders.length}`)
    console.log(`   📸 Photos compressées: ${progress.totalProcessed}`)
    console.log(`   💾 Espace économisé: ${(progress.totalSaved / 1024 / 1024).toFixed(2)} MB`)
    console.log(`   ⏱️  Temps total: ${((Date.now() - startTime) / 1000 / 60).toFixed(1)} minutes`)

    // Supprimer le fichier de progression
    if (fs.existsSync(CONFIG.progressFile)) {
      fs.unlinkSync(CONFIG.progressFile)
      console.log('\n✅ Fichier de progression supprimé')
    }

  } catch (error) {
    console.error('\n❌ Erreur:', error)
    console.log('\n💾 Progression sauvegardée, vous pouvez relancer le script')
  }
}

// Lancer la compression
compressImagesOptimized()
