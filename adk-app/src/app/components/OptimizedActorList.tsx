// components/OptimizedActorList.tsx
'use client'

import { useState } from 'react'
import { Actor } from '@/types/actors'
import Image from 'next/image'
import { EnvelopeIcon, MapPinIcon, UserIcon } from '@heroicons/react/24/outline'

interface OptimizedActorListProps {
  actors: Actor[]
}

export function OptimizedActorList({ actors }: OptimizedActorListProps) {
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())

  const handleImageError = (actorId: number) => {
    setImageErrors(prev => new Set(prev).add(actorId))
  }

  const formatAge = (age: number | null | undefined): string => {
    return age ? `${age} ans` : 'Âge non renseigné'
  }

  if (!actors || actors.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto max-w-md">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Aucun comédien trouvé</h3>
          <p className="mt-1 text-sm text-gray-500">
            Essayez d'ajuster vos critères de recherche pour voir plus de résultats.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {actors.map((actor) => (
        <div key={actor.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          {/* Photo de profil */}
          <div className="aspect-square relative bg-gray-200">
            {actor.profilepicture && !imageErrors.has(actor.id) ? (
              <Image
                src={actor.profilepicture}
                alt={`Photo de ${actor.display_name}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={() => handleImageError(actor.id)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <UserIcon className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>

          {/* Informations */}
          <div className="p-4">
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {actor.display_name}
              </h3>
              {(actor.first_name || actor.last_name) && (
                <p className="text-sm text-gray-600">
                  {[actor.first_name, actor.last_name].filter(Boolean).join(' ')}
                </p>
              )}
            </div>

            {/* Âge */}
            <div className="mb-2 flex items-center text-sm text-gray-600">
              <span className="font-medium">Âge :</span>
              <span className="ml-2">{formatAge(actor.user_age)}</span>
            </div>

            {/* Email */}
            <div className="mb-2 flex items-center text-sm text-gray-600">
              <EnvelopeIcon className="h-4 w-4 mr-2 flex-shrink-0" />
              <a 
                href={`mailto:${actor.user_email}`}
                className="hover:text-blue-600 transition-colors truncate"
              >
                {actor.user_email}
              </a>
            </div>

            {/* Localisation */}
            {(actor.domiciliation || actor.city) && (
              <div className="mb-2 flex items-center text-sm text-gray-600">
                <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">
                  {actor.domiciliation || actor.city}
                </span>
              </div>
            )}

            {/* Informations supplémentaires */}
            <div className="mt-3 space-y-1 text-xs text-gray-500">
              {actor.gender && (
                <div>
                  <span className="font-medium">Genre :</span> {actor.gender}
                </div>
              )}
              {actor.ethnicity && (
                <div>
                  <span className="font-medium">Ethnicité :</span> {actor.ethnicity}
                </div>
              )}
              {actor.experience_level && (
                <div>
                  <span className="font-medium">Expérience :</span> {actor.experience_level}
                </div>
              )}
              {actor.size && (
                <div>
                  <span className="font-medium">Taille :</span> {actor.size} cm
                </div>
              )}
              {actor.hair_color && (
                <div>
                  <span className="font-medium">Cheveux :</span> {actor.hair_color}
                </div>
              )}
              {actor.eye_color && (
                <div>
                  <span className="font-medium">Yeux :</span> {actor.eye_color}
                </div>
              )}
              {actor.actor_nationality && (
                <div>
                  <span className="font-medium">Nationalité :</span> {actor.actor_nationality}
                </div>
              )}
              {actor.actor_languages_native && (
                <div>
                  <span className="font-medium">Langue maternelle :</span> {actor.actor_languages_native}
                </div>
              )}
              {actor.languages && (
                <div>
                  <span className="font-medium">Langues :</span> {actor.languages}
                </div>
              )}
              {actor.actor_dance_skills && (
                <div>
                  <span className="font-medium">Danse :</span> {actor.actor_dance_skills}
                </div>
              )}
              {actor.actor_music_skills && (
                <div>
                  <span className="font-medium">Musique :</span> {actor.actor_music_skills}
                </div>
              )}
              {actor.actor_driving_license && (
                <div>
                  <span className="font-medium">Permis :</span> {actor.actor_driving_license}
                </div>
              )}
            </div>

            {/* Bouton d'action */}
            <div className="mt-4">
              <a
                href={`mailto:${actor.user_email}?subject=Proposition de casting`}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium text-center block"
              >
                Contacter
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
