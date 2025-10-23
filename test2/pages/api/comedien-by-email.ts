// pages/api/comedien-by-email.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email } = req.query

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' })
  }

  try {
    const { data, error } = await supabase
      .from('comediens')
      .select('id, email, display_name, is_active, created_at, first_name, last_name')
      .eq('email', email)
      .eq('is_active', true)
      .order('created_at', { ascending: true }) // Le plus ancien en premier

    if (error) {
      throw error
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Comédien non trouvé' })
    }

    // Si plusieurs résultats, choisir le bon profil selon des critères logiques
    let selectedComedien = data[0] // Par défaut, le plus ancien

    if (data.length > 1) {
      console.log(`⚠️ Plusieurs profils trouvés pour ${email}:`, 
        data.map(c => `${c.display_name} (${c.id.substr(0, 8)})`).join(', '))
      
      // Stratégie de sélection :
      // 1. Préférer les profils avec prénom/nom renseignés
      // 2. Éviter les profils "admin" si on en trouve d'autres
      // 3. Sinon, prendre le plus ancien
      
      const realProfiles = data.filter(c => 
        c.first_name && 
        c.last_name && 
        !c.display_name.toLowerCase().includes('admin')
      )
      
      if (realProfiles.length > 0) {
        selectedComedien = realProfiles[0]
        console.log(`✅ Profil sélectionné: ${selectedComedien.display_name} (critère: profil complet)`)
      } else {
        console.log(`✅ Profil sélectionné: ${selectedComedien.display_name} (critère: le plus ancien)`)
      }
    }

    return res.status(200).json({ data: selectedComedien })
  } catch (error: any) {
    console.error('Erreur API comedien-by-email:', error)
    return res.status(500).json({ error: error.message })
  }
}