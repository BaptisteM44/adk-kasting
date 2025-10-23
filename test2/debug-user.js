require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')

// Configuration Supabase 
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('URL:', supabaseUrl)
console.log('Key présent:', !!supabaseKey)

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugUser() {
  console.log('🔍 Recherche de l\'utilisateur bapmorvan@gmail.com...\n')
  
  try {
    // Chercher l'utilisateur - ne pas utiliser .single() d'abord
    const { data: comediens, error } = await supabase
      .from('comediens')
      .select('id, email, display_name, is_active, user_pass')
      .eq('email', 'bapmorvan@gmail.com')
    
    if (error) {
      console.log('❌ Erreur lors de la recherche:', error.message)
      return
    }
    
    console.log(`Nombre d'utilisateurs trouvés: ${comediens?.length || 0}`)
    
    if (!comediens || comediens.length === 0) {
      console.log('❌ Utilisateur non trouvé')
      
      // Cherchons tous les utilisateurs pour voir quels emails existent
      console.log('\n📋 Premiers utilisateurs en base:')
      const { data: allUsers } = await supabase
        .from('comediens')
        .select('email, display_name')
        .limit(10)
      
      allUsers?.forEach(user => {
        console.log(`- ${user.email} (${user.display_name})`)
      })
      return
    }
    
    // S'il y en a plusieurs, les afficher tous
    if (comediens.length > 1) {
      console.log('⚠️ Plusieurs utilisateurs trouvés:')
      comediens.forEach((comedien, index) => {
        console.log(`${index + 1}. ID: ${comedien.id}, Nom: ${comedien.display_name}, Actif: ${comedien.is_active}`)
      })
    }
    
    const comedien = comediens[0] // Prendre le premier
    
    console.log('✅ Utilisateur trouvé:')
    console.log('- ID:', comedien.id)
    console.log('- Email:', comedien.email)
    console.log('- Nom:', comedien.display_name)
    console.log('- Actif:', comedien.is_active)
    console.log('- user_pass présent:', !!comedien.user_pass)
    console.log('- user_pass commence par:', comedien.user_pass?.substring(0, 10))
    console.log('- Longueur user_pass:', comedien.user_pass?.length)
    
    // Test avec différents mots de passe
    const testPasswords = ['testpass', 'password', '123456789', 'monmotdepasse']
    
    console.log('\n🔐 Test des mots de passe avec bcrypt.compare:')
    
    for (const testPass of testPasswords) {
      try {
        const isValid = await bcrypt.compare(testPass, comedien.user_pass)
        console.log(`- "${testPass}": ${isValid ? '✅ Valide' : '❌ Invalide'}`)
      } catch (err) {
        console.log(`- "${testPass}": ❌ Erreur bcrypt: ${err.message}`)
      }
    }
    
    // Vérifier si c'est un hash WordPress (commence par $P$ ou $2y$)
    console.log('\n📝 Type de hash détecté:')
    if (comedien.user_pass?.startsWith('$P$')) {
      console.log('⚠️  Hash WordPress phpass détecté (commence par $P$)')
      console.log('   Ce type de hash n\'est PAS compatible avec bcrypt!')
      console.log('   Il faut soit:')
      console.log('   1. Utiliser une librairie phpass pour WordPress')
      console.log('   2. Ou demander aux utilisateurs de réinitialiser leur mot de passe')
    } else if (comedien.user_pass?.startsWith('$2y$') || comedien.user_pass?.startsWith('$2b$')) {
      console.log('✅ Hash bcrypt détecté')
    } else {
      console.log('⚠️  Type de hash inconnu:', comedien.user_pass?.substring(0, 10))
    }
    
  } catch (error) {
    console.log('❌ Erreur générale:', error.message)
  }
}

debugUser()