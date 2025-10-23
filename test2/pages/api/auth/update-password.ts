import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

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
    const { token, password } = req.body

    if (!token || !password) {
      return res.status(400).json({ message: 'Token et mot de passe requis' })
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères' })
    }

    // Vérifier le token
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, reset_token_expiry')
      .eq('reset_token', token)
      .single()

    if (userError || !user) {
      return res.status(400).json({ message: 'Token invalide' })
    }

    // Vérifier l'expiration
    const expiry = new Date(user.reset_token_expiry)
    const now = new Date()

    if (expiry < now) {
      return res.status(400).json({ message: 'Token expiré' })
    }

    // Hasher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Mettre à jour le mot de passe et supprimer le token
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password: hashedPassword,
        reset_token: null,
        reset_token_expiry: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Erreur mise à jour mot de passe:', updateError)
      return res.status(500).json({ message: 'Erreur lors de la mise à jour du mot de passe' })
    }

    return res.status(200).json({ message: 'Mot de passe modifié avec succès' })

  } catch (error: any) {
    console.error('Erreur update password:', error)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}
