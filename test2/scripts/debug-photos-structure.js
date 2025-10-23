require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkPhotosStructure() {
  try {
    console.log('🔍 Récupération des données photo...\n')
    
    const { data: comediens, error } = await supabase
      .from('comediens')
      .select('id, email, photos, actor_photo1, actor_photo2, actor_photo3, actor_photo4, actor_photo5')
      .limit(3)

    if (error) throw error

    comediens.forEach((comedien, i) => {
      console.log(`\n=== COMÉDIEN ${i + 1}: ${comedien.email} ===`)
      console.log('📸 Type de photos:', typeof comedien.photos)
      console.log('📸 Array.isArray(photos):', Array.isArray(comedien.photos))
      console.log('📸 Valeur brute photos:', JSON.stringify(comedien.photos))
      console.log('📸 Length:', comedien.photos?.length)
      
      console.log('\n📷 Photos WordPress:')
      console.log('  actor_photo1:', comedien.actor_photo1 ? '✅' : '❌')
      console.log('  actor_photo2:', comedien.actor_photo2 ? '✅' : '❌')
      console.log('  actor_photo3:', comedien.actor_photo3 ? '✅' : '❌')
      console.log('  actor_photo4:', comedien.actor_photo4 ? '✅' : '❌')
      console.log('  actor_photo5:', comedien.actor_photo5 ? '✅' : '❌')
      
      // Test de normalisation NOUVELLE VERSION
      const newPhotos = comedien.photos && Array.isArray(comedien.photos) ? comedien.photos : []
      const wpPhotos = [
        comedien.actor_photo1,
        comedien.actor_photo2,
        comedien.actor_photo3,
        comedien.actor_photo4,
        comedien.actor_photo5
      ].filter(p => p && p.trim() !== '')
      
      const allPhotos = [...newPhotos, ...wpPhotos]
      const uniquePhotos = []
      allPhotos.forEach(photo => {
        if (!uniquePhotos.includes(photo)) {
          uniquePhotos.push(photo)
        }
      })
      const photos_normalized = uniquePhotos
      
      console.log('\n✨ Photos normalisées (NOUVELLE VERSION):', photos_normalized.length, 'photo(s)')
      photos_normalized.forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.substring(0, 60)}...`)
      })
    })

  } catch (error) {
    console.error('❌ Erreur:', error.message)
  }
}

checkPhotosStructure()
