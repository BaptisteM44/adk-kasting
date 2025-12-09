// pages/api/comediens/[id]/status.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

// Service role pour bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query
  const { status, isAdmin } = req.body

  // Vérifier que c'est un admin
  // TODO: Améliorer la vérification d'authentification admin
  if (!isAdmin) {
    return res.status(403).json({ error: 'Accès refusé. Seuls les admins peuvent changer les statuts.' })
  }

  // Valider le statut
  if (!['pending', 'approved', 'published', 'trash'].includes(status)) {
    return res.status(400).json({
      error: 'Statut invalide',
      validStatuses: ['pending', 'approved', 'published', 'trash']
    })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('comediens')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erreur changement statut:', error)
      throw error
    }

    const messages = {
      published: 'publié (payé)',
      approved: 'validé (en attente de paiement)',
      pending: 'mis en attente de validation',
      trash: 'supprimé'
    }

    return res.status(200).json({
      success: true,
      comedien: data,
      message: `Profil ${messages[status as keyof typeof messages] || 'modifié'}`
    })
  } catch (error: any) {
    console.error('Erreur API status:', error)
    return res.status(500).json({ error: error.message || 'Erreur interne' })
  }
}
