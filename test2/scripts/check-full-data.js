// Script pour voir TOUTES les données sauvegardées
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkFullData() {
  const comedienId = 'c65e70ae-34f9-465a-bf5d-2df1646e0e1f'

  console.log('\n📋 Récupération de TOUTES les données du compte...\n')

  const { data, error } = await supabase
    .from('comediens')
    .select('*')
    .eq('id', comedienId)
    .single()

  if (error) {
    console.error('❌ Erreur:', error)
    return
  }

  console.log('✅ Données sauvegardées:\n')

  // Champs de base
  console.log('📧 IDENTITÉ:')
  console.log(`   Email: ${data.email || '❌ VIDE'}`)
  console.log(`   Nom: ${data.first_name || '❌'} ${data.last_name || '❌'}`)
  console.log(`   Nom d'affichage: ${data.display_name || '❌ VIDE'}`)
  console.log(`   Date de naissance: ${data.birth_date || '❌ VIDE'}`)
  console.log(`   Genre: ${data.gender || '❌ VIDE'}`)
  console.log(`   Nationalité: ${data.nationality || '❌ VIDE'}`)

  console.log('\n📍 COORDONNÉES:')
  console.log(`   Téléphone: ${data.phone || '❌ VIDE'}`)
  console.log(`   Téléphone fixe: ${data.phone_fixe || '❌ VIDE'}`)
  console.log(`   Domiciliation: ${data.domiciliation || '❌ VIDE'}`)
  console.log(`   Rue: ${data.street || '❌ VIDE'}`)
  console.log(`   Code postal: ${data.zip_code || '❌ VIDE'}`)
  console.log(`   Ville: ${data.city || '❌ VIDE'}`)
  console.log(`   Pays: ${data.country || '❌ VIDE'}`)

  console.log('\n👤 CARACTÉRISTIQUES PHYSIQUES:')
  console.log(`   Taille: ${data.height || '❌ VIDE'}`)
  console.log(`   Corpulence: ${data.build || '❌ VIDE'}`)
  console.log(`   Type/Ethnicité: ${data.ethnicity || '❌ VIDE'}`)
  console.log(`   Cheveux: ${data.hair_color || '❌ VIDE'}`)
  console.log(`   Yeux: ${data.eye_color || '❌ VIDE'}`)

  console.log('\n🌍 LANGUES:')
  console.log(`   Langue maternelle: ${data.native_language || '❌ VIDE'}`)
  console.log(`   Langues (actor_languages_native): ${data.actor_languages_native || '❌ VIDE'}`)
  console.log(`   Langues couramment: ${data.languages || '❌ VIDE'}`)
  console.log(`   Langues notions: ${data.actor_languages_notions || '❌ VIDE'}`)

  console.log('\n🎯 COMPÉTENCES:')
  console.log(`   Compétences diverses (wp_skills): ${data.wp_skills || '❌ VIDE'}`)
  console.log(`   Permis (actor_driving_license): ${data.actor_driving_license || '❌ VIDE'}`)
  console.log(`   Danse (actor_dance_skills): ${data.actor_dance_skills || '❌ VIDE'}`)
  console.log(`   Musique (actor_music_skills): ${data.actor_music_skills || '❌ VIDE'}`)

  console.log('\n🏢 AGENT:')
  console.log(`   Nom agence: ${data.agency_name || '❌ VIDE'}`)
  console.log(`   Nom agent: ${data.agent_name || '❌ VIDE'}`)
  console.log(`   Email agent: ${data.agent_email || '❌ VIDE'}`)
  console.log(`   Tél agent: ${data.agent_phone || '❌ VIDE'}`)

  console.log('\n📸 PHOTOS:')
  console.log(`   Photo 1: ${data.actor_photo1 ? '✅' : '❌ VIDE'}`)
  console.log(`   Photo 2: ${data.actor_photo2 ? '✅' : '❌ VIDE'}`)
  console.log(`   Photo 3: ${data.actor_photo3 ? '✅' : '❌ VIDE'}`)
  console.log(`   Photo 4: ${data.actor_photo4 ? '✅' : '❌ VIDE'}`)
  console.log(`   Photo 5: ${data.actor_photo5 ? '✅' : '❌ VIDE'}`)

  console.log('\n🎬 VIDÉOS & LIENS:')
  console.log(`   Showreel: ${data.showreel_url || '❌ VIDE'}`)
  console.log(`   Site web: ${data.website_url || '❌ VIDE'}`)
  console.log(`   IMDB: ${data.imdb_url || '❌ VIDE'}`)
  console.log(`   Facebook: ${data.facebook_url || '❌ VIDE'}`)
  console.log(`   LinkedIn: ${data.linkedin_url || '❌ VIDE'}`)
  console.log(`   Instagram: ${data.instagram_url || '❌ VIDE'}`)

  console.log('\n📝 EXPÉRIENCE:')
  console.log(`   Niveau: ${data.experience_level || '❌ VIDE'}`)
  console.log(`   Expérience: ${data.experience ? '✅ Rempli' : '❌ VIDE'}`)
  console.log(`   Formations/Diplômes: ${data.certificates ? '✅ Rempli' : '❌ VIDE'}`)
  console.log(`   Activités désirées (wp_activity_domain): ${data.wp_activity_domain || '❌ VIDE'}`)

  console.log('\n\n🔍 RÉSUMÉ:')
  const totalFields = Object.keys(data).length
  const emptyFields = Object.values(data).filter(v => !v || v === '').length
  const filledFields = totalFields - emptyFields
  console.log(`   Total champs: ${totalFields}`)
  console.log(`   Remplis: ${filledFields} ✅`)
  console.log(`   Vides: ${emptyFields} ❌`)
  console.log(`   Taux de remplissage: ${Math.round((filledFields / totalFields) * 100)}%`)
}

checkFullData()
