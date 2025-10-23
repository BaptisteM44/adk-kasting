// import { supabase } from './supabase'

// // Fonction pour récupérer un profil complet
// export async function getActorProfile(userId: number) {
//   const { data, error } = await supabase.rpc('get_actor_profile', {
//     actor_id: userId
//   })
  
//   if (error) throw error
//   return data
// }

// // Fonction pour rechercher des acteurs
// export async function searchActors(filters: {
//   gender?: string
//   hair_color?: string
//   height_min?: number
//   height_max?: number
//   experience_level?: string
//   city?: string
//   limit?: number
// }) {
//   let query = supabase.rpc('search_actors', filters)
  
//   const { data, error } = await query
//   if (error) throw error
//   return data
// }

// // Fonction pour lister tous les acteurs (avec pagination)
// export async function getAllActors(page = 1, limit = 20) {
//   const offset = (page - 1) * limit
  
//   const { data, error } = await supabase
//     .from('wp_users')
//     .select('*')
//     .range(offset, offset + limit - 1)
    
//   if (error) throw error
//   return data
// }

import { supabase } from '@/app/lib/supabase'
import { Actor } from '@/app/types/actor'

export async function getActors({
  gender,
  hairColor
}: { gender?: string; hairColor?: string } = {}): Promise<Actor[]> {
  let query = supabase
    .from('wp_users')
    .select('id, display_name, user_email')
    .limit(50)

  // Exemple de filtre sur le genre via jointure usermeta
  if (gender) {
    query = query.in('id',
      supabase
        .from('wp_usermeta')
        .select('user_id')
        .eq('meta_key', 'gender')
        .eq('meta_value', gender)
    )
  }

  // À adapter pour d’autres filtres selon la structure de vos données
  const { data, error } = await query
  if (error) throw error
  return data as Actor[]
}
