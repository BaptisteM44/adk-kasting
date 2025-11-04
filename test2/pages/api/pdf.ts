// pages/api/pdf.ts
// NOTE: Cette API n'est pas utilisée actuellement.
// La génération PDF se fait côté client via lib/pdf-generator.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return res.status(501).json({
    error: 'Cette API n\'est pas implémentée. La génération PDF se fait côté client.'
  })
}
