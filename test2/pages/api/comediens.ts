// pages/api/comediens.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

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
    age_min,
    age_max,
    height_min,
    height_max,
    desired_activities, // Nouveau filtre
    name // Nouveau filtre par nom
  } = req.query

  try {
    let query = supabase
      .from('comediens')
      .select('*', { count: 'exact' })
      .eq('is_active', true)

  // Filtrage par permis de conduire - colonne WordPress avec données sérialisées PHP
  if (driving_licenses && driving_licenses !== '') {
    console.log('Recherche permis:', driving_licenses) // Debug
    query = query.ilike('actor_driving_license', `%${driving_licenses}%`)
  }

  // Filtrage par compétences diverses - colonne WordPress avec données sérialisées PHP
  if (wp_skills && wp_skills !== '') {
    console.log('Recherche compétence diverse:', wp_skills) // Debug
    query = query.ilike('wp_skills', `%${wp_skills}%`)
  }

  // Filtrage par activités désirées - TODO: vérifier quelle colonne WordPress contient ces données
  if (desired_activities && desired_activities !== '') {
    console.log('Recherche activité désirée:', desired_activities) // Debug
    // Colonne à identifier dans WordPress
    query = query.ilike('wp_activity_domain', `%${desired_activities}%`)
  }

  // Filtrage par langues parlées couramment - colonne WordPress
  if (languages_fluent && languages_fluent !== '') {
    console.log('Recherche langue courante:', languages_fluent) // Debug
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

  // Langue maternelle - colonne WordPress avec données sérialisées PHP
  if (languages && languages !== '') {
    console.log('Recherche langue maternelle:', languages) // Debug
    query = query.ilike('actor_languages_native', `%${languages}%`)
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

  // Pour l'ordre aléatoire, on récupère plus de résultats qu'on mélange
  // puis on pagine côté serveur
  query = query
    .order('id', { ascending: false })
    .range(startIndex, startIndex + limitNum - 1)

  const { data, error, count } = await query

  if (error) throw error

  // Mélanger les résultats de manière vraiment aléatoire (Fisher-Yates shuffle)
  const shuffleArray = (array: any[]) => {
    // Filtrer d'abord les valeurs nulles ou invalides
    const validArray = array.filter(item => item && item.id);
    const shuffled = [...validArray];

    for (let i = shuffled.length - 1; i > 0; i--) {
      // Générer un index aléatoire
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const shuffledData = data ? shuffleArray(data) : [];

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

    // Ici vous pourriez ajouter une vérification d'authentification
    // et de permissions avant de permettre la mise à jour

    const { data, error } = await supabase
      .from('comediens')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return res.status(200).json({ data })
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du comédien:', error)
    return res.status(500).json({ message: 'Erreur interne du serveur' })
  }
}
