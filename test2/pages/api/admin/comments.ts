import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  
  if (req.method === 'GET') {
    // Récupérer les commentaires d'un comédien
    const { comedienId } = req.query

    if (!comedienId) {
      return res.status(400).json({ message: 'ID comédien requis' })
    }

    try {
      const { data, error } = await supabase
        .from('admin_comments')
        .select('*')
        .eq('comedien_id', comedienId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return res.status(200).json(data || [])
    } catch (error: any) {
      console.error('Erreur récupération commentaires:', error)
      return res.status(500).json({ message: 'Erreur serveur: ' + error.message })
    }
  }

  if (req.method === 'POST') {
    // Ajouter un commentaire
    const { comedienId, adminId, adminName, comment } = req.body

    if (!comedienId || !comment?.trim()) {
      return res.status(400).json({ message: 'ID comédien et commentaire requis' })
    }

    try {
      const { error } = await supabase
        .from('admin_comments')
        .insert({
          comedien_id: comedienId,
          admin_id: adminId || '',
          admin_name: adminName || 'Admin',
          comment: comment.trim()
        })

      if (error) throw error

      return res.status(201).json({ message: 'Commentaire ajouté avec succès' })
    } catch (error: any) {
      console.error('Erreur ajout commentaire:', error)
      return res.status(500).json({ message: 'Erreur serveur: ' + error.message })
    }
  }

  return res.status(405).json({ message: 'Méthode non autorisée' })
}