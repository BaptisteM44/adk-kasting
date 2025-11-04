// Vérifier combien de CV sont encore sur WordPress
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkWordPressResumes() {
  console.log('🔍 Vérification des CV WordPress...\n')

  try {
    // Récupérer tous les comédiens avec un actor_resume
    const { data: comediens, error } = await supabase
      .from('comediens')
      .select('id, display_name, actor_resume')
      .not('actor_resume', 'is', null)

    if (error) throw error

    const wordpressResumes = comediens.filter(c =>
      c.actor_resume &&
      (c.actor_resume.includes('wp-content') || c.actor_resume.includes('wordpress'))
    )

    const supabaseResumes = comediens.filter(c =>
      c.actor_resume &&
      !c.actor_resume.includes('wp-content') &&
      !c.actor_resume.includes('wordpress')
    )

    console.log('📊 Résultats:\n')
    console.log(`Total comédiens avec CV: ${comediens.length}`)
    console.log(`  ✅ CV sur Supabase: ${supabaseResumes.length}`)
    console.log(`  ❌ CV sur WordPress: ${wordpressResumes.length}\n`)

    if (wordpressResumes.length > 0) {
      console.log('📄 Exemples de CV WordPress:\n')
      wordpressResumes.slice(0, 5).forEach(c => {
        console.log(`  ${c.display_name}:`)
        console.log(`  ${c.actor_resume}\n`)
      })
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

checkWordPressResumes()
