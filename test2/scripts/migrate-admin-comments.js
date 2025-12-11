#!/usr/bin/env node
/**
 * Migration des commentaires admin WordPress vers Supabase
 *
 * Les commentaires WordPress sont dans wp_usermeta.description
 * On les migre vers la table admin_comments de Supabase
 *
 * Utilisation:
 * 1. Exporter depuis WordPress phpMyAdmin en CSV
 * 2. Sauvegarder comme wordpress_admin_comments.csv
 * 3. Lancer: node migrate-admin-comments.js
 */

require('dotenv').config({ path: '../.env' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n').filter(line => line.trim())

  // Ignorer la première ligne (header)
  const dataLines = lines.slice(1)

  const comments = []
  for (const line of dataLines) {
    // Parser CSV: "email","comment","date"
    // Utiliser split et nettoyer les guillemets
    const parts = line.split('","').map(p => p.replace(/^"|"$/g, ''))

    if (parts.length >= 2 && parts[0] && parts[1]) {
      const email = parts[0]
      const comment = parts[1]
      const date = parts[2] || new Date().toISOString()
      comments.push({ email, comment, date })
    }
  }

  return comments
}

async function migrateComments() {
  console.log('🚀 Migration des commentaires admin WordPress → Supabase\n')

  // Chercher le fichier CSV
  const csvPath = path.join(__dirname, 'wordpress_admin_comments.csv')
  if (!fs.existsSync(csvPath)) {
    console.error('❌ Fichier wordpress_admin_comments.csv introuvable')
    console.log('\n📝 Instructions:')
    console.log('1. Allez dans phpMyAdmin WordPress')
    console.log('2. Exécutez cette requête:')
    console.log(`
SELECT
    u.user_email,
    description.meta_value as admin_comment,
    u.user_registered as comment_date
FROM wp_users u
LEFT JOIN wp_usermeta description ON u.ID = description.user_id AND description.meta_key = 'description'
WHERE description.meta_value IS NOT NULL
  AND description.meta_value != ''
ORDER BY u.user_email;
    `)
    console.log('3. Exportez en CSV')
    console.log('4. Sauvegardez comme: test2/scripts/wordpress_admin_comments.csv')
    console.log('5. Relancez ce script\n')
    process.exit(1)
  }

  // 1. Vérifier l'état AVANT
  console.log('📊 Commentaires actuels dans Supabase:\n')
  const { data: beforeComments, error: beforeError } = await supabase
    .from('admin_comments')
    .select('id', { count: 'exact' })

  if (beforeError) {
    console.error('❌ Erreur:', beforeError.message)
  } else {
    console.log(`  Nombre actuel: ${beforeComments?.length || 0}\n`)
  }

  // 2. Parser le CSV
  console.log('📂 Lecture du fichier CSV...\n')
  const wpComments = await parseCSV(csvPath)
  console.log(`  ✓ ${wpComments.length} commentaires WordPress trouvés\n`)

  // 3. Confirmer avant migration
  console.log('⚠️  Cette migration va ajouter les commentaires WordPress à la table admin_comments.')
  console.log('Appuyez sur Ctrl+C pour annuler, ou attendez 5 secondes pour continuer...\n')

  await new Promise(resolve => setTimeout(resolve, 5000))

  // 4. Migration
  console.log('🔄 Migration en cours...\n')
  let inserted = 0
  let errors = 0
  let comedienNotFound = 0

  for (const item of wpComments) {
    try {
      // 1. Trouver le comédien par email
      const { data: comedien, error: findError } = await supabase
        .from('comediens')
        .select('id')
        .eq('email', item.email)
        .single()

      if (findError || !comedien) {
        comedienNotFound++
        continue
      }

      // 2. Insérer le commentaire
      const { error: insertError } = await supabase
        .from('admin_comments')
        .insert({
          comedien_id: comedien.id,
          admin_name: 'Migration WordPress',
          comment: item.comment,
          created_at: item.date
        })

      if (insertError) {
        console.error(`  ❌ Erreur pour ${item.email}:`, JSON.stringify(insertError, null, 2))
        errors++
      } else {
        inserted++
        if (inserted % 50 === 0) {
          console.log(`  ... ${inserted} commentaires ajoutés`)
        }
      }
    } catch (error) {
      console.error(`  ❌ Exception pour ${item.email}:`, error)
      errors++
    }
  }

  console.log(`\n✅ Migration terminée !`)
  console.log(`  - ${inserted} commentaires ajoutés`)
  console.log(`  - ${comedienNotFound} comédiens non trouvés dans Supabase`)
  console.log(`  - ${errors} erreurs\n`)

  // 5. Vérifier l'état APRÈS
  console.log('📊 État final dans Supabase:\n')
  const { data: afterComments, error: afterError } = await supabase
    .from('admin_comments')
    .select('id', { count: 'exact' })

  if (!afterError) {
    const before = beforeComments?.length || 0
    const after = afterComments?.length || 0
    const diff = after - before
    console.log(`  Nombre total: ${after} (+${diff})\n`)
  }

  console.log('🎉 Migration des commentaires réussie !\n')
}

migrateComments().catch(console.error)
