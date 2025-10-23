// scripts/test-wordpress-password.ts
import { verifyPassword, isWordPressHash, isBcryptHash, hashPassword } from '../lib/wordpress-password'

async function testPasswords() {
  console.log('🧪 Test de compatibilité des mots de passe WordPress\n')
  console.log('═'.repeat(80))

  // Test 1: Hash WordPress (exemple typique)
  console.log('\n📝 Test 1: Vérification d\'un hash WordPress')
  console.log('─'.repeat(80))
  
  // Créer un hash WordPress pour le mot de passe "test123"
  // Note: Ceci est un exemple de hash WordPress réel généré par WordPress
  const wpHash = '$P$BZlPX7NIx8MYpXokBW2AGsN7i.aUOt0' // Hash pour "test123"
  const password1 = 'test123'
  
  console.log('Hash:', wpHash)
  console.log('Password:', password1)
  console.log('Format WordPress?', isWordPressHash(wpHash))
  
  const result1 = await verifyPassword(password1, wpHash)
  console.log('✅ Résultat:', result1 ? 'VALIDE' : 'INVALIDE')

  // Test 2: Hash bcrypt
  console.log('\n📝 Test 2: Vérification d\'un hash bcrypt')
  console.log('─'.repeat(80))
  
  const password2 = 'mypassword'
  const bcryptHash = await hashPassword(password2)
  
  console.log('Hash:', bcryptHash)
  console.log('Password:', password2)
  console.log('Format bcrypt?', isBcryptHash(bcryptHash))
  
  const result2 = await verifyPassword(password2, bcryptHash)
  console.log('✅ Résultat:', result2 ? 'VALIDE' : 'INVALIDE')

  // Test 3: Mauvais mot de passe WordPress
  console.log('\n📝 Test 3: Mauvais mot de passe avec hash WordPress')
  console.log('─'.repeat(80))
  
  const wrongPassword = 'wrongpassword'
  console.log('Hash:', wpHash)
  console.log('Password (incorrect):', wrongPassword)
  
  const result3 = await verifyPassword(wrongPassword, wpHash)
  console.log('❌ Résultat:', result3 ? 'VALIDE (ERREUR!)' : 'INVALIDE (correct)')

  // Test 4: Mauvais mot de passe bcrypt
  console.log('\n📝 Test 4: Mauvais mot de passe avec hash bcrypt')
  console.log('─'.repeat(80))
  
  console.log('Hash:', bcryptHash)
  console.log('Password (incorrect):', wrongPassword)
  
  const result4 = await verifyPassword(wrongPassword, bcryptHash)
  console.log('❌ Résultat:', result4 ? 'VALIDE (ERREUR!)' : 'INVALIDE (correct)')

  // Résumé
  console.log('\n' + '═'.repeat(80))
  console.log('📊 RÉSUMÉ DES TESTS')
  console.log('═'.repeat(80))
  console.log(`Test 1 (WordPress hash valide):  ${result1 ? '✅ PASSÉ' : '❌ ÉCHOUÉ'}`)
  console.log(`Test 2 (bcrypt hash valide):     ${result2 ? '✅ PASSÉ' : '❌ ÉCHOUÉ'}`)
  console.log(`Test 3 (WordPress hash invalide): ${!result3 ? '✅ PASSÉ' : '❌ ÉCHOUÉ'}`)
  console.log(`Test 4 (bcrypt hash invalide):    ${!result4 ? '✅ PASSÉ' : '❌ ÉCHOUÉ'}`)
  
  const allPassed = result1 && result2 && !result3 && !result4
  console.log('\n' + (allPassed ? '🎉 TOUS LES TESTS RÉUSSIS!' : '⚠️ CERTAINS TESTS ONT ÉCHOUÉ'))
  console.log('═'.repeat(80))
}

testPasswords().catch(console.error)
