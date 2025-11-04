// lib/driving-licenses.ts
import { supabase } from './supabase'
import { normalizeLanguages } from './wordpress-compat'

/**
 * Récupère les permis de conduire d'un comédien
 */
export async function getComedienDrivingLicenses(comedienId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('comediens')
      .select('actor_driving_license')
      .eq('id', comedienId)
      .single()

    if (error) throw error
    if (!data) return []

    // Normaliser les données WordPress sérialisées
    const licenses = normalizeLanguages(data, 'actor_driving_license')
    return licenses
  } catch (error) {
    console.error('Erreur lors de la récupération des permis:', error)
    return []
  }
}

/**
 * Formate une liste de permis pour l'affichage
 */
export function formatDrivingLicenses(licenses: string[]): string {
  if (!licenses || licenses.length === 0) return 'Aucun permis'
  return licenses.join(', ')
}

/**
 * Types de permis disponibles
 */
export const DRIVING_LICENSE_TYPES = {
  AUTO: 'Auto',
  MOTO: 'Moto',
  TRUCK: 'Camion',
  AIRCRAFT: 'Avion / hélicoptère'
} as const

export type DrivingLicenseType = typeof DRIVING_LICENSE_TYPES[keyof typeof DRIVING_LICENSE_TYPES]
