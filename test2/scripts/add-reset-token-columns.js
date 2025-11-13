// Script pour ajouter les colonnes reset_token à la table comediens
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function addResetTokenColumns() {
  console.log('\n🔧 Ajout des colonnes reset_token à la table comediens...\n')

  // Lire le fichier SQL
  const sqlPath = path.join(__dirname, '../sql/add_reset_token_columns.sql')
  const sql = fs.readFileSync(sqlPath, 'utf8')

  console.log('📋 Exécution du SQL:\n')
  console.log(sql)
  console.log('\n')

  // Exécuter le SQL
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

  if (error) {
    console.error('❌ Erreur lors de l\'exécution:', error.message)
    console.log('\n⚠️  Exécutez ce SQL manuellement dans le SQL Editor de Supabase:\n')
    console.log(sql)
    process.exit(1)
  }

  console.log('✅ Colonnes ajoutées avec succès !')
  console.log('\n✨ La table comediens contient maintenant:')
  console.log('   - reset_token (TEXT)')
  console.log('   - reset_token_expiry (TIMESTAMPTZ)')
  console.log('\n📝 Vous pouvez maintenant tester l\'envoi d\'email de reset password!')
}

addResetTokenColumns()
