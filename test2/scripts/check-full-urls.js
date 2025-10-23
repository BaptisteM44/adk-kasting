require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkFullPhotos() {
  try {
    const { data: comediens, error } = await supabase
      .from('comediens')
      .select('email, actor_photo1, actor_photo2, actor_photo3')
      .eq('email', 'brigittemariaulle@gmail.com')
      .single()

    if (error) throw error

    console.log('=== URLs COMPLÈTES ===\n')
    console.log('Photo 1:', comediens.actor_photo1)
    console.log('Photo 2:', comediens.actor_photo2)
    console.log('Photo 3:', comediens.actor_photo3)

  } catch (error) {
    console.error('❌ Erreur:', error.message)
  }
}

checkFullPhotos()
