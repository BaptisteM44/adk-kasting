// Script pour vérifier ou créer un compte test pour tester les emails
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkOrCreateTestAccount() {
  const testEmail = 'bapmorvan@gmail.com'

  console.log(`\n🔍 Vérification du compte ${testEmail}...\n`)

  // Rechercher le compte
  const { data: existingAccount, error: searchError } = await supabase
    .from('comediens')
    .select('id, email, first_name, last_name, is_active')
    .eq('email', testEmail)
    .single()

  if (searchError && searchError.code !== 'PGRST116') {
    console.error('❌ Erreur de recherche:', searchError.message)
    return
  }

  if (existingAccount) {
    console.log(`✅ Compte existant trouvé :`)
    console.log(`   - ID: ${existingAccount.id}`)
    console.log(`   - Nom: ${existingAccount.first_name} ${existingAccount.last_name}`)
    console.log(`   - Actif: ${existingAccount.is_active ? 'Oui' : 'Non'}`)
    console.log(`\n✨ Prêt pour tester l'envoi d'email de reset password!`)
    return
  }

  console.log(`⚠️  Aucun compte trouvé pour ${testEmail}`)
  console.log(`📝 Création d'un compte test...\n`)

  // Créer un compte test simple
  const hashedPassword = await bcrypt.hash('Test1234!', 12)

  const { data: newAccount, error: createError } = await supabase
    .from('comediens')
    .insert({
      email: testEmail,
      user_pass: hashedPassword,
      first_name: 'Baptiste',
      last_name: 'Test',
      display_name: 'Baptiste Test',
      birth_date: '1990-01-01',
      gender: 'Masculin',
      phone: '+33612345678',
      is_active: true
    })
    .select()
    .single()

  if (createError) {
    console.error('❌ Erreur de création:', createError.message)
    return
  }

  console.log(`✅ Compte test créé avec succès !`)
  console.log(`   - ID: ${newAccount.id}`)
  console.log(`   - Email: ${newAccount.email}`)
  console.log(`   - Mot de passe: Test1234!`)
  console.log(`\n✨ Prêt pour tester l'envoi d'email de reset password!`)
}

checkOrCreateTestAccount()
