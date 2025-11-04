// Script pour supprimer le doublon récent
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function deleteDuplicate() {
  const duplicateId = 'd394bed0-fb76-49f5-b931-1f805da201ba'

  console.log('\n🗑️  Suppression du doublon récent...\n')

  // Vérifier d'abord le compte avant de le supprimer
  const { data: before, error: checkError } = await supabase
    .from('comediens')
    .select('id, email, display_name, created_at')
    .eq('id', duplicateId)
    .single()

  if (checkError || !before) {
    console.log('❌ Compte non trouvé ou déjà supprimé.')
    return
  }

  console.log('📋 Compte à supprimer:')
  console.log(`   ID: ${before.id}`)
  console.log(`   Email: ${before.email}`)
  console.log(`   Nom: ${before.display_name}`)
  console.log(`   Créé le: ${new Date(before.created_at).toLocaleString('fr-FR')}`)
  console.log('')

  // Supprimer le doublon
  const { error: deleteError } = await supabase
    .from('comediens')
    .delete()
    .eq('id', duplicateId)

  if (deleteError) {
    console.error('❌ Erreur lors de la suppression:', deleteError)
    return
  }

  console.log('✅ Doublon supprimé avec succès!\n')

  // Vérifier qu'il ne reste plus qu'un ou deux comptes
  const { data: remaining, error: verifyError } = await supabase
    .from('comediens')
    .select('id, email, display_name, is_active, created_at')
    .eq('email', 'bapmorvan@gmail.com')
    .order('created_at', { ascending: true })

  if (!verifyError && remaining) {
    console.log(`✅ Vérification: Il reste ${remaining.length} compte(s) avec cet email:\n`)
    remaining.forEach((c, index) => {
      console.log(`${index + 1}. ${c.display_name} - ${c.is_active ? 'Actif ✅' : 'En attente ❌'}`)
      console.log(`   Créé le: ${new Date(c.created_at).toLocaleString('fr-FR')}`)
    })
  }
}

deleteDuplicate()
