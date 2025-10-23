// pages/api/pdf.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import { PDFGenerator } from '../../lib/pdf'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query

  if (!id) {
    return res.status(400).json({ error: 'ID du comédien requis' })
  }

  try {
    // Récupérer les données du comédien
    const { data: comedien, error } = await supabase
      .from('comediens')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) throw error
    if (!comedien) {
      return res.status(404).json({ error: 'Comédien non trouvé' })
    }

    // Générer le PDF
    const doc = PDFGenerator.generateComedienProfile(comedien)
    const pdfBuffer = doc.output('arraybuffer')

    // Configurer les headers pour le téléchargement
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader(
      'Content-Disposition', 
      `attachment; filename="fiche-${comedien.first_name}-${comedien.last_name}.pdf"`
    )
    res.setHeader('Content-Length', pdfBuffer.byteLength)

    // Envoyer le PDF
    res.status(200).send(Buffer.from(pdfBuffer))
  } catch (error: any) {
    console.error('Erreur lors de la génération du PDF:', error)
    return res.status(500).json({ error: 'Erreur lors de la génération du PDF' })
  }
}
