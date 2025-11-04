// Script pour vérifier l'inscription baptir@outlook.com
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkInscription() {
  const email = 'baptir@outlook.com'

  console.log(`\n🔍 Recherche de l'inscription: ${email}\n`)

  // Chercher tous les enregistrements avec cet email
  const { data: comediens, error } = await supabase
    .from('comediens')
    .select('id, email, first_name, last_name, display_name, is_active, created_at')
    .eq('email', email)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Erreur:', error)
    return
  }

  if (comediens.length === 0) {
    console.log('❌ Aucune inscription trouvée avec cet email.')
    console.log('\n💡 L\'inscription a peut-être échoué. Vérifiez:')
    console.log('   1. Les erreurs dans la console du navigateur lors de l\'inscription')
    console.log('   2. Les logs de l\'API /api/auth/register')
    return
  }

  console.log(`✅ Trouvé ${comediens.length} compte(s) avec cet email:\n`)

  comediens.forEach((c, index) => {
    console.log(`${index + 1}. ID: ${c.id}`)
    console.log(`   Email: ${c.email}`)
    console.log(`   Nom: ${c.display_name || `${c.first_name} ${c.last_name}`}`)
    console.log(`   Statut: ${c.is_active ? '✅ ACTIF' : '❌ EN ATTENTE'}`)
    console.log(`   Créé le: ${new Date(c.created_at).toLocaleString('fr-FR')}`)
    console.log('')
  })

  // Chercher spécifiquement les inscriptions en attente
  const pending = comediens.filter(c => !c.is_active)

  if (pending.length > 0) {
    console.log(`✅ Il y a ${pending.length} inscription(s) en attente qui DEVRAIT apparaître dans le dashboard.`)
  } else {
    console.log('⚠️  Aucune inscription en attente. Tous les comptes sont actifs.')
  }
}

checkInscription()
