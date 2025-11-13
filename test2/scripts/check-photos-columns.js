// Script pour vérifier les colonnes de photos d'un comédien
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkPhotosColumns() {
  const comedienId = '3007073e-d0e6-4dad-a8f2-a6eae3d7c1ec'

  console.log('\n📸 Vérification des colonnes de photos pour Baptiste Morvan...\n')

  // Récupérer toutes les colonnes liées aux photos
  const { data: comedien, error } = await supabase
    .from('comediens')
    .select('id, email, first_name, last_name, profile_picture, photos')
    .eq('id', comedienId)
    .single()

  if (error) {
    console.error('❌ Erreur:', error.message)
    return
  }

  console.log(`📋 Colonnes de photos pour ${comedien.first_name} ${comedien.last_name}:\n`)
  console.log(`   profile_picture: ${comedien.profile_picture || '(vide)'}`)
  console.log(`   photos (array):  ${comedien.photos ? JSON.stringify(comedien.photos, null, 2) : '(vide)'}`)

  console.log('\n💡 Analyse:')

  const hasProfilePicture = !!comedien.profile_picture
  const hasPhotosArray = comedien.photos && comedien.photos.length > 0

  if (!hasProfilePicture && !hasPhotosArray) {
    console.log('   ⚠️  Aucune photo trouvée')
    console.log('\n📝 Les photos doivent être stockées dans:')
    console.log('   - profile_picture: URL de la photo de profil principale')
    console.log('   - photos: Array PostgreSQL TEXT[] avec les URLs des photos supplémentaires')
  } else {
    if (hasProfilePicture) console.log('   ✅ Photo de profil présente')
    if (hasPhotosArray) console.log(`   ✅ ${comedien.photos.length} photo(s) dans l'array`)
  }
}

checkPhotosColumns()
