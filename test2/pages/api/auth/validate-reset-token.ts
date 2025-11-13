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
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' })
  }

  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({ valid: false, message: 'Token requis' })
    }

    // Vérifier si le token existe et n'est pas expiré
    const { data: user, error } = await supabase
      .from('comediens')
      .select('id, reset_token_expiry')
      .eq('reset_token', token)
      .single()

    if (error || !user) {
      return res.status(200).json({ valid: false, message: 'Token invalide' })
    }

    // Vérifier l'expiration
    const expiry = new Date(user.reset_token_expiry)
    const now = new Date()

    if (expiry < now) {
      return res.status(200).json({ valid: false, message: 'Token expiré' })
    }

    return res.status(200).json({ valid: true })

  } catch (error: any) {
    console.error('Erreur validation token:', error)
    return res.status(500).json({ valid: false, message: 'Erreur serveur' })
  }
}
