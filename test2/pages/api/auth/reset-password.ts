import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

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
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email requis' })
    }

    // Vérifier si l'utilisateur existe
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .single()

    if (userError || !existingUser) {
      // Pour des raisons de sécurité, on retourne toujours success même si l'email n'existe pas
      return res.status(200).json({ 
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' 
      })
    }

    // Générer un token de réinitialisation sécurisé
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 heure

    // Sauvegarder le token dans la base
    const { error: updateError } = await supabase
      .from('users')
      .update({
        reset_token: resetToken,
        reset_token_expiry: resetTokenExpiry.toISOString()
      })
      .eq('id', existingUser.id)

    if (updateError) {
      console.error('Erreur lors de la sauvegarde du token:', updateError)
      return res.status(500).json({ message: 'Erreur serveur' })
    }

    // Envoyer l'email de réinitialisation
    const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/nouveau-mot-de-passe?token=${resetToken}`

    try {
      await sendPasswordResetEmail(email, resetToken, resetLink)
      console.log(`✅ Email de réinitialisation envoyé à ${email}`)
    } catch (emailError) {
      // Logger l'erreur mais ne pas bloquer (sécurité)
      console.error('Erreur envoi email réinitialisation:', emailError)

      // En dev, on log le lien pour debug
      if (process.env.NODE_ENV === 'development') {
        console.log('━'.repeat(80))
        console.log('🔐 LIEN DE RÉINITIALISATION (DEV MODE)')
        console.log('━'.repeat(80))
        console.log(`Email: ${email}`)
        console.log(`Lien: ${resetLink}`)
        console.log(`Expire: ${resetTokenExpiry.toLocaleString('fr-FR')}`)
        console.log('━'.repeat(80))
      }
    }

    return res.status(200).json({
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé.',
      // En dev, on retourne le lien pour faciliter les tests
      ...(process.env.NODE_ENV === 'development' && { resetLink })
    })

  } catch (error: any) {
    console.error('Erreur reset password:', error)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}
