// Test de la fonction de désérialisation PHP

// Fonction pour désérialiser une chaîne PHP
function unserializePHP(serialized) {
  if (!serialized || typeof serialized !== 'string') {
    return null
  }

  // Si c'est déjà un tableau JSON ou PostgreSQL array, retourner tel quel
  if (serialized.startsWith('[') || serialized.startsWith('{') && !serialized.includes('i:')) {
    try {
      return JSON.parse(serialized)
    } catch {
      return serialized
    }
  }

  // Convertir les chaînes PHP sérialisées simples
  try {
    // Pattern pour extraire les valeurs de type string (avec i ou I pour ignorer la casse)
    const stringPattern = /[sS]:(\d+):"([^"]*)"/g
    const matches = []
    let match
    
    while ((match = stringPattern.exec(serialized)) !== null) {
      matches.push(match)
    }
    
    if (matches.length > 0) {
      return matches.map(m => m[2]) // m[2] contient la valeur capturée
    }

    // Si c'est une valeur unique
    const singleValueMatch = serialized.match(/[sS]:\d+:"([^"]*)"/)
    if (singleValueMatch) {
      return singleValueMatch[1]
    }

    return null
  } catch (error) {
    console.warn('Erreur lors de la désérialisation PHP:', error)
    return null
  }
}

console.log('=== Test de désérialisation PHP ===\n')

// Test 1: Langue maternelle
const phpLangue = 'a:1:{i:0;s:9:"Français";}'
console.log('Input PHP:', phpLangue)
console.log('Output JS:', unserializePHP(phpLangue))
console.log()

// Test 2: Compétences musique
const phpMusic = 'A:1:{i:0, S:15:"Autre (à vent)", }'
console.log('Input PHP:', phpMusic)
console.log('Output JS:', unserializePHP(phpMusic))
console.log()

// Test 3: Données comédien complètes
const mockComedien = {
  email: 'test@example.com',
  native_language: 'a:1:{i:0;s:9:"Français";}',
  languages_fluent: [],
  languages_notions: [],
  music_skills: 'A:1:{i:0, S:15:"Autre (à vent)", }',
  actor_languages_native: 'a:2:{i:0;s:9:"Français";i:1;s:7:"Anglais";}',
  photos: [],
  actor_photo1: 'https://example.com/photo1.jpg',
  display_name: 'test@example.com',
  first_name: 'Jean',
  last_name: 'Dupont'
}

console.log('=== Test avec données réelles ===')
console.log('native_language brut:', mockComedien.native_language)
console.log('native_language désérialisé:', unserializePHP(mockComedien.native_language))
console.log()

console.log('actor_languages_native brut:', mockComedien.actor_languages_native)
console.log('actor_languages_native désérialisé:', unserializePHP(mockComedien.actor_languages_native))
console.log()

console.log('music_skills brut:', mockComedien.music_skills)
console.log('music_skills désérialisé:', unserializePHP(mockComedien.music_skills))

