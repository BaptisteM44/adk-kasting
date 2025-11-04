// Script pour vérifier les doublons d'email
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkDuplicates() {
  const email = 'bapmorvan@gmail.com'

  console.log(`\n🔍 Recherche de tous les comptes avec l'email: ${email}\n`)

  // Chercher tous les enregistrements avec cet email (insensible à la casse)
  const { data: comediens, error } = await supabase
    .from('comediens')
    .select('id, email, first_name, last_name, display_name, is_active, created_at')
    .or(`email.eq.${email},email.eq.${email.toLowerCase()},email.eq.${email.toUpperCase()}`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Erreur:', error)
    return
  }

  console.log(`✅ Trouvé ${comediens.length} compte(s) avec cet email:\n`)

  comediens.forEach((c, index) => {
    console.log(`${index + 1}. ID: ${c.id}`)
    console.log(`   Email: ${c.email}`)
    console.log(`   Nom: ${c.display_name || `${c.first_name} ${c.last_name}`}`)
    console.log(`   Actif: ${c.is_active ? 'OUI ✅' : 'NON ❌ (en attente)'}`)
    console.log(`   Créé le: ${new Date(c.created_at).toLocaleString('fr-FR')}`)
    console.log('')
  })

  if (comediens.length > 1) {
    console.log(`⚠️  DOUBLON DÉTECTÉ! Il y a ${comediens.length} comptes avec le même email.`)
    console.log(`\n💡 Pour supprimer les doublons, gardez le plus ancien et supprimez les autres.`)
    console.log(`   Commande pour supprimer un doublon (remplacez ID_A_SUPPRIMER):`)
    console.log(`   DELETE FROM comediens WHERE id = 'ID_A_SUPPRIMER';`)
  } else if (comediens.length === 1) {
    console.log(`✅ Aucun doublon. Un seul compte existe avec cet email.`)
  } else {
    console.log(`⚠️  Aucun compte trouvé avec cet email.`)
  }
}

checkDuplicates()
