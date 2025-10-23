interface Actor {
  id: number
  display_name: string
  user_email: string
  photo_url?: string | null
  gender?: string | null
  city?: string | null
  experience_level?: string | null
}

export function ActorCard({ actor }: { actor: Actor }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
      <img
        src={actor.photo_url || 'https://via.placeholder.com/128x128?text=Photo'}
        alt={actor.display_name}
        className="w-24 h-24 rounded-full object-cover mb-4 border"
      />
      <h2 className="font-bold text-lg text-center">{actor.display_name}</h2>
      <p className="text-gray-500 text-sm mb-1">{actor.gender || 'Genre inconnu'}</p>
      <p className="text-gray-500 text-sm mb-1">{actor.city || 'Ville inconnue'}</p>
      <p className="text-gray-500 text-sm mb-1">
        {actor.experience_level ? `Niveau : ${actor.experience_level}` : 'Niveau inconnu'}
      </p>
    </div>
  )
}
