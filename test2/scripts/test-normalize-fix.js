// Test du filtre pour les données mal formatées

function normalizeLanguages(value) {
  if (!value) return []
  
  // Si c'est déjà un tableau
  if (Array.isArray(value)) {
    // Filtrer les valeurs invalides (format sérialisé mal parsé)
    return value
      .filter(v => v && typeof v === 'string')
      .filter(v => !v.match(/^[AaSs]:\d+:/)) // Exclure les fragments de sérialisation
      .filter(v => !v.match(/^[{}]$/)) // Exclure les accolades isolées
      .filter(v => v.trim() !== '')
  }
  
  return []
}

// Test avec les données problématiques
const badData = [ 'A:1:{i:0', 'S:7:"anglais"', '}' ]
const goodData = [ 'Français', 'Anglais', 'Espagnol' ]
const mixedData = [ 'Français', 'A:1:{i:0', 'Anglais', 'S:7:"test"', '}', 'Espagnol' ]

console.log('=== Test du filtre de normalisation ===\n')

console.log('❌ Données mal formatées (PostgreSQL array cassé):')
console.log('  Input:', JSON.stringify(badData))
console.log('  Output:', normalizeLanguages(badData))
console.log()

console.log('✅ Données correctes:')
console.log('  Input:', JSON.stringify(goodData))
console.log('  Output:', normalizeLanguages(goodData))
console.log()

console.log('⚠️  Données mixtes:')
console.log('  Input:', JSON.stringify(mixedData))
console.log('  Output:', normalizeLanguages(mixedData))
console.log()

console.log('✨ Résultat: Les fragments de sérialisation sont filtrés !')
