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
  
  // Si c'est déjà un tableau (PostgreSQL text[])
  if (Array.isArray(value)) {
    // Reconstituer la chaîne PHP sérialisée à partir des fragments
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
  
  // Si c'est une chaîne sérialisée PHP
  if (typeof value === 'string' && value.includes(':{')) {
    const unserialized = unserializePHP(value)
    if (Array.isArray(unserialized)) {
      return unserialized.filter(v => v && v.trim() !== '')
    }
    if (unserialized) {
      return [unserialized]
    }
  }
  
  // Si c'est une chaîne simple
  if (typeof value === 'string') {
    return value.split(',').map(v => v.trim()).filter(v => v !== '')
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
    
    // Normaliser les langues
    native_language_normalized: normalizeLanguages(comedien, 'native_language')[0] || 
                                 normalizeLanguages(comedien, 'actor_languages_native')[0] || 
                                 comedien.native_language,
    
    languages_fluent_normalized: normalizeLanguages(comedien, 'languages').length > 0
      ? normalizeLanguages(comedien, 'languages')
      : normalizeLanguages(comedien, 'languages_fluent'),
    
    languages_notions_normalized: normalizeLanguages(comedien, 'languages_notions').length > 0
      ? normalizeLanguages(comedien, 'languages_notions')
      : normalizeLanguages(comedien, 'actor_languages_notions'),
    
    // Normaliser les compétences
    driving_licenses_normalized: normalizeLanguages(comedien, 'driving_licenses').length > 0
      ? normalizeLanguages(comedien, 'driving_licenses')
      : normalizeLanguages(comedien, 'actor_driving_license'),
    
    dance_skills_normalized: normalizeLanguages(comedien, 'dance_skills').length > 0
      ? normalizeLanguages(comedien, 'dance_skills')
      : normalizeLanguages(comedien, 'actor_dance_skills'),
    
    music_skills_normalized: normalizeLanguages(comedien, 'music_skills').length > 0
      ? normalizeLanguages(comedien, 'music_skills')
      : normalizeLanguages(comedien, 'actor_music_skills'),
    
    diverse_skills_normalized: normalizeLanguages(comedien, 'diverse_skills').length > 0
      ? normalizeLanguages(comedien, 'diverse_skills')
      : normalizeLanguages(comedien, 'wp_skills'),
    
    desired_activities_normalized: normalizeLanguages(comedien, 'desired_activities').length > 0
      ? normalizeLanguages(comedien, 'desired_activities')
      : normalizeLanguages(comedien, 'wp_activity_domain'),
    
    // Normaliser les photos - COMBINER photos[] ET actor_photo1-5
    photos_normalized: (() => {
      const newPhotos = comedien.photos && Array.isArray(comedien.photos) ? comedien.photos : []
      const wpPhotos = [
        comedien.actor_photo1,
        comedien.actor_photo2,
        comedien.actor_photo3,
        comedien.actor_photo4,
        comedien.actor_photo5
      ].filter(p => p && p.trim() !== '')
      
      // Combiner et dédupliquer
      const allPhotos = [...newPhotos, ...wpPhotos]
      const uniquePhotos: string[] = []
      allPhotos.forEach(photo => {
        if (!uniquePhotos.includes(photo)) {
          uniquePhotos.push(photo)
        }
      })
      return uniquePhotos
    })(),
    
    // Normaliser le display name
    display_name_normalized: comedien.display_name && comedien.display_name !== comedien.email
      ? comedien.display_name
      : `${comedien.first_name} ${comedien.last_name}`,
  }
}
