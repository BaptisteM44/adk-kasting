// Script pour tester l'envoi d'email de réinitialisation de mot de passe
const testEmail = 'bapmorvan@gmail.com'

console.log('\n📧 Test d\'envoi d\'email de reset password\n')
console.log(`Email destinataire: ${testEmail}`)
console.log('URL API: http://localhost:3000/api/auth/reset-password\n')

fetch('http://localhost:3000/api/auth/reset-password', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email: testEmail }),
})
  .then(async (response) => {
    const data = await response.json()

    if (!response.ok) {
      console.log('❌ Erreur API:', data.message)
      process.exit(1)
    }

    console.log('✅ Réponse API:', data.message)
    console.log('\n📨 Email envoyé avec succès !')
    console.log('\n🔍 Vérifiez votre boîte de réception:', testEmail)
    console.log('   Vérifiez aussi le dossier spam si nécessaire.')
    console.log('\n📋 Logs serveur:')
    console.log('   Consultez les logs du serveur dev pour voir les détails d\'envoi.')

    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erreur de connexion:', error.message)
    console.log('\n⚠️  Vérifiez que le serveur dev tourne sur http://localhost:3000')
    process.exit(1)
  })
