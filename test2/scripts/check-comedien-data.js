// Script pour vérifier les données d'un comédien dans la base
require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

// Fonction pour désérialiser une chaîne PHP
function unserializePHP(serialized) {
  if (!serialized || typeof serialized !== 'string') {
    return null
  }

  if (serialized.startsWith('[') || serialized.startsWith('{') && !serialized.includes('i:')) {
    try {
      return JSON.parse(serialized)
    } catch {
      return serialized
    }
  }

  try {
    const stringPattern = /[sS]:(\d+):"([^"]*)"/g
    const matches = []
    let match
    
    while ((match = stringPattern.exec(serialized)) !== null) {
      matches.push(match)
    }
    
    if (matches.length > 0) {
      return matches.map(m => m[2])
    }

    const singleValueMatch = serialized.match(/[sS]:\d+:"([^"]*)"/)
    if (singleValueMatch) {
      return singleValueMatch[1]
    }

    return null
  } catch (error) {
    return null
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes!')
  console.log('Assurez-vous que .env.local contient:')
  console.log('  - NEXT_PUBLIC_SUPABASE_URL')
  console.log('  - NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkComedienData() {
  try {
    console.log('🔍 Récupération des comédiens...\n')
    
    const { data: comediens, error } = await supabase
      .from('comediens')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Erreur:', error.message)
      return
    }
    
    if (!comediens || comediens.length === 0) {
      console.log('⚠️  Aucun comédien trouvé dans la base de données\n')
      console.log('💡 Vous devez d\'abord créer un comédien via le formulaire d\'inscription')
      return
    }
    
    const comedien = comediens[0]
    
    console.log('✅ Comédien trouvé!')
    console.log('📋 ID:', comedien.id)
    console.log('👤 Nom:', comedien.display_name || `${comedien.first_name} ${comedien.last_name}`)
    console.log('\n--- DONNÉES DISPONIBLES ---\n')
    
    // Informations de base
    console.log('📌 Informations de base:')
    console.log('  - Email:', comedien.email || '❌ Manquant')
    console.log('  - Téléphone:', comedien.phone || '❌ Manquant')
    console.log('  - Âge:', comedien.age || 'Non calculé')
    console.log('  - Date de naissance:', comedien.birth_date || '❌ Manquant')
    console.log('  - Genre:', comedien.gender || '❌ Manquant')
    console.log('  - Nationalité:', comedien.nationality || '❌ Manquant')
    
    // Caractéristiques physiques
    console.log('\n📏 Caractéristiques physiques:')
    console.log('  - Taille:', comedien.height ? `${comedien.height} cm` : '❌ Manquant')
    console.log('  - Corpulence:', comedien.build || '❌ Manquant')
    console.log('  - Type:', comedien.ethnicity || '❌ Manquant')
    console.log('  - Cheveux:', comedien.hair_color || '❌ Manquant')
    console.log('  - Yeux:', comedien.eye_color || '❌ Manquant')
    
    // Langues
    console.log('\n🌍 Langues:')
    console.log('  - Maternelle (brut):', comedien.native_language || '❌ Manquant')
    console.log('  - Maternelle (désérialisé):', unserializePHP(comedien.native_language) || '❌ Manquant')
    console.log('  - Couramment:', comedien.languages_fluent?.length > 0 ? comedien.languages_fluent.join(', ') : '❌ Manquant')
    console.log('  - Notions:', comedien.languages_notions?.length > 0 ? comedien.languages_notions.join(', ') : '❌ Manquant')
    
    // Photos
    console.log('\n📸 Photos:')
    console.log('  - Photos (nouveau):', comedien.photos?.length > 0 ? `${comedien.photos.length} photo(s)` : '❌ Manquant')
    console.log('  - Photo 1 (WP):', comedien.actor_photo1 ? '✅' : '❌')
    console.log('  - Photo 2 (WP):', comedien.actor_photo2 ? '✅' : '❌')
    console.log('  - Photo 3 (WP):', comedien.actor_photo3 ? '✅' : '❌')
    console.log('  - Photo 4 (WP):', comedien.actor_photo4 ? '✅' : '❌')
    console.log('  - Photo 5 (WP):', comedien.actor_photo5 ? '✅' : '❌')
    
    // Agents
    console.log('\n🤝 Agents:')
    console.log('  - Agence 1:', comedien.agency_name || '❌ Manquant')
    console.log('  - Agent 1:', comedien.agent_name || '❌ Manquant')
    console.log('  - Email agent 1:', comedien.agent_email || '❌ Manquant')
    console.log('  - Tél agent 1:', comedien.agent_phone || '❌ Manquant')
    console.log('  - Agence 2:', comedien.agency_name_2 || '❌ Manquant')
    console.log('  - Agent 2:', comedien.agent_name_2 || '❌ Manquant')
    
    // Vidéos
    console.log('\n🎬 Vidéos:')
    console.log('  - Showreel:', comedien.showreel_url ? '✅' : '❌')
    console.log('  - Vidéo 1:', comedien.video_1_url ? '✅' : '❌')
    console.log('  - Vidéo 2:', comedien.video_2_url ? '✅' : '❌')
    
    // Compétences
    console.log('\n🎯 Compétences:')
    console.log('  - Permis:', comedien.driving_licenses?.length > 0 ? comedien.driving_licenses.join(', ') : '❌ Manquant')
    console.log('  - Danse:', comedien.dance_skills?.length > 0 ? comedien.dance_skills.join(', ') : '❌ Manquant')
    console.log('  - Musique (brut):', comedien.music_skills || '❌ Manquant')
    console.log('  - Musique (désérialisé):', unserializePHP(comedien.music_skills) || '❌ Manquant')
    console.log('  - Autres:', comedien.diverse_skills?.length > 0 ? comedien.diverse_skills.join(', ') : '❌ Manquant')
    
    // Expérience
    console.log('\n💼 Expérience:')
    console.log('  - Niveau:', comedien.experience_level || '❌ Manquant')
    console.log('  - Activités désirées:', comedien.desired_activities?.length > 0 ? comedien.desired_activities.join(', ') : '❌ Manquant')
    console.log('  - Expérience pro:', comedien.professional_experience ? `${comedien.professional_experience.substring(0, 50)}...` : '❌ Manquant')
    console.log('  - Formations:', comedien.training_diplomas ? `${comedien.training_diplomas.substring(0, 50)}...` : '❌ Manquant')
    
    console.log('\n--- TOUTES LES COLONNES ---\n')
    console.log('Colonnes disponibles:', Object.keys(comedien).join(', '))
    
    console.log('\n💡 Pour tester la page, visitez:')
    console.log(`   http://localhost:3000/comediens/${comedien.id}`)
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

checkComedienData()
