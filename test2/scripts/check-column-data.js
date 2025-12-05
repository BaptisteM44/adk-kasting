// Script pour vérifier les colonnes de la table comediens
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '../.env' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkColumns() {
  console.log('🔍 Vérification des colonnes pour les compétences...\n')

  // Récupérer un comédien avec des compétences de danse
  const { data: comediens, error: searchError } = await supabase
    .from('comediens')
    .select('*')
    .not('actor_dance_skills', 'is', null)
    .limit(1)

  if (searchError || !comediens || comediens.length === 0) {
    console.error('❌ Erreur:', searchError || 'Aucun comédien trouvé')
    return
  }

  const data = comediens[0]
  console.log('📍 Comédien trouvé:', data.first_name, data.last_name, '(ID:', data.id, ')\n')

  const { error } = {}

  if (error) {
    console.error('❌ Erreur:', error)
    return
  }

  console.log('📊 Colonnes pour les compétences de DANSE:')
  console.log('  - dance_skills (colonne erreur):', data.dance_skills)
  console.log('  - actor_dance_skills (colonne WordPress):', data.actor_dance_skills)
  console.log('  - dance_skills_other (custom skills):', data.dance_skills_other)

  console.log('\n📊 Colonnes pour les compétences MUSICALES:')
  console.log('  - music_skills (colonne erreur):', data.music_skills)
  console.log('  - actor_music_skills (colonne WordPress):', data.actor_music_skills)
  console.log('  - music_skills_other (custom skills):', data.music_skills_other)

  console.log('\n📊 Colonnes pour les compétences DIVERSES:')
  console.log('  - diverse_skills (colonne erreur):', data.diverse_skills)
  console.log('  - wp_skills (colonne WordPress):', data.wp_skills)
  console.log('  - diverse_skills_other (custom skills):', data.diverse_skills_other)

  console.log('\n📊 Colonnes pour les PERMIS:')
  console.log('  - driving_licenses (colonne erreur):', data.driving_licenses)
  console.log('  - actor_driving_license (colonne WordPress):', data.actor_driving_license)

  console.log('\n📊 Colonnes pour les ACTIVITÉS:')
  console.log('  - desired_activities (colonne erreur):', data.desired_activities)
  console.log('  - wp_activity_domain (colonne WordPress):', data.wp_activity_domain)
  console.log('  - desired_activities_other (custom skills):', data.desired_activities_other)
}

checkColumns()
