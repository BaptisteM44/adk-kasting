require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkColumnTypes() {
  console.log('\n🔍 Vérification des types de colonnes...\n')
  
  // Récupérer les types de colonnes via information_schema
  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'comediens'
      AND column_name IN (
        'wp_skills', 'actor_driving_license', 'actor_dance_skills', 
        'actor_music_skills', 'actor_languages_native', 'actor_languages_notions',
        'wp_activity_domain', 'dance_skills', 'music_skills', 'languages'
      )
      ORDER BY column_name
    `
  })
  
  if (error) {
    console.log('❌ Impossible via RPC, essayons une autre méthode...\n')
    
    // Alternative: insérer un objet test et voir ce qui échoue
    const testData = {
      email: 'test-types@example.com',
      user_pass: 'test',
      first_name: 'Test',
      last_name: 'Types',
      phone: '0600000000',
      birth_date: '1990-01-01',
      
      // Test avec chaînes PHP sérialisées
      wp_skills: 'a:0:{}',
      actor_driving_license: 'a:0:{}',
      actor_dance_skills: 'a:0:{}',
      actor_music_skills: 'a:0:{}',
      actor_languages_native: 'a:0:{}',
      actor_languages_notions: 'a:0:{}',
      wp_activity_domain: 'a:0:{}',
      
      // Test avec arrays vides
      dance_skills: [],
      music_skills: [],
      
      is_active: false
    }
    
    const { error: insertError } = await supabase
      .from('comediens')
      .insert(testData)
    
    if (insertError) {
      console.log('❌ Erreur lors du test:')
      console.log(insertError)
      
      if (insertError.message.includes('array')) {
        console.log('\n💡 Colonnes qui sont probablement des ARRAYS PostgreSQL:')
        console.log('   - dance_skills')
        console.log('   - music_skills')
      }
    } else {
      console.log('✅ Insertion test réussie')
    }
  } else {
    console.log('✅ Types de colonnes:\n')
    data.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (${col.udt_name})`)
    })
  }
}

checkColumnTypes()
