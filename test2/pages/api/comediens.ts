// pages/api/comediens.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

// Client avec service role key pour bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res)
      case 'PUT':
        return await handlePut(req, res)
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const {
    page = '1',
    limit = '12',
    gender,
    ethnicity,
    hair_color,
    eye_color,
    build,
    experience_level,
    nationality,
    city,
    languages,
    languages_fluent, // Nouveau filtre
    wp_skills, // Colonne WordPress avec les vraies données
    driving_licenses, // Permis de conduire
    dance_skills, // Compétences de danse
    music_skills, // Compétences musicales
    age_min,
    age_max,
    height_min,
    height_max,
    desired_activities, // Nouveau filtre
    name, // Nouveau filtre par nom
    status, // Filtre par statut (pour admin)
    include_all_statuses // Pour dashboard admin (voir tous les statuts)
  } = req.query

  try {
    // DEBUG
    console.log('=== API Comediens Debug ===')
    console.log('include_all_statuses:', include_all_statuses, 'type:', typeof include_all_statuses)
    console.log('status:', status)
    
    // Utiliser supabaseAdmin si include_all_statuses est true (bypass RLS pour admins)
    const client = include_all_statuses ? supabaseAdmin : supabase
    console.log('Using client:', include_all_statuses ? 'supabaseAdmin' : 'supabase')
    let query = client
      .from('comediens')
      .select('*', { count: 'exact' })

    // Filtrage par status (seulement si pas admin qui veut tout voir)
    if (!include_all_statuses) {
      const statusFilter = (status as string) || 'published'
      query = query.eq('status', statusFilter)
      console.log('Non-admin filter: status =', statusFilter)
    } else if (status) {
      // Si admin veut voir un statut spécifique
      query = query.eq('status', status as string)
      console.log('Admin filter: status =', status)
    } else {
      console.log('Admin no status filter - returning all')
    }

  // Filtrage par permis de conduire - colonne WordPress avec données sérialisées PHP
  if (driving_licenses && driving_licenses !== '') {
    console.log('Recherche permis:', driving_licenses) // Debug
    query = query.ilike('actor_driving_license', `%${driving_licenses}%`)
  }

  // Filtrage par compétences de danse - colonne WordPress + compétences personnalisées
  if (dance_skills && dance_skills !== '') {
    console.log('Recherche compétence danse:', dance_skills) // Debug
    query = query.or(`actor_dance_skills.ilike.%${dance_skills}%,dance_skills_other.cs.{${dance_skills}}`)
  }

  // Filtrage par compétences musicales - colonne WordPress + compétences personnalisées
  if (music_skills && music_skills !== '') {
    console.log('Recherche compétence musique:', music_skills) // Debug
    // Utiliser ILIKE simple sur la colonne WordPress (contient les données réelles)
    query = query.ilike('actor_music_skills', `%${music_skills}%`)
  }

  // Filtrage par compétences diverses - colonne WordPress + compétences personnalisées
  if (wp_skills && wp_skills !== '') {
    console.log('Recherche compétence diverse:', wp_skills) // Debug
    query = query.or(`wp_skills.ilike.%${wp_skills}%,diverse_skills_other.cs.{${wp_skills}}`)
  }

  // Filtrage par activités désirées - colonne WordPress + activités personnalisées
  if (desired_activities && desired_activities !== '') {
    console.log('Recherche activité désirée:', desired_activities) // Debug
    query = query.or(`wp_activity_domain.ilike.%${desired_activities}%,desired_activities_other.cs.{${desired_activities}}`)
  }

  // Filtrage par langue maternelle - colonne WordPress avec données sérialisées PHP
  if (languages_fluent && languages_fluent !== '') {
    console.log('Recherche langue maternelle:', languages_fluent) // Debug
    query = query.ilike('actor_languages_native', `%${languages_fluent}%`)
  }

  // Recherche par nom - nouveau filtre
  if (name && name !== '') {
    console.log('Recherche par nom:', name) // Debug
    query = query.or(`first_name.ilike.%${name}%,last_name.ilike.%${name}%,display_name.ilike.%${name}%`)
  }

  // Appliquer les autres filtres
  if (gender) query = query.eq('gender', gender)
  if (ethnicity) query = query.eq('ethnicity', ethnicity)
  if (hair_color) query = query.eq('hair_color', hair_color)
  if (eye_color) query = query.eq('eye_color', eye_color)
  if (build) query = query.eq('build', build)
  if (experience_level) query = query.eq('experience_level', experience_level)
  // Nationalité - utiliser colonne WordPress si elle existe, sinon colonne normale
  if (nationality) {
    query = query.or(`actor_nationality.ilike.%${nationality}%,nationality.ilike.%${nationality}%`)
  }

  if (city) query = query.ilike('city', `%${city}%`)

  // Autre langue (notions) - colonne WordPress avec données sérialisées PHP
  if (languages && languages !== '') {
    console.log('Recherche autre langue (notions):', languages) // Debug
    query = query.ilike('actor_languages_notions', `%${languages}%`)
  }
  
  // Recherche par nom (nouveau filtre)
  if (name) {
    query = query.or(`first_name.ilike.%${name}%,last_name.ilike.%${name}%,display_name.ilike.%${name}%`)
  }
  
  if (height_min) query = query.gte('height', parseInt(height_min as string))
  if (height_max) query = query.lte('height', parseInt(height_max as string))

  // Filtrage par âge (approximatif basé sur l'année de naissance)
  if (age_min || age_max) {
    const currentYear = new Date().getFullYear()
    if (age_max) {
      const minBirthYear = currentYear - parseInt(age_max as string)
      query = query.gte('birth_date', `${minBirthYear}-01-01`)
    }
    if (age_min) {
      const maxBirthYear = currentYear - parseInt(age_min as string)
      query = query.lte('birth_date', `${maxBirthYear}-12-31`)
    }
  }

  // Pagination
  const pageNum = parseInt(page as string)
  const limitNum = parseInt(limit as string)
  const startIndex = (pageNum - 1) * limitNum

  // Créer une seed basée sur la date (change chaque jour)
  // Cela donne un ordre différent chaque jour mais stable pendant la journée
  const today = new Date()
  const dateSeed = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`

  // Utiliser un tri pseudo-aléatoire basé sur un hash de l'ID + seed du jour
  // Note: Pour une vraie randomisation à chaque requête, on pourrait ajouter l'heure
  // mais cela casserait la pagination. La seed quotidienne est un bon compromis.
  query = query
    .order('id', { ascending: true }) // Ordre de base pour la stabilité
    .range(startIndex, startIndex + limitNum - 1)

  console.log('Executing query with:', {include_all_statuses, status, pageNum, limitNum})
  const { data, error, count } = await query
  console.log('Query result count:', count, 'data rows:', data?.length, 'first status:', data?.[0]?.status)

  if (error) throw error

  // Mélanger les résultats avec une seed quotidienne (Fisher-Yates shuffle avec seed)
  const shuffleArray = (array: any[], seed: string) => {
    // Filtrer d'abord les valeurs nulles ou invalides
    const validArray = array.filter(item => item && item.id);

    // Créer un générateur pseudo-aléatoire basé sur la seed
    const seededRandom = (id: string) => {
      const str = seed + id;
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return Math.abs(hash);
    };

    // Trier en fonction du hash de chaque ID avec la seed
    const shuffled = validArray.sort((a, b) => {
      const hashA = seededRandom(a.id);
      const hashB = seededRandom(b.id);
      return hashA - hashB;
    });

    return shuffled;
  };

  const shuffledData = data ? shuffleArray(data, dateSeed) : [];

  return res.status(200).json({
    data: shuffledData,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limitNum)
    }
  })
  } catch (error: any) {
    console.error('Erreur lors de la récupération des comédiens:', error)
    return res.status(500).json({ message: 'Erreur interne du serveur' })
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query
    const updates = req.body

    console.log('🔧 API PUT - ID:', id)
    console.log('🔧 API PUT - Updates:', updates)

    // Utiliser supabaseAdmin avec service role key pour bypass RLS
    const { data, error } = await supabaseAdmin
      .from('comediens')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    console.log('🔧 API PUT - Result:', data)
    console.log('🔧 API PUT - Error:', error)

    if (error) throw error

    return res.status(200).json({ data })
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du comédien:', error)
    return res.status(500).json({ message: 'Erreur interne du serveur' })
  }
}
