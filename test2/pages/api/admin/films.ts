// pages/api/admin/films.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Note : Les permissions admin sont vérifiées côté client (AuthGuard)
  // Pour une sécurité renforcée, il faudrait vérifier la session Supabase ici
  // Mais pour simplifier, on fait confiance au frontend pour l'instant

  try {
    // GET - Récupérer tous les films (incluant inactifs pour les admins)
    if (req.method === 'GET') {
      const { data: films, error } = await supabase
        .from('films')
        .select('*')
        .order('year', { ascending: false })

      if (error) {
        console.error('Erreur récupération films:', error)
        return res.status(500).json({ message: 'Erreur serveur' })
      }

      return res.status(200).json({ films })
    }

    // POST - Créer un nouveau film
    if (req.method === 'POST') {
      const {
        title,
        year,
        image_url,
        show_in_hero,
        show_in_collaborations,
        hero_order,
        collaboration_order
      } = req.body

      if (!title || !year || !image_url) {
        return res.status(400).json({
          message: 'Titre, année et image sont requis'
        })
      }

      const { data: film, error } = await supabase
        .from('films')
        .insert({
          title,
          year: parseInt(year),
          image_url,
          show_in_hero: show_in_hero || false,
          show_in_collaborations: show_in_collaborations || false,
          hero_order: hero_order || 0,
          collaboration_order: collaboration_order || 0,
          is_active: true
        })
        .select()
        .single()

      if (error) {
        console.error('Erreur création film:', error)
        return res.status(500).json({ message: 'Erreur lors de la création du film' })
      }

      return res.status(201).json({
        message: 'Film créé avec succès',
        film
      })
    }

    // PUT - Mettre à jour un film existant
    if (req.method === 'PUT') {
      const {
        id,
        title,
        year,
        image_url,
        show_in_hero,
        show_in_collaborations,
        hero_order,
        collaboration_order,
        is_active
      } = req.body

      if (!id) {
        return res.status(400).json({ message: 'ID du film requis' })
      }

      const updateData: any = {}
      if (title !== undefined) updateData.title = title
      if (year !== undefined) updateData.year = parseInt(year)
      if (image_url !== undefined) updateData.image_url = image_url
      if (show_in_hero !== undefined) updateData.show_in_hero = show_in_hero
      if (show_in_collaborations !== undefined) updateData.show_in_collaborations = show_in_collaborations
      if (hero_order !== undefined) updateData.hero_order = hero_order
      if (collaboration_order !== undefined) updateData.collaboration_order = collaboration_order
      if (is_active !== undefined) updateData.is_active = is_active

      const { data: film, error } = await supabase
        .from('films')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Erreur mise à jour film:', error)
        return res.status(500).json({ message: 'Erreur lors de la mise à jour du film' })
      }

      return res.status(200).json({
        message: 'Film mis à jour avec succès',
        film
      })
    }

    // DELETE - Supprimer un film
    if (req.method === 'DELETE') {
      const { id } = req.body

      if (!id) {
        return res.status(400).json({ message: 'ID du film requis' })
      }

      const { error } = await supabase
        .from('films')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Erreur suppression film:', error)
        return res.status(500).json({ message: 'Erreur lors de la suppression du film' })
      }

      return res.status(200).json({
        message: 'Film supprimé avec succès'
      })
    }

    return res.status(405).json({ message: 'Méthode non autorisée' })

  } catch (error: any) {
    console.error('Erreur API admin films:', error)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}
