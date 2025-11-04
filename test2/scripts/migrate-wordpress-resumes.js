// Migration des CV WordPress vers Supabase Storage
// Usage: node scripts/migrate-wordpress-resumes.js

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fetch = require('node-fetch')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function migrateResumes() {
  console.log('🔍 Récupération des CV WordPress...\n')

  try {
    // Récupérer tous les CV WordPress
    const { data: comediens, error } = await supabase
      .from('comediens')
      .select('id, display_name, actor_resume')
      .not('actor_resume', 'is', null)

    if (error) throw error

    const wordpressResumes = comediens.filter(c =>
      c.actor_resume &&
      (c.actor_resume.includes('wp-content') || c.actor_resume.includes('wordpress'))
    )

    console.log(`📄 Trouvé ${wordpressResumes.length} CV WordPress à migrer\n`)

    let successCount = 0
    let errorCount = 0
    let skippedCount = 0

    for (const comedien of wordpressResumes) {
      try {
        console.log(`\n📂 ${comedien.display_name} (${comedien.id})`)
        console.log(`   URL: ${comedien.actor_resume}`)

        // Télécharger le CV depuis WordPress
        const response = await fetch(comedien.actor_resume)

        if (!response.ok) {
          console.log(`   ❌ Erreur HTTP: ${response.status}`)
          errorCount++
          continue
        }

        const buffer = Buffer.from(await response.arrayBuffer())
        const fileSize = (buffer.length / 1024).toFixed(1)
        console.log(`   📥 Téléchargé: ${fileSize} KB`)

        // Déterminer l'extension du fichier
        const contentType = response.headers.get('content-type')
        let extension = '.pdf'
        if (contentType) {
          if (contentType.includes('pdf')) extension = '.pdf'
          else if (contentType.includes('word')) extension = '.docx'
          else if (contentType.includes('msword')) extension = '.doc'
        }

        // Nom du fichier dans Supabase
        const timestamp = Date.now()
        const fileName = `${timestamp}_resume${extension}`
        const filePath = `${comedien.id}/${fileName}`

        // Upload vers Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('comedien-photos')
          .upload(filePath, buffer, {
            contentType: contentType || 'application/pdf',
            upsert: false
          })

        if (uploadError) {
          console.log(`   ❌ Erreur upload: ${uploadError.message}`)
          errorCount++
          continue
        }

        // Obtenir l'URL publique
        const { data: { publicUrl } } = supabase
          .storage
          .from('comedien-photos')
          .getPublicUrl(filePath)

        // Mettre à jour la table comediens
        const { error: updateError } = await supabase
          .from('comediens')
          .update({ actor_resume: publicUrl })
          .eq('id', comedien.id)

        if (updateError) {
          console.log(`   ❌ Erreur update DB: ${updateError.message}`)
          errorCount++
          continue
        }

        console.log(`   ✅ Migré avec succès → ${publicUrl}`)
        successCount++

      } catch (err) {
        console.log(`   ❌ Erreur: ${err.message}`)
        errorCount++
      }

      // Pause pour éviter de surcharger
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log('\n\n🎉 Migration terminée!')
    console.log(`   ✅ Succès: ${successCount}`)
    console.log(`   ❌ Erreurs: ${errorCount}`)
    console.log(`   ⏭️  Ignorés: ${skippedCount}`)

  } catch (error) {
    console.error('❌ Erreur globale:', error)
  }
}

// Lancer la migration
console.log('🚀 Démarrage de la migration des CV...\n')
migrateResumes()
