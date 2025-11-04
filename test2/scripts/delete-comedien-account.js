// Script pour supprimer le compte comédien Baptiste Morvan
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function deleteComedienAccount() {
  const comedienId = 'e37f502f-959c-4e5a-a182-2e340dd4d915'

  console.log('\n🗑️  Suppression du compte comédien Baptiste Morvan...\n')

  // Vérifier d'abord le compte avant de le supprimer
  const { data: before, error: checkError } = await supabase
    .from('comediens')
    .select('id, email, display_name, created_at, is_active')
    .eq('id', comedienId)
    .single()

  if (checkError || !before) {
    console.log('❌ Compte non trouvé ou déjà supprimé.')
    return
  }

  console.log('📋 Compte à supprimer:')
  console.log(`   ID: ${before.id}`)
  console.log(`   Email: ${before.email}`)
  console.log(`   Nom: ${before.display_name}`)
  console.log(`   Statut: ${before.is_active ? 'Actif' : 'En attente'}`)
  console.log(`   Créé le: ${new Date(before.created_at).toLocaleString('fr-FR')}`)
  console.log('')

  // Supprimer le compte
  const { error: deleteError } = await supabase
    .from('comediens')
    .delete()
    .eq('id', comedienId)

  if (deleteError) {
    console.error('❌ Erreur lors de la suppression:', deleteError)
    return
  }

  console.log('✅ Compte comédien supprimé avec succès!\n')

  // Vérifier qu'il ne reste plus qu'un seul compte
  const { data: remaining, error: verifyError } = await supabase
    .from('comediens')
    .select('id, email, display_name, is_active, created_at')
    .eq('email', 'bapmorvan@gmail.com')
    .order('created_at', { ascending: true })

  if (!verifyError && remaining) {
    console.log(`✅ Vérification: Il reste ${remaining.length} compte(s) avec cet email:\n`)
    remaining.forEach((c, index) => {
      console.log(`${index + 1}. ${c.display_name} - ${c.is_active ? 'Actif ✅' : 'En attente ❌'}`)
      console.log(`   ID: ${c.id}`)
      console.log(`   Créé le: ${new Date(c.created_at).toLocaleString('fr-FR')}`)
      console.log('')
    })
  }

  if (remaining && remaining.length === 1) {
    console.log('🎉 Parfait! Il ne reste plus qu\'un seul compte avec cet email.')
    console.log('   Vous pouvez maintenant ajouter la contrainte UNIQUE sur la colonne email.')
    console.log('\n📝 Étapes suivantes:')
    console.log('   1. Ouvrez Supabase SQL Editor')
    console.log('   2. Exécutez le fichier: test2/sql/add_email_unique_constraint.sql')
  }
}

deleteComedienAccount()
