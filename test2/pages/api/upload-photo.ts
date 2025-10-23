// pages/api/upload-photo.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

// Configuration pour accepter les fichiers
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { file, comedienId } = req.body

    if (!file || !comedienId) {
      return res.status(400).json({ message: 'Fichier ou ID comédien manquant' })
    }

    // Créer un client Supabase avec la clé service
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Extraire les données du fichier base64
    const matches = file.match(/^data:(.+);base64,(.+)$/)
    if (!matches) {
      return res.status(400).json({ message: 'Format de fichier invalide' })
    }

    const contentType = matches[1]
    const base64Data = matches[2]
    const buffer = Buffer.from(base64Data, 'base64')

    // Générer un nom de fichier unique
    const fileExt = contentType.split('/')[1] || 'jpg'
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `${comedienId}/${fileName}`

    console.log('📸 Upload photo:', { filePath, contentType, size: buffer.length })

    // Upload vers Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from('comedien-photos')
      .upload(filePath, buffer, {
        contentType,
        upsert: false,
        cacheControl: '3600'
      })

    if (uploadError) {
      console.error('❌ Erreur upload Supabase:', uploadError)
      return res.status(500).json({ 
        message: 'Erreur lors de l\'upload: ' + uploadError.message,
        error: uploadError
      })
    }

    console.log('✅ Upload réussi:', data)

    // Obtenir l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from('comedien-photos')
      .getPublicUrl(filePath)

    console.log('🔗 URL publique:', publicUrl)

    return res.status(200).json({ 
      photoUrl: publicUrl,
      message: 'Photo uploadée avec succès'
    })

  } catch (error: any) {
    console.error('Erreur API upload:', error)
    return res.status(500).json({ 
      message: error.message || 'Erreur lors de l\'upload de la photo'
    })
  }
}
