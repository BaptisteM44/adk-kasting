// pages/comediens/page.tsx
'use client'

import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { OptimizedActorFilters } from '../components/OptimizedActorFilters'
import { OptimizedActorList } from '../components/OptimizedActorList'
import type { Actor, ActorMinimal } from '../types/actor'

// Fonction utilitaire pour convertir ActorMinimal vers Actor
function convertMinimalToFull(minimal: ActorMinimal): Actor {
  return {
    id: 0, // Pas d'ID dans la version minimaliste
    display_name: minimal.display_name,
    user_email: minimal.user_email,
    first_name: minimal.first_name,
    last_name: minimal.last_name,
    profilepicture: minimal.profilepicture,
    domiciliation: minimal.domiciliation,
    user_age: minimal.user_age,
    total_count: minimal.total_count,
    // Valeurs par défaut pour les champs manquants
    birth_date: null,
    mobile_number: null,
    city: null,
    country: null,
    gender: null,
    ethnicity: null,
    build: null,
    hair_color: null,
    eye_color: null,
    experience_level: null,
    actor_nationality: null,
    actor_languages_native: null,
    languages: null,
    actor_dance_skills: null,
    actor_music_skills: null,
    actor_driving_license: null,
    size: null,
  }
}

export default function ComediensPage() {
  const [initialActors, setInitialActors] = useState<Actor[]>([])
  const [filteredActors, setFilteredActors] = useState<Actor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Chargement initial avec get_actors_critical_filters
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase.rpc('get_actors_critical_filters', {
          gender_filter: null,
          age_min: null,
          age_max: null,
          city_filter: null,
          experience_filter: null,
          page_num: 1,
          page_size: 100,
          excluded_ids: [1, 2, 3, 13, 15],
        })

        if (error) {
          console.error('Erreur RPC:', JSON.stringify(error, null, 2))
          throw error
        }

        if (data) {
          // Convertir ActorMinimal vers Actor pour la compatibilité
          const actors: Actor[] = data.map(convertMinimalToFull)
          setInitialActors(actors)
          setFilteredActors(actors)
        } else {
          setInitialActors([])
          setFilteredActors([])
        }
      } catch (err) {
        console.error('Erreur lors du chargement initial:', err)
        setError(err instanceof Error ? err.message : 'Erreur de chargement des données')
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [])

  const handleFilteredData = useCallback((actors: Actor[]) => {
    setFilteredActors(actors)
  }, [])

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des comédiens...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h1 className="text-xl font-bold text-red-800 mb-2">Erreur de chargement</h1>
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Nos comédiens</h1>
        <p className="text-gray-600">
          Découvrez les profils de nos comédiens professionnels avec notre système de filtrage optimisé
        </p>
        {initialActors.length > 0 && (
          <p className="text-sm text-gray-500 mt-2">
            {initialActors[0].total_count || initialActors.length} comédiens dans notre base de données
          </p>
        )}
      </div>

      {/* Composant de filtres */}
      <OptimizedActorFilters 
        onFilteredData={handleFilteredData}
        initialActors={initialActors}
      />

      {/* Liste des comédiens */}
      <OptimizedActorList actors={filteredActors} />

      {/* Footer avec informations */}
      {filteredActors.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center text-sm text-gray-500">
            <p>
              Affichage de {filteredActors.length} comédien{filteredActors.length > 1 ? 's' : ''} 
              {filteredActors[0]?.total_count && filteredActors[0].total_count !== filteredActors.length && 
                ` sur ${filteredActors[0].total_count} au total`
              }
            </p>
            <p className="mt-2">
              Pour contacter un comédien, cliquez sur "Contacter" sur sa fiche ou envoyez-lui un email directement.
            </p>
          </div>
        </div>
      )}
    </main>
  )
}
