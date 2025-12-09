// Utilitaires pour convertir les données WordPress sérialisées en PHP
// vers des formats JavaScript utilisables

/**
 * Désérialise une chaîne PHP sérialisée en objet JavaScript
 * Format PHP: a:2:{i:0;s:8:"Français";i:1;s:7:"Anglais";}
 * Résultat: ["Français", "Anglais"]
 */
export function unserializePHP(serialized: string): any {
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

/**
 * Normalise les langues depuis différents formats (WordPress, nouveau système)
 */
export function normalizeLanguages(data: any, field: string): string[] {
  const value = data[field]

  console.log(`🔍 normalizeLanguages(${field}):`, { value, type: typeof value, isArray: Array.isArray(value) })

  if (!value) return []

  // Si c'est une string qui ressemble à un JSON array, parser d'abord
  if (typeof value === 'string') {
    // Cas 1: JSON array comme '["Français", "Allemand"]'
    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        const parsed = JSON.parse(value)
        if (Array.isArray(parsed)) {
          console.log('🔍 Parsed JSON array:', parsed)
          return parsed.filter(v => v && typeof v === 'string' && v.trim() !== '')
        }
      } catch (e) {
        console.warn('🔍 Failed to parse JSON array:', e)
      }
    }

    // Cas 2: Chaîne sérialisée PHP
    if (value.includes(':{')) {
      const unserialized = unserializePHP(value)
      if (Array.isArray(unserialized)) {
        return unserialized.filter(v => v && v.trim() !== '')
      }
      if (unserialized) {
        return [unserialized]
      }
    }

    // Cas 3: Chaîne simple avec virgules
    return value.split(',').map(v => v.trim()).filter(v => v !== '')
  }

  // Si c'est déjà un tableau (PostgreSQL text[])
  if (Array.isArray(value)) {
    // Détecter si c'est un array natif (nouvelles données) ou des fragments de sérialisation (anciennes données)
    const firstElement = value[0]

    // Si le premier élément contient des patterns de sérialisation PHP, c'est l'ancien format
    if (firstElement && typeof firstElement === 'string' &&
        (firstElement.match(/^[AaSsIiBb]:\d+:/i) || firstElement.includes(':{'))) {
      // Anciennes données : reconstituer la chaîne PHP sérialisée à partir des fragments
      const serializedString = value.join('')
      console.log('🔍 Reconstituted serialized string:', serializedString)

      // Si ça ressemble à une chaîne sérialisée PHP, la désérialiser
      if (serializedString.includes(':{')) {
        const unserialized = unserializePHP(serializedString)
        console.log('🔍 After unserialization:', unserialized)
        return unserialized.filter((v: any) => v && typeof v === 'string' && v.trim() !== '')
      }

      // Sinon, filtrer directement les valeurs invalides
      return value
        .filter(v => v && typeof v === 'string')
        .filter(v => !v.match(/^[AaSsIiBb]:\d+:/i)) // Exclure les fragments de sérialisation (a:, s:, i:, I:, b:)
        .filter(v => !v.match(/^[IiBb]:\d+$/i)) // Exclure les index seuls comme "I:1", "I:2"
        .filter(v => !v.match(/^[{}]$/)) // Exclure les accolades isolées
        .filter(v => v.trim() !== '')
    }

    // Nouvelles données : c'est un array natif PostgreSQL, retourner tel quel
    console.log('🔍 Native PostgreSQL array detected, returning as-is')
    return value.filter(v => v && typeof v === 'string' && v.trim() !== '')
  }

  return []
}

/**
 * Normalise toutes les données d'un comédien pour l'affichage
 */
export function normalizeComedienData(comedien: any) {
  if (!comedien) return null

  return {
    ...comedien,
    
    // Normaliser les langues (3 niveaux)
    // 1. Langues maternelles (array)
    languages_native_normalized: normalizeLanguages(comedien, 'actor_languages_native'),

    // Compatibilité : garder native_language_normalized pour l'ancien code (première langue seulement)
    native_language_normalized: normalizeLanguages(comedien, 'actor_languages_native')[0] ||
                                 normalizeLanguages(comedien, 'native_language')[0] ||
                                 comedien.native_language,

    // 2. Parlées couramment (stockées dans la colonne 'languages')
    languages_fluent_normalized: normalizeLanguages(comedien, 'languages'),

    // 3. Notions
    languages_notions_normalized: normalizeLanguages(comedien, 'actor_languages_notions'),

    // Normaliser les compétences
    driving_licenses_normalized: normalizeLanguages(comedien, 'actor_driving_license'),
    
    dance_skills_normalized: normalizeLanguages(comedien, 'actor_dance_skills'),
    music_skills_normalized: normalizeLanguages(comedien, 'actor_music_skills'),
    diverse_skills_normalized: normalizeLanguages(comedien, 'wp_skills'),
    desired_activities_normalized: normalizeLanguages(comedien, 'wp_activity_domain'),

    // Normaliser le display name
    display_name_normalized: comedien.display_name && comedien.display_name !== comedien.email
      ? comedien.display_name
      : `${comedien.first_name} ${comedien.last_name}`,
  }
}
