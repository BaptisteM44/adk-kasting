// Script pour lister toutes les colonnes de la table comediens
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function listColumns() {
  console.log('\n📋 Récupération de toutes les colonnes de la table comediens...\n')

  // Récupérer un enregistrement pour voir les colonnes
  const { data, error } = await supabase
    .from('comediens')
    .select('*')
    .limit(1)
    .single()

  if (error) {
    console.error('❌ Erreur:', error)
    return
  }

  const columns = Object.keys(data).sort()

  console.log(`✅ Total: ${columns.length} colonnes\n`)

  // Grouper par catégorie
  const photos = columns.filter(c => c.includes('photo'))
  const languages = columns.filter(c => c.includes('language') || c === 'languages')
  const skills = columns.filter(c => c.includes('skill') || c.includes('driving') || c.includes('dance') || c.includes('music'))
  const agent = columns.filter(c => c.includes('agent') || c.includes('agency'))
  const social = columns.filter(c => c.includes('url') || c.includes('facebook') || c.includes('instagram') || c.includes('linkedin') || c.includes('imdb') || c.includes('website'))
  const videos = columns.filter(c => c.includes('video') || c.includes('showreel'))
  const experience = columns.filter(c => c.includes('experience') || c.includes('certificate') || c.includes('resume') || c.includes('activity'))

  console.log('📸 PHOTOS:')
  photos.forEach(c => console.log(`   - ${c}`))

  console.log('\n🌍 LANGUES:')
  languages.forEach(c => console.log(`   - ${c}`))

  console.log('\n🎯 COMPÉTENCES:')
  skills.forEach(c => console.log(`   - ${c}`))

  console.log('\n🏢 AGENT:')
  agent.forEach(c => console.log(`   - ${c}`))

  console.log('\n🔗 RÉSEAUX SOCIAUX:')
  social.forEach(c => console.log(`   - ${c}`))

  console.log('\n🎬 VIDÉOS:')
  videos.forEach(c => console.log(`   - ${c}`))

  console.log('\n📝 EXPÉRIENCE:')
  experience.forEach(c => console.log(`   - ${c}`))

  console.log('\n\n📋 TOUTES LES COLONNES (alphabétique):')
  columns.forEach(c => console.log(`   ${c}`))
}

listColumns()
