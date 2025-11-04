// Script pour supprimer les comptes test
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function deleteTestAccounts() {
  const testEmails = [
    'baptir@outlook.com',
    'bapmorvan@gmail.com'
  ]

  console.log('\n🗑️  Suppression des comptes test...\n')

  for (const email of testEmails) {
    console.log(`📧 Recherche de ${email}...`)

    // Récupérer le compte
    const { data: accounts, error: searchError } = await supabase
      .from('comediens')
      .select('id, email, display_name')
      .eq('email', email)

    if (searchError) {
      console.error(`❌ Erreur recherche ${email}:`, searchError.message)
      continue
    }

    if (!accounts || accounts.length === 0) {
      console.log(`⚠️  Aucun compte trouvé pour ${email}\n`)
      continue
    }

    console.log(`   Trouvé ${accounts.length} compte(s):`)
    accounts.forEach(acc => {
      console.log(`   - ${acc.display_name} (${acc.id})`)
    })

    // Supprimer les comptes
    const { error: deleteError } = await supabase
      .from('comediens')
      .delete()
      .eq('email', email)

    if (deleteError) {
      console.error(`❌ Erreur suppression ${email}:`, deleteError.message)
    } else {
      console.log(`✅ ${accounts.length} compte(s) supprimé(s) pour ${email}\n`)
    }
  }

  console.log('✨ Nettoyage terminé !')
}

deleteTestAccounts()
