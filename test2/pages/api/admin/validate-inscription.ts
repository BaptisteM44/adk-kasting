import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' })
  }

  try {
    const { action, comedienId } = req.body

    if (!action || !comedienId) {
      return res.status(400).json({ message: 'Action et ID comédien requis' })
    }

    if (action === 'validate') {
      // Valider l'inscription
      const { error } = await supabase
        .from('comediens')
        .update({ is_active: true })
        .eq('id', comedienId)

      if (error) throw error

      return res.status(200).json({ message: 'Comédien validé avec succès' })
    }

    if (action === 'reject') {
      // Rejeter l'inscription (supprimer)
      const { error } = await supabase
        .from('comediens')
        .delete()
        .eq('id', comedienId)

      if (error) throw error

      return res.status(200).json({ message: 'Inscription rejetée et supprimée' })
    }

    return res.status(400).json({ message: 'Action non reconnue' })

  } catch (error: any) {
    console.error('Erreur validation inscription:', error)
    return res.status(500).json({ message: 'Erreur serveur: ' + error.message })
  }
}