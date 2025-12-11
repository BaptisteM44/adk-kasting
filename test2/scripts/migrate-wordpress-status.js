#!/usr/bin/env node
/**
 * Migration des statuts WordPress vers Supabase
 * Combine _account_status ET userpro_verified pour déterminer le vrai statut
 *
 * Utilisation:
 * 1. Exporter depuis WordPress phpMyAdmin:
 *    SELECT
 *        u.user_email,
 *        COALESCE(account.meta_value, 'NULL') as account_status,
 *        verified.meta_value as verified
 *    FROM wp_users u
 *    LEFT JOIN wp_usermeta account ON u.ID = account.user_id AND account.meta_key = '_account_status'
 *    LEFT JOIN wp_usermeta verified ON u.ID = verified.user_id AND verified.meta_key = 'userpro_verified'
 *    ORDER BY u.user_email;
 *
 * 2. Sauvegarder en CSV: wordpress_account_status.csv
 *
 * 3. Lancer ce script: node migrate-wordpress-status.js
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

// Mapping WordPress → Supabase
// La logique combine _account_status ET userpro_verified
function getSupabaseStatus(wpStatus, verified) {
  // Si userpro_verified = 1 → Profil PAYÉ (25€)
  if (verified === '1') {
    if (wpStatus === 'archived') return 'trash'  // Payé mais archivé
    return 'published'  // Payé et actif
  }

  // Si userpro_verified = NULL → Profil GRATUIT (non payé)
  if (wpStatus === 'pending_admin') return 'pending'  // En attente validation
  if (wpStatus === 'archived') return 'trash'         // Archivé
  if (wpStatus === 'deleted') return 'trash'          // Supprimé
  if (wpStatus === 'active' || wpStatus === 'NULL') return 'approved'  // Validé mais non payé

  return 'approved'  // Par défaut
}

async function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n').filter(line => line.trim())

  // Ignorer la première ligne (header)
  const dataLines = lines.slice(1)

  const mapping = []
  for (const line of dataLines) {
    // Parser le CSV avec 3 colonnes: email, account_status, verified
    // Nettoyer les guillemets et les espaces
    const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''))

    if (parts.length >= 2 && parts[0]) { // Ignorer les lignes sans email
      const email = parts[0]
      const wpStatus = parts[1] || 'NULL'
      const verified = parts[2] || null
      mapping.push({ email, wpStatus, verified })
    }
  }

  return mapping
}

async function migrateStatus() {
  console.log('🚀 Migration des statuts WordPress → Supabase\n')

  // Chercher le fichier CSV
  const csvPath = path.join(__dirname, 'wordpress_account_status.csv')
  if (!fs.existsSync(csvPath)) {
    console.error('❌ Fichier wordpress_account_status.csv introuvable')
    console.log('\n📝 Instructions:')
    console.log('1. Allez dans phpMyAdmin WordPress')
    console.log('2. Exécutez cette requête:')
    console.log(`
SELECT
    u.user_email,
    COALESCE(status.meta_value, 'NULL') as wp_account_status
FROM wp_users u
LEFT JOIN wp_usermeta status ON u.ID = status.user_id AND status.meta_key = '_account_status'
ORDER BY u.user_email;
    `)
    console.log('3. Exportez en CSV')
    console.log('4. Sauvegardez comme: test2/scripts/wordpress_account_status.csv')
    console.log('5. Relancez ce script\n')
    process.exit(1)
  }

  // 1. Vérifier l'état AVANT
  console.log('📊 État actuel dans Supabase:\n')
  const { data: beforeStats } = await supabase
    .from('comediens')
    .select('status')

  const beforeCounts = beforeStats.reduce((acc, row) => {
    acc[row.status] = (acc[row.status] || 0) + 1
    return acc
  }, {})

  Object.entries(beforeCounts).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`)
  })

  // 2. Parser le CSV
  console.log('\n📂 Lecture du fichier CSV...\n')
  const wpMapping = await parseCSV(csvPath)
  console.log(`  ✓ ${wpMapping.length} utilisateurs WordPress trouvés\n`)

  // 3. Afficher le mapping
  console.log('📋 Mapping WordPress → Supabase:\n')
  const mappingStats = wpMapping.reduce((acc, item) => {
    const newStatus = getSupabaseStatus(item.wpStatus, item.verified)
    const verifiedLabel = item.verified === '1' ? 'PAYÉ' : 'GRATUIT'
    const key = `${item.wpStatus} (${verifiedLabel}) → ${newStatus}`
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  Object.entries(mappingStats).forEach(([mapping, count]) => {
    console.log(`  ${mapping}: ${count} profils`)
  })

  // 4. Confirmer avant migration
  console.log('\n⚠️  Cette migration va modifier les statuts de tous les profils.')
  console.log('Appuyez sur Ctrl+C pour annuler, ou attendez 5 secondes pour continuer...\n')

  await new Promise(resolve => setTimeout(resolve, 5000))

  // 5. Migration
  console.log('🔄 Migration en cours...\n')
  let updated = 0
  let notFound = 0
  let errors = 0

  for (const item of wpMapping) {
    const newStatus = getSupabaseStatus(item.wpStatus, item.verified)

    try {
      const { data, error } = await supabase
        .from('comediens')
        .update({ status: newStatus })
        .eq('email', item.email)
        .select()

      if (error) {
        console.error(`  ❌ Erreur pour ${item.email}:`, error.message)
        errors++
      } else if (!data || data.length === 0) {
        notFound++
      } else {
        updated++
        if (updated % 100 === 0) {
          console.log(`  ... ${updated} profils mis à jour`)
        }
      }
    } catch (error) {
      console.error(`  ❌ Exception pour ${item.email}:`, error.message)
      errors++
    }
  }

  console.log(`\n✅ Migration terminée !`)
  console.log(`  - ${updated} profils mis à jour`)
  console.log(`  - ${notFound} emails non trouvés dans Supabase`)
  console.log(`  - ${errors} erreurs\n`)

  // 6. Vérifier l'état APRÈS
  console.log('📊 État final dans Supabase:\n')
  const { data: afterStats } = await supabase
    .from('comediens')
    .select('status')

  const afterCounts = afterStats.reduce((acc, row) => {
    acc[row.status] = (acc[row.status] || 0) + 1
    return acc
  }, {})

  Object.entries(afterCounts).forEach(([status, count]) => {
    const before = beforeCounts[status] || 0
    const diff = count - before
    const diffStr = diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : '±0'
    console.log(`  ${status}: ${count} (${diffStr})`)
  })

  console.log('\n🎉 Migration réussie !\n')
}

migrateStatus().catch(console.error)
