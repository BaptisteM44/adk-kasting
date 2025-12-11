import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

// Client avec service role key pour bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('comediens')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erreur lors de la récupération du comédien:', error)
      return res.status(500).json({ error: error.message })
    }

    if (!data) {
      return res.status(404).json({ error: 'Comédien non trouvé' })
    }

    // Charger aussi les commentaires admin
    const { data: comments } = await supabaseAdmin
      .from('admin_comments')
      .select('*')
      .eq('comedien_id', id)
      .order('created_at', { ascending: false })

    return res.status(200).json({
      ...data,
      admin_comments: comments || []
    })
  } catch (error: any) {
    console.error('Erreur serveur:', error)
    return res.status(500).json({ error: error.message })
  }
}
