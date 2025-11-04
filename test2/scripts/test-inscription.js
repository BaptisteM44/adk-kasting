// Test d'inscription pour diagnostiquer l'erreur
const fetch = require('node-fetch')

async function testInscription() {
  const testData = {
    email: 'test-debug@example.com',
    password: 'Test1234!',
    first_name: 'Test',
    last_name: 'Debug',
    phone: '0612345678',
    birth_date: '1990-01-01',
    domiciliation: 'Test',
    zip_code: '75001',
    city: 'Paris',
    country: 'France',
    gender: 'Masculin',
    height: 175
  }

  console.log('\n🧪 Test d\'inscription avec données minimales...\n')
  console.log('Données envoyées:', JSON.stringify(testData, null, 2))

  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })

    const data = await response.json()

    console.log('\n📡 Réponse du serveur:')
    console.log('Status:', response.status)
    console.log('Data:', JSON.stringify(data, null, 2))

    if (!response.ok) {
      console.log('\n❌ ERREUR:', data.message || data)
    } else {
      console.log('\n✅ SUCCÈS!')
    }
  } catch (error) {
    console.error('\n❌ Erreur réseau:', error.message)
  }
}

testInscription()
