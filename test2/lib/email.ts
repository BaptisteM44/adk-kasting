// lib/email.ts
import nodemailer from 'nodemailer'
import type { Comedien } from '@/types'

// Configuration du transporteur SMTP
// Utilise SMTP Hostinger en production, ou Resend/Gmail pour tests
const createTransporter = () => {
  // Option 1 : SMTP Hostinger (production)
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: process.env.SMTP_SECURE === 'true', // true pour port 465, false pour autres ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })
  }

  // Option 2 : Resend via SMTP (alternative pour tests)
  if (process.env.RESEND_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: {
        user: 'resend',
        pass: process.env.RESEND_API_KEY,
      },
    })
  }

  // Pas de configuration email disponible
  console.warn('⚠️  Aucune configuration email trouvée. Les emails ne seront pas envoyés.')
  return null
}

/**
 * Fonction générique pour envoyer un email
 */
export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = createTransporter()

    if (!transporter) {
      console.log(`📧 Email non envoyé (pas de config) : ${to} - ${subject}`)
      return { success: false, error: 'Configuration email manquante' }
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@adk-kasting.com',
      to,
      subject,
      text,
      html: html || text,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log(`✅ Email envoyé : ${to} - ${subject}`, info.messageId)

    return { success: true }
  } catch (error: any) {
    console.error('❌ Erreur envoi email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Email de bienvenue pour un nouveau comédien
 */
export async function sendWelcomeEmail(comedien: Partial<Comedien>) {
  const subject = 'Bienvenue sur ADK-KASTING !'

  const text = `Bonjour ${comedien.first_name},

Merci de vous être inscrit(e) sur ADK-KASTING.

Votre profil est actuellement en attente de validation par notre équipe.
Vous recevrez un email de confirmation une fois votre profil approuvé.

En attendant, vous pouvez vous connecter pour compléter ou modifier vos informations.

Informations de votre compte :
- Email : ${comedien.email}
- Nom : ${comedien.first_name} ${comedien.last_name}

Si vous avez des questions, n'hésitez pas à nous contacter :
- Email : info@adk-kasting.com
- Téléphone : +32 2 544 09 05

Cordialement,
L'équipe ADK-KASTING

---
Avenue Maurice 1, 1050 Ixelles, Belgique
www.adk-kasting.com`

  return await sendEmail(comedien.email!, subject, text)
}

/**
 * Email de notification aux admins pour nouvelle inscription
 */
export async function sendAdminNotificationEmail(comedien: Partial<Comedien>) {
  const adminEmail = process.env.ADMIN_EMAIL || 'info@adk-kasting.com'
  const dashboardUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const subject = `Nouvelle inscription - ${comedien.first_name} ${comedien.last_name}`

  const text = `Une nouvelle inscription nécessite votre validation :

Informations du comédien :
- Nom : ${comedien.first_name} ${comedien.last_name}
- Email : ${comedien.email}
- Téléphone : ${comedien.phone || 'Non renseigné'}
- Ville : ${comedien.city || 'Non renseignée'}
- Âge : ${comedien.age ? comedien.age + ' ans' : 'Non renseigné'}
- Sexe : ${comedien.gender || 'Non renseigné'}
- Date d'inscription : ${new Date().toLocaleDateString('fr-BE')}

Validez cette inscription sur le dashboard :
${dashboardUrl}/dashboard

Cordialement,
Système ADK-KASTING`

  return await sendEmail(adminEmail, subject, text)
}

/**
 * Email de réinitialisation de mot de passe
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  resetLink: string
) {
  const subject = 'Réinitialisation de votre mot de passe ADK-KASTING'

  const text = `Bonjour,

Vous avez demandé à réinitialiser votre mot de passe sur ADK-KASTING.

Cliquez sur ce lien pour créer un nouveau mot de passe :
${resetLink}

Ce lien expire dans 1 heure.

Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
Votre mot de passe actuel reste inchangé tant que vous ne cliquez pas sur le lien.

Pour des raisons de sécurité, ne partagez jamais ce lien avec quiconque.

Si vous rencontrez des difficultés, contactez-nous :
- Email : info@adk-kasting.com
- Téléphone : +32 2 544 09 05

Cordialement,
L'équipe ADK-KASTING

---
Avenue Maurice 1, 1050 Ixelles, Belgique
www.adk-kasting.com`

  return await sendEmail(email, subject, text)
}

/**
 * Email de confirmation de validation du profil (optionnel)
 */
export async function sendProfileApprovedEmail(comedien: Partial<Comedien>) {
  const subject = 'Votre profil ADK-KASTING a été validé !'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const text = `Bonjour ${comedien.first_name},

Bonne nouvelle ! Votre profil ADK-KASTING a été validé par notre équipe.

Votre profil est maintenant visible par les professionnels du casting.

Vous pouvez dès maintenant :
- Mettre à jour vos informations
- Ajouter des photos et vidéos
- Consulter votre profil public

Accéder à mon profil : ${siteUrl}/comediens/${comedien.id}

Merci de faire confiance à ADK-KASTING !

Cordialement,
L'équipe ADK-KASTING

---
Avenue Maurice 1, 1050 Ixelles, Belgique
www.adk-kasting.com`

  return await sendEmail(comedien.email!, subject, text)
}
