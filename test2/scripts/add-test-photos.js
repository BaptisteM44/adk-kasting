require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function addTestPhotos() {
  try {
    console.log('🔍 Récupération du comédien...')
    
    const { data: comediens, error: fetchError } = await supabase
      .from('comediens')
      .select('id, email, actor_photo1, photos')
      .limit(1)

    if (fetchError) throw fetchError
    if (!comediens || comediens.length === 0) {
      console.log('❌ Aucun comédien trouvé')
      return
    }

    const comedien = comediens[0]
    console.log('✅ Comédien:', comedien.email)
    console.log('📸 Photo actuelle:', comedien.actor_photo1)
    
    // URLs de photos de test (placeholders)
    const testPhotos = [
      comedien.actor_photo1, // Garder la photo existante
      'https://via.placeholder.com/400x600/FF6B6B/FFFFFF?text=Photo+2',
      'https://via.placeholder.com/400x600/4ECDC4/FFFFFF?text=Photo+3',
      'https://via.placeholder.com/400x600/45B7D1/FFFFFF?text=Photo+4',
      'https://via.placeholder.com/400x600/FFA07A/FFFFFF?text=Photo+5',
      'https://via.placeholder.com/400x600/98D8C8/FFFFFF?text=Photo+6'
    ].filter(p => p) // Enlever les null

    console.log('\n📤 Mise à jour avec', testPhotos.length, 'photos...')

    const { error: updateError } = await supabase
      .from('comediens')
      .update({
        photos: testPhotos,
        actor_photo2: testPhotos[1] || null,
        actor_photo3: testPhotos[2] || null,
        actor_photo4: testPhotos[3] || null,
        actor_photo5: testPhotos[4] || null
      })
      .eq('id', comedien.id)

    if (updateError) throw updateError

    console.log('✅ Photos de test ajoutées avec succès !')
    console.log('\n📸 Photos ajoutées:')
    testPhotos.forEach((photo, i) => {
      console.log(`  ${i + 1}. ${photo}`)
    })
    
    console.log('\n💡 Rechargez la page du comédien pour voir la galerie complète !')
    console.log(`   http://localhost:3000/comediens/${comedien.id}`)

  } catch (error) {
    console.error('❌ Erreur:', error.message)
  }
}

addTestPhotos()
