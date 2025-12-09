// pages/api/films.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' })
  }

  try {
    const { show_in_hero, show_in_collaborations } = req.query

    let query = supabase
      .from('films')
      .select('*')
      .eq('is_active', true)

    // Filtrer et trier selon la section demandée
    if (show_in_hero === 'true') {
      // Ordre aléatoire pour le carousel hero
      const { data: allFilms, error: fetchError } = await supabase
        .from('films')
        .select('*')
        .eq('is_active', true)
        .eq('show_in_hero', true)

      if (fetchError) {
        console.error('Erreur récupération films:', fetchError)
        return res.status(500).json({ message: 'Erreur serveur' })
      }

      // Mélanger aléatoirement les films
      const shuffledFilms = allFilms?.sort(() => Math.random() - 0.5) || []
      return res.status(200).json({ films: shuffledFilms })
    } else if (show_in_collaborations === 'true') {
      query = query.eq('show_in_collaborations', true).order('year', { ascending: false })
    } else {
      // Par défaut, trier par année décroissante (plus récent en premier)
      query = query.order('year', { ascending: false })
    }

    const { data: films, error } = await query

    if (error) {
      console.error('Erreur récupération films:', error)
      return res.status(500).json({ message: 'Erreur serveur' })
    }

    return res.status(200).json({ films })

  } catch (error: any) {
    console.error('Erreur API films:', error)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}
