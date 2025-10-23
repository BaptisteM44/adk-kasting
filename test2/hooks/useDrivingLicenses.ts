// hooks/useDrivingLicenses.ts
import { useState, useEffect } from 'react'
import { getComedienDrivingLicenses, formatDrivingLicenses } from '@/lib/driving-licenses'

export function useDrivingLicenses(comedienId?: string) {
  const [licenses, setLicenses] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!comedienId) return

    const fetchLicenses = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const result = await getComedienDrivingLicenses(comedienId)
        setLicenses(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des permis')
      } finally {
        setLoading(false)
      }
    }

    fetchLicenses()
  }, [comedienId])

  return {
    licenses,
    loading,
    error,
    formatted: formatDrivingLicenses(licenses),
    hasLicenses: licenses.length > 0,
    hasLicense: (licenseType: string) => licenses.includes(licenseType)
  }
}

// Hook pour vérifier si un comédien a un permis spécifique (pour les filtres)
export function useHasDrivingLicense(comedienId?: string, licenseType?: string) {
  const { licenses, loading } = useDrivingLicenses(comedienId)
  
  return {
    hasLicense: licenseType ? licenses.includes(licenseType) : false,
    loading
  }
}
