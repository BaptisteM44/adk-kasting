// scripts/check-wordpress-hash.ts
import { supabase } from '../lib/supabase'
import { verifyPassword, isWordPressHash, isBcryptHash } from '../lib/wordpress-password'

async function checkWordPressHash() {
  console.log('🔍 Vérification des hashs WordPress dans la base de données\n')

  try {
    // Récupérer quelques comédiens avec des mots de passe
    const { data: comediens, error } = await supabase
      .from('comediens')
      .select('id, email, user_pass, display_name')
      .not('user_pass', 'is', null)
      .limit(10)

    if (error) {
      console.error('❌ Erreur:', error.message)
      return
    }

    if (!comediens || comediens.length === 0) {
      console.log('⚠️ Aucun comédien avec mot de passe trouvé')
      return
    }

    console.log(`📊 Trouvé ${comediens.length} comédiens avec mot de passe\n`)
    console.log('═'.repeat(100))

    let wpHashCount = 0
    let bcryptHashCount = 0
    let unknownHashCount = 0

    for (const comedien of comediens) {
      const hash = comedien.user_pass
      const isWP = isWordPressHash(hash)
      const isBcrypt = isBcryptHash(hash)
      
      let hashType = 'INCONNU'
      if (isWP) {
        hashType = 'WordPress (phpass)'
        wpHashCount++
      } else if (isBcrypt) {
        hashType = 'bcrypt'
        bcryptHashCount++
      } else {
        unknownHashCount++
      }

      console.log(`\n👤 ${comedien.display_name || comedien.email}`)
      console.log(`   ID: ${comedien.id}`)
      console.log(`   Email: ${comedien.email}`)
      console.log(`   Hash: ${hash.substring(0, 40)}...`)
      console.log(`   Type: ${hashType}`)
    }

    console.log('\n' + '═'.repeat(100))
    console.log('📊 STATISTIQUES')
    console.log('═'.repeat(100))
    console.log(`Total comédiens:      ${comediens.length}`)
    console.log(`WordPress (phpass):   ${wpHashCount}`)
    console.log(`bcrypt:               ${bcryptHashCount}`)
    console.log(`Format inconnu:       ${unknownHashCount}`)
    console.log('═'.repeat(100))

    // Instructions pour tester
    if (wpHashCount > 0) {
      console.log('\n💡 POUR TESTER LA CONNEXION:')
      console.log('─'.repeat(100))
      console.log('1. Trouvez un compte WordPress existant dont vous connaissez le mot de passe')
      console.log('2. Essayez de vous connecter sur le nouveau site avec les mêmes identifiants')
      console.log('3. Si ça fonctionne, le hash sera automatiquement migré vers bcrypt')
      console.log('─'.repeat(100))
    }

    // Afficher un exemple de hash pour chaque type
    const wpExample = comediens.find(c => isWordPressHash(c.user_pass))
    const bcryptExample = comediens.find(c => isBcryptHash(c.user_pass))

    if (wpExample) {
      console.log('\n📋 EXEMPLE DE HASH WORDPRESS:')
      console.log(`Email: ${wpExample.email}`)
      console.log(`Hash: ${wpExample.user_pass}`)
    }

    if (bcryptExample) {
      console.log('\n📋 EXEMPLE DE HASH BCRYPT:')
      console.log(`Email: ${bcryptExample.email}`)
      console.log(`Hash: ${bcryptExample.user_pass}`)
    }

  } catch (error: any) {
    console.error('❌ Erreur:', error.message)
  }
}

checkWordPressHash()
