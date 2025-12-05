// pages/api/comediens/[id]/rating.ts
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
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Méthode non autorisée' })
  }

  const { id } = req.query
  const { rating, isAdmin } = req.body

  // Vérifier que c'est bien un admin (simpliste, devrait vérifier la session)
  if (!isAdmin) {
    return res.status(403).json({ message: 'Accès refusé' })
  }

  try {
    const { error } = await supabase
      .from('comediens')
      .update({ admin_rating: rating })
      .eq('id', id)

    if (error) throw error

    return res.status(200).json({ message: 'Note sauvegardée avec succès' })
  } catch (error: any) {
    console.error('Erreur sauvegarde note:', error)
    return res.status(500).json({ message: 'Erreur serveur: ' + error.message })
  }
}
