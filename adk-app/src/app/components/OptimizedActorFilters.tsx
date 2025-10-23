// components/OptimizedActorFilters.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Actor, ActorFilters } from '@/types/actors'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

interface OptimizedActorFiltersProps {
  onFilteredData: (actors: Actor[]) => void
  initialActors: Actor[]
}

export function OptimizedActorFilters({ onFilteredData, initialActors }: OptimizedActorFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [allActors, setAllActors] = useState<Actor[]>(initialActors)
  const [loading, setLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const [filters, setFilters] = useState<ActorFilters>({
    genre: searchParams.get('genre') || '',
    age_min: searchParams.get('age_min') || '',
    age_max: searchParams.get('age_max') || '',
    ethnicity: searchParams.get('ethnicity') || '',
    hair_color: searchParams.get('hair_color') || '',
    eye_color: searchParams.get('eye_color') || '',
    build: searchParams.get('build') || '',
    experience_level: searchParams.get('experience_level') || '',
    domiciliation: searchParams.get('domiciliation') || '',
    size: searchParams.get('size') || '',
    nationality: searchParams.get('nationality') || '',
    native_language: searchParams.get('native_language') || '',
    languages: searchParams.get('languages') || '',
    city: searchParams.get('city') || '',
    dance_skills: searchParams.get('dance_skills') || '',
    music_skills: searchParams.get('music_skills') || '',
    driving_license: searchParams.get('driving_license') || '',
  })

  // Afficher automatiquement les filtres avancés si certains sont déjà remplis
  useEffect(() => {
    const hasAdvancedFilters =
      filters.build || filters.experience_level || filters.domiciliation ||
      filters.size || filters.nationality || filters.native_language ||
      filters.languages || filters.city || filters.dance_skills ||
      filters.music_skills || filters.driving_license

    if (hasAdvancedFilters) {
      setShowAdvanced(true)
    }
  }, [filters])

  const loadFilteredData = useCallback(async () => {
    if (loading) return // Éviter les appels multiples

    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('get_actors_optimized_filters', {
        gender_filter: filters.genre || null,
        ethnicity_filter: filters.ethnicity || null,
        hair_color_filter: filters.hair_color || null,
        eye_color_filter: filters.eye_color || null,
        build_filter: filters.build || null,
        experience_level_filter: filters.experience_level || null,
        domiciliation_filter: filters.domiciliation || null,
        size_filter: filters.size || null,
        nationality_filter: filters.nationality || null,
        native_language_filter: filters.native_language || null,
        languages_filter: filters.languages || null,
        city_filter: filters.city || null,
        dance_skills_filter: filters.dance_skills || null,
        music_skills_filter: filters.music_skills || null,
        driving_license_filter: filters.driving_license || null,
        age_min: filters.age_min ? parseInt(filters.age_min, 10) : null,
        age_max: filters.age_max ? parseInt(filters.age_max, 10) : null,
        page_num: 1,
        page_size: 9000,
        excluded_ids: [1, 2, 3, 13, 15],
      })

      if (error) {
        console.error('Erreur RPC:', JSON.stringify(error, null, 2))
        return
      }

      if (data) {
        setAllActors(data)
        onFilteredData(data)
      }
    } catch (err) {
      console.error('Erreur de chargement:', err)
    } finally {
      setLoading(false)
    }
  }, [filters, onFilteredData, loading])

  // Charger les données filtrées avec un délai pour éviter les appels trop fréquents
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadFilteredData()
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [loadFilteredData])

  const handleFilterChange = (key: keyof ActorFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      genre: '', age_min: '', age_max: '', ethnicity: '', hair_color: '', 
      eye_color: '', build: '', experience_level: '', domiciliation: '', 
      size: '', nationality: '', native_language: '', languages: '', 
      city: '', dance_skills: '', music_skills: '', driving_license: ''
    })
    router.push('/comediens')
  }

  const toggleAdvanced = () => setShowAdvanced(!showAdvanced)

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Filtres {loading && <span className="text-blue-500">(Chargement...)</span>}
      </h2>

      {/* FILTRES DE BASE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {/* Genre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
          <select
            value={filters.genre || ''}
            onChange={(e) => handleFilterChange('genre', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous</option>
            <option value="Masculin">Masculin</option>
            <option value="Féminin">Féminin</option>
            <option value="Autre">Autre</option>
          </select>
        </div>

        {/* Âge */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Âge</label>
          <div className="flex gap-2">
            <input
              type="number"
              min="16"
              max="80"
              value={filters.age_min || ''}
              onChange={(e) => handleFilterChange('age_min', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Min"
            />
            <span className="flex items-center text-gray-500">à</span>
            <input
              type="number"
              min="16"
              max="80"
              value={filters.age_max || ''}
              onChange={(e) => handleFilterChange('age_max', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Max"
            />
          </div>
        </div>

        {/* Ethnicité */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ethnicité</label>
          <select
            value={filters.ethnicity || ''}
            onChange={(e) => handleFilterChange('ethnicity', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toutes</option>
            <option value="Européen">Européen</option>
            <option value="Nord africain">Nord africain</option>
            <option value="Africain">Africain</option>
            <option value="Métis">Métis</option>
            <option value="Asiatique">Asiatique</option>
            <option value="Eurasien">Eurasien</option>
            <option value="Méditerranéen">Méditerranéen</option>
            <option value="Nordique">Nordique</option>
            <option value="Latino">Latino</option>
            <option value="Indien / Pakistanais">Indien / Pakistanais</option>
          </select>
        </div>

        {/* Cheveux */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cheveux</label>
          <select
            value={filters.hair_color || ''}
            onChange={(e) => handleFilterChange('hair_color', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toutes</option>
            <option value="Blond">Blonds</option>
            <option value="Chatain clair">Châtain clair</option>
            <option value="Chatain foncé">Châtain foncé</option>
            <option value="Brun">Bruns</option>
            <option value="Roux">Roux</option>
            <option value="Noir">Noirs</option>
            <option value="Gris">Gris</option>
            <option value="Blanc">Blancs</option>
            <option value="Chauve">Chauve</option>
          </select>
        </div>

        {/* Yeux */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Yeux</label>
          <select
            value={filters.eye_color || ''}
            onChange={(e) => handleFilterChange('eye_color', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toutes</option>
            <option value="Brun">Bruns</option>
            <option value="Noisette">Noisette</option>
            <option value="Bleu">Bleus</option>
            <option value="Vert">Verts</option>
          </select>
        </div>
      </div>

      {/* BOUTON POUR FILTRES AVANCÉS */}
      <div className="mb-4">
        <button
          onClick={toggleAdvanced}
          className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
        >
          {showAdvanced ? (
            <ChevronUpIcon className="h-5 w-5" />
          ) : (
            <ChevronDownIcon className="h-5 w-5" />
          )}
          <span>{showAdvanced ? 'Masquer' : 'Plus de filtres'}</span>
        </button>
      </div>

      {/* FILTRES AVANCÉS */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Corpulence</label>
            <select
              value={filters.build || ''}
              onChange={(e) => handleFilterChange('build', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes</option>
              <option value="Mince">Mince</option>
              <option value="Moyenne">Moyenne</option>
              <option value="Forte">Forte</option>
              <option value="Athlétique">Athlétique</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expérience</label>
            <select
              value={filters.experience_level || ''}
              onChange={(e) => handleFilterChange('experience_level', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous niveaux</option>
              <option value="Aucune">Aucune</option>
              <option value="Amateur">Amateur</option>
              <option value="Etudiant">Étudiant</option>
              <option value="Semi-professionnel">Semi-Professionnel</option>
              <option value="Professionnel">Professionnel</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Domiciliation</label>
            <input
              type="text"
              value={filters.domiciliation || ''}
              onChange={(e) => handleFilterChange('domiciliation', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Bruxelles, Paris..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
            <input
              type="text"
              value={filters.city || ''}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Paris, Lyon..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nationalité</label>
            <input
              type="text"
              value={filters.nationality || ''}
              onChange={(e) => handleFilterChange('nationality', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Française, Belge..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Taille (cm)</label>
            <input
              type="text"
              value={filters.size || ''}
              onChange={(e) => handleFilterChange('size', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 170, 180..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Langue maternelle</label>
            <select
              value={filters.native_language || ''}
              onChange={(e) => handleFilterChange('native_language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes</option>
              <option value="Français">Français</option>
              <option value="Néerlandais">Néerlandais</option>
              <option value="Anglais">Anglais</option>
              <option value="Allemand">Allemand</option>
              <option value="Italien">Italien</option>
              <option value="Espagnol">Espagnol</option>
              <option value="Arabe">Arabe</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Langues parlées</label>
            <input
              type="text"
              value={filters.languages || ''}
              onChange={(e) => handleFilterChange('languages', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Anglais, Espagnol..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Compétences danse</label>
            <input
              type="text"
              value={filters.dance_skills || ''}
              onChange={(e) => handleFilterChange('dance_skills', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Classique, Hip-hop..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Compétences musique</label>
            <input
              type="text"
              value={filters.music_skills || ''}
              onChange={(e) => handleFilterChange('music_skills', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Piano, Chant..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Permis de conduire</label>
            <select
              value={filters.driving_license || ''}
              onChange={(e) => handleFilterChange('driving_license', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Peu importe</option>
              <option value="Oui">Oui</option>
              <option value="Non">Non</option>
            </select>
          </div>
        </div>
      )}

      {/* Statistiques et boutons */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <span className="font-medium">{allActors.length}</span> comédiens trouvés
        </div>

        <button
          onClick={clearFilters}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
        >
          Réinitialiser
        </button>
      </div>
    </div>
  )
}
