'use client'
import { useState } from 'react'

// Interface Actor définie localement (évite les problèmes d'import)
interface Actor {
  id: number
  display_name: string
  user_email: string
  photo_url?: string | null
  gender?: string | null
  city?: string | null
  experience_level?: string | null
}

// Types pour les props du composant
interface ActorListProps {
  initialActors: Actor[]
  gender?: string | null
}

// Composant ActorCard intégré pour éviter les imports externes
function ActorCard({ actor }: { actor: Actor }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center hover:shadow-lg transition-shadow">
<img
  src={actor.photo_url || '/images/default-avatar.png'}
  alt={`Photo de ${actor.display_name}`}
  className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
  onError={(e) => {
    const target = e.target as HTMLImageElement;
    // SVG par défaut intégré en base64
    target.src = 'image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjRTVFN0VCIi8+CjxwYXRoIGQ9Ik0zMiA5NkM0Mi42NjY3IDg2IDU2IDg2IDY0IDg2QzcyIDg2IDg1LjMzMzMgODYgOTYgOTZWMTA0SDMyVjk2WiIgZmlsbD0iIzlDQTNBRiIvPgo8Y2lyY2xlIGN4PSI2NCIgY3k9IjQ4IiByPSIxNiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
  }}
/>

      <h2 className="font-bold text-lg text-center text-gray-800 mb-2">
        {actor.display_name}
      </h2>
      <div className="text-center space-y-1">
        <p className="text-gray-600 text-sm">
          <span className="font-medium">Genre :</span> {actor.gender || 'Non renseigné'}
        </p>
        <p className="text-gray-600 text-sm">
          <span className="font-medium">Ville :</span> {actor.city || 'Non renseignée'}
        </p>
        <p className="text-gray-600 text-sm">
          <span className="font-medium">Niveau :</span> {actor.experience_level || 'Non renseigné'}
        </p>
      </div>
    </div>
  )
}

// Composant principal ActorList
export function ActorList({ initialActors = [], gender = null }: ActorListProps) {
  // États avec types explicites
  const [actors, setActors] = useState<Actor[]>(initialActors)
  const [page, setPage] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState<boolean>((initialActors?.length || 0) === 50)

  // Fonction pour charger plus d'acteurs
  const loadMore = async (): Promise<void> => {
    if (loading) return
    
    setLoading(true)
    setError(null)
    
    try {
      const nextPage = page + 1
      const genderParam = gender ? `&gender=${encodeURIComponent(gender)}` : ''
      const url = `/api/comediens?page=${nextPage}${genderParam}`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      
      const newActors: Actor[] = await response.json()
      
      if (Array.isArray(newActors)) {
        setActors(currentActors => [...currentActors, ...newActors])
        setPage(nextPage)
        setHasMore(newActors.length === 50)
      } else {
        throw new Error('Format de réponse invalide')
      }
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(`Erreur lors du chargement: ${errorMessage}`)
      console.error('Erreur loadMore:', err)
    } finally {
      setLoading(false)
    }
  }

  // Gestion du clic sur le bouton "Charger plus"
  const handleLoadMore = (): void => {
    loadMore()
  }

  return (
    <div className="w-full">
      {/* Grille des acteurs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {actors.map((actor: Actor) => (
          <ActorCard key={actor.id} actor={actor} />
        ))}
      </div>
      
      {/* Messages d'erreur */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
          >
            Fermer
          </button>
        </div>
      )}
      
      {/* Bouton Charger plus */}
      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Chargement...
              </span>
            ) : (
              'Charger plus de comédiens'
            )}
          </button>
        </div>
      )}
      
      {/* Message fin de liste */}
      {!hasMore && actors.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-gray-500 italic">
            Tous les comédiens ont été chargés ({actors.length} au total)
          </p>
        </div>
      )}
      
      {/* Message liste vide */}
      {actors.length === 0 && !loading && (
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-lg">
            Aucun comédien trouvé pour ces critères.
          </p>
        </div>
      )}
    </div>
  )
}
