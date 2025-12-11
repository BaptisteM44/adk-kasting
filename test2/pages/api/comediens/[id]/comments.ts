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

  if (req.method === 'POST') {
    // Ajouter un nouveau commentaire
    const { comment, admin_name, admin_id } = req.body

    if (!comment || !comment.trim()) {
      return res.status(400).json({ error: 'Le commentaire ne peut pas être vide' })
    }

    try {
      console.log('📝 Tentative d\'ajout commentaire:', {
        comedien_id: id,
        admin_id: admin_id || null,
        admin_name: admin_name || 'Admin',
        comment: comment.trim()
      })

      // Ne pas inclure admin_id si null pour éviter les erreurs de foreign key
      const insertData: any = {
        comedien_id: id,
        admin_name: admin_name || 'Admin',
        comment: comment.trim()
      }

      // N'ajouter admin_id que s'il est fourni
      if (admin_id) {
        insertData.admin_id = admin_id
      }

      const { data, error } = await supabaseAdmin
        .from('admin_comments')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        console.error('❌ Erreur Supabase:', error)
        throw error
      }

      console.log('✅ Commentaire ajouté:', data)
      return res.status(200).json(data)
    } catch (error: any) {
      console.error('❌ Exception lors de l\'ajout du commentaire:', error)
      return res.status(500).json({ error: error.message, details: error })
    }
  } else if (req.method === 'GET') {
    // Récupérer tous les commentaires d'un comédien
    try {
      const { data, error } = await supabaseAdmin
        .from('admin_comments')
        .select('*')
        .eq('comedien_id', id)
        .order('created_at', { ascending: false })

      if (error) throw error

      return res.status(200).json(data || [])
    } catch (error: any) {
      console.error('Erreur lors de la récupération des commentaires:', error)
      return res.status(500).json({ error: error.message })
    }
  } else if (req.method === 'PUT') {
    // Modifier un commentaire existant
    const { comment_id, comment } = req.body

    if (!comment_id || !comment || !comment.trim()) {
      return res.status(400).json({ error: 'ID et commentaire requis' })
    }

    try {
      const { data, error } = await supabaseAdmin
        .from('admin_comments')
        .update({ comment: comment.trim() })
        .eq('id', comment_id)
        .eq('comedien_id', id) // Sécurité : vérifier que le commentaire appartient à ce comédien
        .select()
        .single()

      if (error) throw error

      return res.status(200).json(data)
    } catch (error: any) {
      console.error('Erreur lors de la modification du commentaire:', error)
      return res.status(500).json({ error: error.message })
    }
  } else if (req.method === 'DELETE') {
    // Supprimer un commentaire
    const { comment_id } = req.body

    if (!comment_id) {
      return res.status(400).json({ error: 'ID du commentaire requis' })
    }

    try {
      const { error } = await supabaseAdmin
        .from('admin_comments')
        .delete()
        .eq('id', comment_id)
        .eq('comedien_id', id) // Sécurité : vérifier que le commentaire appartient à ce comédien

      if (error) throw error

      return res.status(200).json({ success: true })
    } catch (error: any) {
      console.error('Erreur lors de la suppression du commentaire:', error)
      return res.status(500).json({ error: error.message })
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
